/**
 * useChatWidgetFlow - Hook for managing widget interactions in chat
 *
 * This hook handles all widget-related logic:
 * - Date selection (single and range)
 * - Travelers selection
 * - Trip type confirmation
 * - City selection
 * - Airport selection
 * - Search button flow
 * 
 * Now integrated with widget tracking for LLM context.
 */

import { useCallback, useRef } from "react";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { eventBus } from "@/lib/eventBus";
import type { FlightMemory, AirportInfo, MissingField } from "@/contexts/FlightMemoryContext";
import type { Airport } from "@/hooks/useNearestAirports";
import type { WidgetType, CitySelectionData } from "@/types/flight";
import type { ChatMessage } from "../types";
import { useWidgetTracking } from "./useWidgetTracking";

/**
 * Widget flow state - tracks pending operations
 */
export interface WidgetFlowState {
  pendingTravelersWidget: boolean;
  pendingTripDuration: string | null;
  pendingPreferredMonth: string | null;
  citySelectionShownForCountry: string | null;
  searchButtonShown: boolean;
  pendingFromCountry: { code: string; name: string } | null;
  pendingSearchAfterTravelers: boolean;
}

/**
 * Handler result with optional message to add
 */
export interface HandlerResult {
  removeWidget?: boolean;
  newMessages?: Partial<ChatMessage>[];
  memoryUpdates?: Partial<FlightMemory>;
}

/**
 * Options for the widget flow hook
 */
