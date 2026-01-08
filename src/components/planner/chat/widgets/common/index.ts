/**
 * Common Widget Components
 *
 * Shared components used across all chat widgets:
 * - ErrorBoundary for error handling
 * - Skeleton components for loading states
 * - Optimized (memoized) widget wrappers
 */

// Error handling
export {
  ErrorBoundary,
  WidgetErrorFallback,
  withErrorBoundary,
} from "./ErrorBoundary";

// Loading skeletons
export {
  Skeleton,
  DatePickerSkeleton,
  TravelersSelectorSkeleton,
  CitySelectionSkeleton,
  FlightCardSkeleton,
  HotelCardSkeleton,
  ActivityCardSkeleton,
  ComparisonSkeleton,
  ProgressSkeleton,
  TripSummarySkeleton,
  GenericWidgetSkeleton,
  getWidgetSkeleton,
  WIDGET_SKELETONS,
} from "./WidgetSkeletons";

// Optimized (memoized) widgets
export {
  MemoizedDatePickerWidget,
  MemoizedDateRangePickerWidget,
  MemoizedTravelersWidget,
  MemoizedCitySelectionWidget,
  MemoizedMarkdownMessage,
  withMemo,
} from "./OptimizedWidgets";
