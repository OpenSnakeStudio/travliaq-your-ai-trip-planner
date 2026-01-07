/**
 * Occasion Selector Component
 * Clean grid of travel occasions
 */

import { cn } from "@/lib/utils";
import type { TripContext } from "@/contexts/PreferenceMemoryContext";

interface OccasionOption {
  id: NonNullable<TripContext["occasion"]>;
  label: string;
  emoji: string;
}

const OCCASIONS: OccasionOption[] = [
  { id: "vacation", label: "Vacances", emoji: "🌴" },
  { id: "honeymoon", label: "Lune de miel", emoji: "💒" },
  { id: "anniversary", label: "Anniversaire", emoji: "🎂" },
  { id: "birthday", label: "Célébration", emoji: "🎉" },
  { id: "workation", label: "Télétravail", emoji: "💻" },
  { id: "other", label: "Découverte", emoji: "🗺️" },
];

interface OccasionSelectorProps {
  selected: TripContext["occasion"];
  onSelect: (occasion: TripContext["occasion"]) => void;
  compact?: boolean;
}

export function OccasionSelector({ selected, onSelect, compact = false }: OccasionSelectorProps) {
  return (
    <div className={cn(
      "grid grid-cols-3 gap-2",
      compact && "gap-1.5"
    )}>
      {OCCASIONS.map((occasion) => {
        const isSelected = selected === occasion.id;
        
        return (
          <button
            key={occasion.id}
            onClick={() => onSelect(isSelected ? undefined : occasion.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-xl text-center transition-all",
              compact && "px-2 py-2",
              isSelected
                ? "bg-primary/15 text-primary border-2 border-primary"
                : "bg-muted/30 text-muted-foreground border border-border/30 hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <span className="text-lg">{occasion.emoji}</span>
            <span className="text-[10px] font-medium leading-tight">{occasion.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default OccasionSelector;
