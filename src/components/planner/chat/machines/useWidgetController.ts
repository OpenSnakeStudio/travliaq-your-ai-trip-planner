/**
 * useWidgetController - React hook for the Widget Controller State Machine
 * 
 * This hook integrates the widgetControllerMachine with React,
 * providing a simple interface for managing widget state.
 */

import { useCallback, useMemo } from "react";
import { useMachine } from "@xstate/react";
import {
  widgetControllerMachine,
  type WidgetControllerContext,
  type TravelerConfig,
  type ActiveWidget,
} from "./widgetControllerMachine";
import type { WidgetType } from "@/types/flight";
import type { ClassifiedIntent } from "../typeDefs/intent";
import type { FlightMemory } from "@/stores/hooks";

/**
 * Hook return type
 */
export interface UseWidgetControllerReturn {
  // Current state
  state: string;
  context: WidgetControllerContext;
  
  // Active widget info
  activeWidget: ActiveWidget | null;
  isWidgetActive: boolean;
  
  // Derived flags
  isIdle: boolean;
  isProcessing: boolean;
  isReadyToSearch: boolean;
  
  // Actions
  processIntent: (intent: ClassifiedIntent) => void;
  showWidget: (widgetType: WidgetType, reason: string, data?: Record<string, unknown>) => void;
  completeWidget: (widgetType: WidgetType, value: unknown) => void;
  dismissWidget: (widgetType: WidgetType) => void;
  
  // Selection handlers
  handleCitySelected: (city: string, country: string, countryCode: string, field: "from" | "to") => void;
  handleDateSelected: (dateType: "departure" | "return", date: Date) => void;
  handleDateRangeSelected: (departure: Date, returnDate: Date) => void;
  handleTravelersSelected: (travelers: TravelerConfig) => void;
  handleTripTypeSelected: (tripType: "roundtrip" | "oneway" | "multi") => void;
  
  // Flow control
  triggerSearch: () => void;
  reset: () => void;
  
  // Widget history
  widgetHistory: WidgetControllerContext["widgetHistory"];
}

/**
 * Options for the hook
 */
export interface UseWidgetControllerOptions {
  /** Optional: Seed initial context from flight memory */
  initialMemory?: FlightMemory;
  /** Callback when a widget should be shown */
  onWidgetShow?: (widget: ActiveWidget) => void;
  /** Callback when ready to search */
  onReadyToSearch?: () => void;
}

/**
 * Hook for using the Widget Controller state machine
 */
export function useWidgetController(options: UseWidgetControllerOptions = {}): UseWidgetControllerReturn {
  const { initialMemory, onWidgetShow, onReadyToSearch } = options;
  
  // Initialize the machine
  const [state, send] = useMachine(widgetControllerMachine);
  
  // Derived state flags
  const isIdle = state.matches("idle");
  const isProcessing = state.matches("processingIntent");
  const isWidgetActive = state.matches("widgetActive");
  const isReadyToSearch = state.matches("readyToSearch");
  
  // Actions
  const processIntent = useCallback((intent: ClassifiedIntent) => {
    send({ type: "INTENT_RECEIVED", intent });
  }, [send]);
  
  const showWidget = useCallback((widgetType: WidgetType, reason: string, data?: Record<string, unknown>) => {
    send({ type: "SHOW_WIDGET", widgetType, reason, data });
  }, [send]);
  
  const completeWidget = useCallback((widgetType: WidgetType, value: unknown) => {
    send({ type: "WIDGET_COMPLETED", widgetType, value });
  }, [send]);
  
  const dismissWidget = useCallback((widgetType: WidgetType) => {
    send({ type: "WIDGET_DISMISSED", widgetType });
  }, [send]);
  
  // Selection handlers
  const handleCitySelected = useCallback((city: string, country: string, countryCode: string, field: "from" | "to") => {
    send({ type: "CITY_SELECTED", city, country, countryCode, field });
  }, [send]);
  
  const handleDateSelected = useCallback((dateType: "departure" | "return", date: Date) => {
    send({ type: "DATE_SELECTED", dateType, date });
  }, [send]);
  
  const handleDateRangeSelected = useCallback((departure: Date, returnDate: Date) => {
    send({ type: "DATE_RANGE_SELECTED", departure, returnDate });
  }, [send]);
  
  const handleTravelersSelected = useCallback((travelers: TravelerConfig) => {
    send({ type: "TRAVELERS_SELECTED", travelers });
  }, [send]);
  
  const handleTripTypeSelected = useCallback((tripType: "roundtrip" | "oneway" | "multi") => {
    send({ type: "TRIP_TYPE_SELECTED", tripType });
  }, [send]);
  
  // Flow control
  const triggerSearch = useCallback(() => {
    send({ type: "TRIGGER_SEARCH" });
  }, [send]);
  
  const reset = useCallback(() => {
    send({ type: "RESET" });
  }, [send]);
  
  // Memoized context access
  const context = state.context;
  const activeWidget = context.activeWidget;
  const widgetHistory = context.widgetHistory;
  
  return {
    state: state.value as string,
    context,
    activeWidget,
    isWidgetActive,
    isIdle,
    isProcessing,
    isReadyToSearch,
    processIntent,
    showWidget,
    completeWidget,
    dismissWidget,
    handleCitySelected,
    handleDateSelected,
    handleDateRangeSelected,
    handleTravelersSelected,
    handleTripTypeSelected,
    triggerSearch,
    reset,
    widgetHistory,
  };
}

export default useWidgetController;
