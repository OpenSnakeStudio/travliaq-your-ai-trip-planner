/**
 * Sync Badge Component
 *
 * Visual indicator showing that a destination is synchronized from another widget.
 * Features:
 * - Prominent badge with icon
 * - Tooltip explaining the sync source
 * - Optional "desync" button to modify independently
 */

import { memo } from "react";
import { Link2, Unlink, Plane, Building2, MapPin } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { DestinationSource } from "@/types/destination";

export interface SyncBadgeProps {
  /** Source widget that this destination is synced from */
  source: DestinationSource;

  /** Name of the destination (for tooltip) */
  destinationName?: string;

  /** ISO timestamp when synced */
  syncedAt?: string;

  /** Callback to desync (modify independently) */
  onDesync?: () => void;

  /** Whether the badge is compact (smaller) */
  compact?: boolean;

  /** Additional class names */
  className?: string;
}

/**
 * Get icon for source widget.
 */
function getSourceIcon(source: DestinationSource) {
  switch (source) {
    case "flight":
      return Plane;
    case "accommodation":
      return Building2;
    case "activity":
      return MapPin;
    default:
      return Link2;
  }
}

/**
 * Get label for source widget.
 */
function getSourceLabel(source: DestinationSource): string {
  switch (source) {
    case "flight":
      return "Vols";
    case "accommodation":
      return "Hébergements";
    case "activity":
      return "Activités";
    case "manual":
      return "Manuel";
    default:
      return "Inconnu";
  }
}

/**
 * Get color for source widget.
 */
function getSourceColor(source: DestinationSource): string {
  switch (source) {
    case "flight":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "accommodation":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "activity":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

/**
 * Format sync timestamp for tooltip.
 */
function formatSyncTime(isoString?: string): string {
  if (!isoString) return "";

  try {
    const date = new Date(isoString);
    return date.toLocaleString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export const SyncBadge = memo(function SyncBadge({
  source,
  destinationName,
  syncedAt,
  onDesync,
  compact = false,
  className,
}: SyncBadgeProps) {
  const Icon = getSourceIcon(source);
  const sourceLabel = getSourceLabel(source);
  const colorClasses = getSourceColor(source);
  const syncTime = formatSyncTime(syncedAt);

  // Don't show badge for manual entries
  if (source === "manual") {
    return null;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-full border font-medium transition-colors",
              compact
                ? "px-1.5 py-0.5 text-[10px]"
                : "px-2 py-1 text-xs",
              colorClasses,
              className
            )}
          >
            <Icon className={cn(compact ? "h-2.5 w-2.5" : "h-3 w-3")} />
            <span className="whitespace-nowrap">
              {compact ? sourceLabel.substring(0, 4) : `Sync ${sourceLabel}`}
            </span>
            <Link2 className={cn(compact ? "h-2 w-2" : "h-2.5 w-2.5", "opacity-60")} />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5" />
              <span className="font-medium">Synchronisé depuis {sourceLabel}</span>
            </div>
            {destinationName && (
              <p className="text-xs text-muted-foreground">
                La ville "{destinationName}" est héritée de vos {sourceLabel.toLowerCase()}.
              </p>
            )}
            {syncTime && (
              <p className="text-[10px] text-muted-foreground">
                Synchro: {syncTime}
              </p>
            )}
            {onDesync && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDesync();
                }}
                className="mt-1.5 flex w-full items-center justify-center gap-1 rounded-md bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
              >
                <Unlink className="h-2.5 w-2.5" />
                Modifier indépendamment
              </button>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

/**
 * Smaller inline version for tight spaces.
 */
export const SyncBadgeInline = memo(function SyncBadgeInline({
  source,
  className,
}: Pick<SyncBadgeProps, "source" | "className">) {
  const Icon = getSourceIcon(source);
  const colorClasses = getSourceColor(source);

  if (source === "manual") {
    return null;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "inline-flex items-center justify-center rounded-full p-0.5",
              colorClasses,
              className
            )}
          >
            <Link2 className="h-2.5 w-2.5" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <div className="flex items-center gap-1">
            <Icon className="h-3 w-3" />
            <span>Synchronisé depuis {getSourceLabel(source)}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

export default SyncBadge;
