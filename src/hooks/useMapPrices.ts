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
  /** Returns destinations that are NOT in cache, NOT pending, and NOT already known */
  getMissingDestinations: (origins: string[], destinations: string[]) => string[];
}

// Cache with TTL - persists across component remounts
// Key is sorted origins + destination to ensure stability
const pricesCache = new Map<string, { data: MapPrice | null; timestamp: number }>();
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours cache - prices don't change frequently

// Track pending destinations to avoid duplicate requests
const pendingRequests = new Set<string>();

function getCacheKey(origins: string[], destination: string): string {
  return `${[...origins].sort().join(',')}-${destination}`;
}

function getOriginsKey(origins: string[]): string {
  return [...origins].sort().join(',');
}

export function useMapPrices(options: UseMapPricesOptions = {}): UseMapPricesResult {
  const { enabled = true, debounceMs = 800 } = options;
  
  // Use ref to accumulate prices (never reset, only update)
  const pricesRef = useRef<MapPricesResult>({});
  const [prices, setPrices] = useState<MapPricesResult>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const abortController = useRef<AbortController | null>(null);
  const lastOriginsKey = useRef<string>('');

  /**
   * Returns destinations that need to be fetched:
   * - Not in global cache (or cache expired)
   * - Not already in pricesRef (current session)
   * - Not currently pending
   */
  const getMissingDestinations = useCallback((origins: string[], destinations: string[]): string[] => {
    if (origins.length === 0) return [];
    
    const now = Date.now();
    const originsKey = getOriginsKey(origins);
    const currentOriginsKey = lastOriginsKey.current;
    
    // If origins changed, everything is "missing"
    const originsChanged = originsKey !== currentOriginsKey && currentOriginsKey !== '';
    
    return destinations.filter(dest => {
      // If origins just changed, we need all destinations
      if (originsChanged) return true;
      
      const cacheKey = getCacheKey(origins, dest);
      
      // Check global cache
      const cached = pricesCache.get(cacheKey);
      if (cached && (now - cached.timestamp) < CACHE_TTL) {
        return false; // Valid cache hit
      }
      
      // Check session-level prices
      if (pricesRef.current[dest] !== undefined) {
        return false; // Already known this session
      }
      
      // Check pending requests
      if (pendingRequests.has(cacheKey)) {
        return false; // Already being fetched
      }
      
      return true; // Need to fetch
    });
  }, []);

  const fetchPrices = useCallback((origins: string[], destinations: string[]) => {
    if (!enabled || origins.length === 0 || destinations.length === 0) {
      return;
    }

    const originsKey = getOriginsKey(origins);
    
    // If origins changed, clear the accumulated prices
    if (originsKey !== lastOriginsKey.current) {
      console.log(`[useMapPrices] Origins changed: ${lastOriginsKey.current} -> ${originsKey}, resetting prices`);
      pricesRef.current = {};
      lastOriginsKey.current = originsKey;
    }

    // Clear previous debounce
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Check if we will actually fetch anything
    const now = Date.now();
    const uncachedDestinations: string[] = [];
    
    for (const dest of destinations) {
      const cacheKey = getCacheKey(origins, dest);
      const cached = pricesCache.get(cacheKey);
      
      if (cached && (now - cached.timestamp) < CACHE_TTL) {
        // Hydrate from cache immediately
        pricesRef.current[dest] = cached.data;
        continue;
      }
      
      if (pricesRef.current[dest] !== undefined) continue;
      if (pendingRequests.has(cacheKey)) continue;
      
      uncachedDestinations.push(dest);
    }

    // Update state with cached values immediately
    setPrices({ ...pricesRef.current });

    // If nothing to fetch, done
    if (uncachedDestinations.length === 0) {
      console.log(`[useMapPrices] All ${destinations.length} destinations cached/known`);
      setIsLoading(false);
      return;
    }

    // We will fetch, set loading
    console.log(`[useMapPrices] Will fetch ${uncachedDestinations.length}/${destinations.length} destinations after debounce`);
    setIsLoading(true);
    setError(null);

    debounceTimeout.current = setTimeout(async () => {
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

        console.log(`[useMapPrices] Fetching ${uncachedDestinations.length} prices in ${chunks.length} chunk(s)`);

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
            const responseTime = Date.now(); // Use current time, not the debounce start time
            for (const [iata, priceData] of Object.entries(data.prices)) {
              const price = priceData as MapPrice | null;
              
              // Update accumulated prices
              pricesRef.current[iata] = price;
              
              // Update cache with fresh timestamp
              const cacheKey = getCacheKey(origins, iata);
              pricesCache.set(cacheKey, {
                data: price,
                timestamp: responseTime
              });
              
              // Remove from pending
              pendingRequests.delete(cacheKey);
            }
            console.log(`[useMapPrices] Cached ${Object.keys(data.prices).length} prices (TTL: 6h)`);
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

  return { prices, isLoading, error, fetchPrices, getMissingDestinations };
}
