/**
 * Occasion Selector Component
 * Compact chips for travel occasions
 */

import { memo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import type { TripContext } from "@/stores/hooks";

interface OccasionOption {
  id: NonNullable<TripContext["occasion"]>;
  labelKey: string;
  emoji: string;
}

const OCCASIONS: OccasionOption[] = [
  { id: "vacation", labelKey: "planner.preferences.occasion.vacation", emoji: "🌴" },
  { id: "honeymoon", labelKey: "planner.preferences.occasion.honeymoon", emoji: "💒" },
  { id: "anniversary", labelKey: "planner.preferences.occasion.anniversary", emoji: "🎂" },
  { id: "birthday", labelKey: "planner.preferences.occasion.birthday", emoji: "🎉" },
  { id: "workation", labelKey: "planner.preferences.occasion.workation", emoji: "💻" },
  { id: "other", labelKey: "planner.preferences.occasion.discovery", emoji: "🗺️" },
];

interface OccasionSelectorProps {
  selected: TripContext["occasion"];
  onSelect: (occasion: TripContext["occasion"]) => void;
}

export const OccasionSelector = memo(function OccasionSelector({ selected, onSelect }: OccasionSelectorProps) {
  const { t } = useTranslation();
  
  // Stable handler to prevent re-renders from breaking memo
  const handleSelect = useCallback((id: TripContext["occasion"], isCurrentlySelected: boolean) => {
    onSelect(isCurrentlySelected ? undefined : id);
  }, [onSelect]);

  return (
    <div className="flex flex-wrap gap-1.5">
      {OCCASIONS.map((occasion) => {
        const isSelected = selected === occasion.id;

        return (
          <button
            key={occasion.id}
            onClick={() => handleSelect(occasion.id, isSelected)}
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all",
              isSelected
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <span className="text-sm">{occasion.emoji}</span>
            <span>{t(occasion.labelKey)}</span>
          </button>
        );
      })}
    </div>
  );
});

export default OccasionSelector;
