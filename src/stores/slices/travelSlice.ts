/**
 * Travel Slice
 * Manages travelers, destinations, and trip dates
 */

import type { StateCreator } from 'zustand';
import type { TravelersInfo, DestinationInfo } from '../types';

// Initial state
const initialTravelState = {
  travelers: {
    adults: 1,
    children: 0,
    childrenAges: [] as number[],
    infants: 0,
  },
  destinations: [] as DestinationInfo[],
  departureDate: null as Date | null,
  returnDate: null as Date | null,
  activeDestinationIndex: 0,
};

export interface TravelSlice {
  // State
  travelers: TravelersInfo;
  destinations: DestinationInfo[];
  departureDate: Date | null;
  returnDate: Date | null;
  activeDestinationIndex: number;
  
  // Actions
  updateTravelers: (travelers: Partial<TravelersInfo>) => void;
  getTotalTravelers: () => number;
  addDestination: (destination: Omit<DestinationInfo, 'id'>) => void;
  removeDestination: (id: string) => void;
  updateDestination: (id: string, update: Partial<DestinationInfo>) => void;
  setActiveDestination: (index: number) => void;
  getActiveDestination: () => DestinationInfo | null;
  setDates: (departureDate: Date | null, returnDate: Date | null) => void;
  setDepartureDate: (date: Date | null) => void;
  setReturnDate: (date: Date | null) => void;
  resetTravel: () => void;
}

export const createTravelSlice: StateCreator<
  TravelSlice,
  [['zustand/devtools', never], ['zustand/persist', unknown]],
  [],
  TravelSlice
> = (set, get) => ({
  // Initial state
  ...initialTravelState,
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

  setDepartureDate: (date: Date | null) => {
    set({ departureDate: date }, false, 'travel/setDepartureDate');
  },

  setReturnDate: (date: Date | null) => {
    set({ returnDate: date }, false, 'travel/setReturnDate');
  },

  resetTravel: () => {
    set(initialTravelState, false, 'travel/reset');
  },
});
