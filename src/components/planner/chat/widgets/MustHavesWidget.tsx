/**
 * MustHavesWidget - Must-haves picker for chat flow
 * Syncs with PreferenceMemory context
 */

import { memo } from "react";
import { ArrowRight, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MustHavesSwitches } from "@/components/planner/preferences/MustHavesSwitches";
import { usePreferenceMemoryStore, type MustHaves } from "@/stores/hooks";

interface MustHavesWidgetProps {
  onContinue?: () => void;
}

export const MustHavesWidget = memo(function MustHavesWidget({
  onContinue,
}: MustHavesWidgetProps) {
  const { t } = useTranslation();
  const { memory, toggleMustHave } = usePreferenceMemoryStore();
  const mustHaves = memory.preferences.mustHaves;

  const handleToggle = (key: keyof MustHaves) => {
    toggleMustHave(key);
  };

  // Count active must-haves
  const activeCount = Object.values(mustHaves).filter(Boolean).length;

  return (
    <div className="mt-3 p-4 rounded-2xl bg-card border border-border shadow-md max-w-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">{t("planner.mustHaves.title")}</span>
        {activeCount > 0 && (
          <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {t("planner.mustHaves.selected", { count: activeCount })}
          </span>
        )}
      </div>

      {/* Switches */}
      <MustHavesSwitches
        mustHaves={mustHaves}
        onToggle={handleToggle}
      />

      {/* Continue Button */}
      {onContinue && (
        <button
          onClick={onContinue}
          className="mt-5 w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          {t("planner.preference.continue")}
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});

export default MustHavesWidget;
