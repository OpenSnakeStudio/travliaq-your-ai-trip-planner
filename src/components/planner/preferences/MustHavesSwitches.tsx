/**
 * Must-Haves Switches Component
 * Compact toggle switches for essential travel requirements
 * Fixed: clicking the Switch itself now works properly
 */

import { memo } from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { MustHaves } from "@/contexts/preferences";

interface MustHaveConfig {
  key: keyof MustHaves;
  label: string;
  emoji: string;
}

const MUST_HAVES_CONFIG: MustHaveConfig[] = [
  { key: "accessibilityRequired", label: "Accessibilité PMR", emoji: "♿" },
  { key: "highSpeedWifi", label: "WiFi Haut Débit", emoji: "📶" },
  { key: "petFriendly", label: "Accepte animaux", emoji: "🐾" },
  { key: "familyFriendly", label: "Adapté enfants", emoji: "👶" },
];

interface MustHavesSwitchesProps {
  mustHaves: MustHaves;
  onToggle: (key: keyof MustHaves) => void;
  compact?: boolean;
}

export const MustHavesSwitches = memo(function MustHavesSwitches({ mustHaves, onToggle, compact = false }: MustHavesSwitchesProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-2", compact && "gap-1.5")}>
      {MUST_HAVES_CONFIG.map(({ key, label, emoji }) => (
        <div
          key={key}
          className={cn(
            "flex items-center justify-between p-2 rounded-xl transition-colors cursor-pointer",
            mustHaves[key] 
              ? "bg-primary/15 border-2 border-primary" 
              : "bg-muted/30 border border-border/30 hover:bg-muted/50",
            compact && "p-1.5"
          )}
          onClick={() => onToggle(key)}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{emoji}</span>
            <span className="text-[11px] font-medium text-foreground">{label}</span>
          </div>
          {/* Stop propagation so both button and switch work */}
          <div onClick={(e) => e.stopPropagation()}>
            <Switch
              checked={mustHaves[key]}
              onCheckedChange={() => onToggle(key)}
              className="scale-[0.65]"
            />
          </div>
        </div>
      ))}
    </div>
  );
});

export default MustHavesSwitches;
