/**
 * WorkflowController - Orchestrates the planning workflow
 *
 * Provides high-level methods for workflow control, step management,
 * and integration with the chat system.
 */

import type {
  PlanningStep,
  StepSelections,
  StepMetadata,
  WorkflowContext,
} from "../machines/workflowMachine";
import { PLANNING_STEPS } from "../machines/workflowMachine";

/**
 * Step status
 */
export type StepStatus = "pending" | "current" | "completed" | "skipped";

/**
 * Step info for display
 */
export interface StepInfo {
  id: PlanningStep;
  label: string;
  labelActive: string;
  status: StepStatus;
  order: number;
  required: boolean;
  icon: string;
  isAccessible: boolean;
  hasData: boolean;
}

/**
 * Workflow progress
 */
export interface WorkflowProgress {
  currentStep: PlanningStep;
  completedCount: number;
  totalRequired: number;
  totalOptional: number;
  percentComplete: number;
  steps: StepInfo[];
}

/**
 * Get step info from context
 */
export function getStepInfo(
  step: StepMetadata,
  context: WorkflowContext
): StepInfo {
  const isCurrent = context.currentStep === step.id;
  const isCompleted = context.completedSteps.has(step.id);
  const isSkipped = context.skippedSteps.has(step.id);

  // Determine status
  let status: StepStatus = "pending";
  if (isCurrent) status = "current";
  else if (isCompleted) status = "completed";
  else if (isSkipped) status = "skipped";

  // Check if step has data
  const hasData = checkStepHasData(step.id, context.selections);

  // Check if step is accessible (all previous required steps completed)
  const isAccessible = checkStepAccessible(step.id, context);

  return {
    id: step.id,
    label: step.label,
    labelActive: step.labelActive,
    status,
    order: step.order,
    required: step.required,
    icon: step.icon,
    isAccessible,
    hasData,
  };
}

/**
 * Check if a step has data
 */
function checkStepHasData(step: PlanningStep, selections: StepSelections): boolean {
  switch (step) {
    case "destination":
      return !!selections.destination?.city;
    case "dates":
      return !!selections.dates?.departure;
    case "travelers":
      return !!selections.travelers && selections.travelers.adults > 0;
    case "flights":
      return !!selections.flights?.outbound;
    case "hotels":
      return !!selections.hotels?.id;
    case "activities":
      return selections.activities.length > 0;
    case "transfers":
      return selections.transfers.length > 0;
    default:
      return false;
  }
}

/**
 * Check if a step is accessible
 */
function checkStepAccessible(step: PlanningStep, context: WorkflowContext): boolean {
  const stepOrder: PlanningStep[] = [
    "destination",
    "dates",
    "travelers",
    "flights",
    "hotels",
    "activities",
    "transfers",
    "recap",
  ];

  const stepIndex = stepOrder.indexOf(step);
  if (stepIndex === 0) return true; // First step always accessible

  // Check all previous required steps are completed
  for (let i = 0; i < stepIndex; i++) {
    const prevStep = stepOrder[i];
    const prevMeta = PLANNING_STEPS.find((s) => s.id === prevStep);

    if (prevMeta?.required && !context.completedSteps.has(prevStep)) {
      return false;
    }
  }

  return true;
}

/**
 * Get workflow progress
 *
 * Returns 0% if no required steps are defined (prevents division by zero).
 */
export function getWorkflowProgress(context: WorkflowContext): WorkflowProgress {
  const steps = PLANNING_STEPS.map((step) => getStepInfo(step, context));

  const requiredSteps = PLANNING_STEPS.filter((s) => s.required);
  const optionalSteps = PLANNING_STEPS.filter((s) => !s.required);

  const completedRequired = requiredSteps.filter((s) =>
    context.completedSteps.has(s.id)
  ).length;

  // Prevent division by zero
  const percentComplete = requiredSteps.length > 0
    ? Math.round((completedRequired / requiredSteps.length) * 100)
    : 0;

  return {
    currentStep: context.currentStep,
    completedCount: context.completedSteps.size,
    totalRequired: requiredSteps.length,
    totalOptional: optionalSteps.length,
    percentComplete,
    steps,
  };
}

/**
 * Get missing required fields for current state
 */
export interface MissingField {
  step: PlanningStep;
  field: string;
  label: string;
  priority: number;
}

