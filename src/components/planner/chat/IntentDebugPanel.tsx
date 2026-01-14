/**
 * IntentDebugPanel - Debug panel showing intent classification info
 * 
 * Only visible in development mode.
 * Shows:
 * - Primary intent detected
 * - Confidence score with color coding
 * - Widget triggered
 * - Extracted entities
 * - Flow state
 */

import { useState, memo } from "react";
import { Bug, ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IntentClassification } from "./hooks/useChatStream";
import type { FlowState } from "./typeDefs/intent";

interface IntentDebugPanelProps {
  intent: IntentClassification | null;
  flowState: FlowState | null;
  widgetTriggered: string | null;
  className?: string;
}

const CONFIDENCE_COLORS = {
  high: "text-green-500 bg-green-500/10",
  medium: "text-yellow-500 bg-yellow-500/10", 
  low: "text-red-500 bg-red-500/10",
};

function getConfidenceLevel(confidence: number): "high" | "medium" | "low" {
  if (confidence >= 80) return "high";
  if (confidence >= 60) return "medium";
  return "low";
}

function IntentDebugPanelComponent({ 
  intent, 
  flowState, 
  widgetTriggered,
  className 
}: IntentDebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Only show in development
  if (import.meta.env.PROD || isDismissed) {
    return null;
  }

  if (!intent) {
    return null;
  }

  const confidenceLevel = getConfidenceLevel(intent.confidence);
  const confidenceColor = CONFIDENCE_COLORS[confidenceLevel];

  // Filter out empty/null entities
  const filteredEntities = Object.entries(intent.entities || {}).filter(
    ([_, value]) => value !== null && value !== undefined && value !== ""
  );

  return (
    <div 
      className={cn(
        "fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border border-border bg-background/95 backdrop-blur shadow-lg",
        className
      )}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between gap-2 px-3 py-2 cursor-pointer border-b border-border/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Bug className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Intent Debug</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={cn("text-xs font-mono px-1.5 py-0.5 rounded", confidenceColor)}>
            {intent.confidence}%
          </span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsDismissed(true);
            }}
            className="p-0.5 hover:bg-muted rounded"
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Summary (always visible) */}
      <div className="px-3 py-2 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Intent:</span>
          <span className="text-xs font-mono font-medium text-foreground">
            {intent.primaryIntent}
          </span>
        </div>
        {widgetTriggered && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Widget:</span>
            <span className="text-xs font-mono text-primary">
              {widgetTriggered}
            </span>
          </div>
        )}
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-border/50 pt-2">
          {/* Entities */}
          {filteredEntities.length > 0 && (
            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1 block">
                Entities:
              </span>
              <div className="space-y-0.5">
                {filteredEntities.map(([key, value]) => (
                  <div key={key} className="flex items-start gap-1 text-xs">
                    <span className="text-muted-foreground font-mono">{key}:</span>
                    <span className="text-foreground font-mono break-all">
                      {typeof value === "object" ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Widget from backend */}
          {intent.widgetToShow && (
            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1 block">
                Backend Widget:
              </span>
              <div className="text-xs font-mono text-foreground">
                {intent.widgetToShow.type}
                <span className="text-muted-foreground ml-1">
                  ({intent.widgetToShow.reason})
                </span>
              </div>
            </div>
          )}

          {/* Flow state */}
          {flowState && (
            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1 block">
                Flow State:
              </span>
              <div className="flex flex-wrap gap-1">
                {Object.entries(flowState)
                  .filter(([key]) => key.startsWith("has") || key === "isReadyToSearch")
                  .map(([key, value]) => (
                    <span 
                      key={key}
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded font-mono",
                        value ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {key.replace("has", "").replace("isReadyToSearch", "ready")}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* Clarification */}
          {intent.requiresClarification && (
            <div className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
              ⚠️ Needs clarification
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const IntentDebugPanel = memo(IntentDebugPanelComponent);
