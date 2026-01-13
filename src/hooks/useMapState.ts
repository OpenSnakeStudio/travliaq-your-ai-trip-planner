import { useState, useCallback, useRef } from "react";
import { usePlannerEvent } from "@/lib/eventBus";

/**
 * Hook to manage map state (center, zoom, animation)
 * Includes event bus subscriptions for map updates
 * 
 * IMPORTANT: We start at zoom 1 (world view) so the map doesn't show any specific
 * region before user location is detected. This prevents the jarring animation
 * where map flies to Europe then back to user's actual location.
 */
export function useMapState() {
  // Start at world center with very low zoom - map will animate directly to user location
  // This prevents the "fly to Europe then back" animation artifact
  const [mapCenter, setMapCenter] = useState<[number, number]>([0, 20]); // World center (slightly north for land visibility)
  const [mapZoom, setMapZoom] = useState(1.5); // Very wide zoom - just show the whole world
  const [initialAnimationDone, setInitialAnimationDone] = useState(false);

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
  };
}
