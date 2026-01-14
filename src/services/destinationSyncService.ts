/**
 * Destination Sync Service
 *
 * Centralized service for cross-widget destination synchronization.
 * Handles the cascade: Flights → Accommodations → Activities
 *
 * Key responsibilities:
 * - Extract CITY from AirportInfo (not airport name)
 * - Propagate destinations respecting user overrides
 * - Track sync metadata
 */

import type { AirportInfo } from "@/stores/hooks";
import {
  type NormalizedDestination,
  type PropagationResult,
  type DestinationSyncStatus,
  type DestinationSource,
  airportToDestination,
  extractCityFromAirport,
  isSameCity,
  generateDestinationId,
  getSyncSourceLabel,
} from "@/types/destination";
import { eventBus } from "@/lib/eventBus";

// ===== Types =====

/**
 * Accommodation entry shape (minimal interface to avoid circular deps).
 */
interface AccommodationLike {
  id: string;
  city: string;
  country?: string;
  countryCode?: string;
  lat?: number;
  lng?: number;
  syncedFromFlight?: boolean;
  flightLegId?: string;
  userOverridden?: boolean;
}

/**
 * Activity destination shape.
 */
interface ActivityDestinationLike {
  id: string;
  city: string;
  country?: string;
  countryCode?: string;
  lat?: number;
  lng?: number;
  syncedFromAccommodation?: boolean;
  accommodationId?: string;
  userOverridden?: boolean;
}

// ===== Service Class =====

export class DestinationSyncService {
  /**
   * Extract the CITY name from an AirportInfo.
   * Prefers city field, falls back to airport name.
   */
  static extractCity(airport: AirportInfo): string {
    return extractCityFromAirport(airport);
  }

  /**
   * Convert AirportInfo to NormalizedDestination.
   * Extracts CITY (not airport) for cross-widget sync.
   */
  static normalizeFromFlight(
    airport: AirportInfo,
    legId: string
  ): NormalizedDestination {
    return airportToDestination(airport, legId);
  }

  /**
   * Create a NormalizedDestination from accommodation data.
   */
  static normalizeFromAccommodation(
    accommodation: AccommodationLike
  ): NormalizedDestination {
    return {
      id: generateDestinationId(),
      city: accommodation.city,
      country: accommodation.country || "",
      countryCode: accommodation.countryCode || "",
      lat: accommodation.lat,
      lng: accommodation.lng,
      sourceWidget: "accommodation",
      sourceId: accommodation.id,
      syncedAt: new Date().toISOString(),
      userOverridden: accommodation.userOverridden || false,
    };
  }

  /**
   * Check if sync is allowed for a destination.
   * Returns false if user has overridden the destination.
   */
  static canSync(destinationId: string, userOverrides: string[]): boolean {
    return !userOverrides.includes(destinationId);
  }

  /**
   * Propagate a flight destination to accommodations.
   *
   * @param destination - The normalized destination from flight
   * @param currentAccommodations - Current accommodations list
   * @param userOverrides - List of destination IDs user has manually modified
   * @returns PropagationResult with action taken
   */
  static propagateToAccommodation(
    destination: NormalizedDestination,
    currentAccommodations: AccommodationLike[],
    userOverrides: string[]
  ): PropagationResult {
    // Check if user has blocked sync for this destination
    if (userOverrides.includes(destination.id)) {
      eventBus.emit("sync:blocked", {
        widget: "accommodation",
        reason: "user_override",
        destinationId: destination.id,
      });

      return {
        success: false,
        destination,
        blockedReason: "user_override",
        action: "blocked",
      };
    }

    // Check if accommodation for this city already exists
    const existingAccommodation = currentAccommodations.find(
      (acc) =>
        acc.city.toLowerCase() === destination.city.toLowerCase() &&
        acc.countryCode?.toUpperCase() === destination.countryCode.toUpperCase()
    );

    if (existingAccommodation) {
      // Check if existing entry is user-overridden
      if (existingAccommodation.userOverridden) {
        eventBus.emit("sync:blocked", {
          widget: "accommodation",
          reason: "manual_edit",
          destinationId: destination.id,
        });

        return {
          success: false,
          destination,
          blockedReason: "manual_edit",
          action: "blocked",
        };
      }

      // Update existing entry with flight data
      eventBus.emit("sync:cityPropagated", {
        from: "flight",
        to: "accommodation",
        destination,
      });

      return {
        success: true,
        destination,
        action: "updated",
      };
    }

    // Create new accommodation entry
    eventBus.emit("sync:cityPropagated", {
      from: "flight",
      to: "accommodation",
      destination,
    });

    return {
      success: true,
      destination,
      action: "created",
    };
  }

