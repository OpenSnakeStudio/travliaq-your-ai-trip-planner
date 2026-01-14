/**
 * usePreferenceWidgetCallbacks - Encapsulates preference widget flow callbacks
 * Reduces complexity in PlannerChat by isolating preference widget logic
 */

import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { ChatMessage } from "../types";
import type { InspireFlowStep } from "../MemoizedSmartSuggestions";
import type { WidgetType } from "@/types/flight";
import type { StyleAxes, MustHaves } from "@/stores/slices/preferenceTypes";

interface PreferenceMemoryShape {
  preferences: {
    styleAxes: StyleAxes;
    interests: string[];
    mustHaves: MustHaves;
    dietaryRestrictions: string[];
  };
}

interface WidgetTrackingShape {
  trackStyleConfig: (axes: Record<string, number>) => void;
  trackInterestsSelect: (interests: string[]) => void;
  recordInteraction: (
    id: string,
    type: string,
    data: Record<string, unknown>,
    label: string
  ) => void;
}

interface UsePreferenceWidgetCallbacksOptions {
  prefMemory: PreferenceMemoryShape;
  widgetTracking: WidgetTrackingShape;
  setInspireFlowStep: (step: InspireFlowStep) => void;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setDynamicSuggestions: React.Dispatch<
    React.SetStateAction<Array<{ id: string; label: string; emoji: string; message: string }>>
  >;
  handleFetchDestinations: (loadingMessageId: string) => Promise<void>;
}

interface PreferenceWidgetCallbacks {
  onStyleContinue: () => void;
  onInterestsContinue: () => void;
  onMustHavesContinue: () => void;
  onDietaryContinue: () => void;
}

export function usePreferenceWidgetCallbacks({
  prefMemory,
  widgetTracking,
  setInspireFlowStep,
  setMessages,
  setDynamicSuggestions,
  handleFetchDestinations,
}: UsePreferenceWidgetCallbacksOptions): PreferenceWidgetCallbacks {
  const { t } = useTranslation();

  /**
   * Called when user completes style widget
   */
  const onStyleContinue = useCallback(() => {
    // Track style configuration
    const styleAxes = prefMemory.preferences.styleAxes;
    widgetTracking.trackStyleConfig({ ...styleAxes });

    // After style, show interests widget
    setInspireFlowStep("interests");
    const interestsId = `pref-interests-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: interestsId,
        role: "assistant",
        text: t("planner.preference.selectInterests"),
        widget: "preferenceInterests" as WidgetType,
      },
    ]);
  }, [prefMemory.preferences.styleAxes, widgetTracking, setInspireFlowStep, setMessages, t]);

  /**
   * Called when user completes interests widget
   */
  const onInterestsContinue = useCallback(() => {
    // Track interests selection
    const interests = prefMemory.preferences.interests;
    widgetTracking.trackInterestsSelect(interests);

    // After interests, show "Autre chose?" question with suggestions
    setInspireFlowStep("extra");
    const questionId = `extra-question-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: questionId,
        role: "assistant",
        text: t("planner.preference.anythingElse"),
      },
    ]);

    // Dynamic suggestions for extra options
    setDynamicSuggestions([
      {
        id: "must-haves",
        label: t("planner.mustHaves.title"),
        emoji: "⚠️",
        message: "__WIDGET__mustHaves",
      },
      {
        id: "dietary",
        label: t("planner.dietary.title"),
        emoji: "🍽️",
        message: "__WIDGET__dietary",
      },
      {
        id: "nothing-else",
        label: t("planner.suggestion.nothingElse"),
        emoji: "✈️",
        message: "__FETCH_DESTINATIONS__",
      },
    ]);
  }, [prefMemory.preferences.interests, widgetTracking, setInspireFlowStep, setMessages, setDynamicSuggestions, t]);

  /**
   * Called when user completes must-haves widget
   */
  const onMustHavesContinue = useCallback(() => {
    // Track must-haves selection
    const mustHaves = prefMemory.preferences.mustHaves;
    widgetTracking.recordInteraction(
      `must-haves-${Date.now()}`,
      "must_haves_configured",
      { ...mustHaves },
      t("planner.preference.mustHavesConfigured")
    );

    // After must-haves, offer dietary or fetch destinations
    const questionId = `after-musthaves-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: questionId,
        role: "assistant",
        text: t("planner.preference.afterMustHaves"),
      },
    ]);

    setDynamicSuggestions([
      {
        id: "dietary",
        label: t("planner.dietary.title"),
        emoji: "🍽️",
        message: "__WIDGET__dietary",
      },
      {
        id: "nothing-else",
        label: t("planner.suggestion.nothingElse"),
        emoji: "✈️",
        message: "__FETCH_DESTINATIONS__",
      },
    ]);
  }, [prefMemory.preferences.mustHaves, widgetTracking, setMessages, setDynamicSuggestions, t]);

  /**
   * Called when user completes dietary widget
   */
  const onDietaryContinue = useCallback(() => {
    // Track dietary restrictions
    const dietary = prefMemory.preferences.dietaryRestrictions;
    if (dietary.length > 0) {
      widgetTracking.recordInteraction(
        `dietary-${Date.now()}`,
        "dietary_configured",
        { restrictions: dietary },
        t("planner.preference.dietaryConfigured", { restrictions: dietary.join(", ") })
      );
    }

    // After dietary, fetch destinations directly
    const loadingId = `fetching-destinations-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: loadingId,
        role: "assistant",
        text: t("planner.preference.searchingDestinations"),
        isTyping: true,
      },
    ]);
    setDynamicSuggestions([]);

    // Trigger destination fetch
    handleFetchDestinations(loadingId);
  }, [
    prefMemory.preferences.dietaryRestrictions,
    widgetTracking,
    setMessages,
    setDynamicSuggestions,
    handleFetchDestinations,
    t,
  ]);

  return {
    onStyleContinue,
    onInterestsContinue,
    onMustHavesContinue,
    onDietaryContinue,
  };
}
