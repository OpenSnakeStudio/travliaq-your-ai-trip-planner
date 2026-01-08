/**
 * Preference Reducer
 * useReducer pattern for preference state management
 */

import type { TripPreferences, StyleAxes, MustHaves, TravelStyle, TripContext, WorkPreferences } from './types';
import { createDefaultPreferences } from './defaults';

// ============================================================================
// ACTION TYPES
// ============================================================================

export type PreferenceAction =
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<TripPreferences>; fromChat?: boolean }
  | { type: 'SET_STYLE_AXIS'; axis: keyof StyleAxes; value: number }
  | { type: 'SET_TRAVEL_STYLE'; style: TravelStyle }
  | { type: 'TOGGLE_INTEREST'; interest: string }
  | { type: 'TOGGLE_MUST_HAVE'; key: keyof MustHaves }
  | { type: 'SET_WORK_PREFERENCE'; key: keyof WorkPreferences; value: boolean }
  | { type: 'SET_OCCASION'; occasion: TripContext['occasion'] }
  | { type: 'SET_FLEXIBILITY'; flexibility: TripContext['flexibility'] }
  | { type: 'SET_PACE'; pace: TripPreferences['pace'] }
  | { type: 'SET_COMFORT_LEVEL'; level: number }
  | { type: 'TOGGLE_DIETARY_RESTRICTION'; restriction: string }
  | { type: 'TOGGLE_ACCESSIBILITY_NEED'; need: string }
  | { type: 'RESET_TO_DEFAULTS' };

// ============================================================================
// REDUCER
// ============================================================================

