/**
 * Chat Services - Business logic and orchestration
 *
 * These services provide workflow control, suggestions,
 * and conflict detection for the chat planning experience.
 */

// WorkflowController - Step management and progress tracking
export {
  getStepInfo,
  getWorkflowProgress,
  getMissingFields,
  isReadyForSearch,
  calculateTripCost,
  getSuggestedActions,
  formatStepMessage,
  getStepById,
  STEP_ORDER,
  type StepStatus,
  type StepInfo,
  type WorkflowProgress,
  type MissingField,
  type TripCost,
  type SuggestedAction,
} from "./workflowController";

// ContextualSuggestions - Proactive tips and smart suggestions
export {
  getSeasonalInfo,
  getSuggestionsForContext,
  getQuickRepliesForStep,
  SUGGESTION_PRESETS,
  type SuggestionType,
  type SuggestionPriority,
  type ContextualSuggestion,
  type QuickReply,
} from "./contextualSuggestions";

// ConflictDetector - Plan validation and issue detection
export {
  detectConflicts,
  getConflictsForStep,
  isTripBookable,
  getConflictSummary,
  CONFLICT_TYPE_LABELS,
  type ConflictSeverity,
  type ConflictType,
  type Conflict,
  type ConflictDetectionResult,
} from "./conflictDetector";

// FilterParser - Natural language filter parsing (Phase 3)
export {
  parseFilters,
  formatFiltersForDisplay,
  FILTER_EXAMPLES,
  type FilterTarget,
  type PriceFilter,
  type TimeFilter,
  type DurationFilter,
  type RatingFilter,
  type LocationFilter,
  type FlightFilters,
  type HotelFilters,
  type ActivityFilters,
  type ParsedFilters,
} from "./filterParser";

// ProactiveAlerts - Intelligent alert generation (Phase 4)
export {
  getProactiveAlerts,
  filterAlertsByCategory,
  filterAlertsByStep,
  getCriticalAlertsCount,
  getAlertsSummary,
  simulatePriceTracking,
  simulateAvailabilityData,
  type AlertPriority,
  type ProactiveAlert,
} from "./proactiveAlerts";
