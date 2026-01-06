import { describe, expect, it, vi } from 'vitest';
import type { HotelSearchParams, HotelSearchResponse } from '@/services/hotels/hotelService';
import { searchHotelsWithRetry } from '@/services/hotels/searchHotelsWithRetry';

function makeResponse(count: number): HotelSearchResponse {
  return {
    success: true,
    results: {
      hotels: Array.from({ length: count }, (_, i) => ({
        id: `htl_${i}`,
        name: `Hotel ${i}`,
        lat: 0,
        lng: 0,
        imageUrl: null,
        stars: null,
        rating: null,
        reviewCount: 0,
        pricePerNight: 100,
        totalPrice: null,
        currency: 'EUR',
        address: '',
        distanceFromCenter: null,
        amenities: [],
        bookingUrl: null,
      })),
      total: count,
      hasMore: false,
    },
    filters_applied: {},
    cache_info: { cached: false },
  };
}

describe('searchHotelsWithRetry', () => {
  it('retries with forceRefresh=true when first response has 0 hotels', async () => {
    const params: HotelSearchParams = {
      city: 'Doha',
      countryCode: 'QA',
      checkIn: '2026-01-08',
      checkOut: '2026-01-15',
      rooms: [{ adults: 2 }],
      currency: 'EUR',
      limit: 10,
    };

    const searchFn = vi
      .fn<
        (p: HotelSearchParams, forceRefresh?: boolean) => Promise<HotelSearchResponse>
      >()
      .mockResolvedValueOnce(makeResponse(0))
      .mockResolvedValueOnce(makeResponse(2));

    const res = await searchHotelsWithRetry(params, searchFn);

    expect(searchFn).toHaveBeenCalledTimes(2);
    expect(searchFn.mock.calls[0][1]).toBe(false);
    expect(searchFn.mock.calls[1][1]).toBe(true);
    expect(res.results.hotels).toHaveLength(2);
  });

  it('does not retry when first response already has hotels', async () => {
    const params: HotelSearchParams = {
      city: 'Doha',
      countryCode: 'QA',
      checkIn: '2026-01-08',
      checkOut: '2026-01-15',
      rooms: [{ adults: 2 }],
    };

    const searchFn = vi
      .fn<
        (p: HotelSearchParams, forceRefresh?: boolean) => Promise<HotelSearchResponse>
      >()
      .mockResolvedValueOnce(makeResponse(1));

    const res = await searchHotelsWithRetry(params, searchFn);

    expect(searchFn).toHaveBeenCalledTimes(1);
    expect(searchFn.mock.calls[0][1]).toBe(false);
    expect(res.results.hotels).toHaveLength(1);
  });
});
