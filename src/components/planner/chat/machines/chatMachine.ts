/**
 * Chat State Machine - XState v5
 *
 * Manages the conversational flow state for the travel planner chat.
 * This machine handles widget sequencing and data collection flow.
 */

import { createMachine, assign } from "xstate";
import type { FlightMemory, AirportInfo, MissingField } from "@/contexts/FlightMemoryContext";
import type { WidgetType, CitySelectionData } from "@/types/flight";

/**
 * Traveler counts
 */
export interface TravelerCounts {
  adults: number;
  children: number;
  infants: number;
}

/**
 * Chat message for the machine
 */
export interface MachineMessage {
  id: string;
  role: "assistant" | "user" | "system";
  text: string;
  widget?: WidgetType;
  widgetData?: {
    preferredMonth?: string;
    tripDuration?: string;
    citySelection?: CitySelectionData;
    isDeparture?: boolean;
  };
  isTyping?: boolean;
  isStreaming?: boolean;
}

/**
 * Machine context - all the data the machine tracks
 */
export interface ChatMachineContext {
  // Flight memory snapshot
  departure: AirportInfo | null;
  arrival: AirportInfo | null;
  departureDate: Date | null;
  returnDate: Date | null;
  tripType: "roundtrip" | "oneway" | "multi";
  passengers: TravelerCounts;

  // Pending widget data
  pendingTripDuration: string | null;
  pendingPreferredMonth: string | null;
  pendingTravelersWidget: boolean;

  // Flow tracking
  citySelectionShownForCountry: string | null;
  searchButtonShown: boolean;

  // Current widget
  currentWidget: WidgetType | null;

  // Error state
  error: string | null;
}

/**
 * Events the machine can receive
 */
export type ChatMachineEvent =
  | { type: "USER_MESSAGE"; text: string }
  | { type: "STREAM_START" }
  | { type: "STREAM_CONTENT"; content: string }
  | { type: "STREAM_COMPLETE"; content: string; flightData?: any }
  | { type: "STREAM_ERROR"; error: string }
  | { type: "COUNTRY_DETECTED"; countryCode: string; countryName: string; field: "from" | "to" }
  | { type: "CITY_SELECTED"; city: string; country: string; countryCode: string }
  | { type: "DATE_SELECTED"; dateType: "departure" | "return"; date: Date }
  | { type: "DATE_RANGE_SELECTED"; departure: Date; returnDate: Date }
  | { type: "TRAVELERS_SELECTED"; travelers: TravelerCounts }
  | { type: "TRIP_TYPE_CONFIRMED"; tripType: "roundtrip" | "oneway" | "multi" }
  | { type: "AIRPORT_SELECTED"; field: "from" | "to"; iata: string }
  | { type: "SEARCH_TRIGGERED" }
  | { type: "RESET" };

/**
 * Initial context values
 */
const initialContext: ChatMachineContext = {
  departure: null,
  arrival: null,
  departureDate: null,
  returnDate: null,
  tripType: "roundtrip",
  passengers: { adults: 1, children: 0, infants: 0 },

  pendingTripDuration: null,
  pendingPreferredMonth: null,
  pendingTravelersWidget: false,

  citySelectionShownForCountry: null,
  searchButtonShown: false,

  currentWidget: null,
  error: null,
};

/**
 * The chat state machine
 */
