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
  fetchPrices: (origin: string, destinations: string[]) => void;
}

// Cache with TTL (30 minutes as per API)
const pricesCache = new Map<string, { data: MapPrice | null; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCacheKey(origin: string, destination: string): string {
  return `${origin}-${destination}`;
}

export function useMapPrices(options: UseMapPricesOptions = {}): UseMapPricesResult {
  const { enabled = true, debounceMs = 300 } = options;
  
  const [prices, setPrices] = useState<MapPricesResult>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const abortController = useRef<AbortController | null>(null);
  const lastRequest = useRef<{ origin: string; destinations: string[] } | null>(null);

  const fetchPrices = useCallback((origin: string, destinations: string[]) => {
    if (!enabled || !origin || destinations.length === 0) {
      return;
    }

    // Store request for comparison
    lastRequest.current = { origin, destinations };

    // Clear previous debounce
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(async () => {
      // Check cache first
      const now = Date.now();
      const cachedPrices: MapPricesResult = {};
      const uncachedDestinations: string[] = [];

      for (const dest of destinations) {
        const cacheKey = getCacheKey(origin, dest);
        const cached = pricesCache.get(cacheKey);
        
        if (cached && (now - cached.timestamp) < CACHE_TTL) {
          cachedPrices[dest] = cached.data;
        } else {
          uncachedDestinations.push(dest);
        }
      }

      // If all cached, return immediately
      if (uncachedDestinations.length === 0) {
        setPrices(cachedPrices);
        return;
      }

      // Set cached prices immediately, show loading for others
      setPrices(cachedPrices);
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

        const allPrices: MapPricesResult = { ...cachedPrices };

        for (const chunk of chunks) {
          const { data, error: fnError } = await supabase.functions.invoke('map-prices', {
            body: {
              origin,
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
              allPrices[iata] = price;
              
              // Update cache
              pricesCache.set(getCacheKey(origin, iata), {
                data: price,
                timestamp: now
              });
            }
          }
        }

        setPrices(allPrices);
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
