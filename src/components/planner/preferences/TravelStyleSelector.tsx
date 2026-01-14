/**
 * Travel Style Selector Component
 * Clear, readable travel style buttons
 */

import { memo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import type { TravelStyle } from "@/stores/hooks";

interface TravelStyleOption {
  id: TravelStyle;
  labelKey: string;
  emoji: string;
}

const TRAVEL_STYLES: TravelStyleOption[] = [
  { id: "solo", labelKey: "planner.preferences.travelStyle.solo", emoji: "🧑" },
  { id: "couple", labelKey: "planner.preferences.travelStyle.duo", emoji: "💑" },
  { id: "family", labelKey: "planner.preferences.travelStyle.family", emoji: "👨‍👩‍👧" },
  { id: "friends", labelKey: "planner.preferences.travelStyle.friends", emoji: "👯" },
];

interface TravelStyleSelectorProps {
  selected: TravelStyle;
  onSelect: (style: TravelStyle) => void;
}

export const TravelStyleSelector = memo(function TravelStyleSelector({ selected, onSelect }: TravelStyleSelectorProps) {
  const { t } = useTranslation();
  
  // Stable handler to prevent re-renders from breaking memo
  const handleSelect = useCallback((id: TravelStyle) => {
    onSelect(id);
  }, [onSelect]);

  return (
    <div className="grid grid-cols-4 gap-2">
      {TRAVEL_STYLES.map((style) => {
        const isSelected = selected === style.id;

        return (
          <button
            key={style.id}
            onClick={() => handleSelect(style.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl transition-all",
              isSelected
                ? "bg-primary text-primary-foreground shadow-md scale-[1.02]"
                : "bg-muted/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <span className="text-2xl">{style.emoji}</span>
            <span className="text-xs font-semibold">{t(style.labelKey)}</span>
          </button>
        );
      })}
    </div>
  );
});

export default TravelStyleSelector;
