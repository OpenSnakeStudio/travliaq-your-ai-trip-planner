/**
 * SeasonalTip - Seasonal travel advice widget
 *
 * Displays contextual seasonal information about destinations,
 * including weather, events, pricing trends, and recommendations.
 */

import { cn } from "@/lib/utils";
import {
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Thermometer,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  PartyPopper,
  AlertCircle,
} from "lucide-react";

/**
 * Season type
 */
export type Season = "spring" | "summer" | "autumn" | "winter";

/**
 * Crowd level
 */
export type CrowdLevel = "low" | "medium" | "high" | "peak";

/**
 * Price trend
 */
export type PriceTrend = "low" | "average" | "high" | "peak";

/**
 * SeasonalTip data
 */
export interface SeasonalData {
  /** Destination name */
  destination: string;
  /** Month or season */
  period: string;
  /** Season type */
  season?: Season;
  /** Temperature range */
  temperature?: {
    min: number;
    max: number;
    unit?: "C" | "F";
  };
  /** Weather condition */
  weather?: "sunny" | "cloudy" | "rainy" | "snowy" | "mixed";
  /** Crowd level */
  crowdLevel?: CrowdLevel;
  /** Price trend */
  priceTrend?: PriceTrend;
  /** Special events */
  events?: string[];
  /** Main tip message */
  tip: string;
  /** Recommendation (positive/negative/neutral) */
  recommendation?: "recommended" | "caution" | "neutral";
}

/**
 * SeasonalTip props
 */
