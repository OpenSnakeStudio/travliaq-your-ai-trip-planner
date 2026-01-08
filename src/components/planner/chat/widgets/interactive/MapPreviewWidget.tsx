/**
 * MapPreviewWidget - Static map preview with markers
 *
 * Displays a static map preview showing trip locations,
 * with option to expand to full interactive map.
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Plane,
  Hotel,
  Camera,
  Utensils,
  ZoomIn,
  ExternalLink,
  Navigation,
  Route,
  Layers,
  X,
} from "lucide-react";

/**
 * Map marker type
 */
export type MarkerType =
  | "destination"
  | "airport"
  | "hotel"
  | "activity"
  | "restaurant"
  | "attraction"
  | "custom";

/**
 * Map marker
 */
export interface MapMarker {
  id: string;
  type: MarkerType;
  /** Latitude */
  lat: number;
  /** Longitude */
  lng: number;
  /** Label */
  label: string;
  /** Subtitle */
  subtitle?: string;
  /** Custom color */
  color?: string;
  /** Is selected */
  selected?: boolean;
  /** Day number */
  day?: number;
  /** Order in itinerary */
  order?: number;
}

/**
 * Route segment
 */
export interface RouteSegment {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  type: "flight" | "drive" | "walk" | "transit";
  duration?: number;
  distance?: string;
}

/**
 * MapPreviewWidget props
 */
interface MapPreviewWidgetProps {
  /** Markers to display */
  markers: MapMarker[];
  /** Route segments */
  routes?: RouteSegment[];
  /** Map center (auto-calculated if not provided) */
  center?: { lat: number; lng: number };
  /** Zoom level */
  zoom?: number;
  /** Map height */
  height?: number | string;
  /** Show marker list */
  showList?: boolean;
  /** Marker click handler */
  onMarkerClick?: (marker: MapMarker) => void;
  /** Expand handler (to full map) */
  onExpand?: () => void;
  /** Open in maps app */
  onOpenInMaps?: () => void;
  /** Title */
  title?: string;
  /** Show controls */
  showControls?: boolean;
}

/**
 * Marker type icons
 */
const MARKER_ICONS: Record<MarkerType, React.ElementType> = {
  destination: MapPin,
  airport: Plane,
  hotel: Hotel,
  activity: Camera,
  restaurant: Utensils,
  attraction: Camera,
  custom: MapPin,
};

/**
 * Marker type colors
 */
const MARKER_COLORS: Record<MarkerType, string> = {
  destination: "#EF4444", // red
  airport: "#3B82F6", // blue
  hotel: "#8B5CF6", // purple
  activity: "#10B981", // green
  restaurant: "#F59E0B", // amber
  attraction: "#EC4899", // pink
  custom: "#6B7280", // gray
};

/**
 * Calculate bounds for markers
 */
function calculateBounds(markers: MapMarker[]): {
  center: { lat: number; lng: number };
  zoom: number;
} {
  if (markers.length === 0) {
    return { center: { lat: 48.8566, lng: 2.3522 }, zoom: 10 }; // Default: Paris
  }

  if (markers.length === 1) {
    return { center: { lat: markers[0].lat, lng: markers[0].lng }, zoom: 14 };
  }

  const lats = markers.map((m) => m.lat);
  const lngs = markers.map((m) => m.lng);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const center = {
    lat: (minLat + maxLat) / 2,
    lng: (minLng + maxLng) / 2,
  };

  // Estimate zoom based on bounds spread
  const latSpread = maxLat - minLat;
  const lngSpread = maxLng - minLng;
  const maxSpread = Math.max(latSpread, lngSpread);

  let zoom = 10;
  if (maxSpread < 0.01) zoom = 16;
  else if (maxSpread < 0.05) zoom = 14;
  else if (maxSpread < 0.1) zoom = 13;
  else if (maxSpread < 0.5) zoom = 11;
  else if (maxSpread < 1) zoom = 10;
  else if (maxSpread < 5) zoom = 8;
  else zoom = 6;

  return { center, zoom };
}

/**
 * Generate static map URL (using OpenStreetMap tiles simulation)
 * In production, this would use a real static maps API
 */
