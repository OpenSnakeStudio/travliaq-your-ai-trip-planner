/**
 * Planner Store V2
 * Combined Zustand store with all slices
 */

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { createTravelSlice, type TravelSlice } from './slices/travelSlice';
import { createFlightSlice, type FlightSlice } from './slices/flightSlice';
import { createAccommodationSlice, type AccommodationSlice } from './slices/accommodationSlice';
import { createActivitySlice, type ActivitySlice } from './slices/activitySlice';
import { createPreferenceSlice, type PreferenceSlice } from './slices/preferenceSlice';
import { createTripBasketSlice, type TripBasketSlice } from './slices/tripBasketSlice';

const STORAGE_KEY = 'travliaq_planner_store_v2';

// Combined store type
export type PlannerStoreV2 = TravelSlice & FlightSlice & AccommodationSlice & ActivitySlice & PreferenceSlice & TripBasketSlice & {
  isHydrated: boolean;
  _setHydrated: (hydrated: boolean) => void;
};

// Custom storage with Date serialization
const customStorage = createJSONStorage<PlannerStoreV2>(() => localStorage, {
  reviver: (_key, value) => {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) return null;
      return date;
    }
    return value;
  },
  replacer: (_key, value) => (value instanceof Date ? value.toISOString() : value),
});

export const usePlannerStoreV2 = create<PlannerStoreV2>()(
  devtools(
    persist(
      (...args) => ({
        isHydrated: false,
        _setHydrated: (hydrated: boolean) => args[0]({ isHydrated: hydrated }),
        ...createTravelSlice(...args),
        ...createFlightSlice(...args),
        ...createAccommodationSlice(...args),
        ...createActivitySlice(...args),
        ...createPreferenceSlice(...args),
        ...createTripBasketSlice(...args),
      }),
      {
        name: STORAGE_KEY,
        storage: customStorage,
        partialize: (state) => ({
          travelers: state.travelers,
          destinations: state.destinations,
          departureDate: state.departureDate,
          returnDate: state.returnDate,
          activeDestinationIndex: state.activeDestinationIndex,
          tripType: state.tripType,
          departure: state.departure,
          arrival: state.arrival,
          flightDepartureDate: state.flightDepartureDate,
          flightReturnDate: state.flightReturnDate,
          legs: state.legs,
          passengers: state.passengers,
          cabinClass: state.cabinClass,
          directOnly: state.directOnly,
          flexibleDates: state.flexibleDates,
          accommodations: state.accommodations,
          activeAccommodationIndex: state.activeAccommodationIndex,
          useAutoRooms: state.useAutoRooms,
          customRooms: state.customRooms,
          defaultBudgetPreset: state.defaultBudgetPreset,
          defaultPriceMin: state.defaultPriceMin,
          defaultPriceMax: state.defaultPriceMax,
          activities: state.activities,
          localDestinations: state.localDestinations,
          activeFilters: state.activeFilters,
          preferences: state.preferences,
          // Trip basket persistence
          basketItems: state.basketItems,
          flexibleTripType: state.flexibleTripType,
          isFlightRequired: state.isFlightRequired,
          isHotelRequired: state.isHotelRequired,
          basketCurrency: state.basketCurrency,
          explicitRequirements: state.explicitRequirements,
        }),
        onRehydrateStorage: () => (state) => state?._setHydrated(true),
      }
    ),
    { name: 'PlannerStoreV2' }
  )
);

// Re-export slice types
export type { TravelSlice } from './slices/travelSlice';
export type { FlightSlice } from './slices/flightSlice';
export type { AccommodationSlice } from './slices/accommodationSlice';
export type { ActivitySlice } from './slices/activitySlice';
export type { PreferenceSlice } from './slices/preferenceSlice';
export type { TripBasketSlice } from './slices/tripBasketSlice';