export interface UseChatWidgetFlowOptions {
  memory: FlightMemory;
  updateMemory: (updates: Partial<FlightMemory>) => void;
  updateTravelers: (travelers: {
    adults: number;
    children: number;
    infants: number;
    childrenAges: number[];
  }) => void;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

/**
 * Parse trip duration string to number of days
 */
function parseDurationToDays(duration: string): number | null {
  const match = duration.match(/(\d+)\s*(semaine|jour|week|day)/i);
  if (match) {
    const num = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    if (unit.includes("semaine") || unit.includes("week")) {
      return num * 7;
    }
    return num;
  }
  if (duration.toLowerCase().includes("semaine") || duration.toLowerCase().includes("week")) {
    return 7;
  }
  return null;
}

/**
 * Hook for managing widget flow in chat
 */
export function useChatWidgetFlow(options: UseChatWidgetFlowOptions) {
  const { memory, updateMemory, updateTravelers, setMessages } = options;
  
  // Widget tracking for LLM context
  const tracking = useWidgetTracking();

  // Refs for tracking flow state
  const pendingTravelersWidgetRef = useRef(false);
  const pendingTripDurationRef = useRef<string | null>(null);
  const pendingPreferredMonthRef = useRef<string | null>(null);
  const citySelectionShownForCountryRef = useRef<string | null>(null);
  const searchButtonShownRef = useRef(false);
  const pendingFromCountryRef = useRef<{ code: string; name: string } | null>(null);
  const pendingSearchAfterTravelersRef = useRef(false);

  /**
   * Reset all flow state (e.g., when switching sessions)
   */
  const resetFlowState = useCallback(() => {
    pendingTravelersWidgetRef.current = false;
    pendingTripDurationRef.current = null;
    pendingPreferredMonthRef.current = null;
    citySelectionShownForCountryRef.current = null;
    searchButtonShownRef.current = false;
    pendingFromCountryRef.current = null;
    pendingSearchAfterTravelersRef.current = false;
  }, []);

  /**
   * Set pending trip duration
   */
  const setPendingTripDuration = useCallback((duration: string | null) => {
    pendingTripDurationRef.current = duration;
  }, []);

  /**
   * Set pending preferred month
   */
  const setPendingPreferredMonth = useCallback((month: string | null) => {
    pendingPreferredMonthRef.current = month;
  }, []);

  /**
   * Set pending travelers widget flag
   */
  const setPendingTravelersWidget = useCallback((pending: boolean) => {
    pendingTravelersWidgetRef.current = pending;
  }, []);

  /**
   * Mark search button as shown
   */
  const markSearchButtonShown = useCallback(() => {
    searchButtonShownRef.current = true;
  }, []);

  /**
   * Check if search button was shown
   */
  const isSearchButtonShown = useCallback(() => {
    return searchButtonShownRef.current;
  }, []);

  /**
   * Handle airport selection
   */
  const handleAirportSelect = useCallback(
    (
      messageId: string,
      field: "from" | "to",
      airport: Airport,
      isDual?: boolean
    ) => {
      if (isDual) {
        // For dual selection, update the message to remove the selected column
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== messageId || !m.dualAirportChoices) return m;

            const updated = { ...m.dualAirportChoices };
            if (field === "from") delete updated.from;
            if (field === "to") delete updated.to;

            const stillHasChoices = updated.from || updated.to;
            return {
              ...m,
              dualAirportChoices: stillHasChoices ? updated : undefined,
            };
          })
        );
      } else {
        // For single selection, remove the airport choices
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, airportChoices: undefined } : m
          )
        );
      }

      // Update flight memory with full airport info
      const existingInfo = field === "from" ? memory.departure : memory.arrival;
      const airportInfo: AirportInfo = {
        airport: airport.name,
        iata: airport.iata,
        city: airport.city_name,
        country: existingInfo?.country,
        countryCode: airport.country_code || existingInfo?.countryCode,
        lat: airport.lat,
        lng: airport.lon,
      };

      if (field === "from") {
        updateMemory({ departure: airportInfo });
      } else {
        updateMemory({ arrival: airportInfo });
      }
      
      // Track the interaction for LLM context
      tracking.trackAirportSelect(airport.name, airport.iata, field === "from" ? "departure" : "arrival");

      // Add confirmation message
      const confirmText =
        field === "from"
          ? `✓ Départ : **${airport.name}**`
          : `✓ Arrivée : **${airport.name}**`;

      setMessages((prev) => [
        ...prev,
        {
          id: `confirm-${Date.now()}-${field}`,
          role: "assistant",
          text: confirmText,
        },
      ]);

      // Notify parent
      eventBus.emit("flight:selectAirport", { field, airport });
    },
    [memory.departure, memory.arrival, updateMemory, setMessages, tracking]
  );

  /**
   * Handle single date selection
   */
  const handleDateSelect = useCallback(
    (messageId: string, dateType: "departure" | "return", date: Date) => {
      // Build updated memory snapshot
      let nextMem = { ...memory, passengers: { ...memory.passengers } };

      if (dateType === "departure") {
        nextMem = { ...nextMem, departureDate: date };
        updateMemory({ departureDate: date });

        // If we have a pending trip duration, calculate return date
        if (pendingTripDurationRef.current) {
          const days = parseDurationToDays(pendingTripDurationRef.current);
          if (days) {
            const computedReturn = addDays(date, days);
            nextMem = { ...nextMem, returnDate: computedReturn };
            updateMemory({ returnDate: computedReturn });
          }
          pendingTripDurationRef.current = null;
        }
      } else {
        nextMem = { ...nextMem, returnDate: date };
        updateMemory({ returnDate: date });
      }
      
      // Track the interaction for LLM context
      tracking.trackDateSelect(date, dateType);

      // Remove widget from message
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, widget: undefined } : m
        )
      );

      // Build confirmation text
      const confirmText =
        dateType === "departure"
          ? `✓ Date de départ : **${format(date, "d MMMM yyyy", { locale: fr })}**`
          : `✓ Date de retour : **${format(date, "d MMMM yyyy", { locale: fr })}**`;

      // Check if we need to show travelers widget next
      if (dateType === "departure" && pendingTravelersWidgetRef.current) {
        pendingTravelersWidgetRef.current = false;

        const computedReturnInfo = nextMem.returnDate
          ? ` Retour prévu le ${format(nextMem.returnDate, "d MMMM", { locale: fr })}.`
          : "";

        setMessages((prev) => [
          ...prev,
          {
            id: `confirm-date-${Date.now()}`,
            role: "assistant",
            text: `${confirmText}${computedReturnInfo} Maintenant, combien êtes-vous ? 🧳`,
            widget: "travelersSelector",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `confirm-date-${Date.now()}`,
            role: "assistant",
            text: confirmText,
          },
        ]);
      }

      return nextMem;
    },
    [memory, updateMemory, setMessages, tracking]
  );

  /**
   * Handle date range selection (both departure AND return)
   */
  const handleDateRangeSelect = useCallback(
    (messageId: string, departure: Date, returnDate: Date) => {
      updateMemory({ departureDate: departure, returnDate: returnDate });

      // Clear pending refs
      pendingTripDurationRef.current = null;
      pendingPreferredMonthRef.current = null;
      
      // Track the interaction for LLM context
      tracking.trackDateRangeSelect(departure, returnDate);

      // Remove widget from message
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, widget: undefined } : m
        )
      );

      const needsTravelersWidget =
        pendingTravelersWidgetRef.current || memory.passengers.adults < 1;
      pendingTravelersWidgetRef.current = false;

      if (needsTravelersWidget) {
        setMessages((prev) => [
          ...prev,
          {
            id: `confirm-dates-${Date.now()}`,
            role: "assistant",
            text: `✓ **${format(departure, "d MMMM", { locale: fr })}** → **${format(
              returnDate,
              "d MMMM yyyy",
              { locale: fr }
            )}**. Combien êtes-vous ? 🧳`,
            widget: "travelersSelector",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `confirm-dates-${Date.now()}`,
            role: "assistant",
            text: `✓ Dates confirmées : **${format(departure, "d MMMM", {
              locale: fr,
            })}** → **${format(returnDate, "d MMMM yyyy", { locale: fr })}**`,
          },
        ]);
      }
    },
    [memory.passengers.adults, updateMemory, setMessages, tracking]
  );

  /**
   * Handle travelers selection
   */
  const handleTravelersSelect = useCallback(
    (
      messageId: string,
      travelers: { adults: number; children: number; infants: number }
    ) => {
      updateMemory({ passengers: travelers });

      // Update travel memory for accommodation suggestions
      updateTravelers({
        adults: travelers.adults,
        children: travelers.children,
        infants: travelers.infants,
        childrenAges: [],
      });
      
      // Track the interaction for LLM context
      tracking.trackTravelersSelect(travelers);

      // Remove widget from message
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, widget: undefined } : m
        )
      );

      // Build confirmation text
      const parts = [`${travelers.adults} adulte${travelers.adults > 1 ? "s" : ""}`];
      if (travelers.children > 0) {
        parts.push(`${travelers.children} enfant${travelers.children > 1 ? "s" : ""}`);
      }
      if (travelers.infants > 0) {
        parts.push(`${travelers.infants} bébé${travelers.infants > 1 ? "s" : ""}`);
      }

      // Ask trip type confirmation
      setMessages((prev) => [
        ...prev,
        {
          id: `confirm-travelers-${Date.now()}`,
          role: "assistant",
          text: `Parfait, ${parts.join(", ")} ! C'est bien un aller-retour ?`,
          widget: "tripTypeConfirm",
        },
      ]);
    },
    [updateMemory, updateTravelers, setMessages, tracking]
  );

  /**
   * Handle trip type confirmation
   */
  const handleTripTypeConfirm = useCallback(
    (messageId: string, tripType: "roundtrip" | "oneway" | "multi") => {
      updateMemory({ tripType });
      
      // Track the interaction for LLM context
      tracking.trackTripTypeSelect(tripType);

      // Remove widget from message
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, widget: undefined } : m
        )
      );

      if (tripType === "multi") {
        setMessages((prev) => [
          ...prev,
          {
            id: `ask-multi-${Date.now()}`,
            role: "assistant",
            text: `Super ! Pour un voyage multi-destinations, indiquez-moi toutes vos étapes (ex: "Paris → Rome → Barcelone → Paris" ou listez vos villes). 🗺️`,
          },
        ]);
      } else {
        const label = tripType === "roundtrip" ? "Aller-retour" : "Aller simple";
        searchButtonShownRef.current = true;
        setMessages((prev) => [
          ...prev,
          {
            id: `search-ready-${Date.now()}`,
            role: "assistant",
            text: `Parfait, **${label}** confirmé ! Cliquez ci-dessous pour lancer la recherche. 🚀`,
            hasSearchButton: true,
          },
        ]);
      }
    },
    [updateMemory, setMessages, tracking]
  );

  /**
   * Handle city selection
   */
  const handleCitySelect = useCallback(
    async (
      messageId: string,
      cityName: string,
      countryName: string,
      countryCode: string
    ) => {
      citySelectionShownForCountryRef.current = null;

      // Update memory with selected city
      updateMemory({ arrival: { city: cityName, country: countryName, countryCode } });
      
      // Track the interaction for LLM context
      tracking.trackCitySelect(cityName, countryName);

      // Remove widget from message
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, widget: undefined } : m
        )
      );

      // Determine which date widget to show
      const hasTripDuration = !!pendingTripDurationRef.current;
      const isOneway = memory.tripType === "oneway";

      if (!memory.departureDate) {
        let widgetType: WidgetType;
        let messageText: string;

        if (hasTripDuration) {
          widgetType = "datePicker";
          messageText = `Excellent choix, **${cityName}** ! 😊 Tu as mentionné ${pendingTripDurationRef.current}. Choisis ta date de départ :`;
        } else if (isOneway) {
          widgetType = "datePicker";
          messageText = `Excellent choix, **${cityName}** ! 😊 Quand souhaites-tu partir ?`;
        } else {
          widgetType = "dateRangePicker";
          messageText = `Excellent choix, **${cityName}** ! 😊 Choisis tes dates de voyage :`;
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `ask-date-after-city-${Date.now()}`,
            role: "assistant",
            text: messageText,
            widget: widgetType,
            widgetData: {
              preferredMonth: pendingPreferredMonthRef.current || undefined,
              tripDuration: pendingTripDurationRef.current || undefined,
            },
          },
        ]);
      } else if (!memory.returnDate && memory.tripType !== "oneway") {
        if (hasTripDuration) {
          const days = parseDurationToDays(pendingTripDurationRef.current!);
          if (days) {
            const computedReturn = addDays(memory.departureDate!, days);
            updateMemory({ returnDate: computedReturn });
            pendingTripDurationRef.current = null;

            setMessages((prev) => [
              ...prev,
              {
                id: `ask-travelers-after-city-${Date.now()}`,
                role: "assistant",
                text: `Parfait, **${cityName}** du ${format(
                  memory.departureDate!,
                  "d MMMM",
                  { locale: fr }
                )} au ${format(computedReturn, "d MMMM", { locale: fr })} ! Combien êtes-vous ?`,
                widget: "travelersSelector",
              },
            ]);
          }
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `ask-return-after-city-${Date.now()}`,
              role: "assistant",
              text: `Excellent choix, **${cityName}** ! Quand souhaites-tu revenir ?`,
              widget: "returnDatePicker",
              widgetData: {
                preferredMonth: pendingPreferredMonthRef.current || undefined,
              },
            },
          ]);
        }
      } else if (memory.passengers.adults < 1) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ask-travelers-after-city-${Date.now()}`,
            role: "assistant",
            text: `Excellent choix, **${cityName}** ! Combien êtes-vous ?`,
            widget: "travelersSelector",
          },
        ]);
      }
    },
    [memory, updateMemory, setMessages, tracking]
  );

  /**
   * Handle departure city selection
   */
  const handleDepartureCitySelect = useCallback(
    async (
      messageId: string,
      cityName: string,
      countryName: string,
      countryCode: string
    ) => {
      updateMemory({ departure: { city: cityName, country: countryName, countryCode } });
      pendingFromCountryRef.current = null;
      
      // Track the interaction for LLM context (departure city)
      tracking.trackCitySelect(cityName, `${countryName} (départ)`);

      // Remove widget from message
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, widget: undefined } : m
        )
      );

      // Check if we need to ask for destination
      if (!memory.arrival?.city) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ask-destination-${Date.now()}`,
            role: "assistant",
            text: `Parfait, départ de **${cityName}** ! 😊 Où souhaitez-vous aller ?`,
          },
        ]);
      }
    },
    [memory.arrival?.city, updateMemory, setMessages, tracking]
  );

  /**
   * Handle search button click
   */
  const handleSearchButtonClick = useCallback(
    (messageId: string) => {
      const totalTravelers =
        memory.passengers.adults +
        memory.passengers.children +
        memory.passengers.infants;

      // If only 1 adult (default), ask for confirmation
      if (
        totalTravelers === 1 &&
        memory.passengers.adults === 1 &&
        memory.passengers.children === 0 &&
        memory.passengers.infants === 0
      ) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, hasSearchButton: false, widget: "travelersConfirmBeforeSearch" }
              : m
          )
        );
        pendingSearchAfterTravelersRef.current = true;
      } else {
        eventBus.emit("flight:triggerSearch");
      }
    },
    [memory.passengers, setMessages]
  );

  /**
   * Handle solo travel confirmation
   */
  const handleTravelersConfirmSolo = useCallback(
    (messageId: string) => {
      // Track solo confirmation (1 adult)
      tracking.trackTravelersSelect({ adults: 1, children: 0, infants: 0 });
      
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, widget: undefined } : m
        )
      );
      pendingSearchAfterTravelersRef.current = false;
      eventBus.emit("flight:triggerSearch");
    },
    [setMessages, tracking]
  );

  /**
   * Handle travelers edit before search
   */
  const handleTravelersEditBeforeSearch = useCallback(
    (
      messageId: string,
      travelers: { adults: number; children: number; infants: number }
    ) => {
      updateMemory({ passengers: travelers });
      
      // Track the interaction for LLM context
      tracking.trackTravelersSelect(travelers);
      
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, widget: undefined } : m
        )
      );
      pendingSearchAfterTravelersRef.current = false;

      const parts = [`${travelers.adults} adulte${travelers.adults > 1 ? "s" : ""}`];
      if (travelers.children > 0)
        parts.push(`${travelers.children} enfant${travelers.children > 1 ? "s" : ""}`);
      if (travelers.infants > 0)
        parts.push(`${travelers.infants} bébé${travelers.infants > 1 ? "s" : ""}`);

      setMessages((prev) => [
        ...prev,
        {
          id: `search-ready-updated-${Date.now()}`,
          role: "assistant",
          text: `C'est noté, ${parts.join(", ")} ! Cliquez ci-dessous pour lancer la recherche. 🚀`,
          hasSearchButton: true,
        },
      ]);
    },
    [updateMemory, setMessages, tracking]
  );

  /**
   * Determine which widget to show based on current state
   */
  const determineNextWidget = useCallback(
    (
      showDateWidget: boolean,
      showTravelersWidget: boolean,
      nextMem: FlightMemory
    ): WidgetType | undefined => {
      if (showDateWidget) {
        const effectiveTripType = nextMem.tripType || "roundtrip";

        if (!nextMem.departureDate) {
          if (pendingTripDurationRef.current) {
            return "datePicker";
          } else if (effectiveTripType === "oneway") {
            return "datePicker";
          } else {
            return "dateRangePicker";
          }
        } else if (effectiveTripType === "roundtrip" && !nextMem.returnDate) {
          return "returnDatePicker";
        }
      }

      if (showTravelersWidget) {
        return "travelersSelector";
      }

      return undefined;
    },
    []
  );

  /**
   * Get current widget data for display
   */
  const getWidgetData = useCallback(() => {
    return {
      preferredMonth: pendingPreferredMonthRef.current || undefined,
      tripDuration: pendingTripDurationRef.current || undefined,
    };
  }, []);

  return {
    // Flow state management
    resetFlowState,
    setPendingTripDuration,
    setPendingPreferredMonth,
    setPendingTravelersWidget,
    markSearchButtonShown,
    isSearchButtonShown,

    // Handlers
    handleAirportSelect,
    handleDateSelect,
    handleDateRangeSelect,
    handleTravelersSelect,
    handleTripTypeConfirm,
    handleCitySelect,
    handleDepartureCitySelect,
    handleSearchButtonClick,
    handleTravelersConfirmSolo,
    handleTravelersEditBeforeSearch,

    // Widget determination
    determineNextWidget,
    getWidgetData,

    // Refs for external access
    citySelectionShownRef: citySelectionShownForCountryRef,
    pendingFromCountryRef,
  };
}

export default useChatWidgetFlow;
