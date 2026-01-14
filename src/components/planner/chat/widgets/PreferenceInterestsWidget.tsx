/**
 * PreferenceInterestsWidget - Interest picker for chat flow
 * Exact replica of the Preferences panel widget (grid style)
 * Syncs with PreferenceMemory context
 */

import { memo, useCallback, useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePreferenceMemoryStore } from "@/stores/hooks";
import { cn } from "@/lib/utils";

interface PreferenceInterestsWidgetProps {
  /** Called when user clicks "Continue" to advance the flow */
  onContinue?: () => void;
}

// Interests with i18n keys
const INTERESTS_CONFIG = [
  { id: "culture", labelKey: "planner.interest.culture", emoji: "🏛️" },
  { id: "food", labelKey: "planner.interest.food", emoji: "🍽️" },
  { id: "nature", labelKey: "planner.interest.nature", emoji: "🌲" },
  { id: "beach", labelKey: "planner.interest.beach", emoji: "🏖️" },
  { id: "wellness", labelKey: "planner.interest.wellness", emoji: "🧘" },
  { id: "sport", labelKey: "planner.interest.sport", emoji: "⚽" },
  { id: "adventure", labelKey: "planner.interest.adventure", emoji: "🎢" },
  { id: "nightlife", labelKey: "planner.interest.nightlife", emoji: "🍸" },
  { id: "shopping", labelKey: "planner.interest.shopping", emoji: "🛍️" },
  { id: "history", labelKey: "planner.interest.history", emoji: "📜" },
];

const MAX_SELECTIONS = 5;

export const PreferenceInterestsWidget = memo(function PreferenceInterestsWidget({
  onContinue,
}: PreferenceInterestsWidgetProps) {
  const { t } = useTranslation();
  const { memory, toggleInterest } = usePreferenceMemoryStore();
  const selected = memory.preferences.interests;
  const isMaxReached = selected.length >= MAX_SELECTIONS;

  const handleToggle = useCallback((id: string, isDisabled: boolean) => {
    if (!isDisabled) {
      toggleInterest(id);
    }
  }, [toggleInterest]);

  // Memoize translated interests
  const translatedInterests = useMemo(() => 
    INTERESTS_CONFIG.map(interest => ({
      ...interest,
      label: t(interest.labelKey),
    })), [t]);

  return (
    <div className="mt-3 p-4 rounded-2xl bg-card border border-border shadow-md max-w-full">
      {/* Header with counter */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {t("planner.preference.selectUpTo", { max: MAX_SELECTIONS })}
        </span>
        <span className={cn(
          "text-xs font-bold px-2 py-0.5 rounded-full",
          isMaxReached 
            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" 
            : "bg-muted text-muted-foreground"
        )}>
          {selected.length}/{MAX_SELECTIONS}
        </span>
      </div>
      
      {/* Grid of interests - matching screenshot layout */}
      <div className="grid grid-cols-5 gap-2">
        {translatedInterests.map((interest) => {
          const isSelected = selected.includes(interest.id);
          const isDisabled = !isSelected && isMaxReached;
          
          return (
            <button
              key={interest.id}
              onClick={() => handleToggle(interest.id, isDisabled)}
              disabled={isDisabled}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-3 rounded-xl text-center transition-all",
                "min-h-[70px]",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-md"
                  : isDisabled
                    ? "bg-muted/30 text-muted-foreground/40 cursor-not-allowed"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span className="text-2xl">{interest.emoji}</span>
              <span className="text-[10px] font-medium leading-tight">{interest.label}</span>
            </button>
          );
        })}
      </div>

      {/* Continue Button - advances flow but widget stays visible */}
      {onContinue && (
        <button
          onClick={onContinue}
          className="mt-5 w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          {t("planner.preference.continue")}
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});

export default PreferenceInterestsWidget;
