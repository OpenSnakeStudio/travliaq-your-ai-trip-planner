/**
 * Dietary Restrictions Picker Component
 * Grid of checkbox cards - always visible, no collapsible needed
 */

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
  { id: "no-nuts", label: "Sans fruits à coque", icon: Nut, color: "hsl(25, 60%, 45%)" },
];

interface DietaryPickerProps {
  selected: string[];
  onToggle: (id: string) => void;
}

export function DietaryPicker({ selected, onToggle }: DietaryPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {DIETARY_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isSelected = selected.includes(option.id);
        
        return (
          <button
            key={option.id}
            onClick={() => onToggle(option.id)}
            className={cn(
              "relative flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all",
              isSelected
                ? "bg-primary/15 border-2 border-primary shadow-sm"
                : "bg-muted/30 border-2 border-transparent hover:bg-muted/50 hover:border-muted"
            )}
          >
            {/* Selected checkmark */}
            {isSelected && (
              <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-primary-foreground" strokeWidth={3} />
              </div>
            )}
            
            {/* Icon with color */}
            <Icon 
              className="w-5 h-5" 
              style={{ color: isSelected ? option.color : "hsl(var(--muted-foreground))" }}
            />
            
            {/* Full Label - NO truncation */}
            <span className={cn(
              "text-[10px] font-medium text-center leading-tight",
              isSelected ? "text-foreground" : "text-muted-foreground"
            )}>
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default DietaryPicker;
