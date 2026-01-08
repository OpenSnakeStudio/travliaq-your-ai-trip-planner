/**
 * Preference Computed Context
 * Computed/derived values context - memoized selectors
 */

import { createContext, useContext } from 'react';
import type {
  TripPreferences,
  HotelFiltersFromPreferences,
  ActivityFiltersFromPreferences,
  FlightPreferencesComputed,
  ComfortLabel,
} from './types';

// ============================================================================
// CONTEXT VALUE TYPE
// ============================================================================

export interface PreferenceComputedContextValue {
  // Getters (used by PlannerChat and other widgets)
  getPreferences: () => TripPreferences;
  getPreferenceSummary: () => string;
  getComfortLabel: () => ComfortLabel;
  getProfileCompletion: () => number;

  // Computed filters for other widgets
  getHotelFilters: () => HotelFiltersFromPreferences;
  getActivityFilters: () => ActivityFiltersFromPreferences;
  getFlightPreferences: () => FlightPreferencesComputed;

  // Serialization (used by PlannerChat for LLM context)
  getSerializedState: () => Record<string, unknown>;
}

// ============================================================================
// CONTEXT
// ============================================================================

export const PreferenceComputedContext = createContext<PreferenceComputedContextValue | null>(null);

// ============================================================================
// HOOK
// ============================================================================

export function usePreferenceComputed(): PreferenceComputedContextValue {
  const context = useContext(PreferenceComputedContext);
  if (!context) {
    throw new Error('usePreferenceComputed must be used within PreferenceProvider');
  }
  return context;
}
