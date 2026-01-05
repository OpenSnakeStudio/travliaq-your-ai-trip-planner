import { useState, useCallback } from "react";
import { usePlannerEvent } from "@/lib/eventBus";

/**
 * Hook to manage map state (center, zoom, animation)
 * Includes event bus subscriptions for map updates
 */
export function useMapState() {
  // Start at Europe view to avoid jarring globe-to-location animation
  const [mapCenter, setMapCenter] = useState<[number, number]>([2.3522, 48.8566]); // Paris/Europe
  const [mapZoom, setMapZoom] = useState(4.5); // Reasonable zoom for Europe
  const [initialAnimationDone, setInitialAnimationDone] = useState(false);

  // Event listener: map zoom from event bus
  usePlannerEvent(
    "map:zoom",
    useCallback((data) => {
      // Debug: track unexpected zoom resets
      // (we log a stack so we can identify the emitter)
      console.debug("[useMapState] map:zoom", data, new Error("map:zoom").stack);
      setMapCenter(data.center);
      setMapZoom(data.zoom);
    }, [])
  );

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
