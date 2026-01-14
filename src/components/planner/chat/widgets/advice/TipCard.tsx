/**
 * TipCard - Contextual tip/advice card for the chat
 *
 * Displays helpful tips and advice at key moments during the planning flow.
 * Supports different tip types with appropriate icons and styling.
 */

import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Lightbulb, TrendingDown, Clock, Calendar, MapPin, Info, AlertTriangle, Sparkles } from "lucide-react";

/**
 * Tip type determines icon and styling
 */
export type TipType =
  | "info"        // General information
  | "savings"     // Money-saving tip
  | "timing"      // Best time to book/travel
  | "seasonal"    // Seasonal advice
  | "location"    // Location-based tip
  | "warning"     // Important warning
  | "insight"     // AI-generated insight
  | "pro";        // Pro tip

/**
 * TipCard props
 */
interface TipCardProps {
  /** The tip content */
  message: string;
  /** Type of tip (affects icon and styling) */
  type?: TipType;
  /** Optional title */
  title?: string;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Dismissible */
  dismissible?: boolean;
  /** On dismiss callback */
  onDismiss?: () => void;
  /** Size variant */
  size?: "sm" | "md";
  /** Compact mode (inline) */
  compact?: boolean;
}

/**
 * Get icon and colors for tip type
 */
function getTipConfig(type: TipType) {
  switch (type) {
    case "savings":
      return {
        icon: TrendingDown,
        bgColor: "bg-green-50 dark:bg-green-950/30",
        borderColor: "border-green-200 dark:border-green-800",
        iconColor: "text-green-600 dark:text-green-400",
        titleColor: "text-green-800 dark:text-green-200",
      };
    case "timing":
      return {
        icon: Clock,
        bgColor: "bg-blue-50 dark:bg-blue-950/30",
        borderColor: "border-blue-200 dark:border-blue-800",
        iconColor: "text-blue-600 dark:text-blue-400",
        titleColor: "text-blue-800 dark:text-blue-200",
      };
    case "seasonal":
      return {
        icon: Calendar,
        bgColor: "bg-orange-50 dark:bg-orange-950/30",
        borderColor: "border-orange-200 dark:border-orange-800",
        iconColor: "text-orange-600 dark:text-orange-400",
        titleColor: "text-orange-800 dark:text-orange-200",
      };
    case "location":
      return {
        icon: MapPin,
        bgColor: "bg-purple-50 dark:bg-purple-950/30",
        borderColor: "border-purple-200 dark:border-purple-800",
        iconColor: "text-purple-600 dark:text-purple-400",
        titleColor: "text-purple-800 dark:text-purple-200",
      };
    case "warning":
      return {
        icon: AlertTriangle,
        bgColor: "bg-amber-50 dark:bg-amber-950/30",
        borderColor: "border-amber-200 dark:border-amber-800",
        iconColor: "text-amber-600 dark:text-amber-400",
        titleColor: "text-amber-800 dark:text-amber-200",
      };
    case "insight":
      return {
        icon: Sparkles,
        bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
        borderColor: "border-indigo-200 dark:border-indigo-800",
        iconColor: "text-indigo-600 dark:text-indigo-400",
        titleColor: "text-indigo-800 dark:text-indigo-200",
      };
    case "pro":
      return {
        icon: Lightbulb,
        bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
        borderColor: "border-yellow-200 dark:border-yellow-800",
        iconColor: "text-yellow-600 dark:text-yellow-400",
        titleColor: "text-yellow-800 dark:text-yellow-200",
      };
    case "info":
    default:
      return {
        icon: Info,
        bgColor: "bg-slate-50 dark:bg-slate-900/50",
        borderColor: "border-slate-200 dark:border-slate-700",
        iconColor: "text-slate-600 dark:text-slate-400",
        titleColor: "text-slate-800 dark:text-slate-200",
      };
  }
}

/**
 * Default titles for tip types
 */
function getDefaultTitle(type: TipType, t: (key: string) => string): string {
  return t(`planner.tips.type.${type}`);
}

/**
 * TipCard Component
 *
 * @example
 * ```tsx
 * <TipCard
 *   type="savings"
 *   message="Les vols sont généralement 20% moins chers en milieu de semaine"
 *   action={{
 *     label: "Voir les mardis",
 *     onClick: () => filterByDay("tuesday")
 *   }}
 * />
 * ```
 */
export function TipCard({
  message,
  type = "info",
  title,
  action,
  dismissible = false,
  onDismiss,
  size = "md",
  compact = false,
}: TipCardProps) {
  const { t } = useTranslation();
  const config = getTipConfig(type);
  const Icon = config.icon;
  const displayTitle = title || getDefaultTitle(type, t);

  if (compact) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3 py-1.5 border",
          config.bgColor,
          config.borderColor
        )}
      >
        <Icon size={14} className={config.iconColor} />
        <span className="text-xs text-foreground">{message}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border",
        config.bgColor,
        config.borderColor,
        size === "sm" ? "p-2.5" : "p-3"
      )}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            "flex-shrink-0 rounded-full p-1.5",
            config.bgColor
          )}
        >
          <Icon size={size === "sm" ? 14 : 16} className={config.iconColor} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                "font-medium",
                config.titleColor,
                size === "sm" ? "text-xs" : "text-sm"
              )}
            >
              {displayTitle}
            </span>
            {dismissible && onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <p
            className={cn(
              "mt-0.5 text-foreground/80",
              size === "sm" ? "text-xs" : "text-sm"
            )}
          >
            {message}
          </p>

          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className={cn(
                "mt-2 font-medium underline underline-offset-2 hover:no-underline transition-all",
                config.iconColor,
                size === "sm" ? "text-xs" : "text-sm"
              )}
            >
              {action.label} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Quick tip presets
 */
export const QUICK_TIPS = {
  midweekFlights: {
    type: "savings" as TipType,
    title: "Économisez sur les vols",
    message: "Les vols en milieu de semaine (mardi-mercredi) sont souvent 20-30% moins chers.",
  },
  earlyBooking: {
    type: "timing" as TipType,
    title: "Réservez tôt",
    message: "Pour les meilleures offres, réservez 2-3 mois à l'avance pour les vols internationaux.",
  },
  flexibleDates: {
    type: "savings" as TipType,
    title: "Dates flexibles?",
    message: "Décaler votre voyage de quelques jours peut vous faire économiser significativement.",
  },
  highSeason: {
    type: "seasonal" as TipType,
    title: "Haute saison",
    message: "Cette période est très demandée. Réservez rapidement pour avoir les meilleurs choix.",
  },
  directFlight: {
    type: "timing" as TipType,
    title: "Vols directs",
    message: "Un vol direct peut coûter un peu plus mais vous fait gagner des heures précieuses.",
  },
};

export default TipCard;
