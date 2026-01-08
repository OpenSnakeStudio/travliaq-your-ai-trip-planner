/**
 * PriceAlertBanner - Alert banner for price changes
 *
 * Displays visual alerts when prices drop, availability changes,
 * or urgent booking opportunities arise.
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Clock,
  X,
  ChevronRight,
  Zap,
  Flame,
  Bell,
  CheckCircle,
} from "lucide-react";

/**
 * Alert type
 */
export type PriceAlertType =
  | "price_drop"
  | "price_increase"
  | "low_availability"
  | "flash_sale"
  | "expiring_deal"
  | "back_in_stock"
  | "new_deal";

/**
 * Alert severity
 */
export type AlertSeverity = "info" | "success" | "warning" | "urgent";

/**
 * Price alert data
 */
export interface PriceAlert {
  id: string;
  type: PriceAlertType;
  severity: AlertSeverity;
  /** Alert title */
  title: string;
  /** Alert message */
  message: string;
  /** Item affected */
  item?: {
    id: string;
    name: string;
    type: "flight" | "hotel" | "activity";
  };
  /** Price change details */
  priceChange?: {
    oldPrice: number;
    newPrice: number;
    currency: string;
    percentChange: number;
  };
  /** Time-sensitive data */
  expiry?: {
    expiresAt: Date;
    remainingUnits?: number;
  };
  /** Actions available */
  actions?: Array<{
    label: string;
    action: string;
    primary?: boolean;
  }>;
  /** Can be dismissed */
  dismissible?: boolean;
  /** Timestamp */
  createdAt: Date;
}

/**
 * PriceAlertBanner props
 */
interface PriceAlertBannerProps {
  /** Alert to display */
  alert: PriceAlert;
  /** Dismiss callback */
  onDismiss?: () => void;
  /** Action callback */
  onAction?: (action: string) => void;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Show animation */
  animated?: boolean;
}

/**
 * Alert type configuration
 */
const ALERT_CONFIG: Record<
  PriceAlertType,
  {
    icon: React.ElementType;
    defaultTitle: string;
  }
> = {
  price_drop: {
    icon: TrendingDown,
    defaultTitle: "Baisse de prix !",
  },
  price_increase: {
    icon: TrendingUp,
    defaultTitle: "Prix en hausse",
  },
  low_availability: {
    icon: AlertTriangle,
    defaultTitle: "Disponibilité limitée",
  },
  flash_sale: {
    icon: Zap,
    defaultTitle: "Vente flash !",
  },
  expiring_deal: {
    icon: Clock,
    defaultTitle: "Offre bientôt expirée",
  },
  back_in_stock: {
    icon: CheckCircle,
    defaultTitle: "De nouveau disponible",
  },
  new_deal: {
    icon: Bell,
    defaultTitle: "Nouvelle offre",
  },
};

/**
 * Severity styling
 */
const SEVERITY_STYLES: Record<
  AlertSeverity,
  {
    bg: string;
    border: string;
    icon: string;
    text: string;
  }
> = {
  info: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    icon: "text-blue-500",
    text: "text-blue-800 dark:text-blue-200",
  },
  success: {
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-800",
    icon: "text-green-500",
    text: "text-green-800 dark:text-green-200",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
    icon: "text-amber-500",
    text: "text-amber-800 dark:text-amber-200",
  },
  urgent: {
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
    icon: "text-red-500",
    text: "text-red-800 dark:text-red-200",
  },
};

/**
 * Format price change
 */
function formatPriceChange(
  oldPrice: number,
  newPrice: number,
  currency: string
): string {
  const diff = oldPrice - newPrice;
  return diff > 0 ? `-${diff}${currency}` : `+${Math.abs(diff)}${currency}`;
}

/**
 * Format time remaining
 */
function formatTimeRemaining(expiresAt: Date): string {
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();

  if (diff <= 0) return "Expiré";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}j restant${days > 1 ? "s" : ""}`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}min restantes`;
  }

  return `${minutes} min restantes`;
}

/**
 * PriceAlertBanner Component
 *
 * @example
 * ```tsx
 * <PriceAlertBanner
 *   alert={{
 *     id: "1",
 *     type: "price_drop",
 *     severity: "success",
 *     title: "Le prix a baissé !",
 *     message: "Le vol que vous suivez est maintenant moins cher.",
 *     priceChange: {
 *       oldPrice: 250,
 *       newPrice: 180,
 *       currency: "€",
 *       percentChange: -28,
 *     },
 *     item: { id: "flight-1", name: "Paris → Barcelone", type: "flight" },
 *     createdAt: new Date(),
 *   }}
 *   onAction={(action) => handleAction(action)}
 *   onDismiss={() => dismissAlert()}
 * />
 * ```
 */
