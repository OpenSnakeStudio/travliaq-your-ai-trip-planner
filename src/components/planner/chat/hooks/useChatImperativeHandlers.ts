/**
 * useChatImperativeHandlers - Hook for imperative methods exposed via ref
 *
 * These handlers are called externally by parent components to:
 * - Inject system messages (country selection)
 * - Show airport choice widgets
 * - Offer flight search
 * - Update accommodations/activities
 * - Handle preference detection
 */

import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toastSuccess, toastError } from "@/lib/toast";
import { eventBus } from "@/lib/eventBus";
import type { CountrySelectionEvent, AirportChoice, DualAirportChoice, AirportConfirmationData, CitySelectionData } from "@/types/flight";
import type { AccommodationEntry } from "@/stores/hooks";
import type { ActivityEntry } from "@/contexts/ActivityMemoryContext";
import type { TripPreferences } from "@/contexts/PreferenceMemoryContext";
import type { ChatMessage } from "../types";

/**
 * Options for the imperative handlers hook
 */
export interface UseChatImperativeHandlersOptions {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;

  // Memory functions
  findAccommodationByCity: (city: string) => AccommodationEntry | null;
  updateAccommodation: (id: string, updates: Partial<AccommodationEntry>) => void;
  getActivitiesByDestination: (city: string) => ActivityEntry[];
  updateActivity: (id: string, updates: Partial<ActivityEntry>) => void;
  addManualActivity: (activity: Partial<ActivityEntry>) => string;
  updatePreferences: (prefs: Partial<TripPreferences & { detectedFromChat?: boolean }>) => void;
  accomMemory: { accommodations: AccommodationEntry[] };

  // Refs
  citySelectionShownRef: React.MutableRefObject<string | null>;
}

/**
 * Fetch top cities for a country
 */
async function fetchTopCities(countryCode: string): Promise<CitySelectionData["cities"] | null> {
  try {
    const response = await fetch(
      `https://cinbnmlfpffmyjmkwbco.supabase.co/functions/v1/top-cities-by-country?country_code=${countryCode}&limit=5`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          apikey:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpbmJubWxmcGZmbXlqbWt3YmNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NDQ2MTQsImV4cCI6MjA3MzUyMDYxNH0.yrju-Pv4OlfU9Et-mRWg0GRHTusL7ZpJevqKemJFbuA",
        },
      }
    );

    const data = await response.json();

    if (data.cities && data.cities.length > 0) {
      return data.cities.map((c: any) => ({
        name: c.name,
        description: c.description || `Ville importante`,
        population: c.population,
      }));
    }

    return null;
  } catch (error) {
    console.error("Error fetching cities:", error);
    return null;
  }
}

/**
 * Hook for imperative handlers
 */
