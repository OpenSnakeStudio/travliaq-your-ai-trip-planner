/**
 * Stores Barrel Export
 */

// Main store
export { usePlannerStore } from './plannerStore';

// Selectors
export {
  selectTravelers,
  selectDestinations,
  selectTripDates,
  selectHasDestinations,
  selectHasDates,
  selectTripType,
  selectFlightRoute,
  selectFlightDates,
  selectPassengers,
  selectLegs,
  selectFlightOptions,
  selectIsReadyToSearch,
  selectIsHydrated,
} from './plannerStore';

// Action hooks
export { useTravelActions, useFlightActions } from './plannerStore';

// Bridge hooks (for gradual migration from React contexts)
export {
  useTravelMemoryBridge,
  useFlightMemoryBridge,
  useTravelers,
  useDestinations,
  useTripDates,
  useFlightRoute,
  usePassengers,
  useTripType,
  useFlightLegs,
  useIsStoreHydrated,
} from './bridgeHooks';

// Types
export type {
  PlannerStore,
  TravelSlice,
  FlightSlice,
  TravelState,
  FlightState,
  TravelersInfo,
  DestinationInfo,
  AirportInfo,
  FlightLegMemory,
  FlightPassengers,
  TripType,
  CabinClass,
} from './types';

export type {
  TravelMemoryBridge,
  FlightMemoryBridge,
} from './bridgeHooks';