export function PriceAlertBanner({
  alert,
  onDismiss,
  onAction,
  size = "md",
  animated = true,
}: PriceAlertBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const config = ALERT_CONFIG[alert.type];
  const styles = SEVERITY_STYLES[alert.severity];
  const Icon = config.icon;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <div
      className={cn(
        "relative rounded-lg border overflow-hidden",
        styles.bg,
        styles.border,
        animated && "animate-in slide-in-from-top-2 fade-in duration-300"
      )}
    >
      {/* Urgent pulse effect */}
      {alert.severity === "urgent" && (
        <div className="absolute inset-0 animate-pulse bg-red-500/5 pointer-events-none" />
      )}

      <div
        className={cn(
          "flex items-start gap-3",
          size === "sm" && "p-2",
          size === "md" && "p-3",
          size === "lg" && "p-4"
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            "flex-shrink-0 rounded-full p-2",
            styles.bg,
            styles.icon
          )}
        >
          <Icon size={size === "sm" ? 16 : size === "md" ? 20 : 24} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="flex items-center gap-2">
            <h4
              className={cn(
                "font-semibold",
                styles.text,
                size === "sm" ? "text-sm" : "text-base"
              )}
            >
              {alert.title || config.defaultTitle}
            </h4>

            {/* Flash indicator for urgent */}
            {alert.severity === "urgent" && (
              <Flame size={14} className="text-red-500 animate-pulse" />
            )}
          </div>

          {/* Message */}
          <p
            className={cn(
              "mt-1 text-muted-foreground",
              size === "sm" ? "text-xs" : "text-sm"
            )}
          >
            {alert.message}
          </p>

          {/* Item info */}
          {alert.item && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{alert.item.name}</span>
            </div>
          )}

          {/* Price change */}
          {alert.priceChange && (
            <div className="mt-2 flex items-center gap-3">
              {/* Old price */}
              <span className="text-muted-foreground line-through text-sm">
                {alert.priceChange.oldPrice}
                {alert.priceChange.currency}
              </span>

              {/* Arrow */}
              <ChevronRight size={14} className="text-muted-foreground" />

              {/* New price */}
              <span
                className={cn(
                  "font-bold",
                  size === "sm" ? "text-base" : "text-lg",
                  alert.priceChange.percentChange < 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {alert.priceChange.newPrice}
                {alert.priceChange.currency}
              </span>

              {/* Percent change badge */}
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  alert.priceChange.percentChange < 0
                    ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                    : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                )}
              >
                {alert.priceChange.percentChange > 0 ? "+" : ""}
                {alert.priceChange.percentChange}%
              </span>
            </div>
          )}

          {/* Expiry countdown */}
          {alert.expiry && (
            <div className="mt-2 flex items-center gap-2">
              <Clock size={14} className="text-muted-foreground" />
              <span
                className={cn(
                  "text-sm",
                  alert.severity === "urgent"
                    ? "text-red-600 dark:text-red-400 font-medium"
                    : "text-muted-foreground"
                )}
              >
                {formatTimeRemaining(alert.expiry.expiresAt)}
              </span>
              {alert.expiry.remainingUnits !== undefined && (
                <span className="text-sm text-amber-600 dark:text-amber-400">
                  • {alert.expiry.remainingUnits} places restantes
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          {alert.actions && alert.actions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {alert.actions.map((action, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onAction?.(action.action)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    action.primary
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-background border hover:bg-muted"
                  )}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dismiss button */}
        {alert.dismissible !== false && (
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Compact price alert chip
 */
export function PriceAlertChip({
  type,
  message,
  onClick,
}: {
  type: PriceAlertType;
  message: string;
  onClick?: () => void;
}) {
  const config = ALERT_CONFIG[type];
  const Icon = config.icon;

  const colorClass =
    type === "price_drop" || type === "flash_sale" || type === "back_in_stock"
      ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
      : type === "price_increase" || type === "low_availability"
      ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
      : "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
        "transition-all hover:scale-[1.02] active:scale-[0.98]",
        colorClass
      )}
    >
      <Icon size={14} />
      <span>{message}</span>
    </button>
  );
}

/**
 * Multiple alerts stack
 */
export function PriceAlertStack({
  alerts,
  onDismiss,
  onAction,
  maxVisible = 3,
}: {
  alerts: PriceAlert[];
  onDismiss?: (alertId: string) => void;
  onAction?: (alertId: string, action: string) => void;
  maxVisible?: number;
}) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const visibleAlerts = alerts
    .filter((a) => !dismissedIds.has(a.id))
    .slice(0, maxVisible);

  const hiddenCount = Math.max(
    0,
    alerts.filter((a) => !dismissedIds.has(a.id)).length - maxVisible
  );

  const handleDismiss = (alertId: string) => {
    setDismissedIds((prev) => new Set([...prev, alertId]));
    onDismiss?.(alertId);
  };

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {visibleAlerts.map((alert) => (
        <PriceAlertBanner
          key={alert.id}
          alert={alert}
          onDismiss={() => handleDismiss(alert.id)}
          onAction={(action) => onAction?.(alert.id, action)}
          size="sm"
        />
      ))}

      {hiddenCount > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          +{hiddenCount} autre{hiddenCount > 1 ? "s" : ""} alerte
          {hiddenCount > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

export default PriceAlertBanner;
