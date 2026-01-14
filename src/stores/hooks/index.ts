/**
 * Zustand Store Hooks
 * 
 * These hooks provide drop-in replacements for the old Context hooks.
 * They expose the exact same API but use Zustand under the hood.
 */

// Flight Memory (replaces useFlightMemory from FlightMemoryContext)
export { useFlightMemoryStore } from './useFlightMemoryStore';
export type { 
  FlightMemory, 
  FlightMemoryStoreValue, 
  MemoryRoutePoint,
  MissingField,
  AirportInfo,
  FlightLegMemory,
  TripType,
  CabinClass,
  FlightPassengers,
} from './useFlightMemoryStore';

// Travel Memory (replaces useTravelMemory from TravelMemoryContext)
export { useTravelMemoryStore } from './useTravelMemoryStore';
export type { 
  TravelMemory, 
  TravelMemoryStoreValue,
  TravelersInfo,
  DestinationInfo,
} from './useTravelMemoryStore';

// Accommodation Memory (replaces useAccommodationMemory from AccommodationMemoryContext)
export { useAccommodationMemoryStore } from './useAccommodationMemoryStore';
export type {
  AccommodationMemory,
  AccommodationMemoryStoreValue,
  AccommodationEntry,
  AccommodationState,
  BudgetPreset,
  AccommodationType,
  EssentialAmenity,
  RoomConfig,
  AdvancedFilters,
  HotelSearchResult,
  HotelDetails,
} from './useAccommodationMemoryStore';
export { BUDGET_PRESETS } from './useAccommodationMemoryStore';

// Activity Memory (replaces useActivityMemory from ActivityMemoryContext)
export { useActivityMemoryStore } from './useActivityMemoryStore';
export type {
  ActivityMemory,
  ActivityMemoryStoreValue,
  ActivityEntry,
  ActivityDestination,
  ActivityFilters,
  ViatorActivity,
  ActivitySearchState,
} from './useActivityMemoryStore';

// Preference Memory (replaces usePreferenceMemory from PreferenceMemoryContext)
export { usePreferenceMemoryStore } from './usePreferenceMemoryStore';
export type {
  PreferenceMemoryStoreValue,
  TripPreferences,
  StyleAxes,
  MustHaves,
  TravelStyle,
  TripContext,
  WorkPreferences,
  PreferenceMemory,
  HotelFiltersFromPreferences,
  ActivityFiltersFromPreferences,
  FlightPreferencesComputed,
  ComfortLabel,
} from './usePreferenceMemoryStore';
export {
  DEFAULT_STYLE_AXES,
  DEFAULT_MUST_HAVES,
  DEFAULT_WORK_PREFERENCES,
  DEFAULT_TRIP_CONTEXT,
  DEFAULT_PREFERENCES,
  DEFAULT_MEMORY,
  createDefaultPreferences,
  createDefaultMemory,
} from './usePreferenceMemoryStore';

// Re-export bridge hooks for backward compatibility during migration
export * from '../bridgeHooks';
