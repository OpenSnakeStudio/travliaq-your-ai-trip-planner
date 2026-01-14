/**
 * Flight Data to Memory Converter
 * Converts FlightFormData from chat responses to FlightMemory updates
 */

import type { AirportInfo, MissingField } from "@/stores/hooks";
import type { FlightFormData } from "@/types/flight";
import i18n from "@/i18n/config";

/**
 * Memory update structure for flight data
 */
export interface FlightMemoryUpdate {
  departure?: AirportInfo | null;
  arrival?: AirportInfo | null;
  departureDate?: Date | null;
  returnDate?: Date | null;
  passengers?: { adults: number; children: number; infants: number };
  tripType?: "roundtrip" | "oneway" | "multi";
}

/**
 * Convert FlightFormData (from AI response) to FlightMemory updates
 */
export function flightDataToMemory(flightData: FlightFormData): FlightMemoryUpdate {
  const updates: FlightMemoryUpdate = {};

  if (flightData.from) {
    updates.departure = { city: flightData.from };
  }
  if (flightData.to) {
    updates.arrival = { city: flightData.to };
  }
  if (flightData.departureDate) {
    updates.departureDate = new Date(flightData.departureDate);
  }
  if (flightData.returnDate) {
    updates.returnDate = new Date(flightData.returnDate);
  }

  // Handle new adults/children/infants format
  if (
    flightData.adults !== undefined ||
    flightData.children !== undefined ||
    flightData.infants !== undefined
  ) {
    updates.passengers = {
      adults: flightData.adults || 1,
      children: flightData.children || 0,
      infants: flightData.infants || 0,
    };
  } else if (flightData.passengers) {
    // Legacy format: single passengers count
    updates.passengers = { adults: flightData.passengers, children: 0, infants: 0 };
  }

  if (flightData.tripType) {
    updates.tripType = flightData.tripType;
  }

  return updates;
}

/**
 * Get field label for missing fields
 */
export function getMissingFieldLabel(field: MissingField): string {
  const t = i18n.t.bind(i18n);
  
  switch (field) {
    case "departure":
      return t("planner.missing.departure");
    case "arrival":
      return t("planner.missing.arrival");
    case "departureDate":
      return t("planner.missing.departureDate");
    case "returnDate":
      return t("planner.missing.returnDate");
    case "passengers":
      return t("planner.missing.passengers");
    case "legs":
      return t("planner.missing.legs");
    default:
      return field;
  }
}

/**
 * Build missing fields list from memory context string
 */
export function formatMissingFieldsMessage(missingFields: MissingField[]): string {
  const t = i18n.t.bind(i18n);
  
  if (missingFields.length === 0) {
    return t("planner.missing.readyToSearch");
  }
  return missingFields.map(getMissingFieldLabel).join(", ");
}
