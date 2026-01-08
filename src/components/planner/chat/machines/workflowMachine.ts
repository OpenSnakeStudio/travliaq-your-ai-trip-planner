/**
 * Workflow State Machine - XState v5
 *
 * Manages the high-level planning workflow steps:
 * destination → dates → travelers → flights → hotels → activities → recap
 *
 * This machine complements chatMachine by handling step transitions
 * and providing contextual awareness for suggestions and tips.
 */

import { createMachine, assign } from "xstate";

/**
 * Planning step types
 */
export type PlanningStep =
  | "welcome"
  | "destination"
  | "dates"
  | "travelers"
  | "flights"
  | "hotels"
  | "activities"
  | "transfers"
  | "recap"
  | "booking"
  | "complete";

/**
 * Step metadata for display
 */
export interface StepMetadata {
  id: PlanningStep;
  label: string;
  labelActive: string;
  order: number;
  required: boolean;
  icon: string;
}

/**
 * All planning steps with metadata
 */
export const PLANNING_STEPS: StepMetadata[] = [
  { id: "destination", label: "Destination", labelActive: "Choisir la destination", order: 1, required: true, icon: "MapPin" },
  { id: "dates", label: "Dates", labelActive: "Choisir les dates", order: 2, required: true, icon: "Calendar" },
  { id: "travelers", label: "Voyageurs", labelActive: "Nombre de voyageurs", order: 3, required: true, icon: "Users" },
  { id: "flights", label: "Vols", labelActive: "Rechercher des vols", order: 4, required: true, icon: "Plane" },
  { id: "hotels", label: "Hébergement", labelActive: "Trouver un hébergement", order: 5, required: true, icon: "Hotel" },
  { id: "activities", label: "Activités", labelActive: "Découvrir des activités", order: 6, required: false, icon: "Compass" },
  { id: "transfers", label: "Transferts", labelActive: "Organiser les transferts", order: 7, required: false, icon: "Car" },
  { id: "recap", label: "Récapitulatif", labelActive: "Vérifier le voyage", order: 8, required: true, icon: "CheckCircle" },
];

/**
 * Selection data for each step
 */
export interface StepSelections {
  destination: {
    city?: string;
    country?: string;
    countryCode?: string;
    airports?: string[];
  } | null;
  dates: {
    departure?: Date;
    return?: Date;
    nights?: number;
    flexible?: boolean;
  } | null;
  travelers: {
    adults: number;
    children: number;
    infants: number;
  } | null;
  flights: {
    outbound?: {
      id: string;
      price: number;
      airline?: string;
    };
    return?: {
      id: string;
      price: number;
      airline?: string;
    };
  } | null;
  hotels: {
    id?: string;
    name?: string;
    price?: number;
    nights?: number;
  } | null;
  activities: Array<{
    id: string;
    name: string;
    price: number;
    date?: Date;
  }>;
  transfers: Array<{
    id: string;
    type: string;
    price: number;
  }>;
}

/**
 * Workflow context
 */
export interface WorkflowContext {
  // Current step
  currentStep: PlanningStep;
  previousStep: PlanningStep | null;

  // Completed steps
  completedSteps: Set<PlanningStep>;

  // Selections per step
  selections: StepSelections;

  // Budget tracking
  budget: {
    total: number;
    spent: number;
    currency: string;
  } | null;

  // Preferences learned
  preferences: {
    priceRange?: "budget" | "moderate" | "luxury";
    travelStyle?: string[];
    interests?: string[];
  };

  // Skip tracking
  skippedSteps: Set<PlanningStep>;

  // Errors and warnings
  errors: string[];
  warnings: string[];

  // Trip type
  tripType: "roundtrip" | "oneway" | "multi";
}

/**
 * Workflow events
 */
export type WorkflowEvent =
  | { type: "START_PLANNING" }
  | { type: "GO_TO_STEP"; step: PlanningStep }
  | { type: "NEXT_STEP" }
  | { type: "PREVIOUS_STEP" }
  | { type: "SKIP_STEP" }
  | { type: "COMPLETE_STEP"; step: PlanningStep; data?: Partial<StepSelections> }
  | { type: "UPDATE_SELECTION"; step: PlanningStep; data: any }
  | { type: "SET_BUDGET"; total: number; currency?: string }
  | { type: "SET_PREFERENCES"; preferences: Partial<WorkflowContext["preferences"]> }
  | { type: "ADD_WARNING"; message: string }
  | { type: "CLEAR_WARNINGS" }
  | { type: "RESET_WORKFLOW" };

/**
 * Initial context
 */
const initialContext: WorkflowContext = {
  currentStep: "welcome",
  previousStep: null,
  completedSteps: new Set(),
  selections: {
    destination: null,
    dates: null,
    travelers: null,
    flights: null,
    hotels: null,
    activities: [],
    transfers: [],
  },
  budget: null,
  preferences: {},
  skippedSteps: new Set(),
  errors: [],
  warnings: [],
  tripType: "roundtrip",
};