export function useChatImperativeHandlers(options: UseChatImperativeHandlersOptions) {
  const {
    messages,
    setMessages,
    setIsLoading,
    findAccommodationByCity,
    updateAccommodation,
    getActivitiesByDestination,
    updateActivity,
    addManualActivity,
    updatePreferences,
    accomMemory,
    citySelectionShownRef,
  } = options;

  /**
   * Inject system message for country selection
   */
  const injectSystemMessage = useCallback(
    async (event: CountrySelectionEvent) => {
      const countryCode = event.country.country_code;
      const countryKey = `${event.field}-${countryCode}`;

      // Prevent duplicate messages
      if (citySelectionShownRef.current === countryKey) {
        const hasActiveCitySelector = messages.some(
          (m) => m.widget === "citySelector" && !m.isTyping
        );
        if (hasActiveCitySelector) {
          console.log("[Chat] City selector already visible for", countryKey);
          return;
        }
      }
      citySelectionShownRef.current = countryKey;

      const countryName = event.country.name;
      const messageId = `city-select-${Date.now()}`;

      setIsLoading(true);
      setMessages((prev) => [
        ...prev,
        {
          id: messageId,
          role: "assistant",
          text: `Je vois que vous avez sélectionné **${countryName}**. Dans quelle ville de ce pays souhaitez-vous ${
            event.field === "from" ? "partir" : "arriver"
          } ?`,
          isTyping: true,
        },
      ]);

      // Fetch cities
      const cities = await fetchTopCities(countryCode);

      if (cities) {
        const citySelection: CitySelectionData = {
          countryCode,
          countryName,
          cities,
        };

        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  isTyping: false,
                  widget: "citySelector",
                  widgetData: {
                    ...m.widgetData,
                    citySelection,
                    isDeparture: event.field === "from",
                  },
                }
              : m
          )
        );
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  text: `${countryName} est une destination fascinante ! Dans quelle ville souhaites-tu aller ?`,
                  isTyping: false,
                }
              : m
          )
        );
      }

      setIsLoading(false);
    },
    [messages, setMessages, setIsLoading, citySelectionShownRef]
  );

  /**
   * Ask user to choose an airport (single city)
   */
  const askAirportChoice = useCallback(
    (choice: AirportChoice) => {
      const fieldLabel = choice.field === "from" ? "départ" : "destination";
      const messageId = `airport-choice-${Date.now()}`;

      setMessages((prev) => [
        ...prev,
        {
          id: messageId,
          role: "assistant",
          text: `🛫 La ville de **${choice.cityName}** a plusieurs aéroports. Lequel souhaitez-vous utiliser comme ${fieldLabel} ?`,
          airportChoices: choice,
        },
      ]);
    },
    [setMessages]
  );

  /**
   * Ask user to choose airports for both cities
   */
  const askDualAirportChoice = useCallback(
    (choices: DualAirportChoice) => {
      const messageId = `dual-airport-choice-${Date.now()}`;

      const parts: string[] = [];
      if (choices.from) parts.push(`**${choices.from.cityName}** (départ)`);
      if (choices.to) parts.push(`**${choices.to.cityName}** (arrivée)`);

      setMessages((prev) => [
        ...prev,
        {
          id: messageId,
          role: "assistant",
          text: `Plusieurs aéroports sont disponibles pour ${parts.join(
            " et "
          )}. Sélectionnez vos préférences :`,
          dualAirportChoices: choices,
        },
      ]);
    },
    [setMessages]
  );

  /**
   * Offer flight search button
   */
  const offerFlightSearch = useCallback(
    (from: string, to: string) => {
      const fromCode = from.match(/\(([A-Z]{3})\)/)?.[1] || from;
      const toCode = to.match(/\(([A-Z]{3})\)/)?.[1] || to;

      setMessages((prev) => [
        ...prev,
        {
          id: `search-ready-${Date.now()}`,
          role: "assistant",
          text: `Parfait ! Votre itinéraire **${fromCode} → ${toCode}** est prêt. Cliquez ci-dessous pour lancer la recherche de vols.`,
          hasSearchButton: true,
        },
      ]);
    },
    [setMessages]
  );

  /**
   * Update accommodation for a city
   */
  const handleAccommodationUpdate = useCallback(
    (city: string, updates: Partial<AccommodationEntry>): boolean => {
      const accommodation = findAccommodationByCity(city);
      if (!accommodation) {
        console.warn(`[Chat] No accommodation found for city: ${city}`);
        toastError("Hébergement introuvable", `Aucun hébergement trouvé pour ${city}`);
        return false;
      }

      updateAccommodation(accommodation.id, updates);
      console.log(`[Chat] Updated accommodation for ${city}:`, updates);

      toastSuccess("Hébergement mis à jour", `Les préférences pour ${city} ont été modifiées`);
      return true;
    },
    [findAccommodationByCity, updateAccommodation]
  );

  /**
   * Ask for airport confirmation (multi-destination)
   */
  const askAirportConfirmation = useCallback(
    (data: AirportConfirmationData) => {
      const legsText = data.legs
        .map((leg, i) => {
          const fromAirport = leg.from.suggestedAirport;
          const toAirport = leg.to.suggestedAirport;
          return `**Segment ${i + 1}** : ${leg.from.city} → ${leg.to.city} (${fromAirport.iata} → ${toAirport.iata})`;
        })
        .join("\n");

      setMessages((prev) => [
        ...prev,
        {
          id: `airport-confirm-${Date.now()}`,
          role: "assistant",
          text: `J'ai identifié les aéroports suivants pour votre itinéraire multi-destination :\n\n${legsText}\n\nVous pouvez modifier chaque aéroport ci-dessous ou valider pour lancer la recherche.`,
          widget: "airportConfirmation",
          widgetData: {
            airportConfirmation: data,
          },
        },
      ]);
    },
    [setMessages]
  );

  /**
   * Update activities for a city
   */
  const handleActivityUpdate = useCallback(
    (city: string, updates: Partial<ActivityEntry>): boolean => {
      const activities = getActivitiesByDestination(city);

      if (activities.length === 0) {
        console.warn(`[Chat] No activities found for city: ${city}`);
        toastError("Aucune activité", `Aucune activité trouvée pour ${city}`);
        return false;
      }

      activities.forEach((activity) => {
        updateActivity(activity.id, updates);
      });

      console.log(`[Chat] Updated ${activities.length} activity(ies) for ${city}:`, updates);

      toastSuccess(
        "Activité mise à jour",
        `${activities.length} activité(s) pour ${city} modifiée(s)`
      );
      return true;
    },
    [getActivitiesByDestination, updateActivity]
  );

  /**
   * Add an activity for a city
   */
  const handleAddActivityForCity = useCallback(
    (city: string, activity: Partial<ActivityEntry>): string | null => {
      const destination = accomMemory.accommodations.find(
        (a) => a.city?.toLowerCase().trim() === city.toLowerCase().trim()
      );

      if (!destination) {
        console.warn(`[Chat] No destination found for city: ${city}`);
        toastError("Destination introuvable", `Aucune destination trouvée pour ${city}`);
        return null;
      }

      const id = addManualActivity({
        destinationId: destination.id,
        city: destination.city || city,
        country: destination.country || "",
        ...activity,
      });

      console.log(`[Chat] Added activity for ${city}:`, activity);

      toastSuccess("Activité ajoutée", `Nouvelle activité pour ${city}`);
      return id;
    },
    [accomMemory.accommodations, addManualActivity]
  );

  /**
   * Handle detected preferences from chat
   */
  const handlePreferencesDetection = useCallback(
    (detectedPrefs: Partial<TripPreferences>): void => {
      updatePreferences({
        ...detectedPrefs,
        detectedFromChat: true,
      });

      // Build summary
      const summary: string[] = [];
      if (detectedPrefs.pace) summary.push(`rythme ${detectedPrefs.pace}`);
      if (detectedPrefs.interests && detectedPrefs.interests.length > 0) {
        summary.push(`centres d'intérêt: ${detectedPrefs.interests.join(", ")}`);
      }
      if (detectedPrefs.travelStyle) summary.push(`style ${detectedPrefs.travelStyle}`);
      if (detectedPrefs.comfortLevel !== undefined) {
        const comfortLabel =
          detectedPrefs.comfortLevel < 25
            ? "économique"
            : detectedPrefs.comfortLevel < 50
            ? "confort"
            : detectedPrefs.comfortLevel < 75
            ? "premium"
            : "luxe";
        summary.push(`niveau ${comfortLabel}`);
      }

      if (summary.length > 0) {
        console.log(`[Chat] Detected preferences:`, detectedPrefs);
        toastSuccess(
          "Préférences détectées",
          `L'IA a détecté: ${summary.join(", ")}. Modifiez-les dans l'onglet Préférences.`
        );
      }
    },
    [updatePreferences]
  );

  return {
    injectSystemMessage,
    askAirportChoice,
    askDualAirportChoice,
    offerFlightSearch,
    handleAccommodationUpdate,
    askAirportConfirmation,
    handleActivityUpdate,
    handleAddActivityForCity,
    handlePreferencesDetection,
  };
}

export default useChatImperativeHandlers;
