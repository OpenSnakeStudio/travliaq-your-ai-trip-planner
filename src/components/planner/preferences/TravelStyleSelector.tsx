/**
 * Travel Style Selector Component
 * Clear, readable travel style buttons
 */

import { cn } from "@/lib/utils";
import type { TravelStyle } from "@/contexts/PreferenceMemoryContext";

interface TravelStyleOption {
  id: TravelStyle;
  label: string;
  emoji: string;
}

const TRAVEL_STYLES: TravelStyleOption[] = [
  { id: "solo", label: "Solo", emoji: "🧑" },
  { id: "couple", label: "Duo", emoji: "💑" },
  { id: "family", label: "Famille", emoji: "👨‍👩‍👧" },
  { id: "friends", label: "Amis", emoji: "👯" },
];

interface TravelStyleSelectorProps {
  selected: TravelStyle;
  onSelect: (style: TravelStyle) => void;
}

export function TravelStyleSelector({ selected, onSelect }: TravelStyleSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {TRAVEL_STYLES.map((style) => {
        const isSelected = selected === style.id;
        
        return (
          <button
            key={style.id}
            onClick={() => onSelect(style.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl transition-all",
              isSelected
                ? "bg-primary text-primary-foreground shadow-md scale-[1.02]"
                : "bg-muted/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <span className="text-2xl">{style.emoji}</span>
            <span className="text-xs font-semibold">{style.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default TravelStyleSelector;
