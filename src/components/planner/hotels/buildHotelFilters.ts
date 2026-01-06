import type { Amenity, HotelFilters, PropertyType } from '@/services/hotels/hotelService';

export type AccommodationLike = {
  priceMin?: number;
  priceMax?: number;
  minRating?: number | null;
  amenities?: string[];
  types?: string[];
  /** When absent/false, we must NOT apply budget filters */
  userModifiedBudget?: boolean;
};

/**
 * Build filters sent to the Hotels API.
 * Key rule: NEVER apply priceMin/priceMax unless the user explicitly modified the budget.
 */
export function buildHotelFilters(activeAccommodation: AccommodationLike): HotelFilters | undefined {
  const filters: HotelFilters = {};

  const shouldApplyBudget = activeAccommodation.userModifiedBudget === true;
  if (shouldApplyBudget) {
    const min = activeAccommodation.priceMin ?? 0;
    const max = activeAccommodation.priceMax ?? 1000;
    if (min > 0) filters.priceMin = min;
    if (max < 1000) filters.priceMax = max;
  }

  const minRating = activeAccommodation.minRating ?? null;
  if (typeof minRating === 'number' && minRating > 0) filters.minRating = minRating;

  const amenities = activeAccommodation.amenities ?? [];
  if (amenities.length > 0) filters.amenities = amenities as Amenity[];

  const types = activeAccommodation.types ?? [];
  if (types.length > 0 && !types.includes('any')) filters.types = types as PropertyType[];

  return Object.keys(filters).length > 0 ? filters : undefined;
}
