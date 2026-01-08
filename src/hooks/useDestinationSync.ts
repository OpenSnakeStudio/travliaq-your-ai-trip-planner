/**
 * Destination Sync Hook
 *
 * Provides utilities for managing cross-widget destination synchronization.
 * Used by UI components to display sync status and allow user overrides.
 */

import { useCallback, useEffect, useState } from "react";
import { eventBus } from "@/lib/eventBus";
import { DestinationSyncService } from "@/services/destinationSyncService";
import type { AirportInfo } from "@/contexts/FlightMemoryContext";
import type {
  NormalizedDestination,
  DestinationSyncStatus,
  DestinationSource,
} from "@/types/destination";

// ===== Types =====

export interface UseDestinationSyncOptions {
  /** Widget context (for filtering relevant events) */
  widget: "accommodation" | "activity";

  /** Current user overrides from the widget's state */
  userOverrides?: string[];

  /** Callback when a new destination is synced */
  onDestinationSynced?: (destination: NormalizedDestination) => void;

  /** Callback when sync is blocked */
  onSyncBlocked?: (destinationId: string, reason: string) => void;
}

export interface UseDestinationSyncReturn {
  /** Trigger sync from a flight airport */
  syncFromFlight: (airport: AirportInfo, legId: string) => void;

  /** Block future syncs for a destination (user wants to edit independently) */
  blockSync: (destinationId: string) => string[];

  /** Re-enable syncing for a destination */
  unblockSync: (destinationId: string) => string[];

  /** Get sync status for a destination */
  getSyncStatus: (
    destinationId: string,
    syncSource?: DestinationSource,
    syncedAt?: string
  ) => DestinationSyncStatus;

  /** Recently synced destinations (for UI feedback) */
  recentlySynced: NormalizedDestination[];

  /** Clear recently synced list */
  clearRecentlySynced: () => void;
}

// ===== Hook =====

export function useDestinationSync(
  options: UseDestinationSyncOptions
): UseDestinationSyncReturn {
  const { widget, userOverrides = [], onDestinationSynced, onSyncBlocked } = options;

  // Track recently synced destinations for UI feedback
  const [recentlySynced, setRecentlySynced] = useState<NormalizedDestination[]>([]);

  // Subscribe to sync events
  useEffect(() => {
    const handleCityPropagated = (event: {
      from: DestinationSource;
      to: "accommodation" | "activity";
      destination: NormalizedDestination;
    }) => {
      // Only handle events targeted at our widget
      if (event.to !== widget) return;

      // Add to recently synced
      setRecentlySynced((prev) => {
        // Avoid duplicates
        if (prev.some((d) => d.id === event.destination.id)) {
          return prev;
        }
        return [...prev, event.destination];
      });

      // Notify parent
      onDestinationSynced?.(event.destination);
    };

    const handleSyncBlocked = (event: {
      widget: string;
      reason: string;
      destinationId: string;
    }) => {
      // Only handle events for our widget
      if (event.widget !== widget) return;

      onSyncBlocked?.(event.destinationId, event.reason);
    };

    eventBus.on("sync:cityPropagated", handleCityPropagated);
    eventBus.on("sync:blocked", handleSyncBlocked);

    return () => {
      eventBus.off("sync:cityPropagated", handleCityPropagated);
      eventBus.off("sync:blocked", handleSyncBlocked);
    };
  }, [widget, onDestinationSynced, onSyncBlocked]);

  // Auto-clear recently synced after 5 seconds
  useEffect(() => {
    if (recentlySynced.length === 0) return;

    const timer = setTimeout(() => {
      setRecentlySynced([]);
    }, 5000);

    return () => clearTimeout(timer);
  }, [recentlySynced]);

  /**
   * Manually trigger sync from a flight airport.
   * Usually handled automatically by FlightMemoryContext,
   * but can be called manually for testing or special cases.
   */
  const syncFromFlight = useCallback(
    (airport: AirportInfo, legId: string) => {
      const destination = DestinationSyncService.normalizeFromFlight(airport, legId);

      eventBus.emit("destination:flightFinalized", {
        legId,
        destination,
        isMultiCity: false,
      });
    },
    []
  );

  /**
   * Block future syncs for a destination.
   * Call this when the user manually edits a destination.
   */
  const blockSync = useCallback(
    (destinationId: string): string[] => {
      return DestinationSyncService.blockSync(destinationId, userOverrides);
    },
    [userOverrides]
  );

  /**
   * Re-enable syncing for a destination.
   * Call this when the user wants to re-sync from parent widget.
   */
  const unblockSync = useCallback(
    (destinationId: string): string[] => {
      return DestinationSyncService.unblockSync(destinationId, userOverrides);
    },
    [userOverrides]
  );

  /**
   * Get sync status for a destination.
   * Used by SyncBadge component.
   */
  const getSyncStatus = useCallback(
    (
      destinationId: string,
      syncSource?: DestinationSource,
      syncedAt?: string
    ): DestinationSyncStatus => {
      return DestinationSyncService.getSyncStatus(
        destinationId,
        syncSource,
        syncedAt,
        userOverrides
      );
    },
    [userOverrides]
  );

  /**
   * Clear the recently synced list.
   */
  const clearRecentlySynced = useCallback(() => {
    setRecentlySynced([]);
  }, []);

  return {
    syncFromFlight,
    blockSync,
    unblockSync,
    getSyncStatus,
    recentlySynced,
    clearRecentlySynced,
  };
}

// ===== Convenience Hooks =====

/**
 * Hook for accommodation widget sync.
 */
export function useAccommodationSync(
  userOverrides: string[] = [],
  onDestinationSynced?: (destination: NormalizedDestination) => void
) {
  return useDestinationSync({
    widget: "accommodation",
    userOverrides,
    onDestinationSynced,
  });
}

/**
 * Hook for activity widget sync.
 */
export function useActivitySync(
  userOverrides: string[] = [],
  onDestinationSynced?: (destination: NormalizedDestination) => void
) {
  return useDestinationSync({
    widget: "activity",
    userOverrides,
    onDestinationSynced,
  });
}

export default useDestinationSync;
