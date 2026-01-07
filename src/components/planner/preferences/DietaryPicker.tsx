/**
 * Dietary Restrictions Picker Component
 * Stylish checkbox cards with icons for dietary preferences
 */

import { cn } from "@/lib/utils";
import { Leaf, Salad, Moon, Star, Wheat, Fish, Milk, Egg, Nut } from "lucide-react";

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
    <div className="grid grid-cols-3 gap-1.5">
      {DIETARY_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isSelected = selected.includes(option.id);
        
        return (
          <button
            key={option.id}
            onClick={() => onToggle(option.id)}
            className={cn(
              "relative flex items-center gap-2 p-2 rounded-lg transition-all text-left group",
              isSelected
                ? "bg-primary/10 border-2 border-primary"
                : "bg-muted/30 border border-transparent hover:bg-muted/50"
            )}
          >
            {/* Custom checkbox */}
            <div className={cn(
              "w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 transition-all",
              isSelected
                ? "bg-primary"
                : "bg-muted/60 group-hover:bg-muted"
            )}>
              {isSelected && (
                <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            
            {/* Icon with color */}
            <Icon 
              className="w-4 h-4 flex-shrink-0" 
              style={{ color: isSelected ? option.color : "hsl(var(--muted-foreground))" }}
            />
            
            {/* Label */}
            <span className={cn(
              "text-[10px] font-medium leading-tight line-clamp-1",
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
