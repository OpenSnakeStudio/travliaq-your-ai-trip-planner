import type { HotelSearchParams, HotelSearchResponse } from './hotelService';
import { searchHotels } from './hotelService';

/**
 * Wrapper that retries once with force_refresh=true when the first call returns 0 hotels.
 * This helps when server-side cache contains an empty response.
 */
export async function searchHotelsWithRetry(
  params: HotelSearchParams,
  searchFn: (p: HotelSearchParams, forceRefresh?: boolean) => Promise<HotelSearchResponse> = searchHotels
): Promise<HotelSearchResponse> {
  const first = await searchFn(params, false);
  if (first.success && first.results?.hotels?.length === 0) {
    return searchFn(params, true);
  }
  return first;
}
