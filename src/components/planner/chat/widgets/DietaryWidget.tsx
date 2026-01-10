/**
 * DietaryWidget - Dietary restrictions picker for chat flow
 * Syncs with PreferenceMemory context
 */

import { memo } from "react";
import { ArrowRight, Utensils } from "lucide-react";
import { DietaryPicker } from "@/components/planner/preferences/DietaryPicker";
import { usePreferenceMemory } from "@/contexts/preferences";

interface DietaryWidgetProps {
  onContinue?: () => void;
}

export const DietaryWidget = memo(function DietaryWidget({
  onContinue,
}: DietaryWidgetProps) {
  const { memory, toggleDietaryRestriction } = usePreferenceMemory();
  const dietaryRestrictions = memory.preferences.dietaryRestrictions;

  // Count active restrictions
  const activeCount = dietaryRestrictions.length;

  return (
    <div className="mt-3 p-4 rounded-2xl bg-card border border-border shadow-md max-w-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Utensils className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">Restrictions alimentaires</span>
        {activeCount > 0 && (
          <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {activeCount} sélectionné{activeCount > 1 ? "es" : "e"}
          </span>
        )}
      </div>

      {/* Picker */}
      <DietaryPicker
        selected={dietaryRestrictions}
        onToggle={toggleDietaryRestriction}
      />

      {/* Continue Button */}
      {onContinue && (
        <button
          onClick={onContinue}
          className="mt-5 w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          Continuer
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});

export default DietaryWidget;
