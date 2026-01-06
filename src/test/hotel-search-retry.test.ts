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
  it('falls back to sanitized params (popularity + no lat/lng) when first response has 0 hotels', async () => {
    const params: HotelSearchParams = {
      city: 'Paris',
      countryCode: 'FR',
      checkIn: '2026-02-15',
      checkOut: '2026-02-17',
      rooms: [{ adults: 2 }],
      // simulate what UI used to send
      sort: 'price_asc',
      lat: 48.85,
      lng: 2.34,
    };

    const searchFn = vi
      .fn<
        (p: HotelSearchParams, forceRefresh?: boolean) => Promise<HotelSearchResponse>
      >()
      .mockResolvedValueOnce(makeResponse(0))
      .mockResolvedValueOnce(makeResponse(2));

    const res = await searchHotelsWithRetry(params, searchFn);

    expect(searchFn).toHaveBeenCalledTimes(2);

    // 1st call: original params
    expect(searchFn.mock.calls[0][0]).toMatchObject({ sort: 'price_asc', lat: 48.85, lng: 2.34 });
    expect(searchFn.mock.calls[0][1]).toBe(false);

    // 2nd call: sanitized fallback
    expect(searchFn.mock.calls[1][0]).toMatchObject({ sort: 'popularity' });
    expect(searchFn.mock.calls[1][0]).not.toHaveProperty('lat');
    expect(searchFn.mock.calls[1][0]).not.toHaveProperty('lng');
    expect(searchFn.mock.calls[1][1]).toBe(false);

    expect(res.results.hotels).toHaveLength(2);
  });

  it('uses force_refresh=true as last resort when both normal and sanitized calls return 0 hotels', async () => {
    const params: HotelSearchParams = {
      city: 'Doha',
      countryCode: 'QA',
      checkIn: '2026-01-08',
      checkOut: '2026-01-15',
      rooms: [{ adults: 2 }],
      sort: 'price_asc',
      lat: 25.28,
      lng: 51.52,
    };

    const searchFn = vi
      .fn<
        (p: HotelSearchParams, forceRefresh?: boolean) => Promise<HotelSearchResponse>
      >()
      .mockResolvedValueOnce(makeResponse(0))
      .mockResolvedValueOnce(makeResponse(0))
      .mockResolvedValueOnce(makeResponse(1));

    const res = await searchHotelsWithRetry(params, searchFn);

    expect(searchFn).toHaveBeenCalledTimes(3);
    expect(searchFn.mock.calls[2][1]).toBe(true);
    expect(res.results.hotels).toHaveLength(1);
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
