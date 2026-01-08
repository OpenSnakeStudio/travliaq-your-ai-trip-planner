/**
 * Occasion Selector Component
 * Compact chips for travel occasions
 */

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { TripContext } from "@/contexts/preferences";

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
  { id: "workation", label: "Télétravail", emoji: "💻" },
  { id: "other", label: "Découverte", emoji: "🗺️" },
];

interface OccasionSelectorProps {
  selected: TripContext["occasion"];
  onSelect: (occasion: TripContext["occasion"]) => void;
}

export const OccasionSelector = memo(function OccasionSelector({ selected, onSelect }: OccasionSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {OCCASIONS.map((occasion) => {
        const isSelected = selected === occasion.id;
        
        return (
          <button
            key={occasion.id}
            onClick={() => onSelect(isSelected ? undefined : occasion.id)}
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all",
              isSelected
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <span className="text-sm">{occasion.emoji}</span>
            <span>{occasion.label}</span>
          </button>
        );
      })}
    </div>
  );
});

export default OccasionSelector;
