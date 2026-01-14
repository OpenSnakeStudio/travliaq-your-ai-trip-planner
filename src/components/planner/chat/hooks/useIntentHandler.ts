/**
 * useIntentHandler - Handles intent classification from backend
 * 
 * This hook processes the intent classification from the backend
 * and triggers the appropriate widget display based on the detected intent.
 */

import { useCallback, useRef } from "react";
import type { WidgetType } from "@/types/flight";
import type { IntentClassification } from "./useChatStream";
import type { FlightMemory } from "@/stores/hooks";

/**
 * Confidence thresholds
 */
const CONFIDENCE_THRESHOLDS = {
  HIGH: 80,
  MEDIUM: 60,
  LOW: 40,
} as const;

/**
 * Intent to widget mapping
 */
const INTENT_WIDGET_MAP: Record<string, WidgetType | null> = {
  // Destination intents
  "provide_destination": "citySelector",
  "search_destination": null, // Let LLM respond naturally
  
  // Date intents
  "provide_dates": "dateRangePicker",
  "provide_duration": "datePicker",
  "flexible_dates": "dateRangePicker",
  
  // Traveler intents
  "provide_travelers": "travelersSelector",
  "specify_composition": "travelersSelector",
  
  // Preference intents
  "express_preference": "preferenceStyle",
  "ask_inspiration": "preferenceStyle",
  "ask_recommendations": "destinationSuggestions",
  
  // Confirmation intents
  "confirm_selection": "tripTypeConfirm",
  
  // Action intents - no widget, trigger action
  "trigger_search": null,
  "delegate_choice": null,
  
  // Other intents - no widget
  "cancel_or_restart": null,
  "ask_question": null,
  "greeting": null,
  "thank_you": null,
  "other": null,
};

/**
 * Hook options
 */
export interface UseIntentHandlerOptions {
  memory: FlightMemory;
  onShowWidget?: (widgetType: WidgetType, data?: Record<string, unknown>) => void;
  onTriggerSearch?: () => void;
  onDelegateChoice?: (intent: IntentClassification) => void;
}

/**
 * Hook return type
 */
export interface UseIntentHandlerReturn {
  /** Process an intent classification from the backend */
  processIntent: (intent: IntentClassification | null) => {
    shouldShowWidget: boolean;
    widgetType: WidgetType | null;
    widgetData?: Record<string, unknown>;
    action?: "search" | "delegate" | "none";
  };
  
  /** Get the last processed intent */
  lastIntent: IntentClassification | null;
  
  /** Check if a widget can be shown based on current flow state */
  canShowWidget: (widgetType: WidgetType) => boolean;
}

/**
 * Hook for handling intent classification
 */
export function useIntentHandler(options: UseIntentHandlerOptions): UseIntentHandlerReturn {
  const { memory, onShowWidget, onTriggerSearch, onDelegateChoice } = options;
  
  const lastIntentRef = useRef<IntentClassification | null>(null);
  
  /**
   * Check if a widget can be shown based on current flow state
   */
  const canShowWidget = useCallback((widgetType: WidgetType): boolean => {
    const hasDestination = !!memory.arrival?.city;
    const hasDates = !!memory.departureDate;
    const hasTravelers = (memory.passengers?.adults ?? 0) >= 1;
    
    switch (widgetType) {
      case "citySelector":
        // Can always show city selector when country is detected
        return true;
        
      case "datePicker":
      case "dateRangePicker":
        // Need destination first
        return hasDestination;
        
      case "travelersSelector":
        // Need dates first
        return hasDestination && hasDates;
        
      case "tripTypeConfirm":
        // Need travelers first
        return hasDestination && hasDates && hasTravelers;
        
      case "travelersConfirmBeforeSearch":
        // Ready to search
        return hasDestination && hasDates && hasTravelers;
        
      // Preference widgets can be shown anytime
      case "preferenceStyle":
      case "preferenceInterests":
      case "destinationSuggestions":
        return true;
        
      default:
        return true;
    }
  }, [memory]);
  
  /**
   * Get the next required widget based on flow state
   */
  const getNextRequiredWidget = useCallback((): WidgetType | null => {
    const hasDestination = !!memory.arrival?.city;
    const hasDates = !!memory.departureDate;
    const hasTravelers = (memory.passengers?.adults ?? 0) >= 1;
    const tripType = memory.tripType || "roundtrip";
    const hasReturn = tripType === "oneway" || !!memory.returnDate;
    
    if (!hasDestination) return "citySelector";
    if (!hasDates) return tripType === "roundtrip" ? "dateRangePicker" : "datePicker";
    if (tripType === "roundtrip" && !hasReturn) return "dateRangePicker";
    if (!hasTravelers) return "travelersSelector";
    
    return null;
  }, [memory]);
  
  /**
   * Process an intent classification
   */
  const processIntent = useCallback((intent: IntentClassification | null) => {
    lastIntentRef.current = intent;
    
    if (!intent) {
      return { shouldShowWidget: false, widgetType: null, action: "none" as const };
    }
    
    // Log intent for debugging
    console.log("[IntentHandler] Processing intent:", intent.primaryIntent, "confidence:", intent.confidence);
    
    // Check confidence level
    if (intent.confidence < CONFIDENCE_THRESHOLDS.LOW) {
      console.log("[IntentHandler] Low confidence, skipping widget");
      return { shouldShowWidget: false, widgetType: null, action: "none" as const };
    }
    
    // Handle special actions
    if (intent.primaryIntent === "trigger_search") {
      if (onTriggerSearch) onTriggerSearch();
      return { shouldShowWidget: false, widgetType: null, action: "search" as const };
    }
    
    if (intent.primaryIntent === "delegate_choice") {
      if (onDelegateChoice) onDelegateChoice(intent);
      return { shouldShowWidget: false, widgetType: null, action: "delegate" as const };
    }
    
    // Check if backend specified a widget
    if (intent.widgetToShow?.type) {
      const widgetType = intent.widgetToShow.type as WidgetType;
      
      if (canShowWidget(widgetType)) {
        if (onShowWidget) {
          onShowWidget(widgetType, intent.widgetToShow.data);
        }
        return {
          shouldShowWidget: true,
          widgetType,
          widgetData: intent.widgetToShow.data,
          action: "none" as const,
        };
      }
      
      // Widget can't be shown, try fallback
      const fallback = getNextRequiredWidget();
      if (fallback && onShowWidget) {
        onShowWidget(fallback);
      }
      return {
        shouldShowWidget: !!fallback,
        widgetType: fallback,
        action: "none" as const,
      };
    }
    
    // Use intent-to-widget mapping
    const mappedWidget = INTENT_WIDGET_MAP[intent.primaryIntent];
    
    if (mappedWidget && canShowWidget(mappedWidget)) {
      // Build widget data from entities
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
      
      if (onShowWidget) {
        onShowWidget(mappedWidget, Object.keys(widgetData).length > 0 ? widgetData : undefined);
      }
      
      return {
        shouldShowWidget: true,
        widgetType: mappedWidget,
        widgetData: Object.keys(widgetData).length > 0 ? widgetData : undefined,
        action: "none" as const,
      };
    }
    
    return { shouldShowWidget: false, widgetType: null, action: "none" as const };
  }, [canShowWidget, getNextRequiredWidget, onShowWidget, onTriggerSearch, onDelegateChoice]);
  
  return {
    processIntent,
    lastIntent: lastIntentRef.current,
    canShowWidget,
  };
}

export default useIntentHandler;
