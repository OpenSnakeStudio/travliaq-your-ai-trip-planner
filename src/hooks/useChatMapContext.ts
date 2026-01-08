/**
 * useChatMapContext - Provides chat with visual context from map and widgets
 * 
 * Listens to events from the map, hotels, activities, and tabs to provide
 * the chat with information about what the user is currently seeing.
 */

import { useState, useEffect, useCallback } from "react";
import { eventBus } from "@/lib/eventBus";
import type { HotelResult } from "@/components/planner/HotelSearchResults";

interface VisiblePrice {
  destination: string;
  price: number;
  type: "flight" | "hotel" | "activity";
  currency?: string;
}

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapContextState {
  visiblePrices: VisiblePrice[];
  visibleHotels: HotelResult[];
  visibleActivities: unknown[];
  mapBounds: MapBounds | null;
  zoomLevel: number;
  activeTab: "flights" | "activities" | "stays" | "preferences";
  lastUpdated: number;
}

export interface MapContextSummary {
  hasVisibleFlights: boolean;
  flightPriceRange: { min: number; max: number } | null;
  hasVisibleHotels: boolean;
  hotelCount: number;
  hotelPriceRange: { min: number; max: number } | null;
  hasVisibleActivities: boolean;
  activityCount: number;
  currentTab: string;
  zoomLevel: number;
}

const initialState: MapContextState = {
  visiblePrices: [],
  visibleHotels: [],
  visibleActivities: [],
  mapBounds: null,
  zoomLevel: 5,
  activeTab: "flights",
  lastUpdated: Date.now(),
};

export function useChatMapContext() {
  const [state, setState] = useState<MapContextState>(initialState);

  // Listen to map bounds changes
  useEffect(() => {
    const handleMapBounds = (data: { bounds: MapBounds }) => {
      setState((prev) => ({
        ...prev,
        mapBounds: data.bounds,
        lastUpdated: Date.now(),
      }));
    };

    eventBus.on("map:bounds", handleMapBounds);
    return () => eventBus.off("map:bounds", handleMapBounds);
  }, []);

  // Listen to hotel results
  useEffect(() => {
    const handleHotelResults = (data: { hotels: HotelResult[] }) => {
      // Extract prices from hotels for summary
      const hotelPrices: VisiblePrice[] = data.hotels
        .filter((h) => h.pricePerNight)
        .map((h) => ({
          destination: h.name,
          price: h.pricePerNight || 0,
          type: "hotel" as const,
          currency: "EUR",
        }));

      setState((prev) => ({
        ...prev,
        visibleHotels: data.hotels.slice(0, 10),
        visiblePrices: [
          ...prev.visiblePrices.filter((p) => p.type !== "hotel"),
          ...hotelPrices,
        ],
        lastUpdated: Date.now(),
      }));
    };

    eventBus.on("hotels:results", handleHotelResults);
    return () => eventBus.off("hotels:results", handleHotelResults);
  }, []);

  // Listen to activity results
  useEffect(() => {
    const handleActivityResults = (data: { activities: unknown[]; city: string }) => {
      setState((prev) => ({
        ...prev,
        visibleActivities: data.activities.slice(0, 10),
        lastUpdated: Date.now(),
      }));
    };

    eventBus.on("activities:resultsReady", handleActivityResults);
    return () => eventBus.off("activities:resultsReady", handleActivityResults);
  }, []);

  // Listen to tab changes
  useEffect(() => {
    const handleTabChange = (data: { tab: "flights" | "activities" | "stays" | "preferences" }) => {
      setState((prev) => ({
        ...prev,
        activeTab: data.tab,
        lastUpdated: Date.now(),
      }));
    };

    eventBus.on("tab:change", handleTabChange);
    return () => eventBus.off("tab:change", handleTabChange);
  }, []);

  // Get cheapest flight price
  const getCheapestFlightPrice = useCallback((): number | undefined => {
    const flightPrices = state.visiblePrices
      .filter((p) => p.type === "flight")
      .map((p) => p.price);
    return flightPrices.length > 0 ? Math.min(...flightPrices) : undefined;
  }, [state.visiblePrices]);

  // Get cheapest hotel price
  const getCheapestHotelPrice = useCallback((): number | undefined => {
    const hotelPrices = state.visibleHotels
      .map((h) => h.pricePerNight)
      .filter((p): p is number => typeof p === "number" && p > 0);
    return hotelPrices.length > 0 ? Math.min(...hotelPrices) : undefined;
  }, [state.visibleHotels]);

  // Get a summary of the current context for the LLM
  const getSummary = useCallback((): MapContextSummary => {
    const flightPrices = state.visiblePrices.filter((p) => p.type === "flight");
    const hotelPrices = state.visibleHotels
      .map((h) => h.pricePerNight)
      .filter((p): p is number => typeof p === "number" && p > 0);

    return {
      hasVisibleFlights: flightPrices.length > 0,
      flightPriceRange:
        flightPrices.length > 0
          ? {
              min: Math.min(...flightPrices.map((p) => p.price)),
              max: Math.max(...flightPrices.map((p) => p.price)),
            }
          : null,
      hasVisibleHotels: state.visibleHotels.length > 0,
      hotelCount: state.visibleHotels.length,
      hotelPriceRange:
        hotelPrices.length > 0
          ? { min: Math.min(...hotelPrices), max: Math.max(...hotelPrices) }
          : null,
      hasVisibleActivities: state.visibleActivities.length > 0,
      activityCount: state.visibleActivities.length,
      currentTab: state.activeTab,
      zoomLevel: state.zoomLevel,
    };
  }, [state]);

  // Build context string for LLM
  const buildContextString = useCallback((): string => {
    const summary = getSummary();
    const parts: string[] = [];

    parts.push(`[CONTEXTE VISUEL] Onglet actif: ${summary.currentTab}`);

    if (summary.hasVisibleFlights && summary.flightPriceRange) {
      parts.push(
        `Vols visibles: ${state.visiblePrices.filter((p) => p.type === "flight").length} destinations (${summary.flightPriceRange.min}€ - ${summary.flightPriceRange.max}€)`
      );
    }

    if (summary.hasVisibleHotels && summary.hotelPriceRange) {
      parts.push(
        `Hôtels visibles: ${summary.hotelCount} (${summary.hotelPriceRange.min}€ - ${summary.hotelPriceRange.max}€/nuit)`
      );
    }

    if (summary.hasVisibleActivities) {
      parts.push(`Activités visibles: ${summary.activityCount}`);
    }

    return parts.join(" | ");
  }, [getSummary, state.visiblePrices]);

  return {
    ...state,
    getSummary,
    buildContextString,
    getCheapestFlightPrice,
    getCheapestHotelPrice,
  };
}
