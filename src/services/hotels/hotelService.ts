/**
 * Hotel Service
 * 
 * Handles API calls to Travliaq Hotels API with caching
 * Base URL: https://travliaq-api-production.up.railway.app/api/v1/hotels
 */

import { travliaqClient, getErrorMessage } from '@/services/api/travliaqClient';

// ============= Types =============

export interface HotelRoom {
  adults: number;
  childrenAges?: number[];
}

export interface HotelSearchFilters {
  priceMin?: number;
  priceMax?: number;
  minStars?: number;
  minRating?: number;
  amenities?: string[];
  types?: string[];
}

export interface HotelSearchParams {
  city: string;
  countryCode: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  rooms: HotelRoom[];
  currency?: string;
  locale?: string;
  filters?: HotelSearchFilters;
  sort?: 'popularity' | 'price_asc' | 'price_desc' | 'rating' | 'distance';
  limit?: number;
  offset?: number;
}

export interface HotelSearchResult {
  id: string;
  name: string;
  lat: number;
  lng: number;
  imageUrl?: string;
  stars?: number;
  rating?: number;
  reviewCount: number;
  pricePerNight: number;
  totalPrice?: number;
  currency: string;
  address: string;
  distanceFromCenter?: number;
  amenities: string[];
  bookingUrl?: string;
}

export interface HotelSearchResponse {
  success: boolean;
  results: {
    hotels: HotelSearchResult[];
    total: number;
    hasMore: boolean;
  };
  filters_applied: object;
  cache_info: { cached: boolean };
}

export interface HotelDetailAmenity {
  code: string;
  label: string;
}

export interface HotelDetailRoom {
  id: string;
  name: string;
  description?: string;
  maxOccupancy: number;
  bedType?: string;
  pricePerNight: number;
  totalPrice: number;
  amenities: string[];
  cancellationFree: boolean;
}

export interface HotelDetail {
  id: string;
  name: string;
  lat: number;
  lng: number;
  stars?: number;
  rating?: number;
  reviewCount: number;
  address: string;
  distanceFromCenter?: number;
  description?: string;
  images: string[];
  amenities: HotelDetailAmenity[];
  highlights: string[];
  policies?: {
    checkIn?: string;
    checkOut?: string;
    cancellation?: string;
  };
  rooms: HotelDetailRoom[];
  bookingUrl?: string;
}

export interface HotelDetailResponse {
  success: boolean;
  hotel: HotelDetail;
  cache_info: object;
}

export interface MapPriceCity {
  city: string;
  countryCode: string;
}

export interface MapPricesParams {
  cities: MapPriceCity[];
  checkIn: string;
  checkOut: string;
  rooms: HotelRoom[];
  currency?: string;
}

export interface MapPricesResponse {
  success: boolean;
  prices: Record<string, { minPrice: number | null; currency: string } | null>;
  cache_info: object;
}

// ============= Cache =============

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const CACHE_PREFIX = 'travliaq_hotel';

// TTLs matching server-side cache
const CACHE_TTL = {
  search: 30 * 60 * 1000,     // 30 minutes (server: 2h)
  details: 24 * 60 * 60 * 1000, // 24 hours (server: 7d)
  mapPrices: 2 * 60 * 60 * 1000, // 2 hours (server: 24h)
};

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function sortObject(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sortObject);
  const sorted: any = {};
  Object.keys(obj).sort().forEach((key) => {
    sorted[key] = sortObject(obj[key]);
  });
  return sorted;
}

function getCacheKey(type: string, params: any): string {
  const paramString = JSON.stringify(sortObject(params));
  return `${CACHE_PREFIX}_${type}_${hashString(paramString)}`;
}

function getFromCache<T>(type: string, params: any): T | null {
  try {
    const key = getCacheKey(type, params);
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const entry: CacheEntry<T> = JSON.parse(cached);
    const age = Date.now() - entry.timestamp;
    
    if (age > entry.ttl) {
      localStorage.removeItem(key);
      return null;
    }
    
    return entry.data;
  } catch {
    return null;
  }
}

