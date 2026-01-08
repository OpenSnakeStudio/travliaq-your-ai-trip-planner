/**
 * Progress Widgets - Workflow tracking and trip progress visualization
 *
 * These widgets show progress through the planning workflow and
 * provide summary views of the planned trip.
 */

// StepProgressBar - Visual workflow progress
export {
  StepProgressBar,
  InlineProgress,
  type ProgressStep,
  DEFAULT_PLANNING_STEPS,
  createStepsFromIndex,
} from "./StepProgressBar";

// MissingFieldsCard - Required fields indicator
export {
  MissingFieldsCard,
  MissingFieldIndicator,
  type MissingField,
  createFieldsFromFormData,
} from "./MissingFieldsCard";

// ChecklistWidget - Trip component checklist
export {
  ChecklistWidget,
  type ChecklistItem,
  type ChecklistItemType,
  DEFAULT_TRIP_CHECKLIST,
} from "./ChecklistWidget";

// BudgetProgressWidget - Budget tracking
export {
  BudgetProgressWidget,
  type BudgetCategory,
} from "./BudgetProgressWidget";

// TripSummaryCard - Trip summary with editing
export {
  TripSummaryCard,
  InlineTripSummary,
  type TripSummaryData,
} from "./TripSummaryCard";
