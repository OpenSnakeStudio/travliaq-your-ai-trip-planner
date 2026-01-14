/**
 * Planner Store
 * Combined Zustand store with slices for travel planning
 */

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import type { PlannerStore } from './types';
import { createTravelSlice } from './slices/travelSlice';
import { createFlightSlice } from './slices/flightSlice';

const STORAGE_KEY = 'travliaq_planner_store';

// Custom storage with Date serialization
const customStorage = createJSONStorage<PlannerStore>(() => localStorage, {
  reviver: (_key, value) => {
    // Revive Date strings
    if (typeof value === 'string') {
      // ISO 8601 date regex
      const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
      if (dateRegex.test(value)) {
        const date = new Date(value);
        // Validate date is not in the past (reset if it is)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) {
          return null;
        }
        return date;
      }
    }
    return value;
  },
  replacer: (_key, value) => {
    // Serialize Dates to ISO strings
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  },
});

export const usePlannerStore = create<PlannerStore>()(
  devtools(
    persist(
      (set, get, api) => ({
        // Hydration state
        isHydrated: false,
        _setHydrated: (hydrated: boolean) => set({ isHydrated: hydrated }),

        // Slices
        ...createTravelSlice(set, get, api),
        ...createFlightSlice(set, get, api),
      }),
      {
        name: STORAGE_KEY,
        storage: customStorage,
        partialize: (state) => ({
          // Travel state
          travelers: state.travelers,
          destinations: state.destinations,
          departureDate: state.departureDate,
          returnDate: state.returnDate,
          activeDestinationIndex: state.activeDestinationIndex,
          // Flight state
          tripType: state.tripType,
          departure: state.departure,
          arrival: state.arrival,
          legs: state.legs,
          passengers: state.passengers,
          cabinClass: state.cabinClass,
          directOnly: state.directOnly,
          flexibleDates: state.flexibleDates,
        }),
        onRehydrateStorage: () => (state) => {
          state?._setHydrated(true);
        },
      }
    ),
    { name: 'PlannerStore' }
  )
);

// ============================================================================
// SELECTORS (for granular subscriptions - prevents unnecessary re-renders)
// ============================================================================

// Travel selectors
export const selectTravelers = (state: PlannerStore) => state.travelers;
export const selectDestinations = (state: PlannerStore) => state.destinations;
export const selectTripDates = (state: PlannerStore) => ({
  departureDate: state.departureDate,
  returnDate: state.returnDate,
});
export const selectHasDestinations = (state: PlannerStore) => state.destinations.length > 0;
export const selectHasDates = (state: PlannerStore) => state.departureDate !== null;

// Flight selectors
export const selectTripType = (state: PlannerStore) => state.tripType;
export const selectFlightRoute = (state: PlannerStore) => ({
  departure: state.departure,
  arrival: state.arrival,
});
export const selectFlightDates = (state: PlannerStore) => ({
  departureDate: state.departureDate,
  returnDate: state.returnDate,
});
export const selectPassengers = (state: PlannerStore) => state.passengers;
export const selectLegs = (state: PlannerStore) => state.legs;
export const selectFlightOptions = (state: PlannerStore) => ({
  cabinClass: state.cabinClass,
  directOnly: state.directOnly,
  flexibleDates: state.flexibleDates,
});
export const selectIsReadyToSearch = (state: PlannerStore) => {
  if (state.tripType === 'multi') {
    return state.legs.every((leg) => leg.departure && leg.arrival && leg.date);
  }
  const hasBasics = Boolean(state.departure && state.arrival && state.departureDate);
  if (state.tripType === 'roundtrip') {
    return hasBasics && Boolean(state.returnDate);
  }
  return hasBasics;
};

// Hydration selector
export const selectIsHydrated = (state: PlannerStore) => state.isHydrated;

// ============================================================================
// HOOKS (for common use cases)
// ============================================================================

/**
 * Hook to get travel actions only (stable references)
 */
export const useTravelActions = () =>
  usePlannerStore((state) => ({
    updateTravelers: state.updateTravelers,
    addDestination: state.addDestination,
    removeDestination: state.removeDestination,
    updateDestination: state.updateDestination,
    setActiveDestination: state.setActiveDestination,
    setDates: state.setDates,
    resetTravel: state.resetTravel,
  }));

/**
 * Hook to get flight actions only (stable references)
 */
export const useFlightActions = () =>
  usePlannerStore((state) => ({
    setTripType: state.setTripType,
    setDeparture: state.setDeparture,
    setArrival: state.setArrival,
    setFlightDates: state.setFlightDates,
    setPassengers: state.setPassengers,
    setCabinClass: state.setCabinClass,
    setDirectOnly: state.setDirectOnly,
    setFlexibleDates: state.setFlexibleDates,
    addLeg: state.addLeg,
    removeLeg: state.removeLeg,
    updateLeg: state.updateLeg,
    resetFlight: state.resetFlight,
  }));
