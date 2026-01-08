/**
 * Preference Storage
 * LocalStorage persistence logic for preferences
 */

import type { PreferenceMemory } from './types';
import { DEFAULT_MEMORY, DEFAULT_STYLE_AXES, DEFAULT_MUST_HAVES, DEFAULT_WORK_PREFERENCES, DEFAULT_TRIP_CONTEXT, DEFAULT_PREFERENCES } from './defaults';

const STORAGE_KEY = "travliaq_preference_memory_v2";
const STORAGE_KEY_V1 = "travliaq_preference_memory";

/**
 * Serialize memory to JSON string for storage
 */
export function serializeMemory(memory: PreferenceMemory): string {
  return JSON.stringify({
    preferences: {
      ...memory.preferences,
      lastUpdated: memory.preferences.lastUpdated.toISOString(),
    },
  });
}

/**
 * Deserialize JSON string to memory object
 */
export function deserializeMemory(json: string): PreferenceMemory | null {
  try {
    const parsed = JSON.parse(json);
    const prefs = parsed.preferences;

    return {
      preferences: {
        ...DEFAULT_PREFERENCES,
        ...prefs,
        styleAxes: prefs.styleAxes || DEFAULT_STYLE_AXES,
        mustHaves: prefs.mustHaves || DEFAULT_MUST_HAVES,
        workPreferences: prefs.workPreferences || DEFAULT_WORK_PREFERENCES,
        tripContext: prefs.tripContext || DEFAULT_TRIP_CONTEXT,
        manualOverrides: prefs.manualOverrides || [],
        lastUpdated: new Date(prefs.lastUpdated),
      },
    };
  } catch (error) {
    console.warn("[PreferenceStorage] Failed to deserialize:", error);
    return null;
  }
}

/**
 * Load preferences from localStorage
 * Attempts v2 first, then v1 migration
 */
export function loadFromStorage(): PreferenceMemory {
  try {
    // Try v2 first
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const deserialized = deserializeMemory(stored);
      if (deserialized) return deserialized;
    }

    // Try v1 migration
    const v1 = localStorage.getItem(STORAGE_KEY_V1);
    if (v1) {
      const deserialized = deserializeMemory(v1);
      if (deserialized) {
        // Migrate to v2
        saveToStorage(deserialized);
        return deserialized;
      }
    }
  } catch (error) {
    console.warn("[PreferenceStorage] Failed to load from storage:", error);
  }

  return DEFAULT_MEMORY;
}

/**
 * Save preferences to localStorage
 */
export function saveToStorage(memory: PreferenceMemory): void {
  try {
    const serialized = serializeMemory(memory);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.warn("[PreferenceStorage] Failed to save:", error);
  }
}

/**
 * Clear preferences from localStorage
 */
export function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY_V1);
  } catch (error) {
    console.warn("[PreferenceStorage] Failed to clear:", error);
  }
}
