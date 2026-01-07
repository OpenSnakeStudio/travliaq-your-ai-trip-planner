/**
 * Must-Haves Switches Component
 * Toggle switches for essential travel requirements
 */

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { MustHaves } from "@/contexts/PreferenceMemoryContext";

interface MustHaveConfig {
  key: keyof MustHaves;
  label: string;
  description: string;
  emoji: string;
}

const MUST_HAVES_CONFIG: MustHaveConfig[] = [
  {
    key: "accessibilityRequired",
    label: "Accessibilité PMR",
    description: "Hébergements et activités accessibles",
    emoji: "♿",
  },
  {
    key: "highSpeedWifi",
    label: "WiFi Haut Débit",
    description: "Essentiel pour le travail à distance",
    emoji: "📶",
  },
  {
    key: "petFriendly",
    label: "Accepte animaux",
    description: "Voyage avec votre compagnon",
    emoji: "🐾",
  },
  {
    key: "familyFriendly",
    label: "Adapté enfants",
    description: "Activités et hébergements famille",
    emoji: "👨‍👩‍👧",
  },
];

interface MustHavesSwitchesProps {
  mustHaves: MustHaves;
  onToggle: (key: keyof MustHaves) => void;
  compact?: boolean;
}

export function MustHavesSwitches({ mustHaves, onToggle, compact = false }: MustHavesSwitchesProps) {
  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      {MUST_HAVES_CONFIG.map(({ key, label, description, emoji }) => (
        <div
          key={key}
          className={cn(
            "flex items-center justify-between p-3 rounded-xl transition-colors",
            mustHaves[key] 
              ? "bg-primary/10 border border-primary/30" 
              : "bg-muted/30 border border-border/30",
            compact && "p-2"
          )}
        >
          <div className="flex items-center gap-3">
            <span className={cn("text-lg", compact && "text-base")}>{emoji}</span>
            <div>
              <div className="text-sm font-medium text-foreground">{label}</div>
              {!compact && (
                <div className="text-[10px] text-muted-foreground">{description}</div>
              )}
            </div>
          </div>
          <Switch
            checked={mustHaves[key]}
            onCheckedChange={() => onToggle(key)}
          />
        </div>
      ))}
    </div>
  );
}

export default MustHavesSwitches;