export const chatMachine = createMachine({
  id: "plannerChat",
  initial: "idle",
  context: initialContext,

  states: {
    /**
     * Idle - Waiting for user input
     */
    idle: {
      on: {
        USER_MESSAGE: {
          target: "processing",
        },
        COUNTRY_DETECTED: {
          target: "awaitingCitySelection",
          actions: assign({
            citySelectionShownForCountry: ({ event }) =>
              `${event.field}-${event.countryCode}`,
          }),
        },
        RESET: {
          actions: assign(() => initialContext),
        },
      },
    },

    /**
     * Processing - Streaming response from AI
     */
    processing: {
      on: {
        STREAM_COMPLETE: {
          target: "evaluating",
          actions: assign({
            error: null,
          }),
        },
        STREAM_ERROR: {
          target: "idle",
          actions: assign({
            error: ({ event }) => event.error,
          }),
        },
      },
    },

    /**
     * Evaluating - Determine next widget based on state
     */
    evaluating: {
      always: [
        {
          target: "awaitingCitySelection",
          guard: ({ context }) => !context.arrival?.city,
        },
        {
          target: "awaitingDateSelection",
          guard: ({ context }) => !context.departureDate,
        },
        {
          target: "awaitingReturnDate",
          guard: ({ context }) =>
            context.tripType === "roundtrip" && !context.returnDate,
        },
        {
          target: "awaitingTravelers",
          guard: ({ context }) => context.passengers.adults < 1,
        },
        {
          target: "awaitingTripType",
          guard: ({ context }) => context.pendingTravelersWidget,
        },
        {
          target: "ready",
          guard: ({ context }) => isReadyToSearch(context),
        },
        { target: "idle" },
      ],
    },

    /**
     * Awaiting city selection from country
     */
    awaitingCitySelection: {
      entry: assign({
        currentWidget: "citySelector" as WidgetType,
      }),
      on: {
        CITY_SELECTED: {
          target: "evaluating",
          actions: assign({
            arrival: ({ event }) => ({
              city: event.city,
              country: event.country,
              countryCode: event.countryCode,
            }),
            citySelectionShownForCountry: null,
            currentWidget: null,
          }),
        },
        USER_MESSAGE: {
          target: "processing",
          actions: assign({ currentWidget: null }),
        },
      },
    },

    /**
     * Awaiting date selection (departure or range)
     */
    awaitingDateSelection: {
      entry: assign({
        currentWidget: ({ context }) =>
          context.pendingTripDuration || context.tripType === "oneway"
            ? ("datePicker" as WidgetType)
            : ("dateRangePicker" as WidgetType),
      }),
      on: {
        DATE_SELECTED: {
          target: "evaluating",
          actions: assign({
            departureDate: ({ event }) =>
              event.dateType === "departure" ? event.date : undefined,
            returnDate: ({ event, context }) => {
              if (event.dateType === "return") return event.date;
              // Auto-calculate return if we have trip duration
              if (context.pendingTripDuration && event.dateType === "departure") {
                const days = parseDuration(context.pendingTripDuration);
                if (days) {
                  const ret = new Date(event.date);
                  ret.setDate(ret.getDate() + days);
                  return ret;
                }
              }
              return context.returnDate;
            },
            pendingTripDuration: null,
            currentWidget: null,
          }),
        },
        DATE_RANGE_SELECTED: {
          target: "evaluating",
          actions: assign({
            departureDate: ({ event }) => event.departure,
            returnDate: ({ event }) => event.returnDate,
            pendingTripDuration: null,
            pendingPreferredMonth: null,
            currentWidget: null,
          }),
        },
        USER_MESSAGE: {
          target: "processing",
          actions: assign({ currentWidget: null }),
        },
      },
    },

    /**
     * Awaiting return date only
     */
    awaitingReturnDate: {
      entry: assign({
        currentWidget: "returnDatePicker" as WidgetType,
      }),
      on: {
        DATE_SELECTED: {
          target: "evaluating",
          actions: assign({
            returnDate: ({ event }) => event.date,
            currentWidget: null,
          }),
        },
        USER_MESSAGE: {
          target: "processing",
          actions: assign({ currentWidget: null }),
        },
      },
    },

    /**
     * Awaiting travelers count
     */
    awaitingTravelers: {
      entry: assign({
        currentWidget: "travelersSelector" as WidgetType,
      }),
      on: {
        TRAVELERS_SELECTED: {
          target: "awaitingTripType",
          actions: assign({
            passengers: ({ event }) => event.travelers,
            currentWidget: null,
          }),
        },
        USER_MESSAGE: {
          target: "processing",
          actions: assign({ currentWidget: null }),
        },
      },
    },

    /**
     * Awaiting trip type confirmation
     */
    awaitingTripType: {
      entry: assign({
        currentWidget: "tripTypeConfirm" as WidgetType,
        pendingTravelersWidget: false,
      }),
      on: {
        TRIP_TYPE_CONFIRMED: [
          {
            target: "awaitingMultiDestination",
            guard: ({ event }) => event.tripType === "multi",
            actions: assign({
              tripType: ({ event }) => event.tripType,
              currentWidget: null,
            }),
          },
          {
            target: "ready",
            actions: assign({
              tripType: ({ event }) => event.tripType,
              currentWidget: null,
              searchButtonShown: true,
            }),
          },
        ],
        USER_MESSAGE: {
          target: "processing",
          actions: assign({ currentWidget: null }),
        },
      },
    },

    /**
     * Awaiting multi-destination input
     */
    awaitingMultiDestination: {
      on: {
        USER_MESSAGE: {
          target: "processing",
        },
      },
    },

    /**
     * Ready to search
     */
    ready: {
      entry: assign({
        searchButtonShown: true,
        currentWidget: null,
      }),
      on: {
        SEARCH_TRIGGERED: {
          target: "searching",
        },
        USER_MESSAGE: {
          target: "processing",
        },
      },
    },

    /**
     * Search in progress
     */
    searching: {
      on: {
        STREAM_COMPLETE: {
          target: "idle",
        },
        STREAM_ERROR: {
          target: "ready",
          actions: assign({
            error: ({ event }) => event.error,
          }),
        },
      },
    },
  },
});

/**
 * Helper: Parse duration string to days
 */
function parseDuration(duration: string): number | null {
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
 * Helper: Check if we have all required data to search
 */
function isReadyToSearch(context: ChatMachineContext): boolean {
  const hasArrival = !!context.arrival?.city;
  const hasDepartureDate = !!context.departureDate;
  const hasReturnOrOneway =
    context.tripType === "oneway" || !!context.returnDate;
  const hasPassengers = context.passengers.adults >= 1;

  return hasArrival && hasDepartureDate && hasReturnOrOneway && hasPassengers;
}

/**
 * Export types for external use
 */
export type ChatMachineState = typeof chatMachine;
export type ChatMachineSnapshot = ReturnType<typeof chatMachine.getInitialSnapshot>;
