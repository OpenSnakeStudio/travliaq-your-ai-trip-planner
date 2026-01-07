/**
 * Style Equalizer Component
 * Visual sliders for style axes with bilateral colors
 */

import { DualSlider } from "@/components/ui/dual-slider";
import { cn } from "@/lib/utils";
import type { StyleAxes } from "@/contexts/PreferenceMemoryContext";

interface StyleEqualizerProps {
  axes: StyleAxes;
  onAxisChange: (axis: keyof StyleAxes, value: number) => void;
  compact?: boolean;
}

const AXES_CONFIG: Array<{
  key: keyof StyleAxes;
  leftLabel: string;
  rightLabel: string;
  leftEmoji: string;
  rightEmoji: string;
  leftColor: string;
  rightColor: string;
}> = [
  {
    key: "chillVsIntense",
    leftLabel: "Détente",
    rightLabel: "Intense",
    leftEmoji: "🧘",
    rightEmoji: "🏃",
    leftColor: "hsl(200, 80%, 60%)",
    rightColor: "hsl(15, 85%, 55%)",
  },
  {
    key: "cityVsNature",
    leftLabel: "Urbain",
    rightLabel: "Nature",
    leftEmoji: "🏙️",
    rightEmoji: "🌲",
    leftColor: "hsl(250, 70%, 60%)",
    rightColor: "hsl(140, 60%, 45%)",
  },
  {
    key: "ecoVsLuxury",
    leftLabel: "Économique",
    rightLabel: "Luxe",
    leftEmoji: "💰",
    rightEmoji: "✨",
    leftColor: "hsl(45, 70%, 50%)",
    rightColor: "hsl(280, 60%, 55%)",
  },
  {
    key: "touristVsLocal",
    leftLabel: "Touristique",
    rightLabel: "Authentique",
    leftEmoji: "📸",
    rightEmoji: "🏠",
    leftColor: "hsl(340, 70%, 55%)",
    rightColor: "hsl(25, 75%, 50%)",
  },
];

export function StyleEqualizer({ axes, onAxisChange, compact = false }: StyleEqualizerProps) {
  return (
    <div className={cn("space-y-4", compact && "space-y-3")}>
      {AXES_CONFIG.map(({ key, leftLabel, rightLabel, leftEmoji, rightEmoji, leftColor, rightColor }) => (
        <div key={key} className="group">
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-1.5 min-w-[100px] justify-end",
              compact && "min-w-[85px]"
            )}>
              <span className="text-sm">{leftEmoji}</span>
              <span className={cn(
                "text-xs font-medium transition-colors whitespace-nowrap",
                axes[key] < 40 ? "text-foreground" : "text-muted-foreground"
              )}>
                {leftLabel}
              </span>
            </div>
            
            <div className="flex-1 relative py-1">
              <DualSlider
                value={[axes[key]]}
                onValueChange={([v]) => onAxisChange(key, v)}
                max={100}
                step={1}
                leftColor={leftColor}
                rightColor={rightColor}
              />
            </div>
            
            <div className={cn(
              "flex items-center gap-1.5 min-w-[100px]",
              compact && "min-w-[85px]"
            )}>
              <span className={cn(
                "text-xs font-medium transition-colors whitespace-nowrap",
                axes[key] > 60 ? "text-foreground" : "text-muted-foreground"
              )}>
                {rightLabel}
              </span>
              <span className="text-sm">{rightEmoji}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StyleEqualizer;
