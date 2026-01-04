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
  /** Force version increment to trigger re-renders */
  priceVersion: number;
  /** Clear cache for specific destinations or all */
  clearCache: (destinations?: string[]) => void;
}

// Constants
const STORAGE_KEY = 'travliaq_price_cache_v2';
const CACHE_TTL_WITH_PRICE = 6 * 60 * 60 * 1000; // 6 hours for valid prices
const CACHE_TTL_NULL_PRICE = 30 * 60 * 1000; // 30 minutes for null prices (allow retry)
const MAX_CACHE_ENTRIES = 500;

// Cache with TTL - persists across component remounts
// Key is sorted origins + destination to ensure stability
interface CacheEntry {
  data: MapPrice | null;
  timestamp: number;
}

const pricesCache = new Map<string, CacheEntry>();
let cacheLoaded = false;

// Track pending destinations to avoid duplicate requests
const pendingRequests = new Set<string>();

function getCacheKey(origins: string[], destination: string): string {
  return `${[...origins].sort().join(',')}-${destination}`;
}

function getOriginsKey(origins: string[]): string {
  return [...origins].sort().join(',');
}

// Get TTL based on price value
function getTTL(priceData: MapPrice | null): number {
  return priceData !== null ? CACHE_TTL_WITH_PRICE : CACHE_TTL_NULL_PRICE;
}

// Load cache from localStorage
function loadCacheFromStorage(): void {
  if (cacheLoaded) return;
  cacheLoaded = true;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    
    const parsed = JSON.parse(stored) as Record<string, CacheEntry>;
    const now = Date.now();
    let validCount = 0;
    
    for (const [key, entry] of Object.entries(parsed)) {
      const ttl = getTTL(entry.data);
      if (now - entry.timestamp < ttl) {
        pricesCache.set(key, entry);
        validCount++;
      }
    }
    
    console.log(`[useMapPrices] Loaded ${validCount} cached prices from localStorage`);
  } catch (err) {
    console.warn('[useMapPrices] Failed to load cache from localStorage:', err);
  }
}

// Save cache to localStorage
function saveCacheToStorage(): void {
  try {
    // Clean up expired entries and limit size
    const now = Date.now();
    const entries: [string, CacheEntry][] = [];
    
    pricesCache.forEach((entry, key) => {
      const ttl = getTTL(entry.data);
      if (now - entry.timestamp < ttl) {
        entries.push([key, entry]);
      }
    });
    
    // Sort by timestamp (newest first) and limit
    entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
    const limitedEntries = entries.slice(0, MAX_CACHE_ENTRIES);
    
    const obj = Object.fromEntries(limitedEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch (err) {
    console.warn('[useMapPrices] Failed to save cache to localStorage:', err);
  }
}

// Debounced save to avoid excessive writes
let saveTimeout: NodeJS.Timeout | null = null;
function debouncedSave(): void {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveCacheToStorage, 2000);
}

export function useMapPrices(options: UseMapPricesOptions = {}): UseMapPricesResult {
  const { enabled = true, debounceMs = 800 } = options;
  
  // Load cache on first mount
  useEffect(() => {
    loadCacheFromStorage();
  }, []);
  
  // Use ref to accumulate prices (never reset, only update)
  const pricesRef = useRef<MapPricesResult>({});
  const [prices, setPrices] = useState<MapPricesResult>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceVersion, setPriceVersion] = useState(0);
  
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const abortController = useRef<AbortController | null>(null);
  const lastOriginsKey = useRef<string>('');

  /**
   * Clear cache for specific destinations or all
   */
  const clearCache = useCallback((destinations?: string[]) => {
    if (!destinations) {
      pricesCache.clear();
      pricesRef.current = {};
      setPrices({});
      localStorage.removeItem(STORAGE_KEY);
      console.log('[useMapPrices] Cleared all cache');
    } else {
      // Clear specific destinations for all origins
      const keysToDelete: string[] = [];
      pricesCache.forEach((_, key) => {
        const dest = key.split('-').pop();
        if (dest && destinations.includes(dest)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => pricesCache.delete(key));
      
      destinations.forEach(dest => {
        delete pricesRef.current[dest];
      });
      setPrices({ ...pricesRef.current });
      debouncedSave();
      console.log(`[useMapPrices] Cleared cache for ${destinations.length} destinations`);
    }
    setPriceVersion(v => v + 1);
  }, []);

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
      
      // Check global cache with appropriate TTL
      const cached = pricesCache.get(cacheKey);
      if (cached) {
        const ttl = getTTL(cached.data);
        if (now - cached.timestamp < ttl) {
          return false; // Valid cache hit
        }
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
      
      if (cached) {
        const ttl = getTTL(cached.data);
        if (now - cached.timestamp < ttl) {
          // Hydrate from cache immediately
          pricesRef.current[dest] = cached.data;
          continue;
        }
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
            const responseTime = Date.now();
            let pricesReceived = 0;
            
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
              pricesReceived++;
            }
            
            const ttlDesc = 'valid=6h, null=30min';
            console.log(`[useMapPrices] Cached ${pricesReceived} prices (TTL: ${ttlDesc})`);
          }
        }

        // Trigger re-render with new version
        setPriceVersion(v => v + 1);
        setPrices({ ...pricesRef.current });
        
        // Save to localStorage
        debouncedSave();
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

  return { prices, isLoading, error, fetchPrices, getMissingDestinations, priceVersion, clearCache };
}
