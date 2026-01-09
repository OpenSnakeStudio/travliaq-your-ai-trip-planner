/**
 * PreferenceInterestsWidget - Interest picker for chat flow
 * Syncs with PreferenceMemory context
 */

import { memo } from "react";
import { Heart } from "lucide-react";
import { InterestPicker } from "../../preferences/InterestPicker";
import { usePreferenceMemory } from "@/contexts/preferences";

interface PreferenceInterestsWidgetProps {
  onComplete?: () => void;
}

export const PreferenceInterestsWidget = memo(function PreferenceInterestsWidget({
  onComplete,
}: PreferenceInterestsWidgetProps) {
  const { memory, toggleInterest } = usePreferenceMemory();

  return (
    <div className="mt-3 p-4 rounded-xl bg-background border border-border shadow-sm max-w-[85%]">
      <div className="flex items-center gap-2 mb-3">
        <Heart className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Vos centres d'intérêt</span>
      </div>
      
      <p className="text-xs text-muted-foreground mb-4">
        Sélectionnez jusqu'à 5 centres d'intérêt pour personnaliser vos recommandations
      </p>

      <InterestPicker
        selected={memory.preferences.interests}
        onToggle={toggleInterest}
        maxSelections={5}
        compact
      />

      {onComplete && (
        <button
          onClick={onComplete}
          className="mt-4 w-full py-2 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Proposer des destinations
        </button>
      )}
    </div>
  );
});

export default PreferenceInterestsWidget;
