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

// Cache with TTL (30 minutes as per API)
// Key is sorted origins + destination to ensure stability
const pricesCache = new Map<string, { data: MapPrice | null; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCacheKey(origins: string[], destination: string): string {
  return `${origins.sort().join(',')}-${destination}`;
}

export function useMapPrices(options: UseMapPricesOptions = {}): UseMapPricesResult {
  const { enabled = true, debounceMs = 300 } = options;
  
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

    // If origins changed, clear the accumulated prices
    const originsKey = origins.sort().join(',');
    if (originsKey !== lastOriginsKey.current) {
      pricesRef.current = {};
      lastOriginsKey.current = originsKey;
    }

    // Clear previous debounce
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(async () => {
      // Check cache first
      const now = Date.now();
      const cachedPrices: MapPricesResult = { ...pricesRef.current };
      const uncachedDestinations: string[] = [];

      for (const dest of destinations) {
        const cacheKey = getCacheKey(origins, dest);
        const cached = pricesCache.get(cacheKey);
        
        if (cached && (now - cached.timestamp) < CACHE_TTL) {
          cachedPrices[dest] = cached.data;
        } else if (pricesRef.current[dest] === undefined) {
          // Only fetch if not already in our accumulated prices
          uncachedDestinations.push(dest);
        }
      }

      // Update accumulated prices with cached values
      pricesRef.current = { ...pricesRef.current, ...cachedPrices };
      setPrices(pricesRef.current);

      // If all cached/known, return immediately
      if (uncachedDestinations.length === 0) {
        return;
      }

      setIsLoading(true);
      setError(null);

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
              origins,  // Send all origin airports
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
              pricesCache.set(getCacheKey(origins, iata), {
                data: price,
                timestamp: now
              });
            }
          }
        }

        setPrices({ ...pricesRef.current });
      } catch (err) {
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
