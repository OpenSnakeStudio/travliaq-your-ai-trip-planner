/**
 * Criteria Step Component
 * Third step: Must-haves and dietary restrictions
 */

import { memo } from "react";
import { User, Shield, Utensils } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePreferenceMemoryStore } from "@/stores/hooks";
import { MustHavesSwitches, DietaryPicker } from "../";
import { SectionHeader } from "../widgets";

interface CriteriaStepProps {
  onGoBack: () => void;
}

export const CriteriaStep = memo(function CriteriaStep({ onGoBack }: CriteriaStepProps) {
  const { t } = useTranslation();
  const {
    memory: { preferences },
    toggleMustHave,
    toggleDietaryRestriction,
  } = usePreferenceMemoryStore();

  return (
    <div className="space-y-4">
      {/* Must-Haves */}
      <div>
        <SectionHeader icon={Shield} title={t("planner.preferences.criteria.mustHaves")} />
        <MustHavesSwitches
          mustHaves={preferences.mustHaves}
          onToggle={toggleMustHave}
        />
      </div>

      {/* Dietary Restrictions */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center">
            <Utensils className="h-3 w-3 text-primary" />
          </div>
          <span className="text-xs font-medium text-foreground">{t("planner.preferences.criteria.dietary")}</span>
          {preferences.dietaryRestrictions.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">
              {preferences.dietaryRestrictions.length}
            </span>
          )}
        </div>
        <DietaryPicker
          selected={preferences.dietaryRestrictions}
          onToggle={toggleDietaryRestriction}
        />
      </div>

      {/* Go back button */}
      <button
        onClick={onGoBack}
        className="w-full py-2.5 px-4 rounded-xl bg-muted/50 text-muted-foreground text-sm font-medium hover:bg-muted hover:text-foreground transition-colors flex items-center justify-center gap-2"
      >
        <User className="w-4 h-4" />
        {t("planner.preferences.criteria.viewSummary")}
      </button>
    </div>
  );
});

export default CriteriaStep;