function getStaticMapUrl(
  center: { lat: number; lng: number },
  zoom: number,
  width: number,
  height: number,
  markers: MapMarker[]
): string {
  // This is a placeholder - in production, use:
  // - Google Static Maps API
  // - Mapbox Static Images API
  // - OpenStreetMap based alternatives

  // For now, return a placeholder that simulates a map
  const baseUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static`;

  // Build marker string
  const markerStr = markers
    .slice(0, 10) // Limit markers
    .map((m) => {
      const color = (m.color || MARKER_COLORS[m.type]).replace("#", "");
      return `pin-s-${m.order || ""}+${color}(${m.lng},${m.lat})`;
    })
    .join(",");

  // Note: This URL format is for Mapbox - would need actual API key
  // For demo, we'll use a simpler approach
  return `${baseUrl}/${markerStr}/${center.lng},${center.lat},${zoom}/${width}x${height}?access_token=YOUR_TOKEN`;
}

/**
 * Marker list item
 */
function MarkerListItem({
  marker,
  onClick,
}: {
  marker: MapMarker;
  onClick?: () => void;
}) {
  const Icon = MARKER_ICONS[marker.type];
  const color = marker.color || MARKER_COLORS[marker.type];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-2 rounded-lg text-left",
        "transition-colors hover:bg-muted",
        marker.selected && "bg-primary/10"
      )}
    >
      {/* Marker icon */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white"
        style={{ backgroundColor: color }}
      >
        {marker.order !== undefined ? (
          <span className="text-xs font-bold">{marker.order}</span>
        ) : (
          <Icon size={14} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{marker.label}</div>
        {marker.subtitle && (
          <div className="text-xs text-muted-foreground truncate">
            {marker.subtitle}
          </div>
        )}
      </div>

      {/* Day badge */}
      {marker.day !== undefined && (
        <span className="px-2 py-0.5 rounded bg-muted text-xs text-muted-foreground">
          Jour {marker.day}
        </span>
      )}
    </button>
  );
}

/**
 * Map placeholder (when no map API available)
 */
function MapPlaceholder({
  markers,
  height,
  onExpand,
}: {
  markers: MapMarker[];
  height: number | string;
  onExpand?: () => void;
}) {
  // Group markers by type
  const grouped = markers.reduce(
    (acc, m) => {
      acc[m.type] = (acc[m.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden",
        "bg-gradient-to-br from-blue-100 via-green-50 to-amber-50",
        "dark:from-blue-900/30 dark:via-green-900/20 dark:to-amber-900/20"
      )}
      style={{ height }}
    >
      {/* Simulated map grid */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Markers visualization */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-wrap gap-2 justify-center max-w-[80%]">
          {markers.slice(0, 8).map((marker, index) => {
            const Icon = MARKER_ICONS[marker.type];
            const color = marker.color || MARKER_COLORS[marker.type];
            return (
              <div
                key={marker.id}
                className="flex flex-col items-center animate-in fade-in zoom-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg"
                  style={{ backgroundColor: color }}
                >
                  {marker.order !== undefined ? (
                    <span className="text-xs font-bold">{marker.order}</span>
                  ) : (
                    <Icon size={14} />
                  )}
                </div>
                <div className="mt-1 px-2 py-0.5 rounded bg-background/80 text-xs font-medium truncate max-w-[80px]">
                  {marker.label}
                </div>
              </div>
            );
          })}
          {markers.length > 8 && (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs font-medium">
              +{markers.length - 8}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
        {Object.entries(grouped).map(([type, count]) => {
          const Icon = MARKER_ICONS[type as MarkerType];
          return (
            <div
              key={type}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/80 text-xs"
            >
              <Icon size={10} style={{ color: MARKER_COLORS[type as MarkerType] }} />
              <span>{count}</span>
            </div>
          );
        })}
      </div>

      {/* Expand button */}
      {onExpand && (
        <button
          type="button"
          onClick={onExpand}
          className="absolute top-2 right-2 p-2 rounded-lg bg-background/80 hover:bg-background shadow transition-colors"
        >
          <ZoomIn size={16} />
        </button>
      )}
    </div>
  );
}

/**
 * MapPreviewWidget Component
 *
 * @example
 * ```tsx
 * <MapPreviewWidget
 *   markers={[
 *     { id: "1", type: "hotel", lat: 41.3851, lng: 2.1734, label: "Hotel Barcelona", order: 1 },
 *     { id: "2", type: "activity", lat: 41.4036, lng: 2.1744, label: "Sagrada Familia", order: 2 },
 *     { id: "3", type: "activity", lat: 41.3917, lng: 2.1649, label: "Casa Batlló", order: 3 },
 *   ]}
 *   title="Votre itinéraire"
 *   showList
 *   onExpand={() => openFullMap()}
 * />
 * ```
 */
export function MapPreviewWidget({
  markers,
  routes,
  center: providedCenter,
  zoom: providedZoom,
  height = 200,
  showList = false,
  onMarkerClick,
  onExpand,
  onOpenInMaps,
  title,
  showControls = true,
}: MapPreviewWidgetProps) {
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  const { center, zoom } = providedCenter
    ? { center: providedCenter, zoom: providedZoom || 12 }
    : calculateBounds(markers);

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarkerId(marker.id);
    onMarkerClick?.(marker);
  };

  // Update markers with selection state
  const markersWithSelection = markers.map((m) => ({
    ...m,
    selected: m.id === selectedMarkerId,
  }));

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Header */}
      {(title || showControls) && (
        <div className="flex items-center justify-between p-3 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <MapPin className="text-primary" size={18} />
            <span className="font-medium">{title || "Carte"}</span>
            <span className="text-sm text-muted-foreground">
              {markers.length} lieu{markers.length > 1 ? "x" : ""}
            </span>
          </div>

          {showControls && (
            <div className="flex items-center gap-1">
              {onOpenInMaps && (
                <button
                  type="button"
                  onClick={onOpenInMaps}
                  className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  title="Ouvrir dans Maps"
                >
                  <ExternalLink size={14} />
                </button>
              )}
              {onExpand && (
                <button
                  type="button"
                  onClick={onExpand}
                  className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  title="Agrandir"
                >
                  <ZoomIn size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Map area */}
      <MapPlaceholder
        markers={markersWithSelection}
        height={height}
        onExpand={onExpand}
      />

      {/* Route info */}
      {routes && routes.length > 0 && (
        <div className="px-3 py-2 border-t bg-muted/20">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Route size={14} />
              <span>
                {routes.length} trajet{routes.length > 1 ? "s" : ""}
              </span>
            </div>
            {routes.some((r) => r.duration) && (
              <div className="text-muted-foreground">
                ~
                {Math.round(
                  routes.reduce((sum, r) => sum + (r.duration || 0), 0) / 60
                )}
                h de trajet
              </div>
            )}
          </div>
        </div>
      )}

      {/* Marker list */}
      {showList && markers.length > 0 && (
        <div className="border-t max-h-[200px] overflow-y-auto">
          <div className="p-2 space-y-1">
            {markersWithSelection.map((marker) => (
              <MarkerListItem
                key={marker.id}
                marker={marker}
                onClick={() => handleMarkerClick(marker)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact map badge for inline display
 */
export function MapBadge({
  markerCount,
  onClick,
}: {
  markerCount: number;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
        "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
        "text-sm font-medium",
        "transition-all hover:scale-[1.02] active:scale-[0.98]"
      )}
    >
      <MapPin size={14} />
      <span>
        Voir sur la carte ({markerCount} lieu{markerCount > 1 ? "x" : ""})
      </span>
    </button>
  );
}

/**
 * Itinerary route preview
 */
export function ItineraryRoute({
  markers,
  onViewMap,
}: {
  markers: MapMarker[];
  onViewMap?: () => void;
}) {
  const sortedMarkers = [...markers].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Route className="text-primary" size={18} />
          <span className="font-medium">Itinéraire</span>
        </div>
        {onViewMap && (
          <button
            type="button"
            onClick={onViewMap}
            className="text-sm text-primary hover:underline"
          >
            Voir la carte
          </button>
        )}
      </div>

      {/* Route visualization */}
      <div className="relative pl-4">
        {sortedMarkers.map((marker, index) => {
          const Icon = MARKER_ICONS[marker.type];
          const color = marker.color || MARKER_COLORS[marker.type];
          const isLast = index === sortedMarkers.length - 1;

          return (
            <div key={marker.id} className="relative pb-4">
              {/* Connector line */}
              {!isLast && (
                <div className="absolute left-0 top-6 bottom-0 w-0.5 bg-border" />
              )}

              {/* Marker */}
              <div className="flex items-start gap-3">
                <div
                  className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: color }}
                >
                  {marker.order || index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{marker.label}</div>
                  {marker.subtitle && (
                    <div className="text-xs text-muted-foreground">
                      {marker.subtitle}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MapPreviewWidget;
