/**
 * Interactive Widgets - Rich visual components
 *
 * These widgets provide immersive visual experiences
 * for timeline, weather, and map displays.
 */

// TimelineWidget - Day-by-day itinerary
export {
  TimelineWidget,
  CompactTimeline,
  type TimelineItemType,
  type TimeOfDay,
  type TimelineItem,
  type TimelineDay,
} from "./TimelineWidget";

// WeatherWidget - Weather forecasts
export {
  WeatherWidget,
  WeatherStrip,
  WeatherBadge,
  type WeatherCondition,
  type DailyForecast,
  type WeatherAlert,
} from "./WeatherWidget";

// MapPreviewWidget - Static map with markers
export {
  MapPreviewWidget,
  MapBadge,
  ItineraryRoute,
  type MarkerType,
  type MapMarker,
  type RouteSegment,
} from "./MapPreviewWidget";
