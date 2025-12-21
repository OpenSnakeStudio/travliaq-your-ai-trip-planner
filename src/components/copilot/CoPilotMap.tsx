import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "@/styles/mapbox-overrides.css";
import { useTranslation } from "react-i18next";

export interface MapMarker {
  id: string;
  coordinates: [number, number];
  type: "flight" | "hotel" | "activity" | "trip";
  label: string;
  price?: string;
  rating?: number;
  image?: string;
}

interface CoPilotMapProps {
  markers: MapMarker[];
  activeTab: "flights" | "hotels" | "activities" | "trip";
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (marker: MapMarker) => void;
  flightPath?: { from: [number, number]; to: [number, number] };
}

const CoPilotMap = ({
  markers,
  activeTab,
  center = [2.3522, 48.8566], // Paris default
  zoom = 4,
  onMarkerClick,
  flightPath,
}: CoPilotMapProps) => {
  const { t } = useTranslation();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = "pk.eyJ1IjoibW9oYW1lZGJvdWNoaWJhIiwiYSI6ImNtZ2t3dHZ0MzAyaDAya3NldXJ1dTkxdTAifQ.vYCeVngdG4_B0Zpms0dQNA";

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center,
      zoom,
      attributionControl: false,
    });

    map.current.on("load", () => {
      setIsLoaded(true);
    });

    map.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
    map.current.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");

    return () => {
      Object.values(markersRef.current).forEach((marker) => marker.remove());
      markersRef.current = {};
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update center when it changes
  useEffect(() => {
    if (!map.current || !isLoaded) return;
    map.current.flyTo({ center, zoom, duration: 1200 });
  }, [center, zoom, isLoaded]);

  // Draw flight path arc
  useEffect(() => {
    if (!map.current || !isLoaded || !flightPath) return;

    const sourceId = "flight-arc";
    const layerId = "flight-arc-layer";

    // Remove existing layers
    if (map.current.getLayer(layerId)) {
      map.current.removeLayer(layerId);
    }
    if (map.current.getSource(sourceId)) {
      map.current.removeSource(sourceId);
    }

    // Create arc
    const steps = 100;
    const arc: [number, number][] = [];
    const [lng1, lat1] = flightPath.from;
    const [lng2, lat2] = flightPath.to;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const lng = lng1 + (lng2 - lng1) * t;
      const lat = lat1 + (lat2 - lat1) * t;
      // Add arc height
      const height = Math.sin(Math.PI * t) * 0.15 * Math.abs(lng2 - lng1);
      arc.push([lng, lat + height]);
    }

    map.current.addSource(sourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: arc },
      },
    });

    map.current.addLayer({
      id: layerId,
      type: "line",
      source: sourceId,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        "line-color": "hsl(193, 100%, 42%)",
        "line-width": 3,
        "line-dasharray": [2, 2],
      },
    });

    // Fit bounds to show both points
    const bounds = new mapboxgl.LngLatBounds()
      .extend(flightPath.from)
      .extend(flightPath.to);
    map.current.fitBounds(bounds, { padding: 80, duration: 1200 });
  }, [flightPath, isLoaded]);

  // Update markers
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    // Remove old markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    // Add new markers
    markers.forEach((marker) => {
      const el = document.createElement("div");
      el.className = "copilot-marker";
      
      const getIcon = () => {
        switch (marker.type) {
          case "flight": return "✈️";
          case "hotel": return "🏨";
          case "activity": return "🎯";
          case "trip": return "📍";
          default: return "📍";
        }
      };

      const getColor = () => {
        switch (marker.type) {
          case "flight": return "hsl(193, 100%, 42%)";
          case "hotel": return "hsl(45, 100%, 70%)";
          case "activity": return "hsl(142, 71%, 45%)";
          case "trip": return "hsl(262, 83%, 58%)";
          default: return "hsl(193, 100%, 42%)";
        }
      };

      el.innerHTML = `
        <div style="
          background: ${getColor()};
          color: white;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: transform 0.2s;
        ">
          <span>${getIcon()}</span>
          ${marker.price ? `<span>${marker.price}</span>` : `<span>${marker.label}</span>`}
        </div>
      `;

      el.addEventListener("mouseenter", () => {
        el.style.transform = "scale(1.1)";
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "scale(1)";
      });
      el.addEventListener("click", () => {
        onMarkerClick?.(marker);
      });

      const mapboxMarker = new mapboxgl.Marker(el)
        .setLngLat(marker.coordinates)
        .addTo(map.current!);

      markersRef.current[marker.id] = mapboxMarker;
    });
  }, [markers, isLoaded, onMarkerClick]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Map overlay gradient */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/20 to-transparent" />
    </div>
  );
};

export default CoPilotMap;
