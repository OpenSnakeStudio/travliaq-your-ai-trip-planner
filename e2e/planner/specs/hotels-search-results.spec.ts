import { test, expect } from '../../fixtures/auth';
import { PlannerPage } from '../../helpers/planner-page';

function makeHotelsResponse(city: string) {
  return {
    success: true,
    results: {
      hotels: [
        {
          id: `htl_${city.toLowerCase()}_1`,
          name: `Hotel Test ${city} 1`,
          lat: 48.8566,
          lng: 2.3522,
          imageUrl: null,
          stars: 4,
          rating: 8.6,
          reviewCount: 123,
          pricePerNight: 150,
          totalPrice: 300,
          currency: 'EUR',
          address: `${city} Center`,
          distanceFromCenter: null,
          amenities: ['wifi'],
          bookingUrl: null,
        },
      ],
      total: 1,
      hasMore: false,
    },
    filters_applied: {
      city,
      sort: 'popularity',
    },
    cache_info: { cached: false },
  };
}

function accommodationMemoryFor(city: string, country: string, countryCode: string, checkInISO: string, checkOutISO: string) {
  return {
    accommodations: [
      {
        id: 'acc_1',
        city,
        country,
        countryCode,
        checkIn: checkInISO,
        checkOut: checkOutISO,
        budgetPreset: 'comfort',
        priceMin: 80,
        priceMax: 180,
        types: [],
        minRating: null,
        amenities: [],
        advancedFilters: { mealPlan: null, views: [], services: [], accessibility: [] },
      },
    ],
    activeAccommodationIndex: 0,
    useAutoRooms: true,
    customRooms: [],
    defaultBudgetPreset: 'comfort',
    defaultPriceMin: 80,
    defaultPriceMax: 180,
  };
}

test.describe('Hotels search (UI plumbing)', () => {
  test('should render hotel results for multiple cities when API responds with hotels', async ({ authenticatedPage }) => {
    // Mock hotels API
    await authenticatedPage.route('**/api/v1/hotels/search**', async (route) => {
      const body = route.request().postDataJSON() as any;
      const city = body?.city || 'Unknown';
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(makeHotelsResponse(city)),
      });
    });

    const scenarios = [
      {
        city: 'Paris',
        country: 'France',
        countryCode: 'FR',
        checkIn: '2026-02-15T00:00:00.000Z',
        checkOut: '2026-02-17T00:00:00.000Z',
      },
      {
        city: 'Tokyo',
        country: 'Japan',
        countryCode: 'JP',
        checkIn: '2026-03-10T00:00:00.000Z',
        checkOut: '2026-03-12T00:00:00.000Z',
      },
      {
        city: 'Bangkok',
        country: 'Thailand',
        countryCode: 'TH',
        checkIn: '2026-04-05T00:00:00.000Z',
        checkOut: '2026-04-08T00:00:00.000Z',
      },
    ];

    for (const s of scenarios) {
      // Set accommodation memory before visiting planner
      await authenticatedPage.addInitScript(({ memory }) => {
        localStorage.setItem('travliaq_accommodation_memory', JSON.stringify(memory));
      }, { memory: accommodationMemoryFor(s.city, s.country, s.countryCode, s.checkIn, s.checkOut) });

      const page = new PlannerPage(authenticatedPage);
      await page.goto();
      await page.switchToStays();

      await authenticatedPage.getByTestId('hotels-search-button').click();

      // Results view should render at least one hotel card
      await expect(authenticatedPage.getByTestId('hotel-card').first()).toBeVisible({ timeout: 10000 });
    }
  });
});
