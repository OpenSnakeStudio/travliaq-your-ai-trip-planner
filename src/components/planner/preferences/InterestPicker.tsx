/**
 * Interest Picker Component
 * Selectable interest tags with max limit
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
  { id: "nightlife", label: "Vie nocturne", emoji: "🍸" },
  { id: "shopping", label: "Shopping", emoji: "🛍️" },
  { id: "workation", label: "Workation", emoji: "💻" },
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
          "text-[10px] font-medium",
          isMaxReached ? "text-amber-500" : "text-muted-foreground"
        )}>
          {selected.length}/{maxSelections}
        </span>
      </div>
      
      <div className={cn(
        "flex flex-wrap gap-2",
        compact && "gap-1.5"
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
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                compact && "px-2.5 py-1",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : isDisabled
                    ? "bg-muted/30 text-muted-foreground/50 cursor-not-allowed"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span className={cn("text-sm", compact && "text-xs")}>{interest.emoji}</span>
              <span>{interest.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default InterestPicker;
