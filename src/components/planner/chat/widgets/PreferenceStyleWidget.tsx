/**
 * PreferenceStyleWidget - Style sliders for chat flow
 * Exact replica of the Preferences panel widget
 * Syncs with PreferenceMemory context
 */

import { memo, useCallback, useMemo } from "react";
import { Sliders, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DualSlider } from "@/components/ui/dual-slider";
import { usePreferenceMemoryStore, type StyleAxes } from "@/stores/hooks";
import { cn } from "@/lib/utils";

interface PreferenceStyleWidgetProps {
  /** Called when user clicks "Continue" to advance the flow */
  onContinue?: () => void;
}

interface AxisConfig {
  key: keyof StyleAxes;
  leftLabelKey: string;
  rightLabelKey: string;
  leftEmoji: string;
  rightEmoji: string;
}

// Axes configuration with i18n keys
const AXES_CONFIG: AxisConfig[] = [
  { key: "chillVsIntense", leftLabelKey: "planner.style.chill", rightLabelKey: "planner.style.intense", leftEmoji: "🧘", rightEmoji: "🏃" },
  { key: "cityVsNature", leftLabelKey: "planner.style.urban", rightLabelKey: "planner.style.nature", leftEmoji: "🏙️", rightEmoji: "🌲" },
  { key: "ecoVsLuxury", leftLabelKey: "planner.style.budget", rightLabelKey: "planner.style.luxury", leftEmoji: "💰", rightEmoji: "✨" },
  { key: "touristVsLocal", leftLabelKey: "planner.style.tourist", rightLabelKey: "planner.style.authentic", leftEmoji: "📸", rightEmoji: "🏠" },
];
export const PreferenceStyleWidget = memo(function PreferenceStyleWidget({
  onContinue,
}: PreferenceStyleWidgetProps) {
  const { t } = useTranslation();
  const { memory, setStyleAxis } = usePreferenceMemoryStore();
  const axes = memory.preferences.styleAxes;

  const handleAxisChange = useCallback((key: keyof StyleAxes, value: number) => {
    setStyleAxis(key, value);
  }, [setStyleAxis]);

  // Memoize translated labels
  const translatedAxes = useMemo(() => 
    AXES_CONFIG.map(axis => ({
      ...axis,
      leftLabel: t(axis.leftLabelKey),
      rightLabel: t(axis.rightLabelKey),
    })), [t]);

  return (
    <div className="mt-3 p-4 rounded-2xl bg-card border border-border shadow-md max-w-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sliders className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">{t("planner.preference.styleTitle")}</span>
      </div>

      {/* Sliders - matching the screenshot layout */}
      <div className="space-y-4">
        {translatedAxes.map(({ key, leftLabel, rightLabel, leftEmoji, rightEmoji }) => (
          <div key={key} className="flex items-center gap-3">
            {/* Left label */}
            <div className="flex items-center gap-1.5 min-w-[100px] justify-end">
              <span className="text-base">{leftEmoji}</span>
              <span className={cn(
                "text-xs font-medium transition-colors",
                axes[key] < 40 ? "text-foreground" : "text-muted-foreground"
              )}>
                {leftLabel}
              </span>
            </div>

            {/* Slider */}
            <div className="flex-1">
              <DualSlider
                value={[axes[key]]}
                onValueChange={([v]) => handleAxisChange(key, v)}
                max={100}
                step={1}
              />
            </div>
            
            {/* Right label */}
            <div className="flex items-center gap-1.5 min-w-[100px]">
              <span className={cn(
                "text-xs font-medium transition-colors",
                axes[key] > 60 ? "text-foreground" : "text-muted-foreground"
              )}>
                {rightLabel}
              </span>
              <span className="text-base">{rightEmoji}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Continue Button - advances flow but widget stays visible */}
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

export default PreferenceStyleWidget;
