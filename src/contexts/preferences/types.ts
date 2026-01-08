/**
 * Preference Types
 * All interfaces and types for the preference system
 */

// ============================================================================
// CORE TYPES
// ============================================================================

export interface StyleAxes {
  chillVsIntense: number;      // 0-100 (0=Chill, 100=Intense)
  cityVsNature: number;        // 0-100 (0=Ville, 100=Nature)
  ecoVsLuxury: number;         // 0-100 (miroir de comfortLevel)
  touristVsLocal: number;      // 0-100 (0=Touristique, 100=Authentique)
}

export interface MustHaves {
  accessibilityRequired: boolean;
  petFriendly: boolean;
  familyFriendly: boolean;
  highSpeedWifi: boolean;
}

export interface WorkPreferences {
  needsWifi: boolean;
  workationMode: boolean;
}

export interface TripContext {
  occasion?: "honeymoon" | "anniversary" | "birthday" | "vacation" | "workation" | "other";
  flexibility: "fixed" | "flexible" | "very_flexible";
}

export type TravelStyle = "solo" | "couple" | "family" | "friends" | "pet";

export interface TripPreferences {
  id: string;

  // === BASE ===
  travelStyle: TravelStyle;

  // === STYLE AXES (Égaliseur) ===
  styleAxes: StyleAxes;

  // === INTERESTS ===
  interests: string[]; // Max 5: ["culture", "food", "nature", "beach", "wellness", "sport", "adventure", "nightlife", "shopping", "workation"]

  // === MUST-HAVES ===
  mustHaves: MustHaves;

  // === WORK PREFERENCES ===
  workPreferences: WorkPreferences;

  // === TRIP CONTEXT ===
  tripContext: TripContext;

  // === LEGACY (backward compatible) ===
  pace: "relaxed" | "moderate" | "intense";
  comfortLevel: number; // 0-100 - mirror of styleAxes.ecoVsLuxury
  dietaryRestrictions: string[];
  accessibilityNeeds: string[];

  // === METADATA ===
  confidenceScore: number; // 0-100 - profile completion
  lastUpdated: Date;
  detectedFromChat: boolean;
  manualOverrides: string[]; // Fields manually overridden by user
}

export interface PreferenceMemory {
  preferences: TripPreferences;
}

// ============================================================================
// COMPUTED FILTERS FOR OTHER WIDGETS
// ============================================================================

export interface HotelFiltersFromPreferences {
  priceMin: number;
  priceMax: number;
  minStars: number;
  amenities: string[];
  types: string[];
}

export interface ActivityFiltersFromPreferences {
  categories: string[];
  priceRange: [number, number];
  ratingMin: number;
  timeOfDay: string[];
}

export interface FlightPreferencesComputed {
  cabinClass: "economy" | "premium_economy" | "business" | "first";
  flexibility: "exact" | "flexible" | "very_flexible";
}

// ============================================================================
// COMFORT LABELS
// ============================================================================

export type ComfortLabel = "Économique" | "Confort" | "Premium" | "Luxe";
