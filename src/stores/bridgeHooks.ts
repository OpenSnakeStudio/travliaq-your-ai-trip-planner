/**
 * Bridge Hooks
 * These hooks mirror the existing context APIs but use Zustand under the hood.
 */

import { usePlannerStoreV2 } from './plannerStoreV2';
import type { TravelersInfo, DestinationInfo, AirportInfo, FlightPassengers, TripType, CabinClass } from './types';

// ============================================================================
// TRAVEL BRIDGE HOOK
// ============================================================================

export interface TravelMemoryBridge {
  memory: {
    travelers: TravelersInfo;
    destinations: DestinationInfo[];
    departureDate: Date | null;
    returnDate: Date | null;
    activeDestinationIndex: number;
  };
  updateTravelers: (travelers: Partial<TravelersInfo>) => void;
  getTotalTravelers: () => number;
  addDestination: (destination: Omit<DestinationInfo, 'id'>) => void;
  removeDestination: (id: string) => void;
  updateDestination: (id: string, update: Partial<DestinationInfo>) => void;
  setActiveDestination: (index: number) => void;
  getActiveDestination: () => DestinationInfo | null;
  hasDestinations: boolean;
  hasDates: boolean;
  hasTravelers: boolean;
}

export function useTravelMemoryBridge(): TravelMemoryBridge {
  const store = usePlannerStoreV2();
  return {
    memory: {
      travelers: store.travelers,
      destinations: store.destinations,
      departureDate: store.departureDate,
      returnDate: store.returnDate,
      activeDestinationIndex: store.activeDestinationIndex,
    },
    updateTravelers: store.updateTravelers,
    getTotalTravelers: store.getTotalTravelers,
    addDestination: store.addDestination,
    removeDestination: store.removeDestination,
    updateDestination: store.updateDestination,
    setActiveDestination: store.setActiveDestination,
    getActiveDestination: store.getActiveDestination,
    hasDestinations: store.destinations.length > 0,
    hasDates: store.departureDate !== null,
    hasTravelers: store.travelers.adults >= 1,
  };
}

// ============================================================================
// FLIGHT BRIDGE HOOK
// ============================================================================

export interface FlightMemoryBridge {
  memory: {
    tripType: TripType;
    departure: AirportInfo | null;
    arrival: AirportInfo | null;
    departureDate: Date | null;
    returnDate: Date | null;
    legs: Array<{ id: string; departure: AirportInfo | null; arrival: AirportInfo | null; date: Date | null }>;
    passengers: FlightPassengers;
    cabinClass: CabinClass;
    directOnly: boolean;
    flexibleDates: boolean;
  };
  isReadyToSearch: boolean;
  hasCompleteInfo: boolean;
  addLeg: () => void;
  removeLeg: (legId: string) => void;
  updateLeg: (legId: string, update: Partial<{ departure: AirportInfo | null; arrival: AirportInfo | null; date: Date | null }>) => void;
}

export function useFlightMemoryBridge(): FlightMemoryBridge {
  const store = usePlannerStoreV2();
  return {
    memory: {
      tripType: store.tripType,
      departure: store.departure,
      arrival: store.arrival,
      departureDate: store.flightDepartureDate,
      returnDate: store.flightReturnDate,
      legs: store.legs,
      passengers: store.passengers,
      cabinClass: store.cabinClass,
      directOnly: store.directOnly,
      flexibleDates: store.flexibleDates,
    },
    isReadyToSearch: store.isReadyToSearch,
    hasCompleteInfo: store.hasCompleteInfo,
    addLeg: store.addLeg,
    removeLeg: store.removeLeg,
    updateLeg: store.updateLeg,
  };
}

// Granular selectors
export const useTravelers = () => usePlannerStoreV2((s) => s.travelers);
export const useDestinations = () => usePlannerStoreV2((s) => s.destinations);
export const useTripType = () => usePlannerStoreV2((s) => s.tripType);
export const usePassengers = () => usePlannerStoreV2((s) => s.passengers);
export const useIsStoreHydrated = () => usePlannerStoreV2((s) => s.isHydrated);
