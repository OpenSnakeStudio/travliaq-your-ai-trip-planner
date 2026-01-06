import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock the axios client used by hotelService
const postMock = vi.fn();

vi.mock('@/services/api/travliaqClient', () => {
  return {
    travliaqClient: {
      post: postMock,
    },
    getErrorMessage: (e: unknown) => (e instanceof Error ? e.message : String(e)),
  };
});

import { searchHotels } from '@/services/hotels/hotelService';
import type { HotelSearchParams } from '@/services/hotels/hotelService';

describe('hotelService.searchHotels (request building)', () => {
  beforeEach(() => {
    postMock.mockReset();
    postMock.mockResolvedValue({
      data: {
        success: true,
        results: { hotels: [], total: 0, hasMore: false },
        filters_applied: {},
        cache_info: { cached: false },
      },
    });
  });

  it('calls /api/v1/hotels/search by default and does not include filters when undefined', async () => {
    const params: HotelSearchParams = {
      city: 'Doha',
      countryCode: 'QA',
      checkIn: '2026-01-08',
      checkOut: '2026-01-15',
      rooms: [{ adults: 2 }],
      currency: 'EUR',
      limit: 10,
    };

    await searchHotels(params, false);

    expect(postMock).toHaveBeenCalledTimes(1);

    const [url, body] = postMock.mock.calls[0];
    expect(url).toBe('/api/v1/hotels/search');

    // Critical: no "filters" key when params.filters is undefined
    expect(body).toMatchObject({
      city: 'Doha',
      countryCode: 'QA',
      checkIn: '2026-01-08',
      checkOut: '2026-01-15',
      currency: 'EUR',
      limit: 10,
      offset: 0,
      rooms: [{ adults: 2, childrenAges: [] }],
    });
    expect('filters' in body).toBe(false);
  });

  it('uses force_refresh=true when forceRefresh is true', async () => {
    const params: HotelSearchParams = {
      city: 'Paris',
      countryCode: 'FR',
      checkIn: '2026-02-15',
      checkOut: '2026-02-17',
      rooms: [{ adults: 2 }],
    };

    await searchHotels(params, true);

    expect(postMock).toHaveBeenCalledTimes(1);
    const [url] = postMock.mock.calls[0];
    expect(url).toBe('/api/v1/hotels/search?force_refresh=true');
  });

  it('includes filters when provided', async () => {
    const params: HotelSearchParams = {
      city: 'Paris',
      countryCode: 'FR',
      checkIn: '2026-02-15',
      checkOut: '2026-02-17',
      rooms: [{ adults: 2 }],
      filters: { priceMax: 250, minRating: 8 },
    };

    await searchHotels(params, false);

    const [, body] = postMock.mock.calls[0];
    expect(body.filters).toEqual({ priceMax: 250, minRating: 8 });
  });

  it('does not cache empty successful search responses (prevents sticky 0-results)', async () => {
    // Ensure cache is empty
    Object.keys(localStorage)
      .filter((k) => k.startsWith('travliaq_hotel_search_'))
      .forEach((k) => localStorage.removeItem(k));

    postMock.mockResolvedValueOnce({
      data: {
        success: true,
        results: { hotels: [], total: 0, hasMore: false },
        filters_applied: {},
        cache_info: { cached: false },
      },
    });

    const params: HotelSearchParams = {
      city: 'Paris',
      countryCode: 'FR',
      checkIn: '2026-02-15',
      checkOut: '2026-02-17',
      rooms: [{ adults: 2 }],
    };

    await searchHotels(params, false);

    const cachedKeys = Object.keys(localStorage).filter((k) => k.startsWith('travliaq_hotel_search_'));
    expect(cachedKeys.length).toBe(0);
  });
});
