/**
 * Preference Hooks
 * Custom hooks for accessing preference state, actions, and computed values
 */

import { usePreferenceState } from './PreferenceStateContext';
import { usePreferenceActions } from './PreferenceActionsContext';
import { usePreferenceComputed } from './PreferenceComputedContext';
import type { PreferenceMemory } from './types';

// Re-export individual context hooks
export { usePreferenceState } from './PreferenceStateContext';
export { usePreferenceActions } from './PreferenceActionsContext';
export { usePreferenceComputed } from './PreferenceComputedContext';

// ============================================================================
// BACKWARD COMPATIBLE HOOK
// ============================================================================

/**
 * Main hook - FULLY BACKWARD COMPATIBLE with original usePreferenceMemory
 *
 * Used by:
 * - PlannerChat.tsx (updatePreferences, toggleInterest, setPace, setComfortLevel, getSerializedState)
 * - PreferencesPanel.tsx (all actions)
 * - ActivityFilters.tsx (memory.preferences)
 * - PreferenceSummary.tsx (getPreferences, getProfileCompletion)
 */
export function usePreferenceMemory() {
  const { preferences, isHydrated } = usePreferenceState();
  const actions = usePreferenceActions();
  const computed = usePreferenceComputed();

  // Return same structure as original hook
  return {
    // STRUCTURE IDENTIQUE À L'ACTUEL - pour PlannerChat, ActivityFilters, etc.
    memory: { preferences } as PreferenceMemory,
    isHydrated,

    // ACTIONS (utilisées par Chat et Widget)
    updatePreferences: actions.updatePreferences,
    setStyleAxis: actions.setStyleAxis,
    setTravelStyle: actions.setTravelStyle,
    toggleInterest: actions.toggleInterest,
    toggleMustHave: actions.toggleMustHave,
    setWorkPreference: actions.setWorkPreference,
    setOccasion: actions.setOccasion,
    setFlexibility: actions.setFlexibility,
    setPace: actions.setPace,
    setComfortLevel: actions.setComfortLevel,
    toggleDietaryRestriction: actions.toggleDietaryRestriction,
    toggleAccessibilityNeed: actions.toggleAccessibilityNeed,
    resetToDefaults: actions.resetToDefaults,

    // COMPUTED (utilisées par Chat et autres widgets)
    getPreferences: computed.getPreferences,
    getPreferenceSummary: computed.getPreferenceSummary,
    getComfortLabel: computed.getComfortLabel,
    getProfileCompletion: computed.getProfileCompletion,
    getHotelFilters: computed.getHotelFilters,
    getActivityFilters: computed.getActivityFilters,
    getFlightPreferences: computed.getFlightPreferences,
    getSerializedState: computed.getSerializedState,
  };
}

// ============================================================================
// SELECTIVE HOOKS (for performance optimization)
// ============================================================================

/**
 * Hook for style axes only
 * Use in StyleEqualizer for minimal re-renders
 */
export function useStyleAxes() {
  const { preferences } = usePreferenceState();
  const { setStyleAxis } = usePreferenceActions();
  return {
    styleAxes: preferences.styleAxes,
    setStyleAxis,
  };
}

/**
 * Hook for interests only
 * Use in InterestPicker for minimal re-renders
 */
export function useInterests() {
  const { preferences } = usePreferenceState();
  const { toggleInterest } = usePreferenceActions();
  return {
    interests: preferences.interests,
    toggleInterest,
    maxSelections: 5,
  };
}

/**
 * Hook for must-haves only
 * Use in MustHavesSwitches for minimal re-renders
 */
export function useMustHaves() {
  const { preferences } = usePreferenceState();
  const { toggleMustHave } = usePreferenceActions();
  return {
    mustHaves: preferences.mustHaves,
    toggleMustHave,
  };
}

/**
 * Hook for travel style only
 * Use in TravelStyleSelector for minimal re-renders
 */
export function useTravelStyle() {
  const { preferences } = usePreferenceState();
  const { setTravelStyle } = usePreferenceActions();
  return {
    travelStyle: preferences.travelStyle,
    setTravelStyle,
  };
}

/**
 * Hook for occasion only
 * Use in OccasionSelector for minimal re-renders
 */
export function useOccasion() {
  const { preferences } = usePreferenceState();
  const { setOccasion } = usePreferenceActions();
  return {
    occasion: preferences.tripContext.occasion,
    setOccasion,
  };
}

/**
 * Hook for dietary restrictions only
 * Use in DietaryPicker for minimal re-renders
 */
export function useDietaryRestrictions() {
  const { preferences } = usePreferenceState();
  const { toggleDietaryRestriction } = usePreferenceActions();
  return {
    dietaryRestrictions: preferences.dietaryRestrictions,
    toggleDietaryRestriction,
  };
}

/**
 * Hook for profile completion
 * Use in ProfileCompletionCard for minimal re-renders
 */
export function useProfileCompletion() {
  const { getProfileCompletion, getPreferenceSummary } = usePreferenceComputed();
  const { preferences } = usePreferenceState();
  return {
    completion: getProfileCompletion(),
    summary: getPreferenceSummary(),
    lastUpdated: preferences.lastUpdated,
    detectedFromChat: preferences.detectedFromChat,
  };
}
