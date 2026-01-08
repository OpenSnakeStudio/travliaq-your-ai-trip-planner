/**
 * Preference Provider
 * Combined provider that wraps State, Actions, and Computed contexts
 */

import { useReducer, useEffect, useMemo, useCallback, useState, useRef, type ReactNode } from 'react';
import { preferenceReducer } from './reducer';
import { loadFromStorage, saveToStorage } from './storage';
import { createDefaultPreferences } from './defaults';
import { PreferenceStateContext } from './PreferenceStateContext';
import { PreferenceActionsContext, type PreferenceActionsContextValue } from './PreferenceActionsContext';
import { PreferenceComputedContext, type PreferenceComputedContextValue } from './PreferenceComputedContext';
import * as selectors from './selectors';
import { eventBus } from '@/lib/eventBus';
import type { TripPreferences, StyleAxes, MustHaves, TravelStyle, TripContext, WorkPreferences, PreferenceMemory } from './types';

// ============================================================================
// DEBOUNCE UTILITY
// ============================================================================

function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): T & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = ((...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
  };

  return debounced;
}

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface PreferenceProviderProps {
  children: ReactNode;
}

export function PreferenceProvider({ children }: PreferenceProviderProps) {
  // Initialize from localStorage
  const [preferences, dispatch] = useReducer(
    preferenceReducer,
    null,
    () => loadFromStorage().preferences
  );

  const [isHydrated, setIsHydrated] = useState(false);
  const preferencesRef = useRef(preferences);

  // Keep ref in sync for unmount cleanup
  useEffect(() => {
    preferencesRef.current = preferences;
  }, [preferences]);

  // Hydration effect
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Debounced save function (stable reference)
  const debouncedSave = useMemo(
    () => debounce((prefs: TripPreferences) => {
      saveToStorage({ preferences: prefs });
    }, 500),
    []
  );

  // Persistence effect - save to localStorage when preferences change (debounced)
  useEffect(() => {
    if (!isHydrated) return;
    debouncedSave(preferences);
  }, [preferences, isHydrated, debouncedSave]);

  // Cleanup - force save on unmount to prevent data loss
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
      // Force immediate save on unmount
      saveToStorage({ preferences: preferencesRef.current });
    };
  }, [debouncedSave]);

  // ============================================================================
  // STATE CONTEXT VALUE
  // ============================================================================

  const stateValue = useMemo(() => ({
    preferences,
    isHydrated,
  }), [preferences, isHydrated]);

  // ============================================================================
  // ACTIONS CONTEXT VALUE (Stable references via useMemo with dispatch dependency)
  // ============================================================================

  const actionsValue = useMemo<PreferenceActionsContextValue>(() => ({
    dispatch,

    updatePreferences: (updates: Partial<TripPreferences>, fromChat?: boolean) => {
      dispatch({ type: 'UPDATE_PREFERENCES', payload: updates, fromChat });
      eventBus.emit('tab:flash', { tab: 'preferences' });
    },

    setStyleAxis: (axis: keyof StyleAxes, value: number) => {
      dispatch({ type: 'SET_STYLE_AXIS', axis, value });
    },

    setTravelStyle: (style: TravelStyle) => {
      dispatch({ type: 'SET_TRAVEL_STYLE', style });
    },

    toggleInterest: (interest: string) => {
      dispatch({ type: 'TOGGLE_INTEREST', interest });
    },

    toggleMustHave: (key: keyof MustHaves) => {
      dispatch({ type: 'TOGGLE_MUST_HAVE', key });
    },

    setWorkPreference: (key: keyof WorkPreferences, value: boolean) => {
      dispatch({ type: 'SET_WORK_PREFERENCE', key, value });
    },

    setOccasion: (occasion: TripContext['occasion']) => {
      dispatch({ type: 'SET_OCCASION', occasion });
    },

    setFlexibility: (flexibility: TripContext['flexibility']) => {
      dispatch({ type: 'SET_FLEXIBILITY', flexibility });
    },

    setPace: (pace: TripPreferences['pace']) => {
      dispatch({ type: 'SET_PACE', pace });
    },

    setComfortLevel: (level: number) => {
      dispatch({ type: 'SET_COMFORT_LEVEL', level });
    },

    toggleDietaryRestriction: (restriction: string) => {
      dispatch({ type: 'TOGGLE_DIETARY_RESTRICTION', restriction });
    },

    toggleAccessibilityNeed: (need: string) => {
      dispatch({ type: 'TOGGLE_ACCESSIBILITY_NEED', need });
    },

    resetToDefaults: () => {
      dispatch({ type: 'RESET_TO_DEFAULTS' });
    },
  }), [dispatch]);

  // ============================================================================
  // COMPUTED CONTEXT VALUE
  // ============================================================================

  const computedValue = useMemo<PreferenceComputedContextValue>(() => ({
    getPreferences: () => preferences,
    getPreferenceSummary: () => selectors.selectPreferenceSummary(preferences),
    getComfortLabel: () => selectors.selectComfortLabel(preferences),
    getProfileCompletion: () => selectors.selectProfileCompletion(preferences),
    getHotelFilters: () => selectors.selectHotelFilters(preferences),
    getActivityFilters: () => selectors.selectActivityFilters(preferences),
    getFlightPreferences: () => selectors.selectFlightPreferences(preferences),
    getSerializedState: () => selectors.selectSerializedState(preferences),
  }), [preferences]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <PreferenceStateContext.Provider value={stateValue}>
      <PreferenceActionsContext.Provider value={actionsValue}>
        <PreferenceComputedContext.Provider value={computedValue}>
          {children}
        </PreferenceComputedContext.Provider>
      </PreferenceActionsContext.Provider>
    </PreferenceStateContext.Provider>
  );
}
