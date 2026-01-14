/**
 * ConflictAlertWidget - Visual conflict and warning display
 *
 * Displays planning conflicts, warnings, and suggestions
 * with clear visual hierarchy and actionable resolutions.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  X,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Wallet,
  Users,
  Plane,
  Hotel,
  Activity,
  Sparkles,
} from "lucide-react";
import type { Conflict, ConflictSeverity, ConflictType } from "../../services/conflictDetector";

/**
 * Conflict type icons
 */
const CONFLICT_ICONS: Record<ConflictType, React.ElementType> = {
  date_mismatch: Calendar,
  time_overlap: Clock,
  location_impossible: MapPin,
  budget_exceeded: Wallet,
  insufficient_time: Clock,
  missing_transfer: Plane,
  invalid_dates: Calendar,
  capacity_exceeded: Users,
};

/**
 * Severity styling
 */
const SEVERITY_CONFIG: Record<
  ConflictSeverity,
  {
    icon: React.ElementType;
    bg: string;
    border: string;
    iconColor: string;
    titleColor: string;
    label: string;
  }
> = {
  error: {
    icon: AlertCircle,
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
    iconColor: "text-red-500",
    titleColor: "text-red-800 dark:text-red-200",
    label: "Problème",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
    iconColor: "text-amber-500",
    titleColor: "text-amber-800 dark:text-amber-200",
    label: "Attention",
  },
  info: {
    icon: Info,
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-500",
    titleColor: "text-blue-800 dark:text-blue-200",
    label: "Info",
  },
};

/**
 * Single conflict alert props
 */
interface ConflictAlertProps {
  /** Conflict to display */
  conflict: Conflict;
  /** Action callback */
  onAction?: (action: Conflict["action"]) => void;
  /** Dismiss callback */
  onDismiss?: () => void;
  /** Size variant */
  size?: "sm" | "md";
  /** Show suggestion */
  showSuggestion?: boolean;
}

/**
 * ConflictAlert Component
 *
 * @example
 * ```tsx
 * <ConflictAlert
 *   conflict={{
 *     id: "1",
 *     type: "budget_exceeded",
 *     severity: "error",
 *     title: "Budget dépassé",
 *     message: "Vous avez dépassé votre budget de 150€",
 *     items: ["flights", "hotels"],
 *     suggestion: "Réduisez certains éléments ou augmentez votre budget.",
 *   }}
 *   onAction={(action) => handleAction(action)}
 * />
 * ```
 */
