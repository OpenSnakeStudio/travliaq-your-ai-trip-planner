/**
 * Comparison Widgets - Side-by-side comparison components
 *
 * These widgets enable users to compare multiple options
 * (flights, hotels, activities) to make informed decisions.
 */

// ComparisonWidget - Generic comparison
export {
  ComparisonWidget,
  CompactComparisonBar,
  MetricComparisonList,
  type ComparisonItemType,
  type ComparisonMetric,
  type ComparisonItem,
} from "./ComparisonWidget";

// FlightComparisonCard - Flight-specific comparison
export {
  FlightComparisonCard,
  type FlightLegComparison,
  type FlightComparison,
} from "./FlightComparisonCard";

// HotelComparisonCard - Hotel-specific comparison
export {
  HotelComparisonCard,
  type HotelAmenityComparison,
  type HotelComparison,
} from "./HotelComparisonCard";
