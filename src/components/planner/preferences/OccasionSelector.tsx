/**
 * Occasion Selector Component
 * Optional occasion selection for the trip
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
  { id: "birthday", label: "Fête", emoji: "🎉" },
  { id: "workation", label: "Workation", emoji: "💻" },
  { id: "other", label: "Autre", emoji: "✨" },
];

interface OccasionSelectorProps {
  selected: TripContext["occasion"];
  onSelect: (occasion: TripContext["occasion"]) => void;
  compact?: boolean;
}

export function OccasionSelector({ selected, onSelect, compact = false }: OccasionSelectorProps) {
  return (
    <div className={cn(
      "flex flex-wrap gap-2",
      compact && "gap-1.5"
    )}>
      {OCCASIONS.map((occasion) => {
        const isSelected = selected === occasion.id;
        
        return (
          <button
            key={occasion.id}
            onClick={() => onSelect(isSelected ? undefined : occasion.id)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all",
              compact && "px-2.5 py-1.5",
              isSelected
                ? "bg-primary/10 text-primary border border-primary/30"
                : "bg-muted/30 text-muted-foreground border border-border/30 hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <span>{occasion.emoji}</span>
            <span>{occasion.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default OccasionSelector;
