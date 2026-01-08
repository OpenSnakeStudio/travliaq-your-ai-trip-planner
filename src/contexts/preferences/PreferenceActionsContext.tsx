/**
 * Preference Actions Context
 * Actions context with stable references - won't cause re-renders
 */

import { createContext, useContext } from 'react';
import type { TripPreferences, StyleAxes, MustHaves, TravelStyle, TripContext, WorkPreferences } from './types';
import type { PreferenceAction } from './reducer';

// ============================================================================
// CONTEXT VALUE TYPE
// ============================================================================

export interface PreferenceActionsContextValue {
  // Raw dispatch (for advanced use cases)
  dispatch: React.Dispatch<PreferenceAction>;

  // Bulk update (used by PlannerChat)
  updatePreferences: (updates: Partial<TripPreferences>, fromChat?: boolean) => void;

  // Style Axes
  setStyleAxis: (axis: keyof StyleAxes, value: number) => void;

  // Base selections
  setTravelStyle: (style: TravelStyle) => void;

  // Interests (max 5)
  toggleInterest: (interest: string) => void;

  // Must-haves
  toggleMustHave: (key: keyof MustHaves) => void;

  // Work preferences
  setWorkPreference: (key: keyof WorkPreferences, value: boolean) => void;

  // Trip context
  setOccasion: (occasion: TripContext['occasion']) => void;
  setFlexibility: (flexibility: TripContext['flexibility']) => void;

  // Legacy methods (backward compatible - used by PlannerChat)
  setPace: (pace: TripPreferences['pace']) => void;
  setComfortLevel: (level: number) => void;
  toggleDietaryRestriction: (restriction: string) => void;
  toggleAccessibilityNeed: (need: string) => void;

  // Reset
  resetToDefaults: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

export const PreferenceActionsContext = createContext<PreferenceActionsContextValue | null>(null);

// ============================================================================
// HOOK
// ============================================================================

export function usePreferenceActions(): PreferenceActionsContextValue {
  const context = useContext(PreferenceActionsContext);
  if (!context) {
    throw new Error('usePreferenceActions must be used within PreferenceProvider');
  }
  return context;
}
