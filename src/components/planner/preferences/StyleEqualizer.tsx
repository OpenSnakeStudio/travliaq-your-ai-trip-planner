/**
 * Style Equalizer Component
 * Visual sliders for style axes - uses same brand colors for all
 */

import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { DualSlider } from "@/components/ui/dual-slider";
import { cn } from "@/lib/utils";
import type { StyleAxes } from "@/stores/hooks";

interface StyleEqualizerProps {
  axes: StyleAxes;
  onAxisChange: (axis: keyof StyleAxes, value: number) => void;
  compact?: boolean;
}

const AXES_CONFIG: Array<{
  key: keyof StyleAxes;
  leftLabelKey: string;
  rightLabelKey: string;
  leftEmoji: string;
  rightEmoji: string;
}> = [
  { key: "chillVsIntense", leftLabelKey: "planner.preferences.axes.chill", rightLabelKey: "planner.preferences.axes.intense", leftEmoji: "🧘", rightEmoji: "🏃" },
  { key: "cityVsNature", leftLabelKey: "planner.preferences.axes.urban", rightLabelKey: "planner.preferences.axes.nature", leftEmoji: "🏙️", rightEmoji: "🌲" },
  { key: "ecoVsLuxury", leftLabelKey: "planner.preferences.axes.budget", rightLabelKey: "planner.preferences.axes.luxury", leftEmoji: "💰", rightEmoji: "✨" },
  { key: "touristVsLocal", leftLabelKey: "planner.preferences.axes.tourist", rightLabelKey: "planner.preferences.axes.authentic", leftEmoji: "📸", rightEmoji: "🏠" },
];

export const StyleEqualizer = memo(function StyleEqualizer({ axes, onAxisChange, compact = false }: StyleEqualizerProps) {
  const { t } = useTranslation();
  
  // Stable handler to prevent re-renders from breaking memo
  const handleAxisChange = useCallback((key: keyof StyleAxes, value: number) => {
    onAxisChange(key, value);
  }, [onAxisChange]);

  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      {AXES_CONFIG.map(({ key, leftLabelKey, rightLabelKey, leftEmoji, rightEmoji }) => (
        <div key={key} className="group">
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-1 min-w-[90px] justify-end",
              compact && "min-w-[75px]"
            )}>
              <span className="text-sm">{leftEmoji}</span>
              <span className={cn(
                "text-[11px] font-medium transition-colors whitespace-nowrap",
                axes[key] < 40 ? "text-foreground" : "text-muted-foreground"
              )}>
                {t(leftLabelKey)}
              </span>
            </div>

            <div className="flex-1 relative">
              <DualSlider
                value={[axes[key]]}
                onValueChange={([v]) => handleAxisChange(key, v)}
                max={100}
                step={1}
              />
            </div>
            
            <div className={cn(
              "flex items-center gap-1 min-w-[90px]",
              compact && "min-w-[75px]"
            )}>
              <span className={cn(
                "text-[11px] font-medium transition-colors whitespace-nowrap",
                axes[key] > 60 ? "text-foreground" : "text-muted-foreground"
              )}>
                {t(rightLabelKey)}
              </span>
              <span className="text-sm">{rightEmoji}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

export default StyleEqualizer;
