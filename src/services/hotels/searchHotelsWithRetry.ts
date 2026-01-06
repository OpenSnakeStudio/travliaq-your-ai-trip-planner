import type { HotelSearchParams, HotelSearchResponse } from './hotelService';
import { searchHotels } from './hotelService';

function sanitizeParamsForFallback(params: HotelSearchParams): HotelSearchParams {
  // API docs say lat/lng are "non utilisé"; some backend combos can still behave oddly.
  // Also, 'popularity' is the safest default sort.
  // Only override when needed; keep other params identical.
  const { lat, lng, ...rest } = params;
  return {
    ...rest,
    sort: 'popularity',
  };
}

/**
 * Wrapper that retries when the first call returns 0 hotels.
 * Strategy:
 * 1) normal call
 * 2) if empty -> retry with sanitized params (no lat/lng + sort=popularity)
 * 3) if still empty -> retry sanitized params with force_refresh=true
 */
export async function searchHotelsWithRetry(
  params: HotelSearchParams,
  searchFn: (p: HotelSearchParams, forceRefresh?: boolean) => Promise<HotelSearchResponse> = searchHotels
): Promise<HotelSearchResponse> {
  const first = await searchFn(params, false);
  if (!first.success || first.results?.hotels?.length !== 0) return first;

  const fallbackParams = sanitizeParamsForFallback(params);
  const second = await searchFn(fallbackParams, false);
  if (!second.success || second.results?.hotels?.length !== 0) return second;

  return searchFn(fallbackParams, true);
}
