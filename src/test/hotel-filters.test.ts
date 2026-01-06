import { describe, expect, it } from 'vitest';
import { buildHotelFilters } from '@/components/planner/hotels/buildHotelFilters';

describe('buildHotelFilters', () => {
  it('does not send budget filters when userModifiedBudget is missing/false', () => {
    expect(
      buildHotelFilters({
        priceMin: 80,
        priceMax: 223,
      })
    ).toBeUndefined();

    expect(
      buildHotelFilters({
        priceMin: 0,
        priceMax: 223,
        userModifiedBudget: false,
      })
    ).toBeUndefined();
  });

  it('sends budget filters only when userModifiedBudget is true', () => {
    expect(
      buildHotelFilters({
        priceMin: 0,
        priceMax: 223,
        userModifiedBudget: true,
      })
    ).toEqual({ priceMax: 223 });

    expect(
      buildHotelFilters({
        priceMin: 120,
        priceMax: 350,
        userModifiedBudget: true,
      })
    ).toEqual({ priceMin: 120, priceMax: 350 });
  });
});
