/**
 * useTravelMemoryStore - Drop-in replacement for useTravelMemory (Context)
 * 
 * This hook provides the exact same API as TravelMemoryContext
 * but uses Zustand under the hood for better performance.
 */

import { useMemo, useCallback } from 'react';
import { usePlannerStoreV2 } from '../plannerStoreV2';
import type { TravelersInfo, DestinationInfo } from '../types';

// Re-export types
export type { TravelersInfo, DestinationInfo };

// Memory structure (mirrors Context)
export interface TravelMemory {
  travelers: TravelersInfo;
  destinations: DestinationInfo[];
  departureDate: Date | null;
  returnDate: Date | null;
  activeDestinationIndex: number;
}

// Context-compatible return type
export interface TravelMemoryStoreValue {
  memory: TravelMemory;
  
  // Travelers
  updateTravelers: (travelers: Partial<TravelersInfo>) => void;
  getTotalTravelers: () => number;
  
  // Destinations
  addDestination: (destination: Omit<DestinationInfo, 'id'>) => void;
  removeDestination: (id: string) => void;
  updateDestination: (id: string, update: Partial<DestinationInfo>) => void;
  setActiveDestination: (index: number) => void;
  getActiveDestination: () => DestinationInfo | null;
  
  // Dates
  setDates: (departureDate: Date | null, returnDate: Date | null) => void;
  setDepartureDate: (date: Date | null) => void;
  setReturnDate: (date: Date | null) => void;
  
  // Computed
  hasDestinations: boolean;
  hasDates: boolean;
  hasTravelers: boolean;
  
  // Reset
  resetMemory: () => void;
  
  // Serialization
  getSerializedState: () => Record<string, unknown>;
}

/**
 * useTravelMemoryStore - Zustand-based replacement for useTravelMemory
 */
export function useTravelMemoryStore(): TravelMemoryStoreValue {
  const store = usePlannerStoreV2();

  // Build memory object (mirrors Context structure)
  const memory = useMemo<TravelMemory>(() => ({
    travelers: store.travelers,
    destinations: store.destinations,
    departureDate: store.departureDate,
    returnDate: store.returnDate,
    activeDestinationIndex: store.activeDestinationIndex,
  }), [
    store.travelers,
    store.destinations,
    store.departureDate,
    store.returnDate,
    store.activeDestinationIndex,
  ]);

  // Computed values
  const hasDestinations = store.destinations.length > 0;
  const hasDates = store.departureDate !== null;
  const hasTravelers = store.travelers.adults >= 1;

  // Set departure date
  const setDepartureDate = useCallback((date: Date | null) => {
    store.setDates(date, store.returnDate);
  }, [store]);

  // Set return date
  const setReturnDate = useCallback((date: Date | null) => {
    store.setDates(store.departureDate, date);
  }, [store]);

  // Reset memory
  const resetMemory = useCallback(() => {
    store.resetTravel();
  }, [store]);

  // Get serialized state
  const getSerializedState = useCallback((): Record<string, unknown> => {
    return {
      travelers: memory.travelers,
      destinations: memory.destinations.map(d => ({
        ...d,
        arrivalDate: d.arrivalDate?.toISOString() ?? null,
        departureDate: d.departureDate?.toISOString() ?? null,
      })),
      departureDate: memory.departureDate?.toISOString() ?? null,
      returnDate: memory.returnDate?.toISOString() ?? null,
      activeDestinationIndex: memory.activeDestinationIndex,
    };
  }, [memory]);

  return {
    memory,
    updateTravelers: store.updateTravelers,
    getTotalTravelers: store.getTotalTravelers,
    addDestination: store.addDestination,
    removeDestination: store.removeDestination,
    updateDestination: store.updateDestination,
    setActiveDestination: store.setActiveDestination,
    getActiveDestination: store.getActiveDestination,
    setDates: store.setDates,
    setDepartureDate,
    setReturnDate,
    hasDestinations,
    hasDates,
    hasTravelers,
    resetMemory,
    getSerializedState,
  };
}
