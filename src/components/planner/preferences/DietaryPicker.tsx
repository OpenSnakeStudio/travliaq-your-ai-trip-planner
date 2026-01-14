/**
 * Dietary Restrictions Picker Component
 * Compact grid of cards - smaller buttons, smaller icons
 */

import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Leaf, Salad, Moon, Star, Wheat, Fish, Milk, Egg, Nut, Check } from "lucide-react";

interface DietaryOption {
  id: string;
  labelKey: string;
  icon: React.ElementType;
  color: string;
}

const DIETARY_OPTIONS: DietaryOption[] = [
  { id: "vegetarian", labelKey: "planner.preferences.dietary.vegetarian", icon: Salad, color: "hsl(140, 60%, 45%)" },
  { id: "vegan", labelKey: "planner.preferences.dietary.vegan", icon: Leaf, color: "hsl(120, 50%, 40%)" },
  { id: "halal", labelKey: "planner.preferences.dietary.halal", icon: Moon, color: "hsl(200, 70%, 50%)" },
  { id: "kosher", labelKey: "planner.preferences.dietary.kosher", icon: Star, color: "hsl(45, 80%, 50%)" },
  { id: "gluten-free", labelKey: "planner.preferences.dietary.glutenFree", icon: Wheat, color: "hsl(30, 70%, 50%)" },
  { id: "pescatarian", labelKey: "planner.preferences.dietary.pescatarian", icon: Fish, color: "hsl(190, 70%, 50%)" },
  { id: "lactose-free", labelKey: "planner.preferences.dietary.lactoseFree", icon: Milk, color: "hsl(210, 50%, 60%)" },
  { id: "no-eggs", labelKey: "planner.preferences.dietary.noEggs", icon: Egg, color: "hsl(50, 60%, 55%)" },
  { id: "no-nuts", labelKey: "planner.preferences.dietary.noNuts", icon: Nut, color: "hsl(25, 60%, 45%)" },
];

interface DietaryPickerProps {
  selected: string[];
  onToggle: (id: string) => void;
}

export const DietaryPicker = memo(function DietaryPicker({ selected, onToggle }: DietaryPickerProps) {
  const { t } = useTranslation();
  
  // Stable handler to prevent re-renders from breaking memo
  const handleToggle = useCallback((id: string) => {
    onToggle(id);
  }, [onToggle]);

  return (
    <div className="grid grid-cols-3 gap-1.5">
      {DIETARY_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isSelected = selected.includes(option.id);

        return (
          <button
            key={option.id}
            onClick={() => handleToggle(option.id)}
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
              {t(option.labelKey)}
            </span>
          </button>
        );
      })}
    </div>
  );
});

export default DietaryPicker;
