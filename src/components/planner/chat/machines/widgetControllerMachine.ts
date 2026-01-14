/**
 * Widget Controller State Machine
 * 
 * Centralized XState machine for managing widget display and transitions.
 * This machine ensures only one widget is shown at a time and handles
 * the complete flow of data collection for flight booking.
 */

import { createMachine, assign } from "xstate";
import type { WidgetType, CitySelectionData } from "@/types/flight";
import type { ClassifiedIntent, ExtractedEntities, IntentType } from "../types/intent";

/**
 * Traveler configuration
 */
export interface TravelerConfig {
  adults: number;
  children: number;
  infants: number;
}

/**
 * Collected flight data
 */
export interface CollectedFlightData {
  // Destination
  destinationCity?: string;
  destinationCountry?: string;
  destinationCountryCode?: string;
  
  // Departure
  departureCity?: string;
  departureCountry?: string;
  departureCountryCode?: string;
  
  // Dates
  departureDate?: Date;
  returnDate?: Date;
  tripDuration?: string;
  preferredMonth?: string;
  
  // Travelers
  travelers: TravelerConfig;
  travelStyle?: "solo" | "couple" | "family" | "friends" | "group";
  
  // Trip type
  tripType: "roundtrip" | "oneway" | "multi";
}

/**
 * Widget display state
 */
export interface ActiveWidget {
  type: WidgetType;
  reason: string;
  data?: Record<string, unknown>;
  shownAt: Date;
}

/**
 * Machine context
 */
export interface WidgetControllerContext {
  // Collected data
  collected: CollectedFlightData;
  
  // Current widget
  activeWidget: ActiveWidget | null;
  
  // Widget history for tracking
  widgetHistory: Array<{
    type: WidgetType;
    action: "shown" | "completed" | "dismissed";
    timestamp: Date;
    value?: unknown;
  }>;
  
  // Last classified intent
  lastIntent: ClassifiedIntent | null;
  
  // Pending data from city selection
  pendingCountryForCitySelection?: {
    countryCode: string;
    countryName: string;
    field: "from" | "to";
  };
  
  // Errors
  error: string | null;
}

/**
 * Machine events
 */
export type WidgetControllerEvent =
  // Intent received from backend
  | { type: "INTENT_RECEIVED"; intent: ClassifiedIntent }
  
  // Widget interactions
  | { type: "SHOW_WIDGET"; widgetType: WidgetType; reason: string; data?: Record<string, unknown> }
  | { type: "WIDGET_COMPLETED"; widgetType: WidgetType; value: unknown }
  | { type: "WIDGET_DISMISSED"; widgetType: WidgetType }
  
  // User selections
  | { type: "CITY_SELECTED"; city: string; country: string; countryCode: string; field: "from" | "to" }
  | { type: "DATE_SELECTED"; dateType: "departure" | "return"; date: Date }
  | { type: "DATE_RANGE_SELECTED"; departure: Date; returnDate: Date }
  | { type: "TRAVELERS_SELECTED"; travelers: TravelerConfig }
  | { type: "TRIP_TYPE_SELECTED"; tripType: "roundtrip" | "oneway" | "multi" }
  
  // Flow control
  | { type: "TRIGGER_SEARCH" }
  | { type: "RESET" }
  | { type: "ERROR"; message: string };

/**
 * Initial context
 */
const initialContext: WidgetControllerContext = {
  collected: {
    travelers: { adults: 1, children: 0, infants: 0 },
    tripType: "roundtrip"
  },
  activeWidget: null,
  widgetHistory: [],
  lastIntent: null,
  error: null
};

/**
 * Helper: Check if ready to search
 */
function isReadyToSearch(collected: CollectedFlightData): boolean {
  return !!(
    collected.destinationCity &&
    collected.departureDate &&
    (collected.tripType === "oneway" || collected.returnDate) &&
    collected.travelers.adults >= 1
  );
}

/**
 * Helper: Determine next widget based on collected data
 */
