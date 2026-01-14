/**
 * Accommodation Slice
 * Manages hotel/accommodation search state
 */

import type { StateCreator } from 'zustand';
import {
  type AccommodationState,
  type AccommodationEntry,
  type BudgetPreset,
  type AccommodationType,
  type EssentialAmenity,
  type AdvancedFilters,
  type RoomConfig,
  type HotelSearchResult,
  type HotelDetails,
  initialAccommodationState,
  createDefaultAccommodation,
  BUDGET_PRESETS,
} from './accommodationTypes';

export interface AccommodationActions {
  addAccommodation: (entry?: Partial<AccommodationEntry>) => void;
  removeAccommodation: (id: string) => void;
  setActiveAccommodation: (index: number) => void;
  getActiveAccommodation: () => AccommodationEntry | null;
  updateAccommodation: (id: string, updates: Partial<AccommodationEntry>) => void;
  setBudgetPreset: (preset: BudgetPreset) => void;
  setCustomBudget: (min: number, max: number) => void;
  setDefaultBudget: (preset: BudgetPreset, min: number, max: number) => void;
  toggleAccommodationType: (type: AccommodationType) => void;
  toggleAmenity: (amenity: EssentialAmenity) => void;
  setMinRating: (rating: number | null) => void;
  setCustomRooms: (rooms: RoomConfig[]) => void;
  toggleAutoRooms: () => void;
  updateAdvancedFilters: (filters: Partial<AdvancedFilters>) => void;
  setAccommodationDates: (checkIn: Date | null, checkOut: Date | null, isUserAction?: boolean) => void;
  setAccommodationDestination: (city: string, country: string, countryCode: string, lat?: number, lng?: number) => void;
  setHotelSearchResults: (results: HotelSearchResult[]) => void;
  setShowHotelResults: (show: boolean) => void;
  setSelectedHotelForDetailId: (id: string | null) => void;
  clearHotelSearch: () => void;
  setIsLoadingHotelDetails: (loading: boolean) => void;
  // Hotel details cache
  setHotelDetails: (hotelId: string, details: HotelDetails) => void;
  getHotelDetailsFromCache: (hotelId: string) => HotelDetails | null;
  // Batch update for sync operations
  updateAccommodationBatch: (updater: (state: AccommodationState) => Partial<AccommodationState>) => void;
  resetAccommodation: () => void;
}

export interface AccommodationSlice extends AccommodationState, AccommodationActions {}

export const createAccommodationSlice: StateCreator<
  AccommodationSlice,
  [['zustand/devtools', never], ['zustand/persist', unknown]],
  [],
  AccommodationSlice
