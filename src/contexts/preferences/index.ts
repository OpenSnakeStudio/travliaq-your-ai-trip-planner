/**
 * Preferences Module - Barrel Export
 * Maintains backward compatibility with original PreferenceMemoryContext imports
 */

// ============================================================================
// TYPES
// ============================================================================

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
} from './types';

// ============================================================================
// DEFAULTS
// ============================================================================

export {
  DEFAULT_STYLE_AXES,
  DEFAULT_MUST_HAVES,
  DEFAULT_WORK_PREFERENCES,
  DEFAULT_TRIP_CONTEXT,
  DEFAULT_PREFERENCES,
  DEFAULT_MEMORY,
  createDefaultPreferences,
  createDefaultMemory,
} from './defaults';

// ============================================================================
// PROVIDER
// ============================================================================

export { PreferenceProvider } from './PreferenceProvider';

// ============================================================================
// HOOKS
// ============================================================================

// Main backward-compatible hook
export { usePreferenceMemory } from './hooks';

// Individual context hooks
export { usePreferenceState } from './hooks';
export { usePreferenceActions } from './hooks';
export { usePreferenceComputed } from './hooks';

// Selective hooks for performance
export {
  useStyleAxes,
  useInterests,
  useMustHaves,
  useTravelStyle,
  useOccasion,
  useDietaryRestrictions,
  useProfileCompletion,
} from './hooks';

// ============================================================================
// REDUCER & ACTIONS (for advanced use)
// ============================================================================

export { preferenceReducer, type PreferenceAction } from './reducer';

// ============================================================================
// SELECTORS (for direct use)
// ============================================================================

export {
  selectComfortLabel,
  selectProfileCompletion,
  selectPreferenceSummary,
  selectHotelFilters,
  selectActivityFilters,
  selectFlightPreferences,
  selectSerializedState,
} from './selectors';

// ============================================================================
// STORAGE (for testing/debugging)
// ============================================================================

export {
  loadFromStorage,
  saveToStorage,
  clearStorage,
} from './storage';