function setInCache<T>(type: string, params: any, data: T): void {
  try {
    const key = getCacheKey(type, params);
    const ttl = CACHE_TTL[type as keyof typeof CACHE_TTL] || CACHE_TTL.search;
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    // Quota exceeded - ignore
    console.warn('Hotel cache set error:', error);
  }
}

// ============= API Functions =============

/**
 * Search hotels
 */
export async function searchHotels(params: HotelSearchParams): Promise<HotelSearchResponse> {
  // Check cache first
  const cached = getFromCache<HotelSearchResponse>('search', params);
  if (cached) {
    console.log('[HotelService] Cache hit for search');
    return cached;
  }
  
  try {
    const response = await travliaqClient.post<HotelSearchResponse>('/hotels/search', {
      city: params.city,
      countryCode: params.countryCode,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      rooms: params.rooms,
      currency: params.currency || 'EUR',
      locale: params.locale || 'fr',
      filters: params.filters,
      sort: params.sort || 'price_asc',
      limit: params.limit || 30,
      offset: params.offset || 0,
    });
    
    // Cache successful response
    if (response.data.success) {
      setInCache('search', params, response.data);
    }
    
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get hotel details
 */
export async function getHotelDetails(
  hotelId: string,
  checkIn: string,
  checkOut: string,
  rooms: HotelRoom[],
  currency: string = 'EUR',
  locale: string = 'fr'
): Promise<HotelDetailResponse> {
  const cacheParams = { hotelId, checkIn, checkOut, rooms, currency };
  
  // Check cache first
  const cached = getFromCache<HotelDetailResponse>('details', cacheParams);
  if (cached) {
    console.log('[HotelService] Cache hit for details');
    return cached;
  }
  
  try {
    // Format rooms for query param: "adults-childAge1-childAge2,adults-childAge1"
    const roomsParam = rooms.map(r => {
      if (r.childrenAges && r.childrenAges.length > 0) {
        return `${r.adults}-${r.childrenAges.join('-')}`;
      }
      return `${r.adults}`;
    }).join(',');
    
    const response = await travliaqClient.get<HotelDetailResponse>(`/hotels/${hotelId}`, {
      params: {
        checkIn,
        checkOut,
        rooms: roomsParam,
        currency,
        locale,
      },
    });
    
    // Cache successful response
    if (response.data.success) {
      setInCache('details', cacheParams, response.data);
    }
    
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get map prices for multiple cities
 */
export async function getMapPrices(params: MapPricesParams): Promise<MapPricesResponse> {
  // Check cache first
  const cached = getFromCache<MapPricesResponse>('mapPrices', params);
  if (cached) {
    console.log('[HotelService] Cache hit for map prices');
    return cached;
  }
  
  try {
    const response = await travliaqClient.post<MapPricesResponse>('/hotels/map-prices', {
      cities: params.cities.slice(0, 5), // API max 5 cities
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      rooms: params.rooms,
      currency: params.currency || 'EUR',
    });
    
    // Cache successful response
    if (response.data.success) {
      setInCache('mapPrices', params, response.data);
    }
    
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Check API health
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await travliaqClient.get('/hotels/health');
    return response.data?.status === 'ok';
  } catch {
    return false;
  }
}

/**
 * Clear hotel cache
 */
export function clearHotelCache(type?: 'search' | 'details' | 'mapPrices'): void {
  try {
    const prefix = type ? `${CACHE_PREFIX}_${type}_` : `${CACHE_PREFIX}_`;
    const keys = Object.keys(localStorage);
    
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
    
    console.log(`[HotelService] Cache cleared: ${type || 'all'}`);
  } catch (error) {
    console.error('Hotel cache clear error:', error);
  }
}

// Export default object for convenience
export default {
  searchHotels,
  getHotelDetails,
  getMapPrices,
  checkHealth,
  clearHotelCache,
};
