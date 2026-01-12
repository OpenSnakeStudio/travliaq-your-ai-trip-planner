import { useState, useCallback } from "react";
import { usePlannerEvent } from "@/lib/eventBus";

/**
 * Hook to manage map state (center, zoom, animation)
 * Includes event bus subscriptions for map updates
 */
export function useMapState() {
  // Start at Europe view - map will animate to user's actual location
  // Use a wider Europe view as the starting point before geolocation kicks in
  const [mapCenter, setMapCenter] = useState<[number, number]>([10, 50]); // Central Europe (wider view)
  const [mapZoom, setMapZoom] = useState(3.5); // Wider zoom to show more of Europe/world initially
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