/**
 * Step order for navigation
 */
const STEP_ORDER: PlanningStep[] = [
  "welcome",
  "destination",
  "dates",
  "travelers",
  "flights",
  "hotels",
  "activities",
  "transfers",
  "recap",
  "booking",
  "complete",
];

/**
 * Optional steps that can be skipped
 */
const OPTIONAL_STEPS: Set<PlanningStep> = new Set(["activities", "transfers"]);

/**
 * Get next step in sequence (iterative to prevent stack overflow)
 */
function getNextStep(current: PlanningStep, context: WorkflowContext): PlanningStep {
  const currentIndex = STEP_ORDER.indexOf(current);
  if (currentIndex === -1 || currentIndex >= STEP_ORDER.length - 1) {
    return current;
  }

  // Iterate through remaining steps to find next non-skipped step
  for (let i = currentIndex + 1; i < STEP_ORDER.length; i++) {
    const candidateStep = STEP_ORDER[i];

    // Only skip optional steps that are in skippedSteps
    if (OPTIONAL_STEPS.has(candidateStep) && context.skippedSteps.has(candidateStep)) {
      continue;
    }

    return candidateStep;
  }

  // If all remaining steps are skipped, stay at current (shouldn't happen)
  return current;
}

/**
 * Get previous step in sequence
 */
function getPreviousStep(current: PlanningStep): PlanningStep {
  const currentIndex = STEP_ORDER.indexOf(current);
  if (currentIndex <= 0) {
    return "welcome";
  }

  return STEP_ORDER[currentIndex - 1];
}

/**
 * Valid steps for GO_TO_STEP navigation
 */
const NAVIGABLE_STEPS: Set<PlanningStep> = new Set([
  "welcome",
  "destination",
  "dates",
  "travelers",
  "flights",
  "hotels",
  "activities",
  "transfers",
  "recap",
]);

/**
 * Type guard to check if event has a valid step property
 */
function isGoToStepEvent(event: unknown): event is { type: "GO_TO_STEP"; step: PlanningStep } {
  return (
    typeof event === "object" &&
    event !== null &&
    "type" in event &&
    (event as { type: string }).type === "GO_TO_STEP" &&
    "step" in event &&
    typeof (event as { step: unknown }).step === "string" &&
    NAVIGABLE_STEPS.has((event as { step: PlanningStep }).step)
  );
}

/**
 * Calculate total spent
 */
function calculateSpent(selections: StepSelections): number {
  let total = 0;

  if (selections.flights?.outbound?.price) {
    total += selections.flights.outbound.price;
  }
  if (selections.flights?.return?.price) {
    total += selections.flights.return.price;
  }
  if (selections.hotels?.price) {
    total += selections.hotels.price;
  }
  for (const activity of selections.activities) {
    total += activity.price;
  }
  for (const transfer of selections.transfers) {
    total += transfer.price;
  }

  return total;
}

/**
 * The workflow state machine
 */