export function ConflictAlert({
  conflict,
  onAction,
  onDismiss,
  size = "md",
  showSuggestion = true,
}: ConflictAlertProps) {
  const config = SEVERITY_CONFIG[conflict.severity];
  const TypeIcon = CONFLICT_ICONS[conflict.type] || AlertCircle;
  const SeverityIcon = config.icon;

  return (
    <div
      className={cn(
        "rounded-lg border overflow-hidden",
        config.bg,
        config.border
      )}
    >
      <div className={cn("flex gap-3", size === "sm" ? "p-2" : "p-3")}>
        {/* Icon */}
        <div className={cn("flex-shrink-0", config.iconColor)}>
          <SeverityIcon size={size === "sm" ? 18 : 22} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "px-2 py-0.5 rounded text-xs font-medium",
                conflict.severity === "error" && "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
                conflict.severity === "warning" && "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
                conflict.severity === "info" && "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
              )}
            >
              {config.label}
            </span>
            <TypeIcon size={14} className="text-muted-foreground" />
          </div>

          {/* Title */}
          <h4
            className={cn(
              "font-semibold mt-1",
              config.titleColor,
              size === "sm" ? "text-sm" : "text-base"
            )}
          >
            {conflict.title}
          </h4>

          {/* Message */}
          <p
            className={cn(
              "mt-1 text-muted-foreground",
              size === "sm" ? "text-xs" : "text-sm"
            )}
          >
            {conflict.message}
          </p>

          {/* Affected items */}
          {conflict.items.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {conflict.items.map((item) => (
                <span
                  key={item}
                  className="px-2 py-0.5 rounded bg-background/50 text-xs text-muted-foreground"
                >
                  {item}
                </span>
              ))}
            </div>
          )}

          {/* Suggestion */}
          {showSuggestion && conflict.suggestion && (
            <div className="mt-2 flex items-start gap-2 text-sm">
              <Sparkles size={14} className="text-primary mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground italic">
                {conflict.suggestion}
              </span>
            </div>
          )}

          {/* Action */}
          {conflict.action && (
            <button
              type="button"
              onClick={() => onAction?.(conflict.action)}
              className={cn(
                "mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
                "text-sm font-medium transition-all",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              {conflict.action.label}
              <ArrowRight size={14} />
            </button>
          )}
        </div>

        {/* Dismiss */}
        {onDismiss && conflict.severity !== "error" && (
          <button
            type="button"
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Conflict summary widget props
 */
interface ConflictSummaryWidgetProps {
  /** All conflicts */
  conflicts: Conflict[];
  /** Action callback */
  onAction?: (conflict: Conflict, action: Conflict["action"]) => void;
  /** Dismiss callback */
  onDismiss?: (conflictId: string) => void;
  /** Initially expanded */
  defaultExpanded?: boolean;
  /** Max visible conflicts */
  maxVisible?: number;
}

/**
 * ConflictSummaryWidget - Collapsible list of conflicts
 */
export function ConflictSummaryWidget({
  conflicts,
  onAction,
  onDismiss,
  defaultExpanded = false,
  maxVisible = 5,
}: ConflictSummaryWidgetProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const activeConflicts = conflicts.filter((c) => !dismissedIds.has(c.id));
  const errors = activeConflicts.filter((c) => c.severity === "error");
  const warnings = activeConflicts.filter((c) => c.severity === "warning");
  const infos = activeConflicts.filter((c) => c.severity === "info");

  const handleDismiss = (conflictId: string) => {
    setDismissedIds((prev) => new Set([...prev, conflictId]));
    onDismiss?.(conflictId);
  };

  if (activeConflicts.length === 0) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
        <CheckCircle className="text-green-500" size={20} />
        <span className="text-green-800 dark:text-green-200 font-medium">
          Aucun problème détecté
        </span>
      </div>
    );
  }

  // Summary header
  const summaryParts: string[] = [];
  if (errors.length > 0) summaryParts.push(`${errors.length} problème${errors.length > 1 ? "s" : ""}`);
  if (warnings.length > 0) summaryParts.push(`${warnings.length} avertissement${warnings.length > 1 ? "s" : ""}`);
  if (infos.length > 0) summaryParts.push(`${infos.length} suggestion${infos.length > 1 ? "s" : ""}`);

  const hasCritical = errors.length > 0;
  const visibleConflicts = expanded
    ? activeConflicts.slice(0, maxVisible)
    : activeConflicts.slice(0, 1);

  return (
    <div
      className={cn(
        "rounded-lg border overflow-hidden",
        hasCritical
          ? "border-red-200 dark:border-red-800"
          : "border-border"
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "w-full flex items-center justify-between p-3",
          "hover:bg-muted/50 transition-colors",
          hasCritical
            ? "bg-red-50 dark:bg-red-900/20"
            : "bg-muted/30"
        )}
      >
        <div className="flex items-center gap-2">
          {hasCritical ? (
            <AlertCircle className="text-red-500" size={20} />
          ) : (
            <AlertTriangle className="text-amber-500" size={20} />
          )}
          <span
            className={cn(
              "font-medium",
              hasCritical
                ? "text-red-800 dark:text-red-200"
                : "text-foreground"
            )}
          >
            {summaryParts.join(", ")}
          </span>
        </div>
        {activeConflicts.length > 1 && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <span className="text-sm">
              {expanded ? "Réduire" : "Voir tout"}
            </span>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        )}
      </button>

      {/* Conflicts list */}
      <div className="divide-y divide-border">
        {visibleConflicts.map((conflict) => (
          <div key={conflict.id} className="p-3">
            <ConflictAlert
              conflict={conflict}
              onAction={(action) => onAction?.(conflict, action)}
              onDismiss={
                conflict.severity !== "error"
                  ? () => handleDismiss(conflict.id)
                  : undefined
              }
              size="sm"
              showSuggestion={expanded}
            />
          </div>
        ))}

        {/* Show more indicator */}
        {expanded && activeConflicts.length > maxVisible && (
          <div className="p-2 text-center text-sm text-muted-foreground">
            +{activeConflicts.length - maxVisible} autres
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Inline conflict indicator
 */
export function ConflictIndicator({
  count,
  severity,
  onClick,
}: {
  count: number;
  severity: ConflictSeverity;
  onClick?: () => void;
}) {
  if (count === 0) return null;

  const config = SEVERITY_CONFIG[severity];
  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
        "transition-all hover:scale-[1.02] active:scale-[0.98]",
        severity === "error" && "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
        severity === "warning" && "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
        severity === "info" && "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
      )}
    >
      <Icon size={12} />
      <span>
        {count} {config.label.toLowerCase()}
        {count > 1 ? "s" : ""}
      </span>
    </button>
  );
}

/**
 * No conflicts badge
 */
export function NoConflictsBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full",
        "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
        "text-xs font-medium",
        className
      )}
    >
      <CheckCircle size={12} />
      <span>Prêt à réserver</span>
    </div>
  );
}

export default ConflictAlert;
