import { memo, useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import mapboxgl from "mapbox-gl";
import type { AirportMarker } from "@/hooks/useAirportsInBounds";
import type { MapPrice, MapPricesResult } from "@/hooks/useMapPrices";
import eventBus from "@/lib/eventBus";

interface PriceMarkerData {
  hubId: string;
  airport: AirportMarker;
  screenPos: { x: number; y: number };
  price: number | null | undefined; // undefined = loading, null = no flight
  isOrigin: boolean;
  visible: boolean;
}

interface FlightPriceMarkersProps {
  map: mapboxgl.Map | null;
  airports: AirportMarker[];
  prices: MapPricesResult;
  departureIata?: string;
  departureCity?: string;
  departureAirports: string[];
  currentZoom: number;
  isFlightsTab: boolean;
}

// Stable hub ID generator
function getHubId(airport: AirportMarker): string {
  return airport.hubId ?? airport.cityName?.toLowerCase().trim() ?? airport.iata;
}

// Get minimum price across all hub IATAs
function getHubPrice(airport: AirportMarker, prices: MapPricesResult): number | null | undefined {
  const hubIatas = airport.allIatas?.length ? airport.allIatas : [airport.iata];
  let minPrice: number | null | undefined = undefined;
  
  for (const iata of hubIatas) {
    const pd = prices[iata];
    if (pd !== undefined) {
      if (pd !== null && pd.price != null) {
        if (minPrice === undefined || minPrice === null || pd.price < minPrice) {
          minPrice = pd.price;
        }
      } else if (minPrice === undefined) {
        minPrice = null;
      }
    }
  }
  
  return minPrice;
}

// Single price marker component - memoized for stability
const PriceMarker = memo(function PriceMarker({
  data,
  onClick,
}: {
  data: PriceMarkerData;
  onClick: (airport: AirportMarker) => void;
}) {
  const { airport, screenPos, price, isOrigin, visible } = data;
  
  if (!visible) return null;
  
  const cityName = airport.cityName || airport.name;
  
  // Determine display text
  let priceContent: React.ReactNode;
  let priceColor = "#0369a1";
  
  if (isOrigin) {
    priceContent = "Départ";
    priceColor = "#64748b";
  } else if (price === undefined) {
    // Loading state with animated dots
    priceContent = (
      <span className="loading-dots" style={{ display: "inline-flex", gap: 2 }}>
        <span style={{ animation: "bounce-dot 1s infinite", animationDelay: "0ms" }}>•</span>
        <span style={{ animation: "bounce-dot 1s infinite", animationDelay: "150ms" }}>•</span>
        <span style={{ animation: "bounce-dot 1s infinite", animationDelay: "300ms" }}>•</span>
      </span>
    );
  } else if (price === null) {
    // No flight - this shouldn't render (filtered out)
    return null;
  } else {
    priceContent = `${price}€`;
  }
  
  return (
    <div
      className="flight-price-marker"
      style={{
        position: "absolute",
        left: screenPos.x,
        top: screenPos.y,
        transform: "translate(-50%, -100%)",
        zIndex: 10,
        pointerEvents: isOrigin ? "none" : "auto",
        cursor: isOrigin ? "default" : "pointer",
        transition: "opacity 0.15s ease-out",
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!isOrigin) onClick(airport);
      }}
    >
      <div
        className="airport-badge"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transition: "transform 0.15s ease-out, filter 0.15s ease-out",
          filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.35))",
        }}
        onMouseEnter={(e) => {
          if (!isOrigin) {
            e.currentTarget.style.transform = "scale(1.08)";
            e.currentTarget.style.filter = "drop-shadow(0 4px 10px rgba(0,0,0,0.3))";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.filter = "drop-shadow(0 3px 8px rgba(0,0,0,0.35))";
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
            padding: "6px 12px 5px",
            borderRadius: 10,
            border: "1.5px solid rgba(0,0,0,0.12)",
            minWidth: 48,
            boxShadow: "inset 0 1px 2px rgba(255,255,255,0.8)",
          }}
        >
          <span
            style={{
              color: "#0f172a",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.01em",
              lineHeight: 1.1,
              maxWidth: 85,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {cityName}
          </span>
          <span
            className="airport-price"
            style={{
              color: priceColor,
              fontSize: 13,
              fontWeight: 800,
              lineHeight: 1.2,
              marginTop: 2,
            }}
          >
            {priceContent}
          </span>
        </div>
        {/* Arrow pointer */}
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "7px solid transparent",
            borderRight: "7px solid transparent",
            borderTop: "8px solid #ffffff",
            marginTop: -1,
            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.15))",
          }}
        />
      </div>
    </div>
  );
});

