import { useState, useCallback } from "react";
import { usePlannerEvent } from "@/lib/eventBus";

/**
 * Hook to manage map state (center, zoom, animation)
 * Includes event bus subscriptions for map updates
 * 
 * Flow: Start at world view → Animate to user position → Open flights widget
 */
export function useMapState() {
  // Always start at world view - single smooth animation to user location
  const [mapCenter, setMapCenter] = useState<[number, number]>([0, 30]); // World center
  const [mapZoom, setMapZoom] = useState(1.8); // World zoom - shows continents
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
