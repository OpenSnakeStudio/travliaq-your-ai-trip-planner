/**
 * Trip Basket Memory Store Hook
 * Provides access to the trip basket state and actions
 */

import { useMemo, useCallback } from 'react';
import { usePlannerStoreV2 } from '../plannerStoreV2';
import type {
  TripBasketState,
  BasketItem,
  BasketItemType,
  FlexibleTripType,
} from '../slices/tripBasketTypes';

/**
 * Trip basket store value interface
 */
export interface TripBasketStoreValue {
  // State
  items: BasketItem[];
  tripType: FlexibleTripType;
  isFlightRequired: boolean;
  isHotelRequired: boolean;
  currency: string;
  explicitRequirements: TripBasketState['explicitRequirements'];
  isHydrated: boolean;

  // Item management
  addBasketItem: (item: Omit<BasketItem, 'id' | 'addedAt'>) => string;
  removeBasketItem: (id: string) => void;
  updateBasketItem: (id: string, updates: Partial<BasketItem>) => void;
  clearBasket: () => void;

  // Trip type
  setFlexibleTripType: (tripType: FlexibleTripType) => void;
  detectTripTypeFromMessage: (message: string) => FlexibleTripType | null;

  // Requirements
  setExplicitRequirement: (key: keyof TripBasketState['explicitRequirements'], value: boolean | null) => void;

  // Queries
  getBasketItems: () => BasketItem[];
  getItemsByType: (type: BasketItemType) => BasketItem[];
  getItemsByCity: (city: string) => BasketItem[];
  hasItemOfType: (type: BasketItemType) => boolean;
  getTotalPrice: () => number;
  getRequiredStepsForTripType: () => string[];
  getCompletedSteps: () => string[];
  getMissingSteps: () => string[];
  isBasketComplete: () => boolean;

  // LLM context
  getBasketSummary: () => string;
  getBasketForLLM: () => {
    items: Array<{
      type: string;
      name: string;
      price: number;
      city?: string;
      details: string;
    }>;
    tripType: FlexibleTripType;
    totalPrice: number;
    currency: string;
    completedSteps: string[];
    missingSteps: string[];
    isComplete: boolean;
  };
}

/**
 * Hook to access the trip basket store
 */
export function useTripBasketStore(): TripBasketStoreValue {
  const store = usePlannerStoreV2();

  return useMemo(() => ({
    // State
    items: store.basketItems,
    tripType: store.flexibleTripType,
    isFlightRequired: store.isFlightRequired,
    isHotelRequired: store.isHotelRequired,
    currency: store.basketCurrency,
    explicitRequirements: store.explicitRequirements,
    isHydrated: store.isHydrated,

    // Item management
    addBasketItem: store.addBasketItem,
    removeBasketItem: store.removeBasketItem,
    updateBasketItem: store.updateBasketItem,
    clearBasket: store.clearBasket,

    // Trip type
    setFlexibleTripType: store.setFlexibleTripType,
    detectTripTypeFromMessage: store.detectTripTypeFromMessage,

    // Requirements
    setExplicitRequirement: store.setExplicitRequirement,

    // Queries
    getBasketItems: store.getBasketItems,
    getItemsByType: store.getItemsByType,
    getItemsByCity: store.getItemsByCity,
    hasItemOfType: store.hasItemOfType,
    getTotalPrice: store.getTotalPrice,
    getRequiredStepsForTripType: store.getRequiredStepsForTripType,
    getCompletedSteps: store.getCompletedSteps,
    getMissingSteps: store.getMissingSteps,
    isBasketComplete: store.isBasketComplete,

    // LLM context
    getBasketSummary: store.getBasketSummary,
    getBasketForLLM: store.getBasketForLLM,
  }), [
    store.basketItems,
    store.flexibleTripType,
    store.isFlightRequired,
    store.isHotelRequired,
    store.basketCurrency,
    store.explicitRequirements,
    store.isHydrated,
    store.addBasketItem,
    store.removeBasketItem,
    store.updateBasketItem,
    store.clearBasket,
    store.setFlexibleTripType,
    store.detectTripTypeFromMessage,
    store.setExplicitRequirement,
    store.getBasketItems,
    store.getItemsByType,
    store.getItemsByCity,
    store.hasItemOfType,
    store.getTotalPrice,
    store.getRequiredStepsForTripType,
    store.getCompletedSteps,
    store.getMissingSteps,
    store.isBasketComplete,
    store.getBasketSummary,
    store.getBasketForLLM,
  ]);
}
