/**
 * Unified Intent Router Hook (Phase 2 - Intent Unification)
 *
 * This hook combines the functionality of useIntentHandler and useIntentRouter
 * into a single source of truth for widget triggering based on:
 * 1. Backend intent classification (primary source of truth)
 * 2. Flow state validation (prerequisites check)
 * 3. Fallback logic when backend classification fails
 * 4. Detection of already-provided information to avoid redundant widgets
 */

import { useCallback, useMemo, useRef } from "react";
import type { FlightMemory } from "@/stores/hooks";
import type { WidgetType } from "@/types/flight";
import type { IntentClassification } from "./useChatStream";
import type { WidgetInteraction } from "@/contexts/WidgetHistoryContext";
import { boostIntentConfidence } from "../services/intentConfidenceBooster";

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
  /** Widget interaction history from useWidgetTracking */
  widgetInteractions?: WidgetInteraction[];
  /** Last user message for confidence boosting */
  lastUserMessage?: string;
  /** Last assistant message for context */
  lastAssistantMessage?: string;
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

  /** Check if user already provided data for this widget type */
  hasAlreadyProvided: (widgetType: WidgetType) => boolean;

  /** Adaptive check: should we show this widget based on user behavior? */
  shouldShowWidgetAdaptive: (widgetType: WidgetType) => boolean;

  /** Get the next required widget based on flow state */
  getNextRequiredWidget: () => WidgetType | null;

  /** Get current flow state */
  flowState: FlowState;

  /** Get detected user behavior */
  userBehavior: UserBehavior;

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
 * User behavior detection for adaptive widget triggering
 */
export interface UserBehavior {
  /** User prefers using widgets vs typing directly */
  prefersWidgets: boolean;
  /** Completion rate of shown widgets (0-1) */
  completionRate: number;
  /** User interaction style: "guided" needs more widgets, "expert" fewer */
  style: "guided" | "expert";
}

/**
 * Critical widgets that should always be shown regardless of user behavior
 * These collect essential information for flight search
 */
const CRITICAL_WIDGETS: WidgetType[] = [
  "citySelector",
  "dateRangePicker",
  "datePicker",
  "travelersSelector",
];

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
  
  // Phase 4/5 widgets - pending implementation
  comparisonWidget: () => ({ valid: true }),
  conflictAlert: () => ({ valid: true }),
  priceAlert: () => ({ valid: true }),
};

/**
 * Widget type to interaction type mapping
 * Used to check if user already provided data for a widget type
 */
const WIDGET_TO_INTERACTION_MAP: Record<string, string[]> = {
  travelersSelector: ["travelers_selected"],
  travelersConfirmBeforeSearch: ["travelers_selected"],
  dateRangePicker: ["date_range_selected"],
  datePicker: ["date_selected"],
  returnDatePicker: ["date_selected"],
  citySelector: ["city_selected", "destination_selected"],
  destinationSuggestions: ["destination_selected"],
  tripTypeConfirm: ["trip_type_selected"],
  airportConfirmation: ["airport_selected"],
  preferenceStyle: ["style_configured"],
  preferenceInterests: ["interests_selected"],
  mustHaves: ["must_haves_configured"],
  dietary: ["dietary_configured"],
};

/**
 * Unified Intent Router Hook
 */
