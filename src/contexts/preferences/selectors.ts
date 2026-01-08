/**
 * Preference Selectors
 * Pure functions for computing derived values from preferences
 */

import type {
  TripPreferences,
  HotelFiltersFromPreferences,
  ActivityFiltersFromPreferences,
  FlightPreferencesComputed,
  ComfortLabel,
} from './types';

// ============================================================================
// COMFORT LABEL
// ============================================================================

export function selectComfortLabel(prefs: TripPreferences): ComfortLabel {
  const level = prefs.styleAxes.ecoVsLuxury;
  if (level < 25) return "Économique";
  if (level < 50) return "Confort";
  if (level < 75) return "Premium";
  return "Luxe";
}

// ============================================================================
// PROFILE COMPLETION
// ============================================================================

export function selectProfileCompletion(prefs: TripPreferences): number {
  let score = 0;
  const weights = { travelStyle: 15, interests: 25, styleAxes: 30, mustHaves: 15, occasion: 15 };

  // Travel style selected (not default)
  if (prefs.travelStyle !== "couple") score += weights.travelStyle;
  else score += weights.travelStyle * 0.5; // Default still counts partially

  // Interests (at least 2)
  score += Math.min(1, prefs.interests.length / 2) * weights.interests;

  // Style axes modified (any deviation from 50)
  const axesModified = Object.values(prefs.styleAxes).filter(v => Math.abs(v - 50) > 10).length;
  score += (axesModified / 4) * weights.styleAxes;

  // Must-haves (any set)
  const mustHavesSet = Object.values(prefs.mustHaves).filter(Boolean).length;
  score += Math.min(1, mustHavesSet / 1) * weights.mustHaves;

  // Occasion set
  if (prefs.tripContext.occasion) score += weights.occasion;

  return Math.round(score);
}

// ============================================================================
// PREFERENCE SUMMARY (Text)
// ============================================================================

export function selectPreferenceSummary(prefs: TripPreferences): string {
  const comfortLabel = selectComfortLabel(prefs).toLowerCase();

  const styleLabels = {
    solo: "solo",
    couple: "en couple",
    family: "en famille",
    friends: "entre amis",
    pet: "avec animal",
  };

  let summary = `Voyage ${styleLabels[prefs.travelStyle]}`;
  summary += `, niveau ${comfortLabel}.`;

  if (prefs.interests.length > 0) {
    summary += ` Intérêts: ${prefs.interests.slice(0, 3).join(", ")}.`;
  }

  if (prefs.tripContext.occasion) {
    const occasionLabels: Record<string, string> = {
      honeymoon: "lune de miel",
      anniversary: "anniversaire",
      birthday: "anniversaire",
      vacation: "vacances",
      workation: "workation",
    };
    summary += ` Occasion: ${occasionLabels[prefs.tripContext.occasion] || prefs.tripContext.occasion}.`;
  }

  return summary;
}

// ============================================================================
// HOTEL FILTERS
// ============================================================================

export function selectHotelFilters(prefs: TripPreferences): HotelFiltersFromPreferences {
  const comfort = prefs.styleAxes.ecoVsLuxury;

  // Price ranges based on comfort
  let priceMin = 0, priceMax = 500, minStars = 2;
  if (comfort < 25) {
    priceMax = 80; minStars = 2;
  } else if (comfort < 50) {
    priceMax = 150; minStars = 3;
  } else if (comfort < 75) {
    priceMin = 50; priceMax = 300; minStars = 4;
  } else {
    priceMin = 100; priceMax = 500; minStars = 4;
  }

  // Amenities based on must-haves
  const amenities: string[] = [];
  if (prefs.mustHaves.highSpeedWifi || prefs.workPreferences.needsWifi) amenities.push("wifi");
  if (prefs.mustHaves.accessibilityRequired) amenities.push("wheelchair");
  if (prefs.mustHaves.petFriendly) amenities.push("pet-friendly");
  if (prefs.mustHaves.familyFriendly) amenities.push("family-rooms");

  // Types based on travel style
  let types: string[] = ["hotel"];
  if (prefs.travelStyle === "family") types = ["hotel", "apartment"];
  else if (prefs.travelStyle === "couple" && comfort > 70) types = ["hotel", "villa"];
  else if (prefs.travelStyle === "friends") types = ["apartment", "hotel"];

  return { priceMin, priceMax, minStars, amenities, types };
}

// ============================================================================
// ACTIVITY FILTERS
// ============================================================================

export function selectActivityFilters(prefs: TripPreferences): ActivityFiltersFromPreferences {
  const comfort = prefs.styleAxes.ecoVsLuxury;

  // Price range based on comfort
  let priceRange: [number, number] = [0, 500];
  if (comfort < 25) priceRange = [0, 30];
  else if (comfort < 50) priceRange = [0, 80];
  else if (comfort < 75) priceRange = [0, 150];

  // Rating based on comfort
  let ratingMin = 3.5;
  if (comfort >= 75) ratingMin = 4.5;
  else if (comfort >= 50) ratingMin = 4.0;

  // Categories from interests
  const categories = [...prefs.interests];

  // Time of day from chillVsIntense
  const timeOfDay: string[] = [];
  if (prefs.styleAxes.chillVsIntense < 40) {
    timeOfDay.push("morning", "afternoon"); // Relaxed = daytime
  } else if (prefs.styleAxes.chillVsIntense > 60) {
    timeOfDay.push("afternoon", "evening", "night"); // Intense = all day + night
  }

  return { categories, priceRange, ratingMin, timeOfDay };
}

// ============================================================================
// FLIGHT PREFERENCES
// ============================================================================

export function selectFlightPreferences(prefs: TripPreferences): FlightPreferencesComputed {
  const comfort = prefs.styleAxes.ecoVsLuxury;

  let cabinClass: FlightPreferencesComputed["cabinClass"] = "economy";
  if (comfort >= 85) cabinClass = "business";
  else if (comfort >= 70) cabinClass = "premium_economy";

  const flexibility = prefs.tripContext.flexibility === "very_flexible"
    ? "very_flexible"
    : prefs.tripContext.flexibility === "flexible"
      ? "flexible"
      : "exact";

  return { cabinClass, flexibility };
}

// ============================================================================
// SERIALIZED STATE (for PlannerChat context)
// ============================================================================

export function selectSerializedState(prefs: TripPreferences): Record<string, unknown> {
  return {
    ...prefs,
    comfortLabel: selectComfortLabel(prefs),
    profileCompletion: selectProfileCompletion(prefs),
  };
}
