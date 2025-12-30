/**
 * localStorage Memory Migration Utilities
 *
 * Handles versioning and migration of Travliaq memory structures
 * Ensures backward compatibility when schema changes
 */

export const CURRENT_MEMORY_VERSION = 2;

export interface VersionedMemory<T> {
  version: number;
  data: T;
}

/**
 * Migrate accommodation memory from V1 to V2
 *
 * V1 → V2 Changes:
 * - Added userModifiedBudget flag to AccommodationEntry
 * - Added defaultBudgetPreset, defaultPriceMin, defaultPriceMax to AccommodationMemory
 */
export function migrateAccommodationMemory(stored: string): any {
  try {
    const parsed = JSON.parse(stored);

    // Check version
    const version = parsed.version || 1;

    if (version === CURRENT_MEMORY_VERSION) {
      // Already current version
      return parsed;
    }

    // V1 → V2 Migration
    if (version === 1 || !parsed.version) {
      console.log('[Migration] Upgrading AccommodationMemory from V1 to V2');

      const migratedData = {
        ...parsed,
        version: 2,

        // Add new fields to accommodations
        accommodations: (parsed.accommodations || []).map((accom: any) => ({
          ...accom,
          // V2: Add userModifiedBudget flag (default false - not user-modified)
          userModifiedBudget: accom.userModifiedBudget ?? false,
        })),

        // Add default budget preferences
        defaultBudgetPreset: parsed.defaultBudgetPreset || 'comfort',
        defaultPriceMin: parsed.defaultPriceMin || 80,
        defaultPriceMax: parsed.defaultPriceMax || 180,
      };

      // Save migrated version back to localStorage
      try {
        localStorage.setItem('travliaq_accommodation_memory', JSON.stringify(migratedData));
        console.log('[Migration] Successfully migrated AccommodationMemory to V2');
      } catch (error) {
        console.warn('[Migration] Failed to save migrated memory:', error);
      }

      return migratedData;
    }

    // Unknown version - return as-is with warning
    console.warn(`[Migration] Unknown AccommodationMemory version: ${version}`);
    return parsed;
  } catch (error) {
    console.error('[Migration] Failed to parse AccommodationMemory:', error);
    return null;
  }
}

/**
 * Migrate flight memory (future-proofing)
 */
export function migrateFlightMemory(stored: string): any {
  try {
    const parsed = JSON.parse(stored);
    const version = parsed.version || 1;

    if (version === CURRENT_MEMORY_VERSION) {
      return parsed;
    }

    // No migrations needed yet for FlightMemory
    // This is a placeholder for future schema changes
    console.log('[Migration] FlightMemory already at current version');
    return {
      ...parsed,
      version: CURRENT_MEMORY_VERSION,
    };
  } catch (error) {
    console.error('[Migration] Failed to parse FlightMemory:', error);
    return null;
  }
}

/**
 * Migrate travel memory (future-proofing)
 */
export function migrateTravelMemory(stored: string): any {
  try {
    const parsed = JSON.parse(stored);
    const version = parsed.version || 1;

    if (version === CURRENT_MEMORY_VERSION) {
      return parsed;
    }

    // No migrations needed yet for TravelMemory
    console.log('[Migration] TravelMemory already at current version');
    return {
      ...parsed,
      version: CURRENT_MEMORY_VERSION,
    };
  } catch (error) {
    console.error('[Migration] Failed to parse TravelMemory:', error);
    return null;
  }
}

/**
 * Get migration summary for debugging
 */
export function getMigrationSummary(): {
  accommodationVersion: number | null;
  flightVersion: number | null;
  travelVersion: number | null;
  needsMigration: boolean;
} {
  const getVersion = (key: string): number | null => {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      return parsed.version || 1;
    } catch {
      return null;
    }
  };

  const accomVersion = getVersion('travliaq_accommodation_memory');
  const flightVersion = getVersion('travliaq_flight_memory');
  const travelVersion = getVersion('travliaq_travel_memory');

  return {
    accommodationVersion: accomVersion,
    flightVersion: flightVersion,
    travelVersion: travelVersion,
    needsMigration:
      (accomVersion !== null && accomVersion < CURRENT_MEMORY_VERSION) ||
      (flightVersion !== null && flightVersion < CURRENT_MEMORY_VERSION) ||
      (travelVersion !== null && travelVersion < CURRENT_MEMORY_VERSION),
  };
}

/**
 * Force migration of all memories (useful for debugging)
 */
export function migrateAllMemories(): void {
  console.log('[Migration] Starting migration of all memories...');

  const accomStored = localStorage.getItem('travliaq_accommodation_memory');
  if (accomStored) {
    migrateAccommodationMemory(accomStored);
  }

  const flightStored = localStorage.getItem('travliaq_flight_memory');
  if (flightStored) {
    migrateFlightMemory(flightStored);
  }

  const travelStored = localStorage.getItem('travliaq_travel_memory');
  if (travelStored) {
    migrateTravelMemory(travelStored);
  }

  console.log('[Migration] Migration complete');
}

/**
 * Clear all memories (useful for testing)
 */
export function clearAllMemories(): void {
  console.log('[Migration] Clearing all memories...');
  localStorage.removeItem('travliaq_accommodation_memory');
  localStorage.removeItem('travliaq_flight_memory');
  localStorage.removeItem('travliaq_travel_memory');
  console.log('[Migration] All memories cleared');
}
