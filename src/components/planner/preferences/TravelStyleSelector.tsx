/**
 * Travel Style Selector Component
 * Compact single-line travel style selection (no pet option)
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
  { id: "couple", label: "Couple", emoji: "💑" },
  { id: "family", label: "Famille", emoji: "👨‍👩‍👧" },
  { id: "friends", label: "Amis", emoji: "👯" },
];

interface TravelStyleSelectorProps {
  selected: TravelStyle;
  onSelect: (style: TravelStyle) => void;
  compact?: boolean;
}

export function TravelStyleSelector({ selected, onSelect, compact = false }: TravelStyleSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      {TRAVEL_STYLES.map((style) => {
        const isSelected = selected === style.id;
        
        return (
          <button
            key={style.id}
            onClick={() => onSelect(style.id)}
            className={cn(
              "relative flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all flex-1 justify-center",
              compact && "px-2 py-1.5",
              isSelected
                ? "bg-primary/15 text-primary border-2 border-primary shadow-sm"
                : "bg-muted/30 text-muted-foreground border border-border/30 hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <span className={cn("text-lg", compact && "text-base")}>{style.emoji}</span>
            <span className={cn(
              "text-xs font-medium",
              compact && "text-[10px]"
            )}>
              {style.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default TravelStyleSelector;
