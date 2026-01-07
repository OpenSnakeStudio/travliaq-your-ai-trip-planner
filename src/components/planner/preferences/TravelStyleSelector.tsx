/**
 * Travel Style Selector Component
 * Visual cards for selecting travel style (solo, couple, family, etc.)
 */

import { cn } from "@/lib/utils";
import type { TravelStyle } from "@/contexts/PreferenceMemoryContext";

interface TravelStyleOption {
  id: TravelStyle;
  label: string;
  emoji: string;
  description: string;
}

const TRAVEL_STYLES: TravelStyleOption[] = [
  { id: "solo", label: "Solo", emoji: "🧑", description: "Aventure en solitaire" },
  { id: "couple", label: "Couple", emoji: "💑", description: "Escapade romantique" },
  { id: "family", label: "Famille", emoji: "👨‍👩‍👧", description: "Voyage en famille" },
  { id: "friends", label: "Amis", emoji: "👯", description: "Entre amis" },
  { id: "pet", label: "Avec animal", emoji: "🐾", description: "Avec votre compagnon" },
];

interface TravelStyleSelectorProps {
  selected: TravelStyle;
  onSelect: (style: TravelStyle) => void;
  compact?: boolean;
}

export function TravelStyleSelector({ selected, onSelect, compact = false }: TravelStyleSelectorProps) {
  return (
    <div className={cn(
      "grid gap-2",
      compact ? "grid-cols-5" : "grid-cols-2 sm:grid-cols-3"
    )}>
      {TRAVEL_STYLES.map((style) => {
        const isSelected = selected === style.id;
        
        return (
          <button
            key={style.id}
            onClick={() => onSelect(style.id)}
            className={cn(
              "relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl transition-all",
              compact && "p-2 gap-1",
              isSelected
                ? "bg-primary/10 text-primary border-2 border-primary shadow-sm"
                : "bg-muted/30 text-muted-foreground border border-border/30 hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <span className={cn("text-2xl", compact && "text-xl")}>{style.emoji}</span>
            <span className={cn(
              "text-xs font-medium",
              compact && "text-[10px]"
            )}>
              {style.label}
            </span>
            {!compact && (
              <span className="text-[10px] text-muted-foreground text-center">
                {style.description}
              </span>
            )}
            {isSelected && (
              <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default TravelStyleSelector;
