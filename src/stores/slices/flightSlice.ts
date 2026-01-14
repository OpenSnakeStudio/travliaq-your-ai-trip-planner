/**
 * Flight Slice
 * Manages flight search state including airports, dates, passengers, and multi-leg support
 */

import type { StateCreator } from 'zustand';
import type {
  PlannerStore,
  FlightSlice,
  AirportInfo,
  FlightPassengers,
  FlightLegMemory,
  TripType,
  CabinClass,
} from '../types';

// Initial state
const initialFlightState = {
  tripType: 'roundtrip' as TripType,
  departure: null,
  arrival: null,
  departureDate: null,
  returnDate: null,
  legs: [],
  passengers: {
    adults: 1,
    children: 0,
    infants: 0,
  },
  cabinClass: 'economy' as CabinClass,
  directOnly: false,
  flexibleDates: false,
};

export const createFlightSlice: StateCreator<
  PlannerStore,
  [['zustand/devtools', never], ['zustand/persist', unknown]],
  [],
  FlightSlice
> = (set, get) => ({
  // Initial state
  ...initialFlightState,

  // Computed values
  get isReadyToSearch() {
    const state = get();
    if (state.tripType === 'multi') {
      return state.legs.every(
        (leg) => leg.departure && leg.arrival && leg.date
      );
    }
    const hasBasics = Boolean(
      state.departure &&
        state.arrival &&
        state.departureDate
    );
    if (state.tripType === 'roundtrip') {
      return hasBasics && Boolean(state.returnDate);
    }
    return hasBasics;
  },

  get hasCompleteInfo() {
    const state = get();
    return Boolean(
      state.departure?.city &&
        state.arrival?.city &&
        state.passengers.adults >= 1
    );
  },

  // Actions
  setTripType: (type: TripType) => {
    set(
      (state) => {
        // When switching to multi, initialize legs from current departure/arrival
        if (type === 'multi' && state.tripType !== 'multi') {
          const legs: FlightLegMemory[] = [];
          if (state.departure && state.arrival) {
            legs.push({
              id: crypto.randomUUID(),
              departure: state.departure,
              arrival: state.arrival,
              date: state.departureDate,
            });
            legs.push({
              id: crypto.randomUUID(),
              departure: state.arrival,
              arrival: null,
              date: null,
            });
          } else {
            legs.push(
              { id: crypto.randomUUID(), departure: null, arrival: null, date: null },
              { id: crypto.randomUUID(), departure: null, arrival: null, date: null }
            );
          }
          return {
            tripType: type,
            legs,
            departure: null,
            arrival: null,
            departureDate: null,
            returnDate: null,
          };
        }

        // When switching from multi to single, take first leg
        if (type !== 'multi' && state.tripType === 'multi' && state.legs.length > 0) {
          const firstLeg = state.legs[0];
          return {
            tripType: type,
            departure: firstLeg.departure,
            arrival: firstLeg.arrival,
            departureDate: firstLeg.date,
            returnDate: type === 'roundtrip' ? null : state.returnDate,
            legs: [],
          };
        }

        return { tripType: type };
      },
      false,
      'flight/setTripType'
    );
  },

  setDeparture: (info: AirportInfo | null) => {
    set(
      (state) => ({
        departure: info === null ? null : { ...state.departure, ...info },
      }),
      false,
      'flight/setDeparture'
    );
  },

  setArrival: (info: AirportInfo | null) => {
    set(
      (state) => ({
        arrival: info === null ? null : { ...state.arrival, ...info },
      }),
      false,
      'flight/setArrival'
    );
  },

  setFlightDates: (departure: Date | null, returnDate?: Date | null) => {
    set(
      {
        departureDate: departure,
        ...(returnDate !== undefined ? { returnDate } : {}),
      },
      false,
      'flight/setDates'
    );
  },

  setPassengers: (passengers: Partial<FlightPassengers>) => {
    set(
      (state) => ({
        passengers: { ...state.passengers, ...passengers },
      }),
      false,
      'flight/setPassengers'
    );
  },

  setCabinClass: (cabinClass: CabinClass) => {
    set({ cabinClass }, false, 'flight/setCabinClass');
  },

  setDirectOnly: (directOnly: boolean) => {
    set({ directOnly }, false, 'flight/setDirectOnly');
  },

  setFlexibleDates: (flexible: boolean) => {
    set({ flexibleDates: flexible }, false, 'flight/setFlexibleDates');
  },

  addLeg: () => {
    set(
      (state) => ({
        legs: [
          ...state.legs,
          {
            id: crypto.randomUUID(),
            departure: null,
            arrival: null,
            date: null,
          },
        ],
      }),
      false,
      'flight/addLeg'
    );
  },

  removeLeg: (legId: string) => {
    set(
      (state) => ({
        legs: state.legs.filter((l) => l.id !== legId),
      }),
      false,
      'flight/removeLeg'
    );
  },

  updateLeg: (legId: string, update: Partial<FlightLegMemory>) => {
    set(
      (state) => ({
        legs: state.legs.map((l) =>
          l.id === legId ? { ...l, ...update } : l
        ),
      }),
      false,
      'flight/updateLeg'
    );
  },

  resetFlight: () => {
    set(initialFlightState, false, 'flight/reset');
  },
});
