/**
 * Style Equalizer Component
 * Visual sliders for style axes (Chill/Intense, City/Nature, etc.)
 */

import { Slider } from "@/components/ui/slider";
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
  description: string;
}> = [
  {
    key: "chillVsIntense",
    leftLabel: "Chill",
    rightLabel: "Intense",
    leftEmoji: "🧘",
    rightEmoji: "🏃",
    description: "Rythme du voyage",
  },
  {
    key: "cityVsNature",
    leftLabel: "Ville",
    rightLabel: "Nature",
    leftEmoji: "🏙️",
    rightEmoji: "🌲",
    description: "Environnement préféré",
  },
  {
    key: "ecoVsLuxury",
    leftLabel: "Éco",
    rightLabel: "Luxe",
    leftEmoji: "💰",
    rightEmoji: "✨",
    description: "Niveau de confort",
  },
  {
    key: "touristVsLocal",
    leftLabel: "Touristique",
    rightLabel: "Authentique",
    leftEmoji: "📸",
    rightEmoji: "🏠",
    description: "Type d'expérience",
  },
];

export function StyleEqualizer({ axes, onAxisChange, compact = false }: StyleEqualizerProps) {
  return (
    <div className={cn("space-y-4", compact && "space-y-3")}>
      {AXES_CONFIG.map(({ key, leftLabel, rightLabel, leftEmoji, rightEmoji, description }) => (
        <div key={key} className="group">
          {!compact && (
            <div className="text-[10px] text-muted-foreground mb-1.5">{description}</div>
          )}
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center gap-1 min-w-[70px] justify-end",
              compact && "min-w-[60px]"
            )}>
              <span className="text-sm">{leftEmoji}</span>
              <span className={cn(
                "text-xs font-medium transition-colors",
                axes[key] < 40 ? "text-primary" : "text-muted-foreground"
              )}>
                {leftLabel}
              </span>
            </div>
            
            <div className="flex-1 relative">
              <Slider
                value={[axes[key]]}
                onValueChange={([v]) => onAxisChange(key, v)}
                max={100}
                step={1}
                className="w-full"
              />
              {/* Center marker */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-2 bg-border/50 pointer-events-none" />
            </div>
            
            <div className={cn(
              "flex items-center gap-1 min-w-[70px]",
              compact && "min-w-[60px]"
            )}>
              <span className={cn(
                "text-xs font-medium transition-colors",
                axes[key] > 60 ? "text-primary" : "text-muted-foreground"
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
