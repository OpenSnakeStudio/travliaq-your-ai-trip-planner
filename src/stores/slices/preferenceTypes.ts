/**
 * Preference Slice Types
 * Re-exports types from the existing preferences module for consistency
 */

// Re-export all types from the existing preferences module
export type {
  StyleAxes,
  MustHaves,
  WorkPreferences,
  TripContext,
  TravelStyle,
  TripPreferences,
  PreferenceMemory,
  HotelFiltersFromPreferences,
  ActivityFiltersFromPreferences,
  FlightPreferencesComputed,
  ComfortLabel,
} from '@/contexts/preferences/types';

// Re-export defaults
export {
  DEFAULT_STYLE_AXES,
  DEFAULT_MUST_HAVES,
  DEFAULT_WORK_PREFERENCES,
  DEFAULT_TRIP_CONTEXT,
  DEFAULT_PREFERENCES,
  DEFAULT_MEMORY,
  createDefaultPreferences,
  createDefaultMemory,
} from '@/contexts/preferences/defaults';

// Re-export selectors for computed values
export {
  selectComfortLabel,
  selectProfileCompletion,
  selectPreferenceSummary,
  selectHotelFilters,
  selectActivityFilters,
  selectFlightPreferences,
  selectSerializedState,
} from '@/contexts/preferences/selectors';
