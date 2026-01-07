/**
 * Activity Filter Auto-Selection
 *
 * Intelligently selects activity filters based on user preferences.
 * Maps user interests → Viator categories, comfort → price range, etc.
 */

import { VIATOR_CATEGORIES, type ViatorCategory } from "@/constants/metaCategories";

/**
 * User trip preferences (from PreferencesContext)
 */
export interface TripPreferences {
  interests?: string[];           // e.g., ["culture", "food", "nature"]
  comfortLevel?: number;          // 0-100 scale
  pace?: "relaxed" | "moderate" | "intense";
  budget?: {
    min: number;
    max: number;
  };
  // New: Style Axes from PreferenceMemoryContext
  styleAxes?: {
    chillVsIntense?: number;      // 0-100 (0=Chill, 100=Intense)
    cityVsNature?: number;        // 0-100 (0=Ville, 100=Nature)
    ecoVsLuxury?: number;         // 0-100 (0=Éco, 100=Luxe)
    touristVsLocal?: number;      // 0-100 (0=Touristique, 100=Authentique)
  };
}

/**
 * Smart filter output
 */
export interface SmartFilters {
  categories: string[];           // Viator category IDs
  priceRange: [number, number];
  ratingMin: number;
}

/**
 * Intelligently select filters based on user preferences.
 *
 * Mapping Logic:
 * 1. Interests → Categories: Match user interests to Viator categories
 * 2. Comfort Level → Price Range:
 *    - 0-25: Budget (€0-€30)
 *    - 25-50: Économique (€0-€80)
 *    - 50-75: Confort (€0-€150)
 *    - 75-100: Luxe (€0-€500)
 * 3. Comfort Level → Rating:
 *    - 0-50: 3.5★ minimum
 *    - 50-75: 4.0★ minimum
 *    - 75-100: 4.5★ minimum
 *
 * @param preferences - User trip preferences
 * @returns Smart filter selections
 */
export function autoSelectFilters(preferences: TripPreferences): SmartFilters {
  const selectedCategories: string[] = [];

  // === 1. INTERESTS → CATEGORIES ===
  const userInterests = preferences.interests || [];

  userInterests.forEach(interest => {
    VIATOR_CATEGORIES.forEach(category => {
      if (category.userInterestMatch?.some(match =>
        match.toLowerCase() === interest.toLowerCase()
      )) {
        if (!selectedCategories.includes(category.id)) {
          selectedCategories.push(category.id);
        }
      }
    });
  });

  // === 1b. STYLE AXES → ADDITIONAL CATEGORIES ===
  const styleAxes = preferences.styleAxes;
  
  if (styleAxes?.cityVsNature !== undefined) {
    // Nature preference (>60) → nature, outdoor, adventure
    if (styleAxes.cityVsNature > 60) {
      ["nature", "adventure", "outdoor"].forEach(cat => {
        if (!selectedCategories.includes(cat)) selectedCategories.push(cat);
      });
    }
    // City preference (<40) → culture, nightlife, shopping
    else if (styleAxes.cityVsNature < 40) {
      ["culture", "nightlife", "shopping"].forEach(cat => {
        if (!selectedCategories.includes(cat)) selectedCategories.push(cat);
      });
    }
  }
  
  if (styleAxes?.touristVsLocal !== undefined) {
    // Authentic preference (>60) → local experiences, food tours
    if (styleAxes.touristVsLocal > 60) {
      ["food", "local-experiences"].forEach(cat => {
        if (!selectedCategories.includes(cat)) selectedCategories.push(cat);
      });
    }
  }

  // === 2. COMFORT LEVEL → PRICE RANGE ===
  // Use styleAxes.ecoVsLuxury if available, else fallback to comfortLevel
  const comfortLevel = styleAxes?.ecoVsLuxury ?? preferences.comfortLevel ?? 50;
  let priceRange: [number, number] = [0, 500];

  if (comfortLevel < 25) {
    // Budget: €0-€30
    priceRange = [0, 30];
  } else if (comfortLevel < 50) {
    // Économique: €0-€80
    priceRange = [0, 80];
  } else if (comfortLevel < 75) {
    // Confort: €0-€150
    priceRange = [0, 150];
  } else {
    // Luxe: €0-€500
    priceRange = [0, 500];
  }

  // Override with explicit budget if provided
  if (preferences.budget) {
    priceRange = [preferences.budget.min, preferences.budget.max];
  }

  // === 3. COMFORT LEVEL → RATING ===
  let ratingMin = 3.5;

  if (comfortLevel >= 75) {
    // High-end: 4.5★ minimum
    ratingMin = 4.5;
  } else if (comfortLevel >= 50) {
    // Mid-range: 4.0★ minimum
    ratingMin = 4.0;
  }

  return {
    categories: selectedCategories,
    priceRange,
    ratingMin,
  };
}

/**
 * Convert selected category IDs to Viator API keywords.
 *
 * Example:
 * Input: ["culture", "food"]
 * Output: ["museums", "historical", "architecture", "food", "wine", "culinary"]
 *
 * @param categoryIds - Selected category IDs
 * @returns Viator API keywords (deduplicated)
 */
export function mapCategoriesToViatorKeywords(categoryIds: string[]): string[] {
  const viatorKeywords: string[] = [];

  categoryIds.forEach(id => {
    const category = VIATOR_CATEGORIES.find(c => c.id === id);
    if (category?.viatorKeywords) {
      viatorKeywords.push(...category.viatorKeywords);
    }
  });

  // Deduplicate keywords
  return [...new Set(viatorKeywords)];
}

/**
 * Get a human-readable summary of selected filters.
 *
 * Example: "3 catégories · €0-€150 · 4.0★ minimum"
 *
 * @param filters - Smart filter selections
 * @returns Human-readable summary
 */
export function getFiltersSummary(filters: SmartFilters): string {
  const parts: string[] = [];

  if (filters.categories.length > 0) {
    parts.push(`${filters.categories.length} catégorie${filters.categories.length > 1 ? 's' : ''}`);
  }

  parts.push(`€${filters.priceRange[0]}-€${filters.priceRange[1]}`);

  parts.push(`${filters.ratingMin}★ minimum`);

  return parts.join(" · ");
}

/**
 * Check if any filters are active.
 *
 * @param filters - Smart filter selections
 * @returns True if at least one filter is non-default
 */
export function hasActiveFilters(filters: SmartFilters): boolean {
  return (
    filters.categories.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 500 ||
    filters.ratingMin > 3.5
  );
}
