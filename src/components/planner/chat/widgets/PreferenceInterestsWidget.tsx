/**
 * PreferenceInterestsWidget - Interest picker for chat flow
 * Exact replica of the Preferences panel widget (grid style)
 * Syncs with PreferenceMemory context
 */

import { memo, useCallback } from "react";
import { ArrowRight } from "lucide-react";
import { usePreferenceMemoryStore } from "@/stores/hooks";
import { cn } from "@/lib/utils";

interface PreferenceInterestsWidgetProps {
  /** Called when user clicks "Continue" to advance the flow */
  onContinue?: () => void;
}

// Interests matching the screenshot exactly
const INTERESTS = [
  { id: "culture", label: "Culture", emoji: "🏛️" },
  { id: "food", label: "Gastronomie", emoji: "🍽️" },
  { id: "nature", label: "Nature", emoji: "🌲" },
  { id: "beach", label: "Plage", emoji: "🏖️" },
  { id: "wellness", label: "Bien-être", emoji: "🧘" },
  { id: "sport", label: "Sport", emoji: "⚽" },
  { id: "adventure", label: "Aventure", emoji: "🎢" },
  { id: "nightlife", label: "Sorties", emoji: "🍸" },
  { id: "shopping", label: "Shopping", emoji: "🛍️" },
  { id: "history", label: "Histoire", emoji: "📜" },
];

const MAX_SELECTIONS = 5;

export const PreferenceInterestsWidget = memo(function PreferenceInterestsWidget({
  onContinue,
}: PreferenceInterestsWidgetProps) {
  const { memory, toggleInterest } = usePreferenceMemoryStore();
  const selected = memory.preferences.interests;
  const isMaxReached = selected.length >= MAX_SELECTIONS;

  const handleToggle = useCallback((id: string, isDisabled: boolean) => {
    if (!isDisabled) {
      toggleInterest(id);
    }
  }, [toggleInterest]);

  return (
    <div className="mt-3 p-4 rounded-2xl bg-card border border-border shadow-md max-w-full">
      {/* Header with counter */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Sélectionnez jusqu'à {MAX_SELECTIONS}
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
        {INTERESTS.map((interest) => {
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
          Continuer
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});

export default PreferenceInterestsWidget;