export function getMissingFields(context: WorkflowContext): MissingField[] {
  const missing: MissingField[] = [];

  // Destination
  if (!context.selections.destination?.city) {
    missing.push({
      step: "destination",
      field: "city",
      label: "Destination",
      priority: 1,
    });
  }

  // Dates
  if (!context.selections.dates?.departure) {
    missing.push({
      step: "dates",
      field: "departure",
      label: "Date de départ",
      priority: 2,
    });
  }

  if (
    context.tripType === "roundtrip" &&
    !context.selections.dates?.return
  ) {
    missing.push({
      step: "dates",
      field: "return",
      label: "Date de retour",
      priority: 3,
    });
  }

  // Travelers
  if (!context.selections.travelers || context.selections.travelers.adults < 1) {
    missing.push({
      step: "travelers",
      field: "travelers",
      label: "Nombre de voyageurs",
      priority: 4,
    });
  }

  return missing.sort((a, b) => a.priority - b.priority);
}

/**
 * Check if workflow is ready for search
 */
export function isReadyForSearch(context: WorkflowContext): boolean {
  return (
    !!context.selections.destination?.city &&
    !!context.selections.dates?.departure &&
    (context.tripType === "oneway" || !!context.selections.dates?.return) &&
    !!context.selections.travelers &&
    context.selections.travelers.adults >= 1
  );
}

/**
 * Calculate total trip cost
 */
export interface TripCost {
  flights: number;
  hotels: number;
  activities: number;
  transfers: number;
  total: number;
  perPerson: number;
  currency: string;
}

export function calculateTripCost(context: WorkflowContext): TripCost {
  const { selections, budget } = context;
  const currency = budget?.currency || "€";

  const flightsCost =
    (selections.flights?.outbound?.price || 0) +
    (selections.flights?.return?.price || 0);

  const hotelsCost = selections.hotels?.price || 0;

  const activitiesCost = selections.activities.reduce(
    (sum, a) => sum + a.price,
    0
  );

  const transfersCost = selections.transfers.reduce(
    (sum, t) => sum + t.price,
    0
  );

  const total = flightsCost + hotelsCost + activitiesCost + transfersCost;

  // Ensure at least 1 traveler to prevent division by zero
  const travelers = Math.max(1, selections.travelers?.adults || 1);
  const perPerson = Math.round(total / travelers);

  return {
    flights: flightsCost,
    hotels: hotelsCost,
    activities: activitiesCost,
    transfers: transfersCost,
    total,
    perPerson,
    currency,
  };
}

/**
 * Get suggested next action
 */
export interface SuggestedAction {
  type: "navigate" | "search" | "complete" | "skip" | "edit";
  step?: PlanningStep;
  label: string;
  description: string;
  priority: "high" | "medium" | "low";
}

export function getSuggestedActions(context: WorkflowContext): SuggestedAction[] {
  const actions: SuggestedAction[] = [];
  const missing = getMissingFields(context);

  // If missing required fields, suggest completing them
  if (missing.length > 0) {
    const first = missing[0];
    actions.push({
      type: "navigate",
      step: first.step,
      label: `Compléter: ${first.label}`,
      description: "Information requise pour continuer",
      priority: "high",
    });
  }

  // If ready for search, suggest searching
  if (isReadyForSearch(context)) {
    if (!context.completedSteps.has("flights")) {
      actions.push({
        type: "search",
        step: "flights",
        label: "Rechercher des vols",
        description: "Trouvez les meilleurs vols pour votre voyage",
        priority: "high",
      });
    } else if (!context.completedSteps.has("hotels")) {
      actions.push({
        type: "search",
        step: "hotels",
        label: "Rechercher des hébergements",
        description: "Trouvez l'hébergement idéal",
        priority: "high",
      });
    }
  }

  // Suggest optional steps
  if (
    context.completedSteps.has("flights") &&
    context.completedSteps.has("hotels") &&
    !context.completedSteps.has("activities") &&
    !context.skippedSteps.has("activities")
  ) {
    actions.push({
      type: "navigate",
      step: "activities",
      label: "Ajouter des activités",
      description: "Découvrez des expériences uniques",
      priority: "medium",
    });
  }

  // Suggest recap if mostly complete
  const requiredComplete = PLANNING_STEPS.filter(
    (s) => s.required && context.completedSteps.has(s.id)
  ).length;

  if (requiredComplete >= 4) {
    actions.push({
      type: "navigate",
      step: "recap",
      label: "Voir le récapitulatif",
      description: "Vérifiez et finalisez votre voyage",
      priority: "medium",
    });
  }

  return actions;
}

/**
 * Format step for display message
 */
export function formatStepMessage(step: PlanningStep): string {
  const stepMeta = PLANNING_STEPS.find((s) => s.id === step);
  return stepMeta?.labelActive || step;
}

/**
 * Get step by ID
 */
export function getStepById(stepId: PlanningStep): StepMetadata | undefined {
  return PLANNING_STEPS.find((s) => s.id === stepId);
}

/**
 * Export step order for external use
 */
export const STEP_ORDER: PlanningStep[] = [
  "destination",
  "dates",
  "travelers",
  "flights",
  "hotels",
  "activities",
  "transfers",
  "recap",
];