> = (set, get) => ({
  ...initialAccommodationState,

  addAccommodation: (entry?: Partial<AccommodationEntry>) => {
    set(
      (state) => {
        const newEntry: AccommodationEntry = {
          ...createDefaultAccommodation(),
          budgetPreset: state.defaultBudgetPreset,
          priceMin: state.defaultPriceMin,
          priceMax: state.defaultPriceMax,
          ...entry,
        };
        return { accommodations: [...state.accommodations, newEntry] };
      },
      false,
      'accommodation/add'
    );
  },

  removeAccommodation: (id: string) => {
    set(
      (state) => ({
        accommodations: state.accommodations.filter((a) => a.id !== id),
        activeAccommodationIndex: Math.min(state.activeAccommodationIndex, Math.max(0, state.accommodations.length - 2)),
      }),
      false,
      'accommodation/remove'
    );
  },

  setActiveAccommodation: (index: number) => {
    set(
      (state) => ({ activeAccommodationIndex: Math.min(index, state.accommodations.length - 1) }),
      false,
      'accommodation/setActive'
    );
  },

  getActiveAccommodation: () => {
    const { accommodations, activeAccommodationIndex } = get();
    return accommodations[activeAccommodationIndex] || null;
  },

  updateAccommodation: (id: string, updates: Partial<AccommodationEntry>) => {
    set(
      (state) => ({ accommodations: state.accommodations.map((a) => (a.id === id ? { ...a, ...updates } : a)) }),
      false,
      'accommodation/update'
    );
  },

  setBudgetPreset: (preset: BudgetPreset) => {
    set(
      (state) => {
        const { min, max } = BUDGET_PRESETS[preset];
        const activeId = state.accommodations[state.activeAccommodationIndex]?.id;
        if (!activeId) return state;
        return { accommodations: state.accommodations.map((a) => (a.id === activeId ? { ...a, budgetPreset: preset, priceMin: min, priceMax: max } : a)) };
      },
      false,
      'accommodation/setBudgetPreset'
    );
  },

  setCustomBudget: (min: number, max: number) => {
    set(
      (state) => {
        const activeId = state.accommodations[state.activeAccommodationIndex]?.id;
        if (!activeId) return state;
        return { accommodations: state.accommodations.map((a) => (a.id === activeId ? { ...a, budgetPreset: 'custom', priceMin: min, priceMax: max, userModifiedBudget: true } : a)) };
      },
      false,
      'accommodation/setCustomBudget'
    );
  },

  setDefaultBudget: (preset: BudgetPreset, min: number, max: number) => {
    set({ defaultBudgetPreset: preset, defaultPriceMin: min, defaultPriceMax: max }, false, 'accommodation/setDefaultBudget');
  },

  toggleAccommodationType: (type: AccommodationType) => {
    set(
      (state) => {
        const activeId = state.accommodations[state.activeAccommodationIndex]?.id;
        if (!activeId) return state;
        return {
          accommodations: state.accommodations.map((a) => {
            if (a.id !== activeId) return a;
            const types = a.types.includes(type) ? a.types.filter((t) => t !== type) : a.types.length < 2 ? [...a.types, type] : a.types;
            return { ...a, types };
          }),
        };
      },
      false,
      'accommodation/toggleType'
    );
  },

  toggleAmenity: (amenity: EssentialAmenity) => {
    set(
      (state) => {
        const activeId = state.accommodations[state.activeAccommodationIndex]?.id;
        if (!activeId) return state;
        return {
          accommodations: state.accommodations.map((a) => {
            if (a.id !== activeId) return a;
            const amenities = a.amenities.includes(amenity) ? a.amenities.filter((am) => am !== amenity) : [...a.amenities, amenity];
            return { ...a, amenities };
          }),
        };
      },
      false,
      'accommodation/toggleAmenity'
    );
  },

  setMinRating: (rating: number | null) => {
    set(
      (state) => {
        const activeId = state.accommodations[state.activeAccommodationIndex]?.id;
        if (!activeId) return state;
        return { accommodations: state.accommodations.map((a) => (a.id === activeId ? { ...a, minRating: rating } : a)) };
      },
      false,
      'accommodation/setMinRating'
    );
  },

  setCustomRooms: (rooms: RoomConfig[]) => {
    set({ customRooms: rooms, useAutoRooms: false }, false, 'accommodation/setCustomRooms');
  },

  toggleAutoRooms: () => {
    set((state) => ({ useAutoRooms: !state.useAutoRooms }), false, 'accommodation/toggleAutoRooms');
  },

  updateAdvancedFilters: (filters: Partial<AdvancedFilters>) => {
    set(
      (state) => {
        const activeId = state.accommodations[state.activeAccommodationIndex]?.id;
        if (!activeId) return state;
        return { accommodations: state.accommodations.map((a) => (a.id === activeId ? { ...a, advancedFilters: { ...a.advancedFilters, ...filters } } : a)) };
      },
      false,
      'accommodation/updateAdvancedFilters'
    );
  },

  setAccommodationDates: (checkIn: Date | null, checkOut: Date | null, isUserAction = false) => {
    set(
      (state) => {
        const activeId = state.accommodations[state.activeAccommodationIndex]?.id;
        if (!activeId) return state;
        return { accommodations: state.accommodations.map((a) => (a.id === activeId ? { ...a, checkIn, checkOut, userModifiedDates: isUserAction || a.userModifiedDates } : a)) };
      },
      false,
      'accommodation/setDates'
    );
  },

  setAccommodationDestination: (city: string, country: string, countryCode: string, lat?: number, lng?: number) => {
    set(
      (state) => {
        const activeId = state.accommodations[state.activeAccommodationIndex]?.id;
        if (!activeId) return state;
        return { accommodations: state.accommodations.map((a) => (a.id === activeId ? { ...a, city, country, countryCode, lat, lng, userOverriddenDestination: true } : a)) };
      },
      false,
      'accommodation/setDestination'
    );
  },

  setHotelSearchResults: (results: HotelSearchResult[]) => {
    set({ hotelSearchResults: results, showHotelResults: true }, false, 'accommodation/setSearchResults');
  },

  setShowHotelResults: (show: boolean) => {
    set({ showHotelResults: show }, false, 'accommodation/setShowResults');
  },

  setSelectedHotelForDetailId: (id: string | null) => {
    set({ selectedHotelForDetailId: id }, false, 'accommodation/setSelectedHotel');
  },

  clearHotelSearch: () => {
    set({ hotelSearchResults: [], showHotelResults: false, selectedHotelForDetailId: null }, false, 'accommodation/clearSearch');
  },

  setIsLoadingHotelDetails: (loading: boolean) => {
    set({ isLoadingHotelDetails: loading }, false, 'accommodation/setLoadingDetails');
  },

  setHotelDetails: (hotelId: string, details: HotelDetails) => {
    set(
      (state) => ({
        hotelDetailsCache: { ...state.hotelDetailsCache, [hotelId]: details },
      }),
      false,
      'accommodation/setHotelDetails'
    );
  },

  getHotelDetailsFromCache: (hotelId: string) => {
    return get().hotelDetailsCache[hotelId] || null;
  },

  updateAccommodationBatch: (updater: (state: AccommodationState) => Partial<AccommodationState>) => {
    set(
      (state) => updater(state),
      false,
      'accommodation/batchUpdate'
    );
  },

  resetAccommodation: () => {
    set(initialAccommodationState, false, 'accommodation/reset');
  },
});