interface SeasonalTipProps {
  data: SeasonalData;
  /** Show all details or compact */
  variant?: "full" | "compact";
  /** Size */
  size?: "sm" | "md";
  /** Optional action */
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Get weather icon
 */
function WeatherIcon({ weather, size = 16 }: { weather: SeasonalData["weather"]; size?: number }) {
  switch (weather) {
    case "sunny":
      return <Sun size={size} className="text-amber-500" />;
    case "cloudy":
      return <Cloud size={size} className="text-slate-400" />;
    case "rainy":
      return <CloudRain size={size} className="text-blue-500" />;
    case "snowy":
      return <Snowflake size={size} className="text-sky-400" />;
    case "mixed":
    default:
      return <Cloud size={size} className="text-slate-400" />;
  }
}

/**
 * Get crowd level indicator
 */
function CrowdIndicator({ level }: { level: CrowdLevel }) {
  const colors = {
    low: "bg-green-500",
    medium: "bg-yellow-500",
    high: "bg-orange-500",
    peak: "bg-red-500",
  };

  const labels = {
    low: "Peu fréquenté",
    medium: "Fréquentation moyenne",
    high: "Très fréquenté",
    peak: "Affluence maximale",
  };

  return (
    <div className="flex items-center gap-1.5">
      <Users size={14} className="text-muted-foreground" />
      <div className="flex gap-0.5">
        {["low", "medium", "high", "peak"].map((l, i) => (
          <div
            key={l}
            className={cn(
              "w-2 h-2 rounded-full",
              i <= ["low", "medium", "high", "peak"].indexOf(level)
                ? colors[level]
                : "bg-muted"
            )}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{labels[level]}</span>
    </div>
  );
}

/**
 * Get price trend indicator
 */
function PriceTrendIndicator({ trend }: { trend: PriceTrend }) {
  const config = {
    low: { icon: TrendingDown, color: "text-green-600", label: "Prix bas" },
    average: { icon: TrendingUp, color: "text-slate-500", label: "Prix moyens" },
    high: { icon: TrendingUp, color: "text-orange-500", label: "Prix élevés" },
    peak: { icon: TrendingUp, color: "text-red-500", label: "Prix au plus haut" },
  };

  const { icon: Icon, color, label } = config[trend];

  return (
    <div className="flex items-center gap-1.5">
      <Icon size={14} className={color} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

/**
 * SeasonalTip Component
 *
 * @example
 * ```tsx
 * <SeasonalTip
 *   data={{
 *     destination: "Barcelone",
 *     period: "Juillet",
 *     temperature: { min: 22, max: 30 },
 *     weather: "sunny",
 *     crowdLevel: "peak",
 *     priceTrend: "high",
 *     events: ["Festival de musique Sonar"],
 *     tip: "Haute saison touristique. Réservez à l'avance pour les meilleures disponibilités.",
 *     recommendation: "caution"
 *   }}
 * />
 * ```
 */
export function SeasonalTip({
  data,
  variant = "full",
  size = "md",
  action,
}: SeasonalTipProps) {
  const {
    destination,
    period,
    temperature,
    weather,
    crowdLevel,
    priceTrend,
    events,
    tip,
    recommendation,
  } = data;

  const recommendationStyles = {
    recommended: "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20",
    caution: "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20",
    neutral: "border-border bg-muted/30",
  };

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border px-3 py-2",
          recommendation ? recommendationStyles[recommendation] : recommendationStyles.neutral
        )}
      >
        <Calendar size={16} className="text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium">{destination}</span>
          <span className="text-muted-foreground mx-1.5">·</span>
          <span className="text-sm text-muted-foreground">{period}</span>
        </div>
        {temperature && (
          <div className="flex items-center gap-1 text-sm">
            <Thermometer size={14} className="text-muted-foreground" />
            <span>
              {temperature.min}°-{temperature.max}°{temperature.unit || "C"}
            </span>
          </div>
        )}
        {weather && <WeatherIcon weather={weather} size={16} />}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border",
        recommendation ? recommendationStyles[recommendation] : recommendationStyles.neutral,
        size === "sm" ? "p-3" : "p-4"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-primary" />
            <span className={cn("font-semibold", size === "sm" ? "text-sm" : "text-base")}>
              {destination}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{period}</span>
          </div>
        </div>

        {/* Temperature & Weather */}
        {(temperature || weather) && (
          <div className="flex items-center gap-2">
            {weather && <WeatherIcon weather={weather} size={18} />}
            {temperature && (
              <span className="text-sm font-medium">
                {temperature.min}°-{temperature.max}°
              </span>
            )}
          </div>
        )}
      </div>

      {/* Indicators */}
      {(crowdLevel || priceTrend) && (
        <div className="flex items-center gap-4 mt-3">
          {crowdLevel && <CrowdIndicator level={crowdLevel} />}
          {priceTrend && <PriceTrendIndicator trend={priceTrend} />}
        </div>
      )}

      {/* Events */}
      {events && events.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <PartyPopper size={12} />
            <span>Événements</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {events.map((event, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs"
              >
                {event}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tip */}
      <div className="mt-3 flex items-start gap-2">
        {recommendation === "caution" && (
          <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
        )}
        <p className={cn("text-foreground/80", size === "sm" ? "text-xs" : "text-sm")}>
          {tip}
        </p>
      </div>

      {/* Action */}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className={cn(
            "mt-3 font-medium text-primary hover:underline",
            size === "sm" ? "text-xs" : "text-sm"
          )}
        >
          {action.label} →
        </button>
      )}
    </div>
  );
}

/**
 * Preset seasonal data for popular destinations
 */
export const SEASONAL_PRESETS = {
  barcelonaJuly: {
    destination: "Barcelone",
    period: "Juillet",
    temperature: { min: 22, max: 30 },
    weather: "sunny" as const,
    crowdLevel: "peak" as CrowdLevel,
    priceTrend: "high" as PriceTrend,
    events: ["Festival Sonar", "Fêtes de Gràcia"],
    tip: "Haute saison touristique. Les plages et attractions sont très fréquentées. Réservez à l'avance.",
    recommendation: "caution" as const,
  },
  parisSpring: {
    destination: "Paris",
    period: "Avril-Mai",
    temperature: { min: 10, max: 18 },
    weather: "mixed" as const,
    crowdLevel: "medium" as CrowdLevel,
    priceTrend: "average" as PriceTrend,
    events: ["Foire du Trône", "Nuit des Musées"],
    tip: "Excellente période pour visiter. Météo agréable et affluence raisonnable.",
    recommendation: "recommended" as const,
  },
  newYorkWinter: {
    destination: "New York",
    period: "Décembre",
    temperature: { min: -2, max: 7 },
    weather: "snowy" as const,
    crowdLevel: "high" as CrowdLevel,
    priceTrend: "peak" as PriceTrend,
    events: ["Rockefeller Christmas Tree", "New Year's Eve"],
    tip: "Période magique mais très fréquentée et chère. Prévoyez des vêtements chauds.",
    recommendation: "neutral" as const,
  },
};

export default SeasonalTip;
