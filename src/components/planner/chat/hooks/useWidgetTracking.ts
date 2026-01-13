/**
 * useWidgetTracking - Hook for tracking widget interactions in chat
 * 
 * This hook provides helpers to record widget selections and build
 * context for the LLM based on user interactions.
 */

import { useCallback } from "react";
import { 
  useWidgetHistory,
  formatDateSelection,
  formatDateRangeSelection,
  formatTravelersSelection,
  formatTripTypeSelection,
  formatCitySelection,
  formatAirportSelection,
  formatStyleConfiguration,
  formatInterestsSelection,
} from "@/contexts/WidgetHistoryContext";

export function useWidgetTracking() {
  const { 
    recordInteraction, 
    registerWidget, 
    completeWidget,
    getContextForLLM,
    getRecentInteractionsSummary,
    clearHistory,
  } = useWidgetHistory();

  /**
   * Track date selection
   */
  const trackDateSelect = useCallback((date: Date, type: "departure" | "return") => {
    const summary = formatDateSelection(date, type);
    recordInteraction(
      `date-${type}-${Date.now()}`,
      "date_selected",
      { date: date.toISOString(), type },
      summary
    );
  }, [recordInteraction]);

  /**
   * Track date range selection
   */
  const trackDateRangeSelect = useCallback((departure: Date, returnDate: Date) => {
    const summary = formatDateRangeSelection(departure, returnDate);
    recordInteraction(
      `date-range-${Date.now()}`,
      "date_range_selected",
      { departure: departure.toISOString(), return: returnDate.toISOString() },
      summary
    );
  }, [recordInteraction]);

  /**
   * Track travelers selection
   */
  const trackTravelersSelect = useCallback((travelers: { adults: number; children: number; infants: number }) => {
    const summary = formatTravelersSelection(travelers.adults, travelers.children, travelers.infants);
    recordInteraction(
      `travelers-${Date.now()}`,
      "travelers_selected",
      travelers,
      summary
    );
  }, [recordInteraction]);

  /**
   * Track trip type selection
   */
  const trackTripTypeSelect = useCallback((tripType: "roundtrip" | "oneway" | "multi") => {
    const summary = formatTripTypeSelection(tripType);
    recordInteraction(
      `triptype-${Date.now()}`,
      "trip_type_selected",
      { tripType },
      summary
    );
  }, [recordInteraction]);

  /**
   * Track city selection
   */
  const trackCitySelect = useCallback((cityName: string, countryName: string) => {
    const summary = formatCitySelection(cityName, countryName);
    recordInteraction(
      `city-${Date.now()}`,
      "city_selected",
      { cityName, countryName },
      summary
    );
  }, [recordInteraction]);

  /**
   * Track airport selection
   */
  const trackAirportSelect = useCallback((airportName: string, iata: string, type: "departure" | "arrival") => {
    const summary = formatAirportSelection(airportName, iata, type);
    recordInteraction(
      `airport-${type}-${Date.now()}`,
      "airport_selected",
      { airportName, iata, type },
      summary
    );
  }, [recordInteraction]);

  /**
   * Track style configuration
   */
  const trackStyleConfig = useCallback((axes: Record<string, number>) => {
    const summary = formatStyleConfiguration(axes);
    recordInteraction(
      `style-${Date.now()}`,
      "style_configured",
      axes,
      summary
    );
  }, [recordInteraction]);

  /**
   * Track interests selection
   */
  const trackInterestsSelect = useCallback((interests: string[]) => {
    const summary = formatInterestsSelection(interests);
    recordInteraction(
      `interests-${Date.now()}`,
      "interests_selected",
      { interests },
      summary
    );
  }, [recordInteraction]);

  /**
   * Track destination selection
   */
  const trackDestinationSelect = useCallback((destinationName: string, countryCode: string) => {
    const summary = `Destination suggérée choisie : ${destinationName}`;
    recordInteraction(
      `destination-${Date.now()}`,
      "destination_selected",
      { destinationName, countryCode },
      summary
    );
  }, [recordInteraction]);

  return {
    // Tracking functions
    trackDateSelect,
    trackDateRangeSelect,
    trackTravelersSelect,
    trackTripTypeSelect,
    trackCitySelect,
    trackAirportSelect,
    trackStyleConfig,
    trackInterestsSelect,
    trackDestinationSelect,
    // Context functions
    getContextForLLM,
    getRecentInteractionsSummary,
    clearHistory,
    // Raw functions for custom tracking
    registerWidget,
    completeWidget,
    recordInteraction,
  };
}
