import { useState, useCallback, useEffect } from "react";
import { usePlannerEvent } from "@/lib/eventBus";

const DEPARTURE_CACHE_KEY = 'travliaq_auto_departure';

/**
 * Hook to manage map state (center, zoom, animation)
 * Includes event bus subscriptions for map updates
 * 
 * IMPORTANT: We try to start the map centered on the user's cached location
 * to avoid the jarring animation where map shows one region then flies elsewhere.
 */
export function useMapState() {
  // Try to get cached departure location for initial center
  const getCachedLocation = (): { center: [number, number]; zoom: number } | null => {
    try {
      const cached = localStorage.getItem(DEPARTURE_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.airport?.lng && parsed?.airport?.lat) {
          return {
            center: [parsed.airport.lng, parsed.airport.lat],
            zoom: 5, // Start at destination zoom level
          };
        }
      }
    } catch {
      // Ignore cache errors
    }
    return null;
  };

  const cachedLocation = getCachedLocation();
  
  // If we have cached location, start there. Otherwise start at a neutral world view.
  // This prevents showing Europe briefly before flying to user's actual location.
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    cachedLocation?.center ?? [0, 30] // World center if no cache
  );
  const [mapZoom, setMapZoom] = useState(
    cachedLocation?.zoom ?? 2 // Neutral zoom if no cache
  );
  const [initialAnimationDone, setInitialAnimationDone] = useState(false);
  
  // If we started from cache, mark animation as already complete (no need to fly)
  const [skipInitialAnimation] = useState(!!cachedLocation);

  // Event listener: map zoom from event bus
  usePlannerEvent("map:zoom", useCallback((data) => {
    setMapCenter(data.center);
    setMapZoom(data.zoom);
  }, []));

  const handleAnimationComplete = useCallback(() => {
    setInitialAnimationDone(true);
  }, []);

  return {
    mapCenter,
    setMapCenter,
    mapZoom,
    setMapZoom,
    initialAnimationDone,
    setInitialAnimationDone,
    handleAnimationComplete,
    skipInitialAnimation,
  };
}
