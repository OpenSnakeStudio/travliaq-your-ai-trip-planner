/**
 * Unified Intent Router Hook (Phase 2 - Intent Unification)
 * 
 * This hook combines the functionality of useIntentHandler and useIntentRouter
 * into a single source of truth for widget triggering based on:
 * 1. Backend intent classification (primary source of truth)
 * 2. Flow state validation (prerequisites check)
 * 3. Fallback logic when backend classification fails
 */

import { useCallback, useMemo, useRef } from "react";
import type { FlightMemory } from "@/stores/hooks";
import type { WidgetType } from "@/types/flight";
import type { IntentClassification } from "./useChatStream";

/**
 * Flow state computed from memory
 */
export interface FlowState {
  hasDestination: boolean;
  hasDestinationCity: boolean;
  hasDepartureCity: boolean;
  hasDepartureDate: boolean;
  hasReturnDate: boolean;
  hasTravelers: boolean;
  hasTripType: boolean;
  tripType: "roundtrip" | "oneway" | "multi";
  isReadyToSearch: boolean;
}

/**
 * Widget validation result
 */
export interface WidgetValidation {
  valid: boolean;
  reason?: string;
  suggestedWidget?: WidgetType;
}

/**
 * Result of processing an intent
 */
export interface IntentProcessResult {
  shouldShowWidget: boolean;
  widgetType: WidgetType | null;
  widgetData?: Record<string, unknown>;
  action?: "search" | "delegate" | "clarify" | "none";
  reason?: string;
}

/**
 * Hook options
 */
export interface UseUnifiedIntentRouterOptions {
  memory: FlightMemory;
  onWidgetTriggered?: (widgetType: WidgetType, data?: Record<string, unknown>) => void;
  onSearchTriggered?: () => void;
  onDelegateChoice?: (intent: IntentClassification) => void;
}

/**
 * Hook return type
 */
export interface UseUnifiedIntentRouterReturn {
  /** Process a backend intent classification */
  processIntent: (intent: IntentClassification | null) => IntentProcessResult;
  
  /** Validate if a widget can be shown */
  canShowWidget: (widgetType: WidgetType) => WidgetValidation;
  
  /** Get the next required widget based on flow state */
  getNextRequiredWidget: () => WidgetType | null;
  
  /** Get current flow state */
  flowState: FlowState;
  
  /** Get the last processed intent */
  lastIntent: IntentClassification | null;
}

/**
 * Confidence thresholds for intent processing
 */
const CONFIDENCE_THRESHOLDS = {
  HIGH: 80,
  MEDIUM: 60,
  LOW: 40,
} as const;

/**
 * Widget prerequisites - defines what's needed before showing each widget
 * More relaxed than before to allow flexible user journeys
 */
const WIDGET_PREREQUISITES: Record<WidgetType, (flow: FlowState) => WidgetValidation> = {
  // City selector can always be shown
  citySelector: () => ({ valid: true }),
  
  // Date widgets - always available (user might want to pick dates first)
  datePicker: () => ({ valid: true }),
  dateRangePicker: () => ({ valid: true }),
  returnDatePicker: (flow) => ({
    valid: flow.hasDepartureDate,
    reason: flow.hasDepartureDate ? undefined : "Departure date required first",
  }),
  
  // Travelers - always available
  travelersSelector: () => ({ valid: true }),
  
  // Trip type confirm - need travelers
  tripTypeConfirm: (flow) => ({
    valid: flow.hasTravelers,
    reason: flow.hasTravelers ? undefined : "Travelers count required first",
    suggestedWidget: flow.hasTravelers ? undefined : "travelersSelector",
  }),
  
  // Final confirmation - need all core info
  travelersConfirmBeforeSearch: (flow) => ({
    valid: flow.hasDestinationCity && flow.hasDepartureDate && flow.hasTravelers,
    reason: flow.isReadyToSearch ? undefined : "Complete trip info required",
  }),
  
  // Airport confirmation - need all core info
  airportConfirmation: (flow) => ({
    valid: flow.isReadyToSearch,
    reason: flow.isReadyToSearch ? undefined : "Complete trip info required",
  }),
  
  // Preference widgets can always be shown
  preferenceStyle: () => ({ valid: true }),
  preferenceInterests: () => ({ valid: true }),
  mustHaves: () => ({ valid: true }),
  dietary: () => ({ valid: true }),
  destinationSuggestions: () => ({ valid: true }),
  
  // Quick filter widgets - always available
  quickFilterChips: () => ({ valid: true }),
  starRatingSelector: () => ({ valid: true }),
  durationChips: () => ({ valid: true }),
  timeOfDayChips: () => ({ valid: true }),
  cabinClassSelector: () => ({ valid: true }),
  directFlightToggle: () => ({ valid: true }),
  budgetRangeSlider: () => ({ valid: true }),
};

/**
 * Unified Intent Router Hook
 */
