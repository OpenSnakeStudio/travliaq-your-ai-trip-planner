/**
 * Advice Widgets - Contextual tips, suggestions, and recommendations
 *
 * These widgets provide guidance, tips, and recommendations throughout
 * the travel planning workflow.
 */

// TipCard - Contextual advice cards
export {
  TipCard,
  type TipType,
  QUICK_TIPS,
} from "./TipCard";

// StepSuggestion - Next step guidance
export {
  StepSuggestion,
  InlineStepSuggestion,
  type StepType,
  STEP_SUGGESTIONS,
} from "./StepSuggestion";

// SeasonalTip - Seasonal travel advice
export {
  SeasonalTip,
  type Season,
  type CrowdLevel,
  type PriceTrend,
  type SeasonalData,
  SEASONAL_PRESETS,
} from "./SeasonalTip";

// ResultBadges - Highlight badges for results
export {
  ResultBadge,
  BestDealBadge,
  PopularChoiceBadge,
  RecommendedBadge,
  TopRatedBadge,
  BadgeGroup,
  type BadgeType,
} from "./ResultBadges";

// ResultRecommendation - Personalized recommendations
export {
  ResultRecommendation,
  InlineRecommendation,
  type RecommendationReason,
  type RecommendationData,
} from "./ResultRecommendation";
