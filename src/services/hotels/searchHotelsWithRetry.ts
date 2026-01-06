import type { HotelSearchParams, HotelSearchResponse } from './hotelService';
import { searchHotels } from './hotelService';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sanitizeParamsForFallback(params: HotelSearchParams): HotelSearchParams {
  // Use 'popularity' as safest default sort (most reliable backend behavior).
  return {
    ...params,
    sort: 'popularity',
  };
}

/**
 * Wrapper that retries when the first call returns 0 hotels.
 * Strategy:
 * 1) normal call
 * 2) if empty -> retry with sort=popularity
 * 3) if still empty -> retry with force_refresh=true
 *
 * Note: we've seen cases where the backend returns an empty cached response first,
 * then returns data a moment later once cache warms. When the first response is
 * empty AND cached=true, we wait briefly before the force_refresh attempt.
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

  // If we are likely hitting a "warming" cache, wait a beat before the forced refresh.
  const cachedEmpty = first.cache_info?.cached === true || second.cache_info?.cached === true;
  if (cachedEmpty) {
    await sleep(800);
  }

  return searchFn(fallbackParams, true);
}
