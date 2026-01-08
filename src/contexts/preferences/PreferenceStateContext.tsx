/**
 * Preference State Context
 * Read-only state context - only re-renders when preferences change
 */

import { createContext, useContext } from 'react';
import type { TripPreferences } from './types';

// ============================================================================
// CONTEXT VALUE TYPE
// ============================================================================

export interface PreferenceStateContextValue {
  preferences: TripPreferences;
  isHydrated: boolean;
}

// ============================================================================
// CONTEXT
// ============================================================================

export const PreferenceStateContext = createContext<PreferenceStateContextValue | null>(null);

// ============================================================================
// HOOK
// ============================================================================

export function usePreferenceState(): PreferenceStateContextValue {
  const context = useContext(PreferenceStateContext);
  if (!context) {
    throw new Error('usePreferenceState must be used within PreferenceProvider');
  }
  return context;
}
