/**
 * WidgetSkeletons - Loading skeleton components for chat widgets
 *
 * Provides consistent loading states across all widget types
 * to improve perceived performance.
 */

import React from "react";
import { cn } from "@/lib/utils";

/**
 * Base skeleton component with animation
 */
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps): JSX.Element {
  return (
    <div
      className={cn(
        "animate-pulse bg-gray-200 dark:bg-gray-700 rounded",
        className
      )}
    />
  );
}

/**
 * Date picker skeleton
 */
export function DatePickerSkeleton(): JSX.Element {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <Skeleton className="h-5 w-32 mb-3" />
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-6 w-full" />
        ))}
        {/* Calendar days */}
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={`day-${i}`} className="h-8 w-full" />
        ))}
      </div>
    </div>
  );
}

/**
 * Travelers selector skeleton
 */
export function TravelersSelectorSkeleton(): JSX.Element {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <Skeleton className="h-5 w-40 mb-4" />
      {/* Traveler rows */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-6 w-8" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      ))}
      <Skeleton className="h-10 w-full mt-4 rounded-md" />
    </div>
  );
}

/**
 * City selection skeleton
 */
export function CitySelectionSkeleton(): JSX.Element {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <Skeleton className="h-5 w-48 mb-4" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Flight card skeleton
 */
export function FlightCardSkeleton(): JSX.Element {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="flex items-center gap-4 mb-3">
        <div className="flex-1">
          <Skeleton className="h-5 w-12 mb-1" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-1 w-20" />
        <div className="flex-1 text-right">
          <Skeleton className="h-5 w-12 mb-1 ml-auto" />
          <Skeleton className="h-4 w-16 ml-auto" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </div>
  );
}

/**
 * Hotel card skeleton
 */
export function HotelCardSkeleton(): JSX.Element {
  return (
    <div className="flex gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <Skeleton className="h-24 w-24 rounded-lg flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-3 w-40 mb-2" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}

/**
 * Activity card skeleton
 */
export function ActivityCardSkeleton(): JSX.Element {
  return (
    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex gap-3">
        <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-20 mb-2" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Comparison widget skeleton
 */
export function ComparisonSkeleton(): JSX.Element {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <Skeleton className="h-5 w-40 mb-4" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Progress bar skeleton
 */
export function ProgressSkeleton(): JSX.Element {
  return (
    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}

/**
 * Trip summary skeleton
 */
export function TripSummarySkeleton(): JSX.Element {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded" />
          <div className="flex-1">
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded" />
          <div className="flex-1">
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded" />
          <div className="flex-1">
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    </div>
  );
}

/**
 * Generic widget skeleton with configurable rows
 */
interface GenericWidgetSkeletonProps {
  rows?: number;
  showHeader?: boolean;
  showFooter?: boolean;
}

export function GenericWidgetSkeleton({
  rows = 3,
  showHeader = true,
  showFooter = false,
}: GenericWidgetSkeletonProps): JSX.Element {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {showHeader && <Skeleton className="h-5 w-32 mb-4" />}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
      {showFooter && <Skeleton className="h-10 w-full mt-4" />}
    </div>
  );
}

/**
 * Map of widget types to their skeleton components
 */
export const WIDGET_SKELETONS: Record<string, React.FC> = {
  datePicker: DatePickerSkeleton,
  dateRangePicker: DatePickerSkeleton,
  travelersSelector: TravelersSelectorSkeleton,
  citySelector: CitySelectionSkeleton,
  flightCard: FlightCardSkeleton,
  hotelCard: HotelCardSkeleton,
  activityCard: ActivityCardSkeleton,
  comparison: ComparisonSkeleton,
  progress: ProgressSkeleton,
  tripSummary: TripSummarySkeleton,
};

/**
 * Get skeleton component for a widget type
 */
export function getWidgetSkeleton(widgetType: string): React.FC {
  return WIDGET_SKELETONS[widgetType] || GenericWidgetSkeleton;
}

export default {
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
};
