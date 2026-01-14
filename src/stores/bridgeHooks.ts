/**
 * Bridge Hooks
 * These hooks mirror the existing context APIs but use Zustand under the hood.
 * Use these for new components or when migrating existing ones.
 */

import { usePlannerStore } from './plannerStore';
import type { TravelersInfo, DestinationInfo, AirportInfo, FlightPassengers, TripType, CabinClass } from './types';

// ============================================================================
// TRAVEL BRIDGE HOOK
// Mirrors useTravelMemory() from TravelMemoryContext
// ============================================================================

export interface TravelMemoryBridge {
  memory: {
    travelers: TravelersInfo;
    destinations: DestinationInfo[];
    departureDate: Date | null;
    returnDate: Date | null;
    activeDestinationIndex: number;
  };
  updateMemory: (partial: Partial<TravelMemoryBridge['memory']>) => void;
  resetMemory: () => void;
  updateTravelers: (travelers: Partial<TravelersInfo>) => void;
  getTotalTravelers: () => number;
  addDestination: (destination: Omit<DestinationInfo, 'id'>) => void;
  removeDestination: (id: string) => void;
  updateDestination: (id: string, update: Partial<DestinationInfo>) => void;
  setActiveDestination: (index: number) => void;
  getActiveDestination: () => DestinationInfo | null;
  getSerializedState: () => Record<string, unknown>;
  hasDestinations: boolean;
  hasDates: boolean;
  hasTravelers: boolean;
}

export function useTravelMemoryBridge(): TravelMemoryBridge {
  const store = usePlannerStore();

  return {
    memory: {
      travelers: store.travelers,
      destinations: store.destinations,
      departureDate: store.departureDate,
      returnDate: store.returnDate,
      activeDestinationIndex: store.activeDestinationIndex,
    },
    updateMemory: (partial) => {
      if (partial.travelers) store.updateTravelers(partial.travelers);
      if (partial.departureDate !== undefined || partial.returnDate !== undefined) {
        store.setDates(
          partial.departureDate ?? store.departureDate,
          partial.returnDate ?? store.returnDate
        );
      }
    },
    resetMemory: store.resetTravel,
    updateTravelers: store.updateTravelers,
    getTotalTravelers: store.getTotalTravelers,
    addDestination: store.addDestination,
    removeDestination: store.removeDestination,
    updateDestination: store.updateDestination,
    setActiveDestination: store.setActiveDestination,
    getActiveDestination: store.getActiveDestination,
    getSerializedState: () => ({
      travelers: store.travelers,
      destinations: store.destinations,
      departureDate: store.departureDate?.toISOString() || null,
      returnDate: store.returnDate?.toISOString() || null,
      activeDestinationIndex: store.activeDestinationIndex,
    }),
    hasDestinations: store.destinations.length > 0,
    hasDates: store.departureDate !== null,
    hasTravelers: store.travelers.adults >= 1,
  };
}

// ============================================================================
// FLIGHT BRIDGE HOOK
// Mirrors useFlightMemory() from FlightMemoryContext
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
  updateMemory: (partial: Partial<FlightMemoryBridge['memory']>) => void;
  resetMemory: () => void;
  isReadyToSearch: boolean;
  hasCompleteInfo: boolean;
  addLeg: () => void;
  removeLeg: (legId: string) => void;
  updateLeg: (legId: string, update: Partial<{ departure: AirportInfo | null; arrival: AirportInfo | null; date: Date | null }>) => void;
  getSerializedState: () => Record<string, unknown>;
}

export function useFlightMemoryBridge(): FlightMemoryBridge {
  const store = usePlannerStore();

  return {
    memory: {
      tripType: store.tripType,
      departure: store.departure,
      arrival: store.arrival,
      departureDate: store.departureDate,
      returnDate: store.returnDate,
      legs: store.legs,
      passengers: store.passengers,
      cabinClass: store.cabinClass,
      directOnly: store.directOnly,
      flexibleDates: store.flexibleDates,
    },
    updateMemory: (partial) => {
      if (partial.tripType) store.setTripType(partial.tripType);
      if (partial.departure !== undefined) store.setDeparture(partial.departure);
      if (partial.arrival !== undefined) store.setArrival(partial.arrival);
      if (partial.departureDate !== undefined || partial.returnDate !== undefined) {
        store.setFlightDates(
          partial.departureDate ?? store.departureDate,
          partial.returnDate ?? store.returnDate
        );
      }
      if (partial.passengers) store.setPassengers(partial.passengers);
      if (partial.cabinClass) store.setCabinClass(partial.cabinClass);
      if (partial.directOnly !== undefined) store.setDirectOnly(partial.directOnly);
      if (partial.flexibleDates !== undefined) store.setFlexibleDates(partial.flexibleDates);
    },
    resetMemory: store.resetFlight,
    isReadyToSearch: (() => {
      if (store.tripType === 'multi') {
        return store.legs.every((leg) => leg.departure && leg.arrival && leg.date);
      }
      const hasBasics = Boolean(store.departure && store.arrival && store.departureDate);
      if (store.tripType === 'roundtrip') {
        return hasBasics && Boolean(store.returnDate);
      }
      return hasBasics;
    })(),
    hasCompleteInfo: Boolean(
      store.departure?.city && store.arrival?.city && store.passengers.adults >= 1
    ),
    addLeg: store.addLeg,
    removeLeg: store.removeLeg,
    updateLeg: store.updateLeg,
    getSerializedState: () => ({
      tripType: store.tripType,
      departure: store.departure,
      arrival: store.arrival,
      departureDate: store.departureDate?.toISOString() || null,
      returnDate: store.returnDate?.toISOString() || null,
      legs: store.legs.map((leg) => ({
        ...leg,
        date: leg.date?.toISOString() || null,
      })),
      passengers: store.passengers,
      cabinClass: store.cabinClass,
      directOnly: store.directOnly,
      flexibleDates: store.flexibleDates,
    }),
  };
}

// ============================================================================
// GRANULAR SELECTORS FOR OPTIMIZED SUBSCRIPTIONS
// Use these to subscribe to specific parts of state only
// ============================================================================

/**
 * Subscribe to travelers only
 */
export function useTravelers() {
  return usePlannerStore((state) => state.travelers);
}

/**
 * Subscribe to destinations only
 */
export function useDestinations() {
  return usePlannerStore((state) => state.destinations);
}

/**
 * Subscribe to trip dates only
 */
export function useTripDates() {
  return usePlannerStore((state) => ({
    departureDate: state.departureDate,
    returnDate: state.returnDate,
  }));
}

/**
 * Subscribe to flight route only
 */
export function useFlightRoute() {
  return usePlannerStore((state) => ({
    departure: state.departure,
    arrival: state.arrival,
  }));
}

/**
 * Subscribe to passengers only
 */
export function usePassengers() {
  return usePlannerStore((state) => state.passengers);
}

/**
 * Subscribe to trip type only
 */
export function useTripType() {
  return usePlannerStore((state) => state.tripType);
}

/**
 * Subscribe to multi-city legs only
 */
export function useFlightLegs() {
  return usePlannerStore((state) => state.legs);
}

/**
 * Check if store is hydrated from localStorage
 */
export function useIsStoreHydrated() {
  return usePlannerStore((state) => state.isHydrated);
}
