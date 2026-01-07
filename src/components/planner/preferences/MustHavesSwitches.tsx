/**
 * Must-Haves Switches Component
 * Compact toggle switches for essential travel requirements
 */

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { MustHaves } from "@/contexts/PreferenceMemoryContext";

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

export function MustHavesSwitches({ mustHaves, onToggle, compact = false }: MustHavesSwitchesProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-2", compact && "gap-1.5")}>
      {MUST_HAVES_CONFIG.map(({ key, label, emoji }) => (
        <button
          key={key}
          onClick={() => onToggle(key)}
          className={cn(
            "flex items-center justify-between p-2.5 rounded-xl transition-colors text-left",
            mustHaves[key] 
              ? "bg-primary/15 border-2 border-primary" 
              : "bg-muted/30 border border-border/30 hover:bg-muted/50",
            compact && "p-2"
          )}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">{emoji}</span>
            <span className="text-xs font-medium text-foreground">{label}</span>
          </div>
          <Switch
            checked={mustHaves[key]}
            onCheckedChange={() => onToggle(key)}
            className="scale-75"
          />
        </button>
      ))}
    </div>
  );
}

export default MustHavesSwitches;