export function preferenceReducer(
  state: TripPreferences,
  action: PreferenceAction
): TripPreferences {
  const now = new Date();

  switch (action.type) {
    case 'UPDATE_PREFERENCES': {
      const newManualOverrides = action.fromChat
        ? state.manualOverrides
        : [...new Set([...state.manualOverrides, ...Object.keys(action.payload)])];

      // Sync comfortLevel ↔ styleAxes.ecoVsLuxury
      let syncedPayload = { ...action.payload };
      if ('comfortLevel' in action.payload && action.payload.comfortLevel !== undefined) {
        syncedPayload = {
          ...syncedPayload,
          styleAxes: {
            ...state.styleAxes,
            ...action.payload.styleAxes,
            ecoVsLuxury: action.payload.comfortLevel,
          },
        };
      }
      if (action.payload.styleAxes?.ecoVsLuxury !== undefined) {
        syncedPayload.comfortLevel = action.payload.styleAxes.ecoVsLuxury;
      }

      return {
        ...state,
        ...syncedPayload,
        lastUpdated: now,
        detectedFromChat: action.fromChat ?? false,
        manualOverrides: newManualOverrides,
      };
    }

    case 'SET_STYLE_AXIS': {
      const clampedValue = Math.max(0, Math.min(100, action.value));
      const newStyleAxes = { ...state.styleAxes, [action.axis]: clampedValue };

      const updates: Partial<TripPreferences> = {
        styleAxes: newStyleAxes,
        lastUpdated: now,
        detectedFromChat: false,
        manualOverrides: [...new Set([...state.manualOverrides, 'styleAxes'])],
      };

      // Sync ecoVsLuxury with comfortLevel
      if (action.axis === 'ecoVsLuxury') {
        updates.comfortLevel = clampedValue;
      }

      // Sync chillVsIntense with pace
      if (action.axis === 'chillVsIntense') {
        if (clampedValue < 35) updates.pace = 'relaxed';
        else if (clampedValue < 70) updates.pace = 'moderate';
        else updates.pace = 'intense';
      }

      return { ...state, ...updates };
    }

    case 'SET_TRAVEL_STYLE': {
      const newMustHaves = { ...state.mustHaves };
      // Auto-set family-friendly if family
      if (action.style === 'family') newMustHaves.familyFriendly = true;
      // Auto-set pet-friendly if pet
      if (action.style === 'pet') newMustHaves.petFriendly = true;

      return {
        ...state,
        travelStyle: action.style,
        mustHaves: newMustHaves,
        lastUpdated: now,
        detectedFromChat: false,
        manualOverrides: [...new Set([...state.manualOverrides, 'travelStyle'])],
      };
    }

    case 'TOGGLE_INTEREST': {
      let interests = [...state.interests];
      if (interests.includes(action.interest)) {
        interests = interests.filter(i => i !== action.interest);
      } else if (interests.length < 5) {
        interests.push(action.interest);
      }

      // Auto-set workation mode if workation interest
      const workPreferences = { ...state.workPreferences };
      if (action.interest === 'workation' && interests.includes('workation')) {
        workPreferences.workationMode = true;
        workPreferences.needsWifi = true;
      }

      return {
        ...state,
        interests,
        workPreferences,
        lastUpdated: now,
        detectedFromChat: false,
        manualOverrides: [...new Set([...state.manualOverrides, 'interests'])],
      };
    }

    case 'TOGGLE_MUST_HAVE': {
      return {
        ...state,
        mustHaves: {
          ...state.mustHaves,
          [action.key]: !state.mustHaves[action.key],
        },
        lastUpdated: now,
        detectedFromChat: false,
        manualOverrides: [...new Set([...state.manualOverrides, 'mustHaves'])],
      };
    }

    case 'SET_WORK_PREFERENCE': {
      return {
        ...state,
        workPreferences: {
          ...state.workPreferences,
          [action.key]: action.value,
        },
        lastUpdated: now,
        detectedFromChat: false,
      };
    }

    case 'SET_OCCASION': {
      return {
        ...state,
        tripContext: { ...state.tripContext, occasion: action.occasion },
        lastUpdated: now,
        detectedFromChat: false,
      };
    }

    case 'SET_FLEXIBILITY': {
      return {
        ...state,
        tripContext: { ...state.tripContext, flexibility: action.flexibility },
        lastUpdated: now,
        detectedFromChat: false,
      };
    }

    case 'SET_PACE': {
      // Sync with styleAxes.chillVsIntense
      const chillVsIntense = action.pace === 'relaxed' ? 20 : action.pace === 'moderate' ? 50 : 80;
      return {
        ...state,
        pace: action.pace,
        styleAxes: { ...state.styleAxes, chillVsIntense },
        lastUpdated: now,
        detectedFromChat: false,
      };
    }

    case 'SET_COMFORT_LEVEL': {
      const clamped = Math.max(0, Math.min(100, action.level));
      return {
        ...state,
        comfortLevel: clamped,
        styleAxes: { ...state.styleAxes, ecoVsLuxury: clamped },
        lastUpdated: now,
        detectedFromChat: false,
      };
    }

    case 'TOGGLE_DIETARY_RESTRICTION': {
      const dietaryRestrictions = state.dietaryRestrictions.includes(action.restriction)
        ? state.dietaryRestrictions.filter(r => r !== action.restriction)
        : [...state.dietaryRestrictions, action.restriction];
      return {
        ...state,
        dietaryRestrictions,
        lastUpdated: now,
        detectedFromChat: false,
      };
    }

    case 'TOGGLE_ACCESSIBILITY_NEED': {
      const accessibilityNeeds = state.accessibilityNeeds.includes(action.need)
        ? state.accessibilityNeeds.filter(n => n !== action.need)
        : [...state.accessibilityNeeds, action.need];

      // Sync with mustHaves
      const hasWheelchair = accessibilityNeeds.includes('wheelchair');
      return {
        ...state,
        accessibilityNeeds,
        mustHaves: { ...state.mustHaves, accessibilityRequired: hasWheelchair },
        lastUpdated: now,
        detectedFromChat: false,
      };
    }

    case 'RESET_TO_DEFAULTS': {
      return createDefaultPreferences();
    }

    default:
      return state;
  }
}