  /**
   * Propagate an accommodation destination to activities.
   *
   * @param destination - The normalized destination from accommodation
   * @param currentActivities - Current activity destinations
   * @param userOverrides - List of destination IDs user has manually modified
   * @returns PropagationResult with action taken
   */
  static propagateToActivity(
    destination: NormalizedDestination,
    currentActivities: ActivityDestinationLike[],
    userOverrides: string[]
  ): PropagationResult {
    // Check if user has blocked sync
    if (userOverrides.includes(destination.id)) {
      eventBus.emit("sync:blocked", {
        widget: "activity",
        reason: "user_override",
        destinationId: destination.id,
      });

      return {
        success: false,
        destination,
        blockedReason: "user_override",
        action: "blocked",
      };
    }

    // Check if activity destination already exists
    const existingActivity = currentActivities.find(
      (act) =>
        act.city.toLowerCase() === destination.city.toLowerCase() &&
        act.countryCode?.toUpperCase() === destination.countryCode.toUpperCase()
    );

    if (existingActivity) {
      if (existingActivity.userOverridden) {
        eventBus.emit("sync:blocked", {
          widget: "activity",
          reason: "manual_edit",
          destinationId: destination.id,
        });

        return {
          success: false,
          destination,
          blockedReason: "manual_edit",
          action: "blocked",
        };
      }

      eventBus.emit("sync:cityPropagated", {
        from: "accommodation",
        to: "activity",
        destination,
      });

      return {
        success: true,
        destination,
        action: "updated",
      };
    }

    eventBus.emit("sync:cityPropagated", {
      from: "accommodation",
      to: "activity",
      destination,
    });

    return {
      success: true,
      destination,
      action: "created",
    };
  }

  /**
   * Get sync status for a destination in a widget.
   */
  static getSyncStatus(
    destinationId: string,
    syncSource?: DestinationSource,
    syncedAt?: string,
    userOverrides: string[] = []
  ): DestinationSyncStatus {
    const isBlocked = userOverrides.includes(destinationId);
    const isSynced = !!syncSource && syncSource !== "manual";

    return {
      destinationId,
      isSynced,
      syncSource,
      syncedAt,
      isBlocked,
      sourceLabel: syncSource ? getSyncSourceLabel(syncSource) : undefined,
    };
  }

  /**
   * Mark a destination as user-overridden (blocks future sync).
   */
  static blockSync(
    destinationId: string,
    currentOverrides: string[]
  ): string[] {
    if (currentOverrides.includes(destinationId)) {
      return currentOverrides;
    }
    return [...currentOverrides, destinationId];
  }

  /**
   * Unblock a destination (re-enables sync).
   */
  static unblockSync(
    destinationId: string,
    currentOverrides: string[]
  ): string[] {
    return currentOverrides.filter((id) => id !== destinationId);
  }

  /**
   * Compare two destinations to check if they represent the same city.
   */
  static isSameCity(
    dest1: NormalizedDestination,
    dest2: NormalizedDestination
  ): boolean {
    return isSameCity(dest1, dest2);
  }

  /**
   * Emit flight finalized event to trigger cascade.
   */
  static emitFlightFinalized(
    airport: AirportInfo,
    legId: string,
    isMultiCity: boolean
  ): void {
    const destination = this.normalizeFromFlight(airport, legId);

    eventBus.emit("destination:flightFinalized", {
      legId,
      destination,
      isMultiCity,
    });
  }

  /**
   * Emit accommodation updated event to trigger cascade to activities.
   */
  static emitAccommodationUpdated(accommodation: AccommodationLike): void {
    const destination = this.normalizeFromAccommodation(accommodation);

    eventBus.emit("destination:accommodationUpdated", {
      accommodationId: accommodation.id,
      destination,
    });
  }
}

export default DestinationSyncService;
