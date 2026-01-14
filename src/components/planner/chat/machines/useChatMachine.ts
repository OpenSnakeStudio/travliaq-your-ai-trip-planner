/**
 * useChatMachine - React hook for the chat state machine
 *
 * This hook provides the integration between XState and React,
 * connecting the machine to Zustand store and providing
 * convenient methods for UI components.
 */

import { useCallback, useMemo } from "react";
import { useMachine } from "@xstate/react";
import { chatMachine, type ChatMachineEvent, type TravelerCounts } from "./chatMachine";
import { useFlightMemoryStore } from "@/stores/hooks";
import type { WidgetType } from "@/types/flight";

/**
 * Hook return type
 */
export interface UseChatMachineReturn {
  // Current state
  state: string;
  isProcessing: boolean;
  isReady: boolean;
  isSearching: boolean;

  // Current widget
  currentWidget: WidgetType | null;
  widgetData: {
    preferredMonth: string | null;
    tripDuration: string | null;
  };

  // Flags
  searchButtonShown: boolean;
  error: string | null;

  // Actions
  sendUserMessage: (text: string) => void;
  handleCitySelected: (city: string, country: string, countryCode: string) => void;
  handleDateSelected: (dateType: "departure" | "return", date: Date) => void;
  handleDateRangeSelected: (departure: Date, returnDate: Date) => void;
  handleTravelersSelected: (travelers: TravelerCounts) => void;
  handleTripTypeConfirmed: (tripType: "roundtrip" | "oneway" | "multi") => void;
  handleAirportSelected: (field: "from" | "to", iata: string) => void;
  triggerSearch: () => void;
  reset: () => void;

  // Stream callbacks (for external streaming logic)
  onStreamComplete: (content: string, flightData?: any) => void;
  onStreamError: (error: string) => void;
}

/**
 * React hook for the chat state machine
 */
export function useChatMachine(): UseChatMachineReturn {
  const flightMemory = useFlightMemoryStore();

  // Create machine with initial context from flight memory
  const [snapshot, send] = useMachine(chatMachine, {
    input: {
      departure: flightMemory.memory.departure,
      arrival: flightMemory.memory.arrival,
      departureDate: flightMemory.memory.departureDate,
      returnDate: flightMemory.memory.returnDate,
      tripType: flightMemory.memory.tripType,
      passengers: flightMemory.memory.passengers,
    },
  });

  // Derived state
  const state = snapshot.value as string;
  const context = snapshot.context;

  const isProcessing = state === "processing";
  const isReady = state === "ready";
  const isSearching = state === "searching";

  // Actions
  const sendUserMessage = useCallback(
    (text: string) => {
      send({ type: "USER_MESSAGE", text });
    },
    [send]
  );

  const handleCitySelected = useCallback(
    (city: string, country: string, countryCode: string) => {
      send({ type: "CITY_SELECTED", city, country, countryCode });
      flightMemory.updateMemory({
        arrival: { city, country, countryCode },
      });
    },
    [send, flightMemory]
  );

  const handleDateSelected = useCallback(
    (dateType: "departure" | "return", date: Date) => {
      send({ type: "DATE_SELECTED", dateType, date });
      if (dateType === "departure") {
        flightMemory.updateMemory({ departureDate: date });
      } else {
        flightMemory.updateMemory({ returnDate: date });
      }
    },
    [send, flightMemory]
  );

  const handleDateRangeSelected = useCallback(
    (departure: Date, returnDate: Date) => {
      send({ type: "DATE_RANGE_SELECTED", departure, returnDate });
      flightMemory.updateMemory({ departureDate: departure, returnDate });
    },
    [send, flightMemory]
  );

  const handleTravelersSelected = useCallback(
    (travelers: TravelerCounts) => {
      send({ type: "TRAVELERS_SELECTED", travelers });
      flightMemory.updateMemory({ passengers: travelers });
    },
    [send, flightMemory]
  );

  const handleTripTypeConfirmed = useCallback(
    (tripType: "roundtrip" | "oneway" | "multi") => {
      send({ type: "TRIP_TYPE_CONFIRMED", tripType });
      flightMemory.updateMemory({ tripType });
    },
    [send, flightMemory]
  );

  const handleAirportSelected = useCallback(
    (field: "from" | "to", iata: string) => {
      send({ type: "AIRPORT_SELECTED", field, iata });
    },
    [send]
  );

  const triggerSearch = useCallback(() => {
    send({ type: "SEARCH_TRIGGERED" });
  }, [send]);

  const reset = useCallback(() => {
    send({ type: "RESET" });
    flightMemory.resetMemory();
  }, [send, flightMemory]);

  const onStreamComplete = useCallback(
    (content: string, flightData?: any) => {
      send({ type: "STREAM_COMPLETE", content, flightData });
    },
    [send]
  );

  const onStreamError = useCallback(
    (error: string) => {
      send({ type: "STREAM_ERROR", error });
    },
    [send]
  );

  // Widget data for display
  const widgetData = useMemo(
    () => ({
      preferredMonth: context.pendingPreferredMonth,
      tripDuration: context.pendingTripDuration,
    }),
    [context.pendingPreferredMonth, context.pendingTripDuration]
  );

  return {
    // State
    state,
    isProcessing,
    isReady,
    isSearching,

    // Widget
    currentWidget: context.currentWidget,
    widgetData,

    // Flags
    searchButtonShown: context.searchButtonShown,
    error: context.error,

    // Actions
    sendUserMessage,
    handleCitySelected,
    handleDateSelected,
    handleDateRangeSelected,
    handleTravelersSelected,
    handleTripTypeConfirmed,
    handleAirportSelected,
    triggerSearch,
    reset,

    // Stream callbacks
    onStreamComplete,
    onStreamError,
  };
}

export default useChatMachine;
