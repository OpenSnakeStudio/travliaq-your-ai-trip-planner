/**
 * Travel Slice
 * Manages travelers, destinations, and trip dates
 */

import type { StateCreator } from 'zustand';
import type { PlannerStore, TravelSlice, TravelersInfo, DestinationInfo } from '../types';

const STORAGE_KEY = 'travliaq_planner_store';

// Initial state
const initialTravelState = {
  travelers: {
    adults: 1,
    children: 0,
    childrenAges: [],
    infants: 0,
  },
  destinations: [],
  departureDate: null,
  returnDate: null,
  activeDestinationIndex: 0,
};

export const createTravelSlice: StateCreator<
  PlannerStore,
  [['zustand/devtools', never], ['zustand/persist', unknown]],
  [],
  TravelSlice
> = (set, get) => ({
  // Initial state
  ...initialTravelState,

  // Computed values (derived from state)
  get hasDestinations() {
    return get().destinations.length > 0;
  },
  get hasDates() {
    return get().departureDate !== null;
  },
  get hasTravelers() {
    return get().travelers.adults >= 1;
  },

  // Actions
  updateTravelers: (travelers: Partial<TravelersInfo>) => {
    set(
      (state) => ({
        travelers: { ...state.travelers, ...travelers },
      }),
      false,
      'travel/updateTravelers'
    );
  },

  getTotalTravelers: () => {
    const { travelers } = get();
    return travelers.adults + travelers.children + travelers.infants;
  },

  addDestination: (destination: Omit<DestinationInfo, 'id'>) => {
    set(
      (state) => ({
        destinations: [
          ...state.destinations,
          { ...destination, id: crypto.randomUUID() },
        ],
      }),
      false,
      'travel/addDestination'
    );
  },

  removeDestination: (id: string) => {
    set(
      (state) => ({
        destinations: state.destinations.filter((d) => d.id !== id),
        activeDestinationIndex: Math.min(
          state.activeDestinationIndex,
          Math.max(0, state.destinations.length - 2)
        ),
      }),
      false,
      'travel/removeDestination'
    );
  },

  updateDestination: (id: string, update: Partial<DestinationInfo>) => {
    set(
      (state) => ({
        destinations: state.destinations.map((d) =>
          d.id === id ? { ...d, ...update } : d
        ),
      }),
      false,
      'travel/updateDestination'
    );
  },

  setActiveDestination: (index: number) => {
    set(
      (state) => ({
        activeDestinationIndex: Math.min(index, state.destinations.length - 1),
      }),
      false,
      'travel/setActiveDestination'
    );
  },

  getActiveDestination: () => {
    const { destinations, activeDestinationIndex } = get();
    if (destinations.length === 0) return null;
    return destinations[activeDestinationIndex] || destinations[0];
  },

  setDates: (departureDate: Date | null, returnDate: Date | null) => {
    set({ departureDate, returnDate }, false, 'travel/setDates');
  },

  resetTravel: () => {
    set(initialTravelState, false, 'travel/reset');
  },
});