// Main component that manages all price markers via React Portal
function FlightPriceMarkersInner({
  map,
  airports,
  prices,
  departureIata,
  departureCity,
  departureAirports,
  currentZoom,
  isFlightsTab,
}: FlightPriceMarkersProps) {
  const [markers, setMarkers] = useState<PriceMarkerData[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  
  // Update screen positions on map move
  const updatePositions = useCallback(() => {
    if (!map || !isFlightsTab) return;
    
    const userDepIata = departureIata?.toUpperCase();
    const userDepCity = departureCity?.toLowerCase().trim();
    const depSet = new Set(departureAirports.map((d) => d.toUpperCase()));
    const hideDeparturePin = currentZoom < 7;
    
    const newMarkers: PriceMarkerData[] = [];
    
    for (const airport of airports) {
      const hubId = getHubId(airport);
      const price = getHubPrice(airport, prices);
      
      // Check if origin
      const isOrigin =
        (userDepIata && airport.iata.toUpperCase() === userDepIata) ||
        (userDepCity && airport.cityName?.toLowerCase().trim() === userDepCity) ||
        depSet.has(airport.iata.toUpperCase());
      
      // Hide origin when zoomed out, or hide destinations with null price (no flight)
      if ((isOrigin && hideDeparturePin) || (price === null && !isOrigin)) {
        continue;
      }
      
      // Project to screen coordinates
      const point = map.project([airport.lng, airport.lat]);
      const canvas = map.getCanvas();
      const bounds = canvas.getBoundingClientRect();
      
      // Check if in viewport (with some margin)
      const margin = 50;
      const inViewport =
        point.x >= -margin &&
        point.x <= bounds.width + margin &&
        point.y >= -margin &&
        point.y <= bounds.height + margin;
      
      newMarkers.push({
        hubId,
        airport,
        screenPos: { x: point.x, y: point.y },
        price,
        isOrigin,
        visible: inViewport,
      });
    }
    
    setMarkers(newMarkers);
  }, [map, airports, prices, departureIata, departureCity, departureAirports, currentZoom, isFlightsTab]);
  
  // Set up map event listeners for position updates
  useEffect(() => {
    if (!map || !isFlightsTab) {
      setMarkers([]);
      return;
    }
    
    // Create container for portal if needed
    if (!containerRef.current) {
      const container = document.createElement("div");
      container.id = "flight-price-markers-container";
      container.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        overflow: hidden;
        z-index: 5;
      `;
      // Make individual markers clickable
      container.querySelectorAll(".flight-price-marker").forEach((el) => {
        (el as HTMLElement).style.pointerEvents = "auto";
      });
      
      const mapContainer = map.getContainer();
      mapContainer.appendChild(container);
      containerRef.current = container;
    }
    
    // Update function with RAF throttling
    const scheduleUpdate = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updatePositions);
    };
    
    // Initial update
    updatePositions();
    
    // Listen to map events
    map.on("move", scheduleUpdate);
    map.on("zoom", scheduleUpdate);
    map.on("resize", scheduleUpdate);
    
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      map.off("move", scheduleUpdate);
      map.off("zoom", scheduleUpdate);
      map.off("resize", scheduleUpdate);
    };
  }, [map, isFlightsTab, updatePositions]);
  
  // Update positions when airports or prices change
  useEffect(() => {
    updatePositions();
  }, [airports, prices, updatePositions]);
  
  // Cleanup container on unmount
  useEffect(() => {
    return () => {
      if (containerRef.current) {
        containerRef.current.remove();
        containerRef.current = null;
      }
    };
  }, []);
  
  // Handle marker click
  const handleClick = useCallback((airport: AirportMarker) => {
    console.log(`[FlightPriceMarkers] Hub clicked: ${getHubId(airport)} - ${airport.cityName}`);
    eventBus.emit("airports:click", { airport });
  }, []);
  
  // Render via portal
  if (!containerRef.current || !isFlightsTab) return null;
  
  return createPortal(
    <>
      {markers.map((marker) => (
        <PriceMarker key={marker.hubId} data={marker} onClick={handleClick} />
      ))}
    </>,
    containerRef.current
  );
}

// Inject bounce-dot animation styles once
function injectStyles() {
  if (document.getElementById("flight-price-markers-styles")) return;
  
  const style = document.createElement("style");
  style.id = "flight-price-markers-styles";
  style.textContent = `
    @keyframes bounce-dot {
      0%, 80%, 100% {
        transform: translateY(0);
        opacity: 0.5;
      }
      40% {
        transform: translateY(-3px);
        opacity: 1;
      }
    }
    
    #flight-price-markers-container .flight-price-marker {
      pointer-events: auto;
    }
  `;
  document.head.appendChild(style);
}

// Wrapper with styles injection
const FlightPriceMarkers = memo(function FlightPriceMarkers(props: FlightPriceMarkersProps) {
  useEffect(() => {
    injectStyles();
  }, []);
  
  return <FlightPriceMarkersInner {...props} />;
});

export default FlightPriceMarkers;
