/**
 * Viator Meta-Categories System
 *
 * Simplified category system that maps user-facing categories to Viator API keywords.
 *
 * Philosophy:
 * - Simple, direct Viator-only categories (no multi-provider complexity)
 * - User-friendly French names with emojis
 * - Direct mapping to Viator API keywords
 * - Auto-selection support based on user interests
 */

export interface ViatorCategory {
  id: string;                     // Unique ID for the category
  name: string;                   // User-facing French name
  emoji: string;                  // Icon emoji
  description: string;            // Short description
  viatorKeywords: string[];       // Keywords for Viator API filtering
  userInterestMatch?: string[];   // User interest keywords that map to this category
}

/**
 * 7 Main Viator Categories
 *
 * Coverage:
 * - Culture & Patrimoine: Museums, historical sites, architecture
 * - Gastronomie: Food tours, wine tastings, culinary experiences
 * - Nature: Parks, hiking, wildlife, outdoor activities
 * - Aventure & Sports: Extreme sports, water sports, adrenaline activities
 * - Bien-être: Spas, yoga, wellness, relaxation
 * - Vie Nocturne: Nightlife, shopping, urban entertainment
 * - Famille: Family-friendly activities, theme parks, kids entertainment
 */
export const VIATOR_CATEGORIES: ViatorCategory[] = [
  {
    id: "culture",
    name: "Culture & Patrimoine",
    emoji: "🎨",
    description: "Musées, sites historiques, architecture",
    viatorKeywords: [
      "museums",
      "historical",
      "architecture",
      "cultural",
      "heritage",
      "monuments",
      "art",
      "galleries"
    ],
    userInterestMatch: [
      "culture",
      "history",
      "art",
      "museums",
      "heritage",
      "architecture"
    ],
  },
  {
    id: "food",
    name: "Gastronomie",
    emoji: "🍽️",
    description: "Restaurants, dégustations, food tours",
    viatorKeywords: [
      "food",
      "wine",
      "culinary",
      "dining",
      "tasting",
      "cooking",
      "gastronomy",
      "restaurants"
    ],
    userInterestMatch: [
      "food",
      "gastronomy",
      "wine",
      "culinary",
      "cooking",
      "dining"
    ],
  },
  {
    id: "nature",
    name: "Nature",
    emoji: "🌲",
    description: "Parcs naturels, randonnées, écotourisme",
    viatorKeywords: [
      "nature",
      "outdoor",
      "hiking",
      "wildlife",
      "parks",
      "eco",
      "mountains",
      "forests"
    ],
    userInterestMatch: [
      "nature",
      "outdoor",
      "hiking",
      "wildlife",
      "eco",
      "environment"
    ],
  },
  {
    id: "adventure",
    name: "Aventure & Sports",
    emoji: "🧗",
    description: "Activités extrêmes, sports nautiques",
    viatorKeywords: [
      "adventure",
      "sport",
      "extreme",
      "water-sports",
      "climbing",
      "diving",
      "surfing",
      "adrenaline"
    ],
    userInterestMatch: [
      "adventure",
      "sport",
      "adrenaline",
      "extreme",
      "watersports",
      "diving"
    ],
  },
  {
    id: "wellness",
    name: "Bien-être",
    emoji: "🧘",
    description: "Spas, yoga, relaxation",
    viatorKeywords: [
      "spa",
      "wellness",
      "yoga",
      "relaxation",
      "meditation",
      "massage",
      "health",
      "thermal"
    ],
    userInterestMatch: [
      "wellness",
      "relaxation",
      "spa",
      "yoga",
      "meditation",
      "health"
    ],
  },
  {
    id: "nightlife",
    name: "Vie Nocturne",
    emoji: "🌃",
    description: "Bars, clubs, shopping",
    viatorKeywords: [
      "nightlife",
      "shopping",
      "urban",
      "entertainment",
      "bars",
      "clubs",
      "city-tours",
      "markets"
    ],
    userInterestMatch: [
      "nightlife",
      "shopping",
      "party",
      "urban",
      "entertainment"
    ],
  },
  {
    id: "family",
    name: "Famille",
    emoji: "👨‍👩‍👧‍👦",
    description: "Activités familiales, parcs",
    viatorKeywords: [
      "family",
      "kids",
      "children",
      "theme-parks",
      "amusement",
      "family-friendly",
      "educational"
    ],
    userInterestMatch: [
      "family",
      "kids",
      "children",
      "educational"
    ],
  },
];

/**
 * Get category by ID
 */
export function getCategoryById(id: string): ViatorCategory | undefined {
  return VIATOR_CATEGORIES.find(cat => cat.id === id);
}

/**
 * Get all category IDs
 */
export function getAllCategoryIds(): string[] {
  return VIATOR_CATEGORIES.map(cat => cat.id);
}

/**
 * Get category name by ID (fallback to ID if not found)
 */
export function getCategoryName(id: string): string {
  const category = getCategoryById(id);
  return category?.name || id;
}

/**
 * Get category emoji by ID (fallback to empty string)
 */
export function getCategoryEmoji(id: string): string {
  const category = getCategoryById(id);
  return category?.emoji || "";
}
