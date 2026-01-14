/**
 * Activity Slice Types
 */

// Activity entry
export interface ActivityEntry {
  id: string;
  destinationId: string;
  viatorProductCode?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  duration?: number;
  price?: number;
  currency?: string;
  rating?: number;
  reviewCount?: number;
  categories?: string[];
  date: Date | null;
  timeSlot?: string;
  participants?: number;
  bookingUrl?: string;
  isManual?: boolean;
  addedAt: Date;
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

// Viator activity from API
export interface ViatorActivity {
  productCode: string;
  title: string;
  description?: string;
  primaryImage?: string;
  images?: string[];
  duration?: number;
  durationUnit?: string;
  price?: number;
  originalPrice?: number;
  currency?: string;
  rating?: number;
  reviewCount?: number;
  categories?: string[];
  bookingUrl?: string;
  lat?: number;
  lng?: number;
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
