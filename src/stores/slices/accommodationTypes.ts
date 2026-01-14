/**
 * Accommodation Slice Types
 */

// Room configuration
export interface RoomConfig {
  id: string;
  adults: number;
  children: number;
  childrenAges: number[];
}

// Budget presets
export type BudgetPreset = 'eco' | 'comfort' | 'premium' | 'luxury' | 'custom';

// Accommodation types
export type AccommodationType = 'hotel' | 'apartment' | 'villa' | 'hostel' | 'guesthouse' | 'any';

// Essential amenities
export type EssentialAmenity = 'wifi' | 'parking' | 'breakfast' | 'ac' | 'pool' | 'kitchen';

// Meal plans
export type MealPlan = 'none' | 'breakfast' | 'half' | 'full' | 'all-inclusive';

// Advanced filters
export interface AdvancedFilters {
  mealPlan: MealPlan | null;
  views: string[];
  services: string[];
  accessibility: string[];
}

// Single accommodation entry
export interface AccommodationEntry {
  id: string;
  city: string;
  country: string;
  countryCode: string;
  lat?: number;
  lng?: number;
  checkIn: Date | null;
  checkOut: Date | null;
  syncedFromFlight?: boolean;
  flightLegId?: string;
  userOverriddenDestination?: boolean;
  userModifiedDates?: boolean;
  userModifiedBudget?: boolean;
  budgetPreset: BudgetPreset;
  priceMin: number;
  priceMax: number;
  types: AccommodationType[];
  minRating: number | null;
  amenities: EssentialAmenity[];
  advancedFilters: AdvancedFilters;
}

// Hotel search result
export interface HotelSearchResult {
  id: string;
  name: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  totalPrice?: number;
  currency: string;
  address: string;
  lat: number;
  lng: number;
  amenities: string[];
  stars?: number;
  distanceFromCenter?: string;
  bookingUrl?: string;
}

// Note: HotelDetails is imported from the hotel service
// We use a generic Record type here to avoid circular dependencies
// The actual type is defined in @/services/hotels/hotelService

// Accommodation state
export interface AccommodationState {
  accommodations: AccommodationEntry[];
  activeAccommodationIndex: number;
  useAutoRooms: boolean;
  customRooms: RoomConfig[];
  defaultBudgetPreset: BudgetPreset;
  defaultPriceMin: number;
  defaultPriceMax: number;
  hotelSearchResults: HotelSearchResult[];
  showHotelResults: boolean;
  selectedHotelForDetailId: string | null;
  isLoadingHotelDetails: boolean;
  // Hotel details cache (runtime only) - uses generic type to avoid circular deps
  hotelDetailsCache: Record<string, unknown>;
}

// Budget presets values
export const BUDGET_PRESETS: Record<BudgetPreset, { min: number; max: number; label: string }> = {
  eco: { min: 0, max: 80, label: 'Économique' },
  comfort: { min: 80, max: 180, label: 'Confort' },
  premium: { min: 180, max: 350, label: 'Premium' },
  luxury: { min: 350, max: 1000, label: 'Luxe' },
  custom: { min: 0, max: 1000, label: 'Personnalisé' },
};

// Create default accommodation
export const createDefaultAccommodation = (): AccommodationEntry => ({
  id: crypto.randomUUID(),
  city: '',
  country: '',
  countryCode: '',
  checkIn: null,
  checkOut: null,
  budgetPreset: 'comfort',
  priceMin: 80,
  priceMax: 180,
  types: [],
  minRating: null,
  amenities: [],
  advancedFilters: {
    mealPlan: null,
    views: [],
    services: [],
    accessibility: [],
  },
});

// Initial state - start with empty accommodations to avoid UUID generation issues during SSR/hydration
export const initialAccommodationState: AccommodationState = {
  accommodations: [],
  activeAccommodationIndex: 0,
  useAutoRooms: true,
  customRooms: [],
  defaultBudgetPreset: 'comfort',
  defaultPriceMin: 80,
  defaultPriceMax: 180,
  hotelSearchResults: [],
  showHotelResults: false,
  selectedHotelForDetailId: null,
  isLoadingHotelDetails: false,
  hotelDetailsCache: {},
};
