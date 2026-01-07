/**
 * Interest Picker Component
 * Grid of selectable interests with max limit
 */

import { cn } from "@/lib/utils";

interface Interest {
  id: string;
  label: string;
  emoji: string;
}

const INTERESTS: Interest[] = [
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

interface InterestPickerProps {
  selected: string[];
  onToggle: (interest: string) => void;
  maxSelections?: number;
  compact?: boolean;
}

export function InterestPicker({ 
  selected, 
  onToggle, 
  maxSelections = 5,
  compact = false 
}: InterestPickerProps) {
  const isMaxReached = selected.length >= maxSelections;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
          Sélectionnez jusqu'à {maxSelections}
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
              onClick={() => !isDisabled && onToggle(interest.id)}
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
              <span className="text-[9px] font-medium leading-tight">{interest.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default InterestPicker;
