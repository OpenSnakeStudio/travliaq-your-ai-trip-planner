/**
 * Activity Slice Types
 */

// Activity entry
export interface ActivityEntry {
  id: string;
  destinationId: string;
  viatorProductCode?: string;
  // Location fields (for compatibility with old context)
  city?: string;
  country?: string;
  coordinates?: { lat: number; lng: number };
  title: string;
  description?: string;
  imageUrl?: string;
  images?: any[]; // For compatibility
  duration?: number | { minutes: number; formatted: string };
  price?: number;
  currency?: string;
  rating?: number | { average: number; count: number };
  reviewCount?: number;
  categories?: string[];
  date: Date | null;
  timeSlot?: string;
  participants?: number;
  bookingUrl?: string;
  isManual?: boolean;
  addedAt: Date;
  // Compatibility fields
  pricing?: { from_price: number; currency: string; is_discounted: boolean };
  flags?: string[];
  source?: 'viator' | 'manual';
  userModified?: boolean;
  notes?: string;
  location?: { destination: string; country: string; coordinates?: { lat: number; lng: number } };
}

// Activity destination
export interface ActivityDestination {
  id: string;
  city: string;
  countryCode: string;
  checkIn: Date | null;
  checkOut: Date | null;
  lat?: number;
  lng?: number;
  isInherited?: boolean;
  syncedFromAccommodation?: boolean;
  accommodationId?: string;
  userOverridden?: boolean;
}

// Activity filters
export interface ActivityFilters {
  categories: string[];
  priceRange: [number, number];
  ratingMin: number;
  durationMax: number;
  timeOfDay: string[];
  durationRange: string[];
}

// Viator activity from API (unified type compatible with both API and slice)
export interface ViatorActivity {
  id: string;
  productCode?: string; // Optional for backward compatibility
  title: string;
  description?: string;
  type?: 'activity' | 'attraction';
  primaryImage?: string;
  images?: any[]; // Can be string[] or ActivityImage[]
  duration?: number | { minutes: number; formatted: string };
  durationUnit?: string;
  price?: number;
  originalPrice?: number;
  currency?: string;
  rating?: number | { average: number; count: number };
  reviewCount?: number;
  categories?: string[];
  bookingUrl?: string;
  booking_url?: string;
  lat?: number;
  lng?: number;
  coordinates?: { lat: number; lng: number };
  pricing?: { from_price: number; currency: string; is_discounted: boolean };
  flags?: string[];
  location?: { destination: string; country: string };
  availability?: string;
}

// Activity search state
export interface ActivitySearchState {
  isSearching: boolean;
  searchResults: ViatorActivity[];
  attractions: ViatorActivity[];
  activities: ViatorActivity[];
  totalResults: number;
  totalAttractions: number;
  totalActivities: number;
  currentPage: number;
  hasMore: boolean;
  error: string | null;
}

// Activity state
export interface ActivityState {
  activities: ActivityEntry[];
  localDestinations: ActivityDestination[];
  search: ActivitySearchState;
  recommendations: ViatorActivity[];
  isLoadingRecommendations: boolean;
  selectedActivityId: string | null;
  activeFilters: ActivityFilters;
}

// Initial state
export const initialActivityState: ActivityState = {
  activities: [],
  localDestinations: [],
  search: {
    isSearching: false,
    searchResults: [],
    attractions: [],
    activities: [],
    totalResults: 0,
    totalAttractions: 0,
    totalActivities: 0,
    currentPage: 1,
    hasMore: false,
    error: null,
  },
  recommendations: [],
  isLoadingRecommendations: false,
  selectedActivityId: null,
  activeFilters: {
    categories: [],
    priceRange: [0, 500],
    ratingMin: 0,
    durationMax: 480,
    timeOfDay: [],
    durationRange: [],
  },
};
