/**
 * Interest Picker Component
 * Grid of selectable interests with max limit
 */

import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface Interest {
  id: string;
  labelKey: string;
  emoji: string;
}

const INTERESTS: Interest[] = [
  { id: "culture", labelKey: "planner.preferences.interests.culture", emoji: "🏛️" },
  { id: "food", labelKey: "planner.preferences.interests.food", emoji: "🍽️" },
  { id: "nature", labelKey: "planner.preferences.interests.nature", emoji: "🌲" },
  { id: "beach", labelKey: "planner.preferences.interests.beach", emoji: "🏖️" },
  { id: "wellness", labelKey: "planner.preferences.interests.wellness", emoji: "🧘" },
  { id: "sport", labelKey: "planner.preferences.interests.sport", emoji: "⚽" },
  { id: "adventure", labelKey: "planner.preferences.interests.adventure", emoji: "🎢" },
  { id: "nightlife", labelKey: "planner.preferences.interests.nightlife", emoji: "🍸" },
  { id: "shopping", labelKey: "planner.preferences.interests.shopping", emoji: "🛍️" },
  { id: "history", labelKey: "planner.preferences.interests.history", emoji: "📜" },
];

interface InterestPickerProps {
  selected: string[];
  onToggle: (interest: string) => void;
  maxSelections?: number;
  compact?: boolean;
}

export const InterestPicker = memo(function InterestPicker({
  selected,
  onToggle,
  maxSelections = 5,
  compact = false
}: InterestPickerProps) {
  const { t } = useTranslation();
  const isMaxReached = selected.length >= maxSelections;

  // Stable handler to prevent re-renders from breaking memo
  const handleToggle = useCallback((id: string, isDisabled: boolean) => {
    if (!isDisabled) {
      onToggle(id);
    }
  }, [onToggle]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
          {t("planner.preferences.interests.selectUpTo", { count: maxSelections })}
        </span>
        <span className={cn(
          "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
          isMaxReached 
            ? "bg-amber-500/20 text-amber-600" 
            : "bg-muted text-muted-foreground"
        )}>
          {selected.length}/{maxSelections}
        </span>
      </div>
      
      <div className={cn(
        "grid grid-cols-5 gap-1.5",
        compact && "gap-1"
      )}>
        {INTERESTS.map((interest) => {
          const isSelected = selected.includes(interest.id);
          const isDisabled = !isSelected && isMaxReached;
          
          return (
            <button
              key={interest.id}
              onClick={() => handleToggle(interest.id, isDisabled)}
              disabled={isDisabled}
              className={cn(
                "flex flex-col items-center gap-0.5 p-2 rounded-lg text-center transition-all",
                compact && "p-1.5",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : isDisabled
                    ? "bg-muted/20 text-muted-foreground/40 cursor-not-allowed"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <span className="text-base">{interest.emoji}</span>
              <span className="text-[9px] font-medium leading-tight">{t(interest.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default InterestPicker;