export const workflowMachine = createMachine({
  id: "planningWorkflow",
  initial: "welcome",
  context: initialContext,

  states: {
    /**
     * Welcome - Initial greeting
     */
    welcome: {
      on: {
        START_PLANNING: {
          target: "destination",
          actions: assign({
            currentStep: "destination" as PlanningStep,
            previousStep: "welcome" as PlanningStep,
          }),
        },
        GO_TO_STEP: {
          target: "navigating",
        },
      },
    },

    /**
     * Destination selection
     */
    destination: {
      entry: assign({ currentStep: "destination" as PlanningStep }),
      on: {
        COMPLETE_STEP: {
          target: "dates",
          actions: assign({
            completedSteps: ({ context }) => {
              const newSet = new Set(context.completedSteps);
              newSet.add("destination");
              return newSet;
            },
            selections: ({ context, event }) => ({
              ...context.selections,
              destination: event.data?.destination || context.selections.destination,
            }),
            previousStep: "destination" as PlanningStep,
          }),
        },
        GO_TO_STEP: { target: "navigating" },
        PREVIOUS_STEP: { target: "welcome" },
        UPDATE_SELECTION: {
          actions: assign({
            selections: ({ context, event }) => ({
              ...context.selections,
              [event.step]: event.data,
            }),
          }),
        },
      },
    },

    /**
     * Date selection
     */
    dates: {
      entry: assign({ currentStep: "dates" as PlanningStep }),
      on: {
        COMPLETE_STEP: {
          target: "travelers",
          actions: assign({
            completedSteps: ({ context }) => {
              const newSet = new Set(context.completedSteps);
              newSet.add("dates");
              return newSet;
            },
            selections: ({ context, event }) => ({
              ...context.selections,
              dates: event.data?.dates || context.selections.dates,
            }),
            previousStep: "dates" as PlanningStep,
          }),
        },
        GO_TO_STEP: { target: "navigating" },
        PREVIOUS_STEP: { target: "destination" },
        UPDATE_SELECTION: {
          actions: assign({
            selections: ({ context, event }) => ({
              ...context.selections,
              [event.step]: event.data,
            }),
          }),
        },
      },
    },

    /**
     * Travelers selection
     */
    travelers: {
      entry: assign({ currentStep: "travelers" as PlanningStep }),
      on: {
        COMPLETE_STEP: {
          target: "flights",
          actions: assign({
            completedSteps: ({ context }) => {
              const newSet = new Set(context.completedSteps);
              newSet.add("travelers");
              return newSet;
            },
            selections: ({ context, event }) => ({
              ...context.selections,
              travelers: event.data?.travelers || context.selections.travelers,
            }),
            previousStep: "travelers" as PlanningStep,
          }),
        },
        GO_TO_STEP: { target: "navigating" },
        PREVIOUS_STEP: { target: "dates" },
        UPDATE_SELECTION: {
          actions: assign({
            selections: ({ context, event }) => ({
              ...context.selections,
              [event.step]: event.data,
            }),
          }),
        },
      },
    },

    /**
     * Flights selection
     */
    flights: {
      entry: assign({ currentStep: "flights" as PlanningStep }),
      on: {
        COMPLETE_STEP: {
          target: "hotels",
          actions: assign({
            completedSteps: ({ context }) => {
              const newSet = new Set(context.completedSteps);
              newSet.add("flights");
              return newSet;
            },
            selections: ({ context, event }) => ({
              ...context.selections,
              flights: event.data?.flights || context.selections.flights,
            }),
            previousStep: "flights" as PlanningStep,
            budget: ({ context }) => {
              if (!context.budget) return null;
              return {
                ...context.budget,
                spent: calculateSpent(context.selections),
              };
            },
          }),
        },
        GO_TO_STEP: { target: "navigating" },
        PREVIOUS_STEP: { target: "travelers" },
        UPDATE_SELECTION: {
          actions: assign({
            selections: ({ context, event }) => ({
              ...context.selections,
              [event.step]: event.data,
            }),
          }),
        },
      },
    },

    /**
     * Hotels selection
     */
    hotels: {
      entry: assign({ currentStep: "hotels" as PlanningStep }),
      on: {
        COMPLETE_STEP: {
          target: "activities",
          actions: assign({
            completedSteps: ({ context }) => {
              const newSet = new Set(context.completedSteps);
              newSet.add("hotels");
              return newSet;
            },
            selections: ({ context, event }) => ({
              ...context.selections,
              hotels: event.data?.hotels || context.selections.hotels,
            }),
            previousStep: "hotels" as PlanningStep,
            budget: ({ context }) => {
              if (!context.budget) return null;
              return {
                ...context.budget,
                spent: calculateSpent(context.selections),
              };
            },
          }),
        },
        SKIP_STEP: {
          target: "activities",
          actions: assign({
            skippedSteps: ({ context }) => {
              const newSet = new Set(context.skippedSteps);
              newSet.add("hotels");
              return newSet;
            },
            previousStep: "hotels" as PlanningStep,
          }),
        },
        GO_TO_STEP: { target: "navigating" },
        PREVIOUS_STEP: { target: "flights" },
        UPDATE_SELECTION: {
          actions: assign({
            selections: ({ context, event }) => ({
              ...context.selections,
              [event.step]: event.data,
            }),
          }),
        },
      },
    },

    /**
     * Activities selection (optional)
     */
    activities: {
      entry: assign({ currentStep: "activities" as PlanningStep }),
      on: {
        COMPLETE_STEP: {
          target: "transfers",
          actions: assign({
            completedSteps: ({ context }) => {
              const newSet = new Set(context.completedSteps);
              newSet.add("activities");
              return newSet;
            },
            selections: ({ context, event }) => ({
              ...context.selections,
              activities: event.data?.activities || context.selections.activities,
            }),
            previousStep: "activities" as PlanningStep,
            budget: ({ context }) => {
              if (!context.budget) return null;
              return {
                ...context.budget,
                spent: calculateSpent(context.selections),
              };
            },
          }),
        },
        SKIP_STEP: {
          target: "transfers",
          actions: assign({
            skippedSteps: ({ context }) => {
              const newSet = new Set(context.skippedSteps);
              newSet.add("activities");
              return newSet;
            },
            previousStep: "activities" as PlanningStep,
          }),
        },
        GO_TO_STEP: { target: "navigating" },
        PREVIOUS_STEP: { target: "hotels" },
        UPDATE_SELECTION: {
          actions: assign({
            selections: ({ context, event }) => ({
              ...context.selections,
              [event.step]: event.data,
            }),
          }),
        },
      },
    },

    /**
     * Transfers selection (optional)
     */
    transfers: {
      entry: assign({ currentStep: "transfers" as PlanningStep }),
      on: {
        COMPLETE_STEP: {
          target: "recap",
          actions: assign({
            completedSteps: ({ context }) => {
              const newSet = new Set(context.completedSteps);
              newSet.add("transfers");
              return newSet;
            },
            selections: ({ context, event }) => ({
              ...context.selections,
              transfers: event.data?.transfers || context.selections.transfers,
            }),
            previousStep: "transfers" as PlanningStep,
          }),
        },
        SKIP_STEP: {
          target: "recap",
          actions: assign({
            skippedSteps: ({ context }) => {
              const newSet = new Set(context.skippedSteps);
              newSet.add("transfers");
              return newSet;
            },
            previousStep: "transfers" as PlanningStep,
          }),
        },
        GO_TO_STEP: { target: "navigating" },
        PREVIOUS_STEP: { target: "activities" },
        UPDATE_SELECTION: {
          actions: assign({
            selections: ({ context, event }) => ({
              ...context.selections,
              [event.step]: event.data,
            }),
          }),
        },
      },
    },

    /**
     * Recap - Review selections
     */
    recap: {
      entry: assign({
        currentStep: "recap" as PlanningStep,
        completedSteps: ({ context }) => {
          const newSet = new Set(context.completedSteps);
          newSet.add("recap");
          return newSet;
        },
      }),
      on: {
        COMPLETE_STEP: {
          target: "booking",
        },
        GO_TO_STEP: { target: "navigating" },
        PREVIOUS_STEP: { target: "transfers" },
      },
    },

    /**
     * Booking - Final booking step
     */
    booking: {
      entry: assign({ currentStep: "booking" as PlanningStep }),
      on: {
        COMPLETE_STEP: {
          target: "complete",
        },
        GO_TO_STEP: { target: "navigating" },
        PREVIOUS_STEP: { target: "recap" },
      },
    },

    /**
     * Complete - Trip planned
     */
    complete: {
      entry: assign({ currentStep: "complete" as PlanningStep }),
      type: "final",
    },

    /**
     * Navigating - Transitional state for direct navigation
     * Uses type-safe guards to prevent invalid transitions
     */
    navigating: {
      always: [
        {
          target: "welcome",
          guard: ({ event }) => isGoToStepEvent(event) && event.step === "welcome",
        },
        {
          target: "destination",
          guard: ({ event }) => isGoToStepEvent(event) && event.step === "destination",
        },
        {
          target: "dates",
          guard: ({ event }) => isGoToStepEvent(event) && event.step === "dates",
        },
        {
          target: "travelers",
          guard: ({ event }) => isGoToStepEvent(event) && event.step === "travelers",
        },
        {
          target: "flights",
          guard: ({ event }) => isGoToStepEvent(event) && event.step === "flights",
        },
        {
          target: "hotels",
          guard: ({ event }) => isGoToStepEvent(event) && event.step === "hotels",
        },
        {
          target: "activities",
          guard: ({ event }) => isGoToStepEvent(event) && event.step === "activities",
        },
        {
          target: "transfers",
          guard: ({ event }) => isGoToStepEvent(event) && event.step === "transfers",
        },
        {
          target: "recap",
          guard: ({ event }) => isGoToStepEvent(event) && event.step === "recap",
        },
        // Fallback: if no valid step, go back to previous step stored in context
        // This prevents infinite loops and handles invalid navigation gracefully
        {
          target: "destination",
          guard: ({ context }) => context.previousStep === "destination" || context.currentStep === "destination",
        },
        // Ultimate fallback: stay at welcome (first valid step)
        { target: "welcome" },
      ],
    },
  },

  // Global events
  on: {
    SET_BUDGET: {
      actions: assign({
        budget: ({ event, context }) => ({
          total: event.total,
          spent: calculateSpent(context.selections),
          currency: event.currency || "€",
        }),
      }),
    },
    SET_PREFERENCES: {
      actions: assign({
        preferences: ({ context, event }) => ({
          ...context.preferences,
          ...event.preferences,
        }),
      }),
    },
    ADD_WARNING: {
      actions: assign({
        warnings: ({ context, event }) => [...context.warnings, event.message],
      }),
    },
    CLEAR_WARNINGS: {
      actions: assign({
        warnings: [],
      }),
    },
    RESET_WORKFLOW: {
      target: ".welcome",
      actions: assign(() => initialContext),
    },
  },
});

/**
 * Export types
 */
export type WorkflowMachineState = typeof workflowMachine;
export type WorkflowSnapshot = ReturnType<typeof workflowMachine.getInitialSnapshot>;
