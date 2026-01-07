/**
 * AI Conflict Badge Component
 * Shows when AI detected a preference different from manual value
 * Offers "Apply suggestion" button
 */

import { useState, useEffect } from "react";
import { Sparkles, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlannerEvent } from "@/lib/eventBus";

interface ConflictData {
  field: string;
  chatValue: unknown;
  manualValue: unknown;
}

interface AIConflictBadgeProps {
  onApply: (field: string, value: unknown) => void;
  className?: string;
}

const FIELD_LABELS: Record<string, string> = {
  travelStyle: "Style de voyage",
  comfortLevel: "Niveau de confort",
  pace: "Rythme",
  interests: "Centres d'intérêt",
  occasion: "Occasion",
  "styleAxes.chillVsIntense": "Énergie",
  "styleAxes.ecoVsLuxury": "Budget",
  "styleAxes.cityVsNature": "Environnement",
  "styleAxes.touristVsLocal": "Authenticité",
};

export function AIConflictBadge({ onApply, className }: AIConflictBadgeProps) {
  const [conflicts, setConflicts] = useState<ConflictData[]>([]);
  
  // Listen for conflict events
  usePlannerEvent("preferences:conflictDetected", (data) => {
    setConflicts(prev => {
      // Avoid duplicates
      if (prev.some(c => c.field === data.field)) {
        return prev.map(c => c.field === data.field ? data : c);
      }
      return [...prev, data];
    });
  });

  const handleApply = (conflict: ConflictData) => {
    onApply(conflict.field, conflict.chatValue);
    setConflicts(prev => prev.filter(c => c.field !== conflict.field));
  };

  const handleDismiss = (field: string) => {
    setConflicts(prev => prev.filter(c => c.field !== field));
  };

  if (conflicts.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {conflicts.map((conflict) => (
        <div
          key={conflict.field}
          className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400 truncate">
                L'IA suggère : {FIELD_LABELS[conflict.field] || conflict.field}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                Valeur détectée différente de votre sélection
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => handleApply(conflict)}
              className="p-1.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-600 transition-colors"
              title="Appliquer la suggestion"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDismiss(conflict.field)}
              className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground transition-colors"
              title="Ignorer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AIConflictBadge;
