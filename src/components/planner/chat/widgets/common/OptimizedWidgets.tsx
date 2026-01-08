/**
 * OptimizedWidgets - React.memo wrappers for expensive components
 *
 * Provides memoized versions of widgets that benefit from
 * preventing unnecessary re-renders.
 */

import React, { memo } from "react";
import { DatePickerWidget } from "../DatePickerWidget";
import { DateRangePickerWidget } from "../DateRangePickerWidget";
import { TravelersWidget } from "../TravelersWidget";
import { CitySelectionWidget } from "../CitySelectionWidget";
import { MarkdownMessage } from "../MarkdownMessage";

/**
 * Shallow comparison for props (handles arrays and objects at first level)
 */
function shallowEqual(prev: Record<string, unknown>, next: Record<string, unknown>): boolean {
  const prevKeys = Object.keys(prev);
  const nextKeys = Object.keys(next);

  if (prevKeys.length !== nextKeys.length) {
    return false;
  }

  for (const key of prevKeys) {
    const prevValue = prev[key];
    const nextValue = next[key];

    // Skip function comparison (assume stable references)
    if (typeof prevValue === "function" && typeof nextValue === "function") {
      continue;
    }

    // Shallow array comparison
    if (Array.isArray(prevValue) && Array.isArray(nextValue)) {
      if (prevValue.length !== nextValue.length) {
        return false;
      }
      for (let i = 0; i < prevValue.length; i++) {
        if (prevValue[i] !== nextValue[i]) {
          return false;
        }
      }
      continue;
    }

    // Direct comparison for primitives
    if (prevValue !== nextValue) {
      return false;
    }
  }

  return true;
}

/**
 * Create a comparison function that ignores callback props (functions)
 */
function createPropsComparisonIgnoringCallbacks<P extends object>(): (prev: P, next: P) => boolean {
  return (prev, next) => {
    const prevFiltered: Record<string, unknown> = {};
    const nextFiltered: Record<string, unknown> = {};

    // Copy all non-function props
    for (const [key, value] of Object.entries(prev)) {
      if (typeof value !== "function") {
        prevFiltered[key] = value;
      }
    }
    for (const [key, value] of Object.entries(next)) {
      if (typeof value !== "function") {
        nextFiltered[key] = value;
      }
    }

    return shallowEqual(prevFiltered, nextFiltered);
  };
}

/**
 * Memoized DatePickerWidget
 *
 * Re-renders only when non-callback props change.
 */
export const MemoizedDatePickerWidget = memo(
  DatePickerWidget,
  createPropsComparisonIgnoringCallbacks()
);
MemoizedDatePickerWidget.displayName = "MemoizedDatePickerWidget";

/**
 * Memoized DateRangePickerWidget
 *
 * Re-renders only when non-callback props change.
 */
export const MemoizedDateRangePickerWidget = memo(
  DateRangePickerWidget,
  createPropsComparisonIgnoringCallbacks()
);
MemoizedDateRangePickerWidget.displayName = "MemoizedDateRangePickerWidget";

/**
 * Memoized TravelersWidget
 *
 * Re-renders only when non-callback props change.
 */
export const MemoizedTravelersWidget = memo(
  TravelersWidget,
  createPropsComparisonIgnoringCallbacks()
);
MemoizedTravelersWidget.displayName = "MemoizedTravelersWidget";

/**
 * Memoized CitySelectionWidget
 *
 * Re-renders only when non-callback props change.
 */
export const MemoizedCitySelectionWidget = memo(
  CitySelectionWidget,
  createPropsComparisonIgnoringCallbacks()
);
MemoizedCitySelectionWidget.displayName = "MemoizedCitySelectionWidget";

/**
 * Memoized MarkdownMessage
 *
 * Re-renders only when content changes.
 */
export const MemoizedMarkdownMessage = memo(MarkdownMessage, (prev, next) => {
  return prev.content === next.content && prev.className === next.className;
});
MemoizedMarkdownMessage.displayName = "MemoizedMarkdownMessage";

/**
 * Generic HOC to create a memoized version of any component
 *
 * @example
 * ```tsx
 * const MemoizedMyWidget = withMemo(MyWidget);
 * ```
 */
export function withMemo<P extends object>(
  Component: React.ComponentType<P>
): React.MemoExoticComponent<React.ComponentType<P>> {
  const MemoizedComponent = memo(Component, createPropsComparisonIgnoringCallbacks<P>());
  MemoizedComponent.displayName = `Memo(${Component.displayName || Component.name || "Component"})`;
  return MemoizedComponent;
}

/**
 * Pure component wrapper for class components
 *
 * @example
 * ```tsx
 * class MyWidget extends PureComponent<Props> {
 *   // Only re-renders when props actually change
 * }
 * ```
 */
export { PureComponent } from "react";

export default {
  MemoizedDatePickerWidget,
  MemoizedDateRangePickerWidget,
  MemoizedTravelersWidget,
  MemoizedCitySelectionWidget,
  MemoizedMarkdownMessage,
  withMemo,
};
