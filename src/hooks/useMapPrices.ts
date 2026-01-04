import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MapPrice {
  price: number;
  date: string;
}

export interface MapPricesResult {
  [iata: string]: MapPrice | null;
}

interface UseMapPricesOptions {
  enabled?: boolean;
  debounceMs?: number;
}

interface UseMapPricesResult {
  prices: MapPricesResult;
  isLoading: boolean;
  error: string | null;
  fetchPrices: (origins: string[], destinations: string[]) => void;
}

// Cache with TTL - persists across component remounts
// Key is sorted origins + destination to ensure stability
const pricesCache = new Map<string, { data: MapPrice | null; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

// Track pending destinations to avoid duplicate requests
const pendingRequests = new Set<string>();

function getCacheKey(origins: string[], destination: string): string {
  return `${[...origins].sort().join(',')}-${destination}`;
}

function getOriginsKey(origins: string[]): string {
  return [...origins].sort().join(',');
}

export function useMapPrices(options: UseMapPricesOptions = {}): UseMapPricesResult {
  const { enabled = true, debounceMs = 800 } = options; // Increased debounce to reduce API calls
  
  // Use ref to accumulate prices (never reset, only update)
  const pricesRef = useRef<MapPricesResult>({});
  const [prices, setPrices] = useState<MapPricesResult>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const abortController = useRef<AbortController | null>(null);
  const lastOriginsKey = useRef<string>('');

  const fetchPrices = useCallback((origins: string[], destinations: string[]) => {
    if (!enabled || origins.length === 0 || destinations.length === 0) {
      return;
    }

    const originsKey = getOriginsKey(origins);
    
    // If origins changed, clear the accumulated prices
    if (originsKey !== lastOriginsKey.current) {
      pricesRef.current = {};
      lastOriginsKey.current = originsKey;
    }

    // Clear previous debounce
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // If we know we will fetch (after debounce), flip loading immediately so markers show "..."
    const nowPreview = Date.now();
    let willFetch = false;
    for (const dest of destinations) {
      const cacheKey = getCacheKey(origins, dest);
      const cached = pricesCache.get(cacheKey);

      if (cached && (nowPreview - cached.timestamp) < CACHE_TTL) continue;
      if (pricesRef.current[dest] !== undefined) continue;
      if (pendingRequests.has(cacheKey)) continue;

      willFetch = true;
      break;
    }

    if (willFetch) {
      setIsLoading(true);
      setError(null);
    }

    debounceTimeout.current = setTimeout(async () => {
      const now = Date.now();
      const uncachedDestinations: string[] = [];

      // Check what we need to fetch
      for (const dest of destinations) {
        const cacheKey = getCacheKey(origins, dest);
        const cached = pricesCache.get(cacheKey);
        
        // Use cache if valid
        if (cached && (now - cached.timestamp) < CACHE_TTL) {
          pricesRef.current[dest] = cached.data;
          continue;
        }
        
        // Skip if already in accumulated prices (from previous fetch in same session)
        if (pricesRef.current[dest] !== undefined) {
          continue;
        }
        
        // Skip if request is pending
        if (pendingRequests.has(cacheKey)) {
          continue;
        }
        
        uncachedDestinations.push(dest);
      }

      // Update state with what we have
      setPrices({ ...pricesRef.current });

      // If all cached/known, return immediately
      if (uncachedDestinations.length === 0) {
        // If we turned loading on earlier for this debounce, turn it back off.
        setIsLoading(false);
        return;
      }

      // Mark destinations as pending
      const pendingKeys = uncachedDestinations.map(dest => getCacheKey(origins, dest));
      pendingKeys.forEach(key => pendingRequests.add(key));

      // Abort previous request
      if (abortController.current) {
        abortController.current.abort();
      }
      abortController.current = new AbortController();

      try {
        // Batch in chunks of 50
        const chunks: string[][] = [];
        for (let i = 0; i < uncachedDestinations.length; i += 50) {
          chunks.push(uncachedDestinations.slice(i, i + 50));
        }

        for (const chunk of chunks) {
          const { data, error: fnError } = await supabase.functions.invoke('map-prices', {
            body: {
              origins,
              destinations: chunk,
              adults: 1,
              currency: 'EUR'
            }
          });

          if (fnError) {
            throw new Error(fnError.message);
          }

          if (data?.success && data?.prices) {
            for (const [iata, priceData] of Object.entries(data.prices)) {
              const price = priceData as MapPrice | null;
              
              // Update accumulated prices
              pricesRef.current[iata] = price;
              
              // Update cache
              const cacheKey = getCacheKey(origins, iata);
              pricesCache.set(cacheKey, {
                data: price,
                timestamp: now
              });
              
              // Remove from pending
              pendingRequests.delete(cacheKey);
            }
          }
        }

        setPrices({ ...pricesRef.current });
      } catch (err) {
        // Clear pending on error
        pendingKeys.forEach(key => pendingRequests.delete(key));
        
        if ((err as Error).name !== 'AbortError') {
          console.error('[useMapPrices] Error fetching prices:', err);
          setError((err as Error).message);
        }
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);
  }, [enabled, debounceMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  return { prices, isLoading, error, fetchPrices };
}
