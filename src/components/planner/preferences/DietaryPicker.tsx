/**
 * Dietary Restrictions Picker Component
 * Compact grid of cards - smaller buttons, smaller icons
 */

import { memo } from "react";
import { cn } from "@/lib/utils";
import { Leaf, Salad, Moon, Star, Wheat, Fish, Milk, Egg, Nut, Check } from "lucide-react";

interface DietaryOption {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

const DIETARY_OPTIONS: DietaryOption[] = [
  { id: "vegetarian", label: "Végétarien", icon: Salad, color: "hsl(140, 60%, 45%)" },
  { id: "vegan", label: "Végan", icon: Leaf, color: "hsl(120, 50%, 40%)" },
  { id: "halal", label: "Halal", icon: Moon, color: "hsl(200, 70%, 50%)" },
  { id: "kosher", label: "Casher", icon: Star, color: "hsl(45, 80%, 50%)" },
  { id: "gluten-free", label: "Sans gluten", icon: Wheat, color: "hsl(30, 70%, 50%)" },
  { id: "pescatarian", label: "Pescétarien", icon: Fish, color: "hsl(190, 70%, 50%)" },
  { id: "lactose-free", label: "Sans lactose", icon: Milk, color: "hsl(210, 50%, 60%)" },
  { id: "no-eggs", label: "Sans œufs", icon: Egg, color: "hsl(50, 60%, 55%)" },
  { id: "no-nuts", label: "Fruits à coque", icon: Nut, color: "hsl(25, 60%, 45%)" },
];

interface DietaryPickerProps {
  selected: string[];
  onToggle: (id: string) => void;
}

export const DietaryPicker = memo(function DietaryPicker({ selected, onToggle }: DietaryPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {DIETARY_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isSelected = selected.includes(option.id);
        
        return (
          <button
            key={option.id}
            onClick={() => onToggle(option.id)}
            className={cn(
              "relative flex flex-col items-center gap-1 p-2 rounded-lg transition-all",
              isSelected
                ? "bg-primary/15 border border-primary shadow-sm"
                : "bg-muted/30 border border-transparent hover:bg-muted/50"
            )}
          >
            {/* Selected checkmark */}
            {isSelected && (
              <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-2 h-2 text-primary-foreground" strokeWidth={3} />
              </div>
            )}
            
            {/* Smaller icon */}
            <Icon 
              className="w-4 h-4" 
              style={{ color: isSelected ? option.color : "hsl(var(--muted-foreground))" }}
            />
            
            {/* Full label - no truncation */}
            <span className={cn(
              "text-[9px] font-medium text-center leading-tight",
              isSelected ? "text-foreground" : "text-muted-foreground"
            )}>
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
});

export default DietaryPicker;
