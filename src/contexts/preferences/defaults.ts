/**
 * Preference Defaults
 * Default values for the preference system
 */

import type {
  StyleAxes,
  MustHaves,
  WorkPreferences,
  TripContext,
  TripPreferences,
  PreferenceMemory,
} from './types';

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_STYLE_AXES: StyleAxes = {
  chillVsIntense: 50,
  cityVsNature: 50,
  ecoVsLuxury: 50,
  touristVsLocal: 50,
};

export const DEFAULT_MUST_HAVES: MustHaves = {
  accessibilityRequired: false,
  petFriendly: false,
  familyFriendly: false,
  highSpeedWifi: false,
};

export const DEFAULT_WORK_PREFERENCES: WorkPreferences = {
  needsWifi: false,
  workationMode: false,
};

export const DEFAULT_TRIP_CONTEXT: TripContext = {
  occasion: undefined,
  flexibility: "flexible",
};

export const DEFAULT_PREFERENCES: TripPreferences = {
  id: crypto.randomUUID(),
  travelStyle: "couple",
  styleAxes: DEFAULT_STYLE_AXES,
  interests: [],
  mustHaves: DEFAULT_MUST_HAVES,
  workPreferences: DEFAULT_WORK_PREFERENCES,
  tripContext: DEFAULT_TRIP_CONTEXT,
  // Legacy
  pace: "moderate",
  comfortLevel: 50,
  dietaryRestrictions: [],
  accessibilityNeeds: [],
  // Metadata
  confidenceScore: 0,
  lastUpdated: new Date(),
  detectedFromChat: false,
  manualOverrides: [],
};

export const DEFAULT_MEMORY: PreferenceMemory = {
  preferences: DEFAULT_PREFERENCES,
};

/**
 * Create fresh default preferences with new ID
 */
export function createDefaultPreferences(): TripPreferences {
  return {
    ...DEFAULT_PREFERENCES,
    id: crypto.randomUUID(),
    lastUpdated: new Date(),
  };
}

/**
 * Create fresh default memory with new preferences
 */
export function createDefaultMemory(): PreferenceMemory {
  return {
    preferences: createDefaultPreferences(),
  };
}
