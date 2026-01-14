/**
 * Flight Data to Memory Converter
 * Converts FlightFormData from chat responses to FlightMemory updates
 */

import type { AirportInfo, MissingField } from "@/stores/hooks";
import type { FlightFormData } from "@/types/flight";

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
 * Get field label in French for missing fields
 */
export function getMissingFieldLabel(field: MissingField): string {
  switch (field) {
    case "departure":
      return "ville de départ";
    case "arrival":
      return "destination";
    case "departureDate":
      return "date de départ";
    case "returnDate":
      return "date de retour";
    case "passengers":
      return "nombre de voyageurs";
    case "legs":
      return "étapes du voyage";
    default:
      return field;
  }
}

/**
 * Build missing fields list from memory context string
 */
export function formatMissingFieldsMessage(missingFields: MissingField[]): string {
  if (missingFields.length === 0) {
    return "Aucun - prêt à chercher";
  }
  return missingFields.map(getMissingFieldLabel).join(", ");
}
