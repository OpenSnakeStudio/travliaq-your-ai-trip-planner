/**
 * Trip Basket Memory Store Hook
 * Provides access to the trip basket state and actions
 */

import { useTripBasketStore as useStore } from '../tripBasketStore';
import type { FlexibleTripType, BasketItem, BasketItemType, TripBasketState } from '../slices/tripBasketTypes';

export { useTripBasketStore } from '../tripBasketStore';

// Re-export types for convenience
export type { FlexibleTripType, BasketItem, BasketItemType, TripBasketState };