export function useUnifiedIntentRouter({
  memory,
  widgetInteractions = [],
  lastUserMessage,
  lastAssistantMessage,
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
   * Detect user behavior based on widget interaction history
   * This helps adapt the widget triggering strategy
   */
  const userBehavior = useMemo<UserBehavior>(() => {
    // Count completed vs dismissed/ignored interactions
    const completedTypes = [
      "date_selected",
      "date_range_selected",
      "travelers_selected",
      "trip_type_selected",
      "city_selected",
      "destination_selected",
      "style_configured",
      "interests_selected",
    ];

    const completed = widgetInteractions.filter((i) =>
      completedTypes.includes(i.interactionType)
    ).length;

    // If no interactions yet, default to guided mode
    if (widgetInteractions.length === 0) {
      return {
        prefersWidgets: true,
        completionRate: 1,
        style: "guided" as const,
      };
    }

    // Calculate completion rate (completed / total relevant interactions)
    const totalRelevant = widgetInteractions.length;
    const completionRate = totalRelevant > 0 ? completed / totalRelevant : 1;

    // Determine style based on completion rate
    // High completion rate = user likes widgets (guided)
    // Low completion rate = user prefers typing (expert)
    const style = completionRate >= 0.5 ? "guided" : "expert";
    const prefersWidgets = completionRate >= 0.5;

    return {
      prefersWidgets,
      completionRate,
      style: style as "guided" | "expert",
    };
  }, [widgetInteractions]);

  /**
   * Validate if a widget can be shown
   */
  const canShowWidget = useCallback(
    (widgetType: WidgetType): WidgetValidation => {
      const validator = WIDGET_PREREQUISITES[widgetType];
      if (!validator) {
        return { valid: true };
      }
      return validator(flowState);
    },
    [flowState]
  );

  /**
   * Check if user already provided data for this widget type via a previous widget interaction
   * This prevents showing redundant widgets for already-provided information
   */
  const hasAlreadyProvided = useCallback(
    (widgetType: WidgetType): boolean => {
      const interactionTypes = WIDGET_TO_INTERACTION_MAP[widgetType];
      if (!interactionTypes || interactionTypes.length === 0) {
        return false;
      }

      // Check if any interaction matches the widget's expected types
      return widgetInteractions.some((interaction) =>
        interactionTypes.includes(interaction.interactionType)
      );
    },
    [widgetInteractions]
  );

  /**
   * Adaptive widget display based on user behavior
   * Critical widgets are always shown, non-critical only for guided users
   */
  const shouldShowWidgetAdaptive = useCallback(
    (widgetType: WidgetType): boolean => {
      // Critical widgets are always shown
      if (CRITICAL_WIDGETS.includes(widgetType)) {
        return true;
      }

      // For expert users, skip non-critical widgets
      if (userBehavior.style === "expert") {
        console.log(
          `[UnifiedIntentRouter] Skipping non-critical widget "${widgetType}" for expert user`
        );
        return false;
      }

      // Guided users get all widgets
      return true;
    },
    [userBehavior.style]
  );

  /**
   * Get the next required widget based on flow state
   * Now checks hasAlreadyProvided to avoid redundant widgets
   */
  const getNextRequiredWidget = useCallback((): WidgetType | null => {
    // Priority order for collecting data
    // Each check now also verifies the user hasn't already provided this via widget

    if (!flowState.hasDestinationCity && !hasAlreadyProvided("citySelector")) {
      return "citySelector";
    }

    if (!flowState.hasDepartureDate) {
      const dateWidget = flowState.tripType === "roundtrip" ? "dateRangePicker" : "datePicker";
      if (!hasAlreadyProvided(dateWidget)) {
        return dateWidget;
      }
    }

    if (flowState.tripType === "roundtrip" && !flowState.hasReturnDate) {
      if (!hasAlreadyProvided("dateRangePicker")) {
        return "dateRangePicker";
      }
    }

    if (!flowState.hasTravelers && !hasAlreadyProvided("travelersSelector")) {
      return "travelersSelector";
    }

    if (!flowState.hasTripType && !hasAlreadyProvided("tripTypeConfirm")) {
      return "tripTypeConfirm";
    }

    if (flowState.isReadyToSearch && !hasAlreadyProvided("travelersConfirmBeforeSearch")) {
      return "travelersConfirmBeforeSearch";
    }

    return null;
  }, [flowState, hasAlreadyProvided]);

  /**
   * Process a backend intent classification
   * This is the main entry point - trusts the backend as source of truth
   * Now enhanced with frontend confidence boosting
   */
  const processIntent = useCallback((intent: IntentClassification | null): IntentProcessResult => {
    lastIntentRef.current = intent;
    
    if (!intent) {
      return { shouldShowWidget: false, widgetType: null, action: "none" };
    }
    
    // BOOST CONFIDENCE: Cross-reference with frontend analysis
    const boostResult = boostIntentConfidence(intent, lastUserMessage || '', lastAssistantMessage);
    const effectiveConfidence = boostResult.boostedConfidence;
    
    console.log("[UnifiedIntentRouter] Processing intent:", intent.primaryIntent, 
      "original:", intent.confidence, "boosted:", effectiveConfidence,
      "lang:", boostResult.detectedLanguage);
    
    // Handle undecided users with delegate suggestion
    if (boostResult.suggestedIntent === 'delegate_choice' && boostResult.frontendSignals.isUndecided) {
      if (onDelegateChoice) onDelegateChoice(intent);
      return { shouldShowWidget: false, widgetType: null, action: "delegate" };
    }
    
    // Check boosted confidence level (not original)
    if (effectiveConfidence < CONFIDENCE_THRESHOLDS.LOW && boostResult.shouldClarify) {
      console.log("[UnifiedIntentRouter] Low confidence after boost, requesting clarification");
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
      "express_preference",
      "express_constraint",
    ];
    
    // PREFERENCE INTENT → WIDGET MAPPING
    // Check for preference-related intents and trigger appropriate widgets
    const PREFERENCE_KEYWORD_TRIGGERS: Array<{
      keywords: string[];
      widgetType: WidgetType;
    }> = [
      // Dietary restrictions (FR + EN)
      { 
        keywords: ["végétarien", "vegan", "végan", "halal", "casher", "kosher", "sans gluten", "gluten-free", "lactose", "allergie", "allergy", "régime", "diet", "restriction alimentaire", "dietary", "je mange"],
        widgetType: "dietary" 
      },
      // Accessibility / Must-haves (FR + EN)
      { 
        keywords: ["fauteuil", "wheelchair", "mobilité réduite", "mobility", "pmr", "handicap", "disability", "accessible", "chien", "dog", "chat", "cat", "animal de compagnie", "pet", "wifi obligatoire", "piscine obligatoire"],
        widgetType: "mustHaves" 
      },
      // Interests (FR + EN)
      { 
        keywords: ["j'aime la plage", "j'aime la culture", "j'aime la nature", "gastronomie", "aventure", "sport", "musées", "museums", "shopping", "nightlife", "vie nocturne"],
        widgetType: "preferenceInterests" 
      },
      // Style (FR + EN)
      { 
        keywords: ["voyage luxe", "luxury trip", "économique", "budget trip", "backpacker", "haut de gamme", "premium"],
        widgetType: "preferenceStyle" 
      },
    ];
    
    // Check if user message contains preference keywords
    if (lastUserMessage && (intent.primaryIntent === "express_preference" || intent.primaryIntent === "express_constraint")) {
      const messageLower = lastUserMessage.toLowerCase();
      
      for (const trigger of PREFERENCE_KEYWORD_TRIGGERS) {
        const matchedKeyword = trigger.keywords.find(kw => messageLower.includes(kw));
        if (matchedKeyword) {
          const validation = canShowWidget(trigger.widgetType);
          if (validation.valid) {
            console.log(`[UnifiedIntentRouter] Preference keyword matched: "${matchedKeyword}" → ${trigger.widgetType}`);
            if (onWidgetTriggered) {
              onWidgetTriggered(trigger.widgetType);
            }
            return {
              shouldShowWidget: true,
              widgetType: trigger.widgetType,
              action: "none",
              reason: `User mentioned "${matchedKeyword}"`,
            };
          }
        }
      }
      
      // Check entities from intent classification
      if (intent.entities) {
        const entities = intent.entities as Record<string, unknown>;
        if (entities.dietaryRestrictions && canShowWidget("dietary").valid) {
          if (onWidgetTriggered) onWidgetTriggered("dietary");
          return { shouldShowWidget: true, widgetType: "dietary", action: "none", reason: "Dietary restrictions detected" };
        }
        if ((entities.accessibilityRequired || entities.petFriendly) && canShowWidget("mustHaves").valid) {
          if (onWidgetTriggered) onWidgetTriggered("mustHaves");
          return { shouldShowWidget: true, widgetType: "mustHaves", action: "none", reason: "Must-haves detected" };
        }
        if (entities.interests && canShowWidget("preferenceInterests").valid) {
          if (onWidgetTriggered) onWidgetTriggered("preferenceInterests");
          return { shouldShowWidget: true, widgetType: "preferenceInterests", action: "none", reason: "Interests detected" };
        }
        if (entities.budgetLevel && canShowWidget("preferenceStyle").valid) {
          if (onWidgetTriggered) onWidgetTriggered("preferenceStyle");
          return { shouldShowWidget: true, widgetType: "preferenceStyle", action: "none", reason: "Budget/style detected" };
        }
      }
    }
    
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
  }, [canShowWidget, getNextRequiredWidget, onWidgetTriggered, onSearchTriggered, onDelegateChoice, lastUserMessage]);

  return {
    processIntent,
    canShowWidget,
    hasAlreadyProvided,
    shouldShowWidgetAdaptive,
    getNextRequiredWidget,
    flowState,
    userBehavior,
    lastIntent: lastIntentRef.current,
  };
}

export default useUnifiedIntentRouter;
