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
