/**
 * Intent Confidence Booster
 * 
 * Crosses backend intent classification with frontend message analysis
 * to improve confidence and reduce unnecessary clarification requests.
 */

import { analyzeUserIntent, analyzeLastAssistantMessage, detectLanguage, type UserIntent } from './messageAnalyzer';
import type { IntentClassification } from '../hooks/useChatStream';

export interface BoostResult {
  boostedConfidence: number;
  shouldClarify: boolean;
  suggestedIntent?: string;
  frontendSignals: UserIntent;
  detectedLanguage: 'fr' | 'en';
}

/**
 * Intent alignment map - maps frontend signals to backend intents
 */
const INTENT_ALIGNMENT: Record<string, keyof UserIntent> = {
  'provide_budget': 'wantsBudgetInfo',
  'ask_budget': 'wantsBudgetInfo',
  'provide_dates': 'wantsDateInfo',
  'flexible_dates': 'wantsDateInfo',
  'compare_options': 'wantsComparison',
  'request_alternatives': 'wantsMoreOptions',
  'confirm_selection': 'wantsToBook',
  'accept_suggestion': 'isPositive',
  'reject_suggestion': 'isNegative',
};

/**
 * Boost confidence by cross-referencing frontend and backend analysis
 */
export function boostIntentConfidence(
  backendIntent: IntentClassification | null,
  userMessage: string,
  lastAssistantMessage?: string
): BoostResult {
  const frontendSignals = analyzeUserIntent(userMessage);
  const detectedLanguage = detectLanguage(userMessage);
  const assistantContent = analyzeLastAssistantMessage(lastAssistantMessage);
  
  // No backend intent - use frontend signals only
  if (!backendIntent) {
    return {
      boostedConfidence: 0,
      shouldClarify: true,
      frontendSignals,
      detectedLanguage,
    };
  }
  
  let confidenceBoost = 0;
  
  // Check if frontend signals align with backend intent
  const alignedSignal = INTENT_ALIGNMENT[backendIntent.primaryIntent];
  if (alignedSignal && frontendSignals[alignedSignal]) {
    // Frontend confirms backend - boost confidence by 15
    confidenceBoost += 15;
  }
  
  // Check sentiment alignment
  if (backendIntent.primaryIntent.includes('confirm') || backendIntent.primaryIntent.includes('accept')) {
    if (frontendSignals.isPositive) confidenceBoost += 10;
    if (frontendSignals.isNegative) confidenceBoost -= 20; // Conflict!
  }
  
  if (backendIntent.primaryIntent.includes('reject')) {
    if (frontendSignals.isNegative) confidenceBoost += 10;
    if (frontendSignals.isPositive) confidenceBoost -= 20; // Conflict!
  }
  
  // Context alignment - if assistant asked a question and user responds appropriately
  if (assistantContent.type === 'dates_question' && frontendSignals.wantsDateInfo) {
    confidenceBoost += 10;
  }
  if (assistantContent.type === 'budget_question' && frontendSignals.wantsBudgetInfo) {
    confidenceBoost += 10;
  }
  if (assistantContent.type === 'travelers_question') {
    confidenceBoost += 5; // User is likely responding to this
  }
  
  // Undecided users need more guidance, not clarification
  if (frontendSignals.isUndecided) {
    // Don't reduce confidence, but suggest delegate_choice
    if (backendIntent.confidence < 60) {
      return {
        boostedConfidence: Math.max(backendIntent.confidence, 50),
        shouldClarify: false,
        suggestedIntent: 'delegate_choice',
        frontendSignals,
        detectedLanguage,
      };
    }
  }
  
  const boostedConfidence = Math.min(100, Math.max(0, backendIntent.confidence + confidenceBoost));
  
  // Only clarify if confidence is still low after boost
  const shouldClarify = boostedConfidence < 40 && !frontendSignals.isUndecided;
  
  return {
    boostedConfidence,
    shouldClarify,
    frontendSignals,
    detectedLanguage,
  };
}

/**
 * Quick intent suggestion based on frontend analysis alone
 * Useful when backend is slow or unavailable
 */
export function suggestIntentFromFrontend(userMessage: string): string | null {
  const signals = analyzeUserIntent(userMessage);
  
  if (signals.wantsToBook) return 'confirm_selection';
  if (signals.wantsComparison) return 'compare_options';
  if (signals.wantsMoreOptions) return 'request_alternatives';
  if (signals.wantsBudgetInfo && signals.mentionedBudget) return 'provide_budget';
  if (signals.isPositive) return 'accept_suggestion';
  if (signals.isNegative) return 'reject_suggestion';
  if (signals.isUndecided) return 'delegate_choice';
  
  return null;
}
