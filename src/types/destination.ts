/**
 * Normalized Destination Types
 *
 * Unified destination type for cross-widget synchronization.
 * Used to propagate CITIES (not airports) from Flights → Accommodations → Activities.
 */

import type { AirportInfo } from "@/contexts/FlightMemoryContext";

// ===== Core Types =====

/**
 * Source widget that created/owns this destination.
 */
export type DestinationSource = "flight" | "accommodation" | "activity" | "manual";

/**
 * Normalized destination for cross-widget sync.
 * Contains CITY information (not airport) to ensure consistency.
 */
export interface NormalizedDestination {
  /** Unique ID for tracking across widgets */
  id: string;

  /** City name - REQUIRED (e.g., "Paris", "Barcelona") */
  city: string;

  /** Country name (e.g., "France", "Spain") */
  country: string;

  /** ISO country code (e.g., "FR", "ES") */
  countryCode: string;

  /** Latitude for map positioning */
  lat?: number;

  /** Longitude for map positioning */
  lng?: number;

  // ===== Sync Metadata =====

  /** Which widget created this destination */
  sourceWidget: DestinationSource;

  /** ID from source widget (e.g., legId from flights) */
  sourceId?: string;

  /** ISO timestamp when synced */
  syncedAt: string;

  /** True if user manually modified - blocks future auto-sync */
  userOverridden: boolean;
}

/**
 * Sync status for a destination in a widget.
 */
export interface DestinationSyncStatus {
  /** Destination ID */
  destinationId: string;

  /** Is this destination synced from another widget? */
  isSynced: boolean;

  /** Source of the sync */
  syncSource?: DestinationSource;

  /** When was it synced? */
  syncedAt?: string;

  /** Has user blocked sync? */
  isBlocked: boolean;

  /** Human-readable source label (e.g., "Synchronisé depuis Vols") */
  sourceLabel?: string;
}

/**
 * Result of a sync propagation attempt.
 */
export interface PropagationResult {
  /** Was propagation successful? */
  success: boolean;

  /** Destination that was propagated (or attempted) */
  destination: NormalizedDestination;

  /** Reason if blocked */
  blockedReason?: "user_override" | "manual_edit" | "already_exists";

  /** Was a new entry created or existing updated? */
  action: "created" | "updated" | "blocked" | "skipped";
}

// ===== Helper Functions =====

/**
 * Generate a unique destination ID.
 */
export function generateDestinationId(): string {
  return `dest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Extract the CITY name from an AirportInfo.
 * Falls back to airport name if city is not available.
 */
export function extractCityFromAirport(airport: AirportInfo): string {
  // Prefer city, fallback to airport name, then IATA code
  return airport.city || airport.airport || airport.iata || "Unknown";
}

/**
 * Convert AirportInfo to NormalizedDestination.
 * Extracts CITY (not airport) for cross-widget sync.
 */
export function airportToDestination(
  airport: AirportInfo,
  legId: string
): NormalizedDestination {
  return {
    id: generateDestinationId(),
    city: extractCityFromAirport(airport),
    country: airport.country || "",
    countryCode: airport.countryCode || "",
    lat: airport.lat,
    lng: airport.lng,
    sourceWidget: "flight",
    sourceId: legId,
    syncedAt: new Date().toISOString(),
    userOverridden: false,
  };
}

/**
 * Create a destination from manual user input.
 */
export function createManualDestination(
  city: string,
  country: string,
  countryCode: string,
  coords?: { lat: number; lng: number }
): NormalizedDestination {
  return {
    id: generateDestinationId(),
    city,
    country,
    countryCode,
    lat: coords?.lat,
    lng: coords?.lng,
    sourceWidget: "manual",
    syncedAt: new Date().toISOString(),
    userOverridden: true, // Manual entries are always "overridden"
  };
}

/**
 * Check if two destinations represent the same city.
 */
export function isSameCity(
  dest1: NormalizedDestination,
  dest2: NormalizedDestination
): boolean {
  // Compare by city name (case-insensitive) and country code
  const city1 = dest1.city.toLowerCase().trim();
  const city2 = dest2.city.toLowerCase().trim();
  const country1 = dest1.countryCode.toUpperCase();
  const country2 = dest2.countryCode.toUpperCase();

  return city1 === city2 && country1 === country2;
}

/**
 * Get human-readable source label for sync badge.
 */
export function getSyncSourceLabel(source: DestinationSource): string {
  switch (source) {
    case "flight":
      return "Synchronisé depuis Vols";
    case "accommodation":
      return "Synchronisé depuis Hébergements";
    case "activity":
      return "Ajouté manuellement";
    case "manual":
      return "Ajouté manuellement";
    default:
      return "Source inconnue";
  }
}

/**
 * Format destination for display (e.g., "Paris, France").
 */
export function formatDestination(dest: NormalizedDestination): string {
  if (dest.country) {
    return `${dest.city}, ${dest.country}`;
  }
  return dest.city;
}