function getNextWidget(collected: CollectedFlightData): { type: WidgetType; reason: string } | null {
  if (!collected.destinationCity) {
    return { type: "citySelector", reason: "Need destination city" };
  }
  if (!collected.departureDate) {
    return collected.tripType === "roundtrip" 
      ? { type: "dateRangePicker", reason: "Need travel dates" }
      : { type: "datePicker", reason: "Need departure date" };
  }
  if (collected.tripType === "roundtrip" && !collected.returnDate) {
    return { type: "dateRangePicker", reason: "Need return date" };
  }
  if (collected.travelers.adults < 1) {
    return { type: "travelersSelector", reason: "Need traveler count" };
  }
  if (isReadyToSearch(collected)) {
    return { type: "tripTypeConfirm", reason: "Confirm trip type before search" };
  }
  return null;
}

/**
 * Widget Controller Machine
 */
export const widgetControllerMachine = createMachine({
  id: "widgetController",
  initial: "idle",
  context: initialContext,
  
  states: {
    /**
     * Idle - No widget active, waiting for intent or user action
     */
    idle: {
      on: {
        INTENT_RECEIVED: {
          target: "processingIntent",
          actions: assign({
            lastIntent: ({ event }) => event.intent
          })
        },
        
        SHOW_WIDGET: {
          target: "widgetActive",
          actions: assign({
            activeWidget: ({ event }) => ({
              type: event.widgetType,
              reason: event.reason,
              data: event.data,
              shownAt: new Date()
            }),
            widgetHistory: ({ context, event }) => [
              ...context.widgetHistory,
              { type: event.widgetType, action: "shown" as const, timestamp: new Date() }
            ]
          })
        },
        
        RESET: {
          actions: assign(() => initialContext)
        }
      }
    },
    
    /**
     * Processing intent from backend
     */
    processingIntent: {
      always: [
        // If intent has widget to show
        {
          target: "widgetActive",
          guard: ({ context }) => {
            const intent = context.lastIntent;
            return !!(intent?.widgets && intent.widgets.length > 0);
          },
          actions: assign({
            activeWidget: ({ context }) => {
              const widget = context.lastIntent!.widgets[0];
              return {
                type: widget.type,
                reason: widget.reason,
                data: widget.data,
                shownAt: new Date()
              };
            },
            widgetHistory: ({ context }) => {
              const widget = context.lastIntent!.widgets[0];
              return [
                ...context.widgetHistory,
                { type: widget.type, action: "shown" as const, timestamp: new Date() }
              ];
            }
          })
        },
        
        // If intent extracted entities, update collected data
        {
          target: "evaluating",
          actions: assign({
            collected: ({ context }) => {
              const entities = context.lastIntent?.entities || {};
              const current = context.collected;
              
              return {
                ...current,
                destinationCity: entities.destinationCity || current.destinationCity,
                destinationCountry: entities.destinationCountry || current.destinationCountry,
                destinationCountryCode: entities.destinationCountryCode || current.destinationCountryCode,
                departureCity: entities.departureCity || current.departureCity,
                travelers: entities.adults 
                  ? {
                      adults: entities.adults,
                      children: entities.children || 0,
                      infants: entities.infants || 0
                    }
                  : current.travelers,
                travelStyle: entities.travelStyle || current.travelStyle
              };
            }
          })
        }
      ]
    },
    
    /**
     * Evaluating state - determine next widget
     */
    evaluating: {
      always: [
        // Ready to search
        {
          target: "readyToSearch",
          guard: ({ context }) => isReadyToSearch(context.collected)
        },
        
        // Show next required widget
        {
          target: "widgetActive",
          guard: ({ context }) => !!getNextWidget(context.collected),
          actions: assign({
            activeWidget: ({ context }) => {
              const next = getNextWidget(context.collected)!;
              return {
                type: next.type,
                reason: next.reason,
                shownAt: new Date()
              };
            },
            widgetHistory: ({ context }) => {
              const next = getNextWidget(context.collected)!;
              return [
                ...context.widgetHistory,
                { type: next.type, action: "shown" as const, timestamp: new Date() }
              ];
            }
          })
        },
        
        // Nothing to do, go idle
        { target: "idle" }
      ]
    },
    
    /**
     * Widget is active and waiting for user interaction
     */
    widgetActive: {
      on: {
        WIDGET_COMPLETED: {
          target: "evaluating",
          actions: assign({
            widgetHistory: ({ context, event }) => [
              ...context.widgetHistory,
              { 
                type: event.widgetType, 
                action: "completed" as const, 
                timestamp: new Date(),
                value: event.value
              }
            ],
            activeWidget: null
          })
        },
        
        WIDGET_DISMISSED: {
          target: "idle",
          actions: assign({
            widgetHistory: ({ context, event }) => [
              ...context.widgetHistory,
              { type: event.widgetType, action: "dismissed" as const, timestamp: new Date() }
            ],
            activeWidget: null
          })
        },
        
        // Direct selection events
        CITY_SELECTED: {
          target: "evaluating",
          actions: assign({
            collected: ({ context, event }) => ({
              ...context.collected,
              [event.field === "to" ? "destinationCity" : "departureCity"]: event.city,
              [event.field === "to" ? "destinationCountry" : "departureCountry"]: event.country,
              [event.field === "to" ? "destinationCountryCode" : "departureCountryCode"]: event.countryCode
            }),
            activeWidget: null,
            widgetHistory: ({ context }) => [
              ...context.widgetHistory,
              { type: "citySelector" as WidgetType, action: "completed" as const, timestamp: new Date() }
            ]
          })
        },
        
        DATE_SELECTED: {
          target: "evaluating",
          actions: assign({
            collected: ({ context, event }) => ({
              ...context.collected,
              [event.dateType === "departure" ? "departureDate" : "returnDate"]: event.date
            }),
            activeWidget: null,
            widgetHistory: ({ context }) => [
              ...context.widgetHistory,
              { type: "datePicker" as WidgetType, action: "completed" as const, timestamp: new Date() }
            ]
          })
        },
        
        DATE_RANGE_SELECTED: {
          target: "evaluating",
          actions: assign({
            collected: ({ context, event }) => ({
              ...context.collected,
              departureDate: event.departure,
              returnDate: event.returnDate
            }),
            activeWidget: null,
            widgetHistory: ({ context }) => [
              ...context.widgetHistory,
              { type: "dateRangePicker" as WidgetType, action: "completed" as const, timestamp: new Date() }
            ]
          })
        },
        
        TRAVELERS_SELECTED: {
          target: "evaluating",
          actions: assign({
            collected: ({ context, event }) => ({
              ...context.collected,
              travelers: event.travelers
            }),
            activeWidget: null,
            widgetHistory: ({ context }) => [
              ...context.widgetHistory,
              { type: "travelersSelector" as WidgetType, action: "completed" as const, timestamp: new Date() }
            ]
          })
        },
        
        TRIP_TYPE_SELECTED: {
          target: "evaluating",
          actions: assign({
            collected: ({ context, event }) => ({
              ...context.collected,
              tripType: event.tripType
            }),
            activeWidget: null,
            widgetHistory: ({ context }) => [
              ...context.widgetHistory,
              { type: "tripTypeConfirm" as WidgetType, action: "completed" as const, timestamp: new Date() }
            ]
          })
        },
        
        // Handle new intent while widget is active
        INTENT_RECEIVED: {
          target: "processingIntent",
          actions: assign({
            lastIntent: ({ event }) => event.intent,
            activeWidget: null // Close current widget
          })
        },
        
        RESET: {
          target: "idle",
          actions: assign(() => initialContext)
        }
      }
    },
    
    /**
     * Ready to search - all required data collected
     */
    readyToSearch: {
      on: {
        TRIGGER_SEARCH: {
          target: "searching"
        },
        
        INTENT_RECEIVED: {
          target: "processingIntent",
          actions: assign({
            lastIntent: ({ event }) => event.intent
          })
        },
        
        RESET: {
          target: "idle",
          actions: assign(() => initialContext)
        }
      }
    },
    
    /**
     * Search in progress
     */
    searching: {
      on: {
        WIDGET_COMPLETED: {
          target: "idle"
        },
        
        ERROR: {
          target: "readyToSearch",
          actions: assign({
            error: ({ event }) => event.message
          })
        },
        
        RESET: {
          target: "idle",
          actions: assign(() => initialContext)
        }
      }
    }
  }
});

/**
 * Export types
 */
export type WidgetControllerState = typeof widgetControllerMachine;
export type WidgetControllerSnapshot = ReturnType<typeof widgetControllerMachine.getInitialSnapshot>;