export function useUnifiedIntentRouter({
  memory,
  onWidgetTriggered,
  onSearchTriggered,
  onDelegateChoice,
}: UseUnifiedIntentRouterOptions): UseUnifiedIntentRouterReturn {
  
  const lastIntentRef = useRef<IntentClassification | null>(null);

  /**
   * Compute current flow state from memory
   */
  const flowState = useMemo<FlowState>(() => {
    const hasDestination = !!(memory.arrival?.country || memory.arrival?.countryCode);
    const hasDestinationCity = !!memory.arrival?.city;
    const hasDepartureCity = !!memory.departure?.city;
    const hasDepartureDate = !!memory.departureDate;
    const hasReturnDate = !!memory.returnDate;
    const hasTravelers = (memory.passengers?.adults ?? 0) >= 1;
    const tripType = memory.tripType || "roundtrip";
    const hasTripType = !!memory.tripType;
    
    const isReadyToSearch = 
      hasDestinationCity && 
      hasDepartureDate && 
      (tripType === "oneway" || hasReturnDate) && 
      hasTravelers;
    
    return {
      hasDestination,
      hasDestinationCity,
      hasDepartureCity,
      hasDepartureDate,
      hasReturnDate,
      hasTravelers,
      hasTripType,
      tripType,
      isReadyToSearch,
    };
  }, [memory]);

  /**
   * Validate if a widget can be shown
   */
  const canShowWidget = useCallback((widgetType: WidgetType): WidgetValidation => {
    const validator = WIDGET_PREREQUISITES[widgetType];
    if (!validator) {
      return { valid: true };
    }
    return validator(flowState);
  }, [flowState]);

  /**
   * Get the next required widget based on flow state
   */
  const getNextRequiredWidget = useCallback((): WidgetType | null => {
    // Priority order for collecting data
    if (!flowState.hasDestinationCity) {
      return "citySelector";
    }
    if (!flowState.hasDepartureDate) {
      return flowState.tripType === "roundtrip" ? "dateRangePicker" : "datePicker";
    }
    if (flowState.tripType === "roundtrip" && !flowState.hasReturnDate) {
      return "dateRangePicker";
    }
    if (!flowState.hasTravelers) {
      return "travelersSelector";
    }
    if (!flowState.hasTripType) {
      return "tripTypeConfirm";
    }
    if (flowState.isReadyToSearch) {
      return "travelersConfirmBeforeSearch";
    }
    
    return null;
  }, [flowState]);

  /**
   * Process a backend intent classification
   * This is the main entry point - trusts the backend as source of truth
   */
  const processIntent = useCallback((intent: IntentClassification | null): IntentProcessResult => {
    lastIntentRef.current = intent;
    
    if (!intent) {
      return { shouldShowWidget: false, widgetType: null, action: "none" };
    }
    
    console.log("[UnifiedIntentRouter] Processing intent:", intent.primaryIntent, "confidence:", intent.confidence);
    
    // Check confidence level
    if (intent.confidence < CONFIDENCE_THRESHOLDS.LOW) {
      console.log("[UnifiedIntentRouter] Low confidence, requesting clarification");
      return { 
        shouldShowWidget: false, 
        widgetType: null, 
        action: "clarify",
        reason: (intent as IntentClassification & { clarificationQuestion?: string }).clarificationQuestion || "Please clarify your request",
      };
    }
    
    // Handle special actions
    if (intent.primaryIntent === "trigger_search") {
      if (onSearchTriggered) onSearchTriggered();
      return { shouldShowWidget: false, widgetType: null, action: "search" };
    }
    
    if (intent.primaryIntent === "delegate_choice") {
      if (onDelegateChoice) onDelegateChoice(intent);
      return { shouldShowWidget: false, widgetType: null, action: "delegate" };
    }
    
    // TRUST THE BACKEND: If backend specified a widget, validate and use it
    if (intent.widgetToShow?.type) {
      const widgetType = intent.widgetToShow.type as WidgetType;
      const validation = canShowWidget(widgetType);
      
      if (validation.valid) {
        if (onWidgetTriggered) {
          onWidgetTriggered(widgetType, intent.widgetToShow.data);
        }
        return {
          shouldShowWidget: true,
          widgetType,
          widgetData: intent.widgetToShow.data,
          action: "none",
          reason: intent.widgetToShow.reason,
        };
      }
      
      // Widget can't be shown, use suggested fallback or next required
      const fallbackWidget = validation.suggestedWidget || getNextRequiredWidget();
      if (fallbackWidget) {
        if (onWidgetTriggered) {
          onWidgetTriggered(fallbackWidget);
        }
        return {
          shouldShowWidget: true,
          widgetType: fallbackWidget,
          action: "none",
          reason: validation.reason || "Fallback to required widget",
        };
      }
    }
    
    // No widget from backend - check if we should show the next required one
    // Only do this for intents that typically need a widget
    const widgetTriggeringIntents = [
      "provide_destination",
      "provide_dates",
      "provide_duration",
      "flexible_dates",
      "provide_travelers",
      "specify_composition",
      "confirm_selection",
    ];
    
    if (widgetTriggeringIntents.includes(intent.primaryIntent)) {
      const nextRequired = getNextRequiredWidget();
      if (nextRequired) {
        // Build widget data from entities if available
        const widgetData: Record<string, unknown> = {};
        
        if (intent.entities.preferredMonth) {
          widgetData.preferredMonth = intent.entities.preferredMonth;
        }
        if (intent.entities.tripDuration) {
          widgetData.tripDuration = intent.entities.tripDuration;
        }
        if (intent.entities.destinationCountryCode) {
          widgetData.countryCode = intent.entities.destinationCountryCode;
          widgetData.countryName = intent.entities.destinationCountry;
        }
        
        if (onWidgetTriggered) {
          onWidgetTriggered(nextRequired, Object.keys(widgetData).length > 0 ? widgetData : undefined);
        }
        
        return {
          shouldShowWidget: true,
          widgetType: nextRequired,
          widgetData: Object.keys(widgetData).length > 0 ? widgetData : undefined,
          action: "none",
          reason: `Next required: ${nextRequired}`,
        };
      }
    }
    
    return { shouldShowWidget: false, widgetType: null, action: "none" };
  }, [canShowWidget, getNextRequiredWidget, onWidgetTriggered, onSearchTriggered, onDelegateChoice]);

  return {
    processIntent,
    canShowWidget,
    getNextRequiredWidget,
    flowState,
    lastIntent: lastIntentRef.current,
  };
}

export default useUnifiedIntentRouter;
