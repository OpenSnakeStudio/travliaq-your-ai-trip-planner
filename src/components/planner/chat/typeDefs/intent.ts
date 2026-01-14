/**
 * Intent Classification Types
 * 
 * Centralized type definitions for the intent classification system.
 * This module defines all possible user intents, widget mappings, and validation rules.
 */

import type { WidgetType } from "@/types/flight";
export type IntentType =
  // Destination intents
  | "search_destination"      // User is looking for destination ideas
  | "provide_destination"     // User provides a specific destination (city or country)
  | "provide_departure_city"  // User provides departure city
  
  // Date intents
  | "provide_dates"           // User provides travel dates
  | "provide_duration"        // User provides trip duration
  | "flexible_dates"          // User has flexible dates
  
  // Travelers intents
  | "provide_travelers"       // User provides traveler count
  | "specify_composition"     // User specifies traveler composition (family, couple, etc.)
  
  // Preference intents
  | "express_preference"      // User expresses travel preferences
  | "express_constraint"      // User expresses constraints (budget, accessibility, etc.)
  
  // Inspiration intents
  | "ask_inspiration"         // User wants destination inspiration
  | "ask_recommendations"     // User asks for recommendations
  
  // Comparison/selection intents
  | "compare_options"         // User wants to compare options
  | "confirm_selection"       // User confirms a selection
  | "modify_selection"        // User wants to modify a previous selection
  
  // Action intents
  | "trigger_search"          // User wants to launch search
  | "delegate_choice"         // User asks AI to choose for them
  | "cancel_or_restart"       // User wants to cancel or start over
  
  // General intents
  | "ask_question"            // User asks a general question
  | "greeting"                // User greets
  | "thank_you"               // User thanks
  | "other";                  // Unclassified intent

/**
 * Extracted entities from user message
 */
export interface ExtractedEntities {
  // Location entities
  destinationCity?: string;
  destinationCountry?: string;
  destinationCountryCode?: string;
  departureCity?: string;
  departureCountry?: string;
  departureCountryCode?: string;
  
  // Date entities
  exactDepartureDate?: string;
  exactReturnDate?: string;
  preferredMonth?: string;
  preferredSeason?: string;
  tripDuration?: string;
  
  // Traveler entities
  adults?: number;
  children?: number;
  infants?: number;
  travelStyle?: "solo" | "couple" | "family" | "friends" | "group";
  
  // Preference entities
  budgetLevel?: "budget" | "moderate" | "luxury";
  interests?: string[];
  constraints?: string[];
  
  // Selection entities
  selectedOption?: string;
  selectedWidgetType?: string;
}

/**
 * Widget to be shown based on intent
 */
export interface IntentWidget {
  type: WidgetType;
  priority: number;
  reason: string;
  data?: Record<string, unknown>;
}

/**
 * Classified intent from backend
 */
export interface ClassifiedIntent {
  primaryIntent: IntentType;
  secondaryIntent?: IntentType;
  confidence: number; // 0-100
  entities: ExtractedEntities;
  widgets: IntentWidget[];
  nextExpectedIntent?: IntentType;
  requiresClarification?: boolean;
  clarificationQuestion?: string;
}

/**
 * Flow state representing what data is collected
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
 * Intent-to-widget mapping rule
 */
export interface IntentWidgetRule {
  intent: IntentType;
  widgets: Array<{
    type: WidgetType;
    condition?: (flowState: FlowState, entities: ExtractedEntities) => boolean;
    priority: number;
    reason: string;
  }>;
}

/**
 * Intent priority order for flow control
 */
export const INTENT_PRIORITY_ORDER: IntentType[] = [
  "provide_destination",
  "provide_dates",
  "provide_duration",
  "provide_travelers",
  "provide_departure_city",
  "trigger_search",
];

/**
 * Widget priority order (which widget to show first when multiple are needed)
 */
export const WIDGET_PRIORITY_ORDER = [
  "citySelector",
  "dateRangePicker",
  "datePicker",
  "travelersSelector",
  "tripTypeConfirm",
  "travelersConfirmBeforeSearch",
] as const;

/**
 * Minimum confidence thresholds
 */
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 80,
  MEDIUM: 60,
  LOW: 40,
  CLARIFY: 50, // Below this, ask for clarification
} as const;
