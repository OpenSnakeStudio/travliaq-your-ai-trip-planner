/**
 * PreferenceStyleWidget - Style sliders for chat flow
 * Syncs with PreferenceMemory context
 */

import { memo } from "react";
import { Sliders } from "lucide-react";
import { StyleEqualizer } from "../../preferences/StyleEqualizer";
import { usePreferenceMemory } from "@/contexts/preferences";

interface PreferenceStyleWidgetProps {
  onComplete?: () => void;
}

export const PreferenceStyleWidget = memo(function PreferenceStyleWidget({
  onComplete,
}: PreferenceStyleWidgetProps) {
  const { memory, setStyleAxis } = usePreferenceMemory();

  return (
    <div className="mt-3 p-4 rounded-xl bg-background border border-border shadow-sm max-w-[85%]">
      <div className="flex items-center gap-2 mb-3">
        <Sliders className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Votre style de voyage</span>
      </div>
      
      <p className="text-xs text-muted-foreground mb-4">
        Ajustez ces curseurs pour que je vous propose des idées adaptées
      </p>

      <StyleEqualizer
        axes={memory.preferences.styleAxes}
        onAxisChange={setStyleAxis}
        compact
      />

      {onComplete && (
        <button
          onClick={onComplete}
          className="mt-4 w-full py-2 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Continuer
        </button>
      )}
    </div>
  );
});

export default PreferenceStyleWidget;
