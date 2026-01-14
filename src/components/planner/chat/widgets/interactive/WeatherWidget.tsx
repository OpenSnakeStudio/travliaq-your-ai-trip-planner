/**
 * WeatherWidget - Weather forecast display
 *
 * Shows weather forecasts for the trip duration to help
 * users plan activities appropriately.
 */

import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Droplets,
  Thermometer,
  Umbrella,
  CloudSun,
  CloudFog,
  Sunrise,
  Sunset,
} from "lucide-react";

/**
 * Weather condition
 */
export type WeatherCondition =
  | "sunny"
  | "partly_cloudy"
  | "cloudy"
  | "rainy"
  | "stormy"
  | "snowy"
  | "foggy"
  | "windy";

/**
 * Daily weather forecast
 */
export interface DailyForecast {
  date: Date;
  /** Weather condition */
  condition: WeatherCondition;
  /** High temperature (Celsius) */
  tempHigh: number;
  /** Low temperature (Celsius) */
  tempLow: number;
  /** Precipitation probability (0-100) */
  precipitationChance: number;
  /** Wind speed (km/h) */
  windSpeed?: number;
  /** Humidity (0-100) */
  humidity?: number;
  /** UV index */
  uvIndex?: number;
  /** Sunrise time */
  sunrise?: string;
  /** Sunset time */
  sunset?: string;
  /** Weather description */
  description?: string;
}

/**
 * Weather alert
 */
export interface WeatherAlert {
  id: string;
  type: "heat" | "rain" | "storm" | "wind" | "cold" | "uv";
  severity: "minor" | "moderate" | "severe";
  title: string;
  message: string;
  affectedDays: number[];
}

/**
 * WeatherWidget props
 */
interface WeatherWidgetProps {
  /** City/location name */
  location: string;
  /** Forecasts for trip duration */
  forecasts: DailyForecast[];
  /** Weather alerts */
  alerts?: WeatherAlert[];
  /** Temperature unit */
  unit?: "celsius" | "fahrenheit";
  /** Compact display */
  compact?: boolean;
  /** Show detailed info */
  showDetails?: boolean;
  /** Day click handler */
  onDayClick?: (forecast: DailyForecast, index: number) => void;
}

/**
 * Weather condition icons
 */
const CONDITION_ICONS: Record<WeatherCondition, React.ElementType> = {
  sunny: Sun,
  partly_cloudy: CloudSun,
  cloudy: Cloud,
  rainy: CloudRain,
  stormy: CloudLightning,
  snowy: CloudSnow,
  foggy: CloudFog,
  windy: Wind,
};

/**
 * Weather condition colors
 */
const CONDITION_COLORS: Record<WeatherCondition, string> = {
  sunny: "text-amber-500",
  partly_cloudy: "text-amber-400",
  cloudy: "text-slate-400",
  rainy: "text-blue-500",
  stormy: "text-purple-500",
  snowy: "text-cyan-400",
  foggy: "text-slate-400",
  windy: "text-teal-500",
};

/**
 * Weather condition backgrounds
 */
const CONDITION_BG: Record<WeatherCondition, string> = {
  sunny: "bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30",
  partly_cloudy: "bg-gradient-to-br from-amber-50 to-slate-100 dark:from-amber-900/20 dark:to-slate-800/30",
  cloudy: "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800/30 dark:to-slate-700/30",
  rainy: "bg-gradient-to-br from-blue-100 to-slate-200 dark:from-blue-900/30 dark:to-slate-800/30",
  stormy: "bg-gradient-to-br from-purple-100 to-slate-200 dark:from-purple-900/30 dark:to-slate-800/30",
  snowy: "bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-900/20 dark:to-slate-800/30",
  foggy: "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800/30 dark:to-slate-700/30",
  windy: "bg-gradient-to-br from-teal-50 to-slate-100 dark:from-teal-900/20 dark:to-slate-800/30",
};

// Condition labels are now retrieved via i18n

/**
 * Convert Celsius to Fahrenheit
 */
function toFahrenheit(celsius: number): number {
  return Math.round((celsius * 9) / 5 + 32);
}

/**
 * Format temperature
 */
function formatTemp(temp: number, unit: "celsius" | "fahrenheit"): string {
  const value = unit === "fahrenheit" ? toFahrenheit(temp) : temp;
  return `${value}°${unit === "fahrenheit" ? "F" : "C"}`;
}

/**
 * Format day name with i18n
 */
function formatDayName(date: Date, index: number, t: (key: string) => string, locale: string): string {
  if (index === 0) return t("planner.weather.today");
  if (index === 1) return t("planner.weather.tomorrow");
  return date.toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", { weekday: "short" });
}

/**
 * Weather alert badge
 */
function AlertBadge({ alert }: { alert: WeatherAlert }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium",
        alert.severity === "severe" &&
          "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
        alert.severity === "moderate" &&
          "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
        alert.severity === "minor" &&
          "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
      )}
    >
      {alert.type === "rain" && <Umbrella size={12} />}
      {alert.type === "heat" && <Thermometer size={12} />}
      {alert.type === "storm" && <CloudLightning size={12} />}
      {alert.type === "wind" && <Wind size={12} />}
      <span>{alert.title}</span>
    </div>
  );
}

/**
 * Single day forecast card
 */
function DayForecastCard({
  forecast,
  index,
  unit,
  compact,
  showDetails,
  onClick,
  t,
  locale,
}: {
  forecast: DailyForecast;
  index: number;
  unit: "celsius" | "fahrenheit";
  compact: boolean;
  showDetails: boolean;
  onClick?: () => void;
  t: (key: string) => string;
  locale: string;
}) {
  const Icon = CONDITION_ICONS[forecast.condition];
  const dayName = formatDayName(forecast.date, index, t, locale);
  const dateStr = forecast.date.toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", {
    day: "numeric",
    month: "short",
  });
  
  // Condition labels via i18n
  const conditionLabel = t(`planner.weather.conditions.${forecast.condition}`);

  if (compact) {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-1 p-2 rounded-lg min-w-[60px]",
          CONDITION_BG[forecast.condition],
          onClick && "cursor-pointer hover:opacity-80 transition-opacity"
        )}
        onClick={onClick}
      >
        <span className="text-xs font-medium">{dayName}</span>
        <Icon size={24} className={CONDITION_COLORS[forecast.condition]} />
        <div className="text-xs">
          <span className="font-semibold">{forecast.tempHigh}°</span>
          <span className="text-muted-foreground">/{forecast.tempLow}°</span>
        </div>
        {forecast.precipitationChance > 30 && (
          <div className="flex items-center gap-0.5 text-xs text-blue-500">
            <Droplets size={10} />
            <span>{forecast.precipitationChance}%</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border overflow-hidden",
        onClick && "cursor-pointer hover:shadow-md transition-shadow"
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className={cn("p-3", CONDITION_BG[forecast.condition])}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">{dayName}</div>
            <div className="text-xs text-muted-foreground">{dateStr}</div>
          </div>
          <Icon size={32} className={CONDITION_COLORS[forecast.condition]} />
        </div>

        {/* Temperature */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold">
            {formatTemp(forecast.tempHigh, unit)}
          </span>
          <span className="text-muted-foreground">
            / {formatTemp(forecast.tempLow, unit)}
          </span>
        </div>

        {/* Condition label */}
        <div className="text-sm text-muted-foreground mt-1">
          {forecast.description || conditionLabel}
        </div>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="p-3 bg-card border-t space-y-2">
          {/* Precipitation */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Droplets size={14} />
              <span>{t("planner.weather.precipitation")}</span>
            </div>
            <span className="font-medium">{forecast.precipitationChance}%</span>
          </div>

          {/* Wind */}
          {forecast.windSpeed !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Wind size={14} />
                <span>{t("planner.weather.wind")}</span>
              </div>
              <span className="font-medium">{forecast.windSpeed} km/h</span>
            </div>
          )}

          {/* Humidity */}
          {forecast.humidity !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Droplets size={14} />
                <span>{t("planner.weather.humidity")}</span>
              </div>
              <span className="font-medium">{forecast.humidity}%</span>
            </div>
          )}

          {/* Sunrise/Sunset */}
          {(forecast.sunrise || forecast.sunset) && (
            <div className="flex items-center justify-between text-sm pt-2 border-t">
              {forecast.sunrise && (
                <div className="flex items-center gap-1 text-amber-500">
                  <Sunrise size={14} />
                  <span>{forecast.sunrise}</span>
                </div>
              )}
              {forecast.sunset && (
                <div className="flex items-center gap-1 text-indigo-500">
                  <Sunset size={14} />
                  <span>{forecast.sunset}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * WeatherWidget Component
 *
 * @example
 * ```tsx
 * <WeatherWidget
 *   location="Barcelone"
 *   forecasts={[
 *     {
 *       date: new Date("2024-07-15"),
 *       condition: "sunny",
 *       tempHigh: 32,
 *       tempLow: 24,
 *       precipitationChance: 5,
 *     },
 *     {
 *       date: new Date("2024-07-16"),
 *       condition: "partly_cloudy",
 *       tempHigh: 30,
 *       tempLow: 23,
 *       precipitationChance: 20,
 *     },
 *   ]}
 *   showDetails
 * />
 * ```
 */
export function WeatherWidget({
  location,
  forecasts,
  alerts = [],
  unit = "celsius",
  compact = false,
  showDetails = false,
  onDayClick,
}: WeatherWidgetProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  
  if (forecasts.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-4 text-center text-muted-foreground">
        {t("planner.weather.noForecast")}
      </div>
    );
  }

  // Calculate averages
  const avgHigh = Math.round(
    forecasts.reduce((sum, f) => sum + f.tempHigh, 0) / forecasts.length
  );
  const avgLow = Math.round(
    forecasts.reduce((sum, f) => sum + f.tempLow, 0) / forecasts.length
  );
  const rainyDays = forecasts.filter((f) => f.precipitationChance > 50).length;

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{t("planner.weather.weatherAt", { location })}</h3>
            <p className="text-sm text-muted-foreground">
              {t("planner.weather.days", { count: forecasts.length })} • {t("planner.weather.avg")} {avgHigh}°/{avgLow}°
              {rainyDays > 0 && ` • ${t("planner.weather.rainyDays", { count: rainyDays })}`}
            </p>
          </div>
          <Cloud className="text-muted-foreground" size={24} />
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {alerts.map((alert) => (
              <AlertBadge key={alert.id} alert={alert} />
            ))}
          </div>
        )}
      </div>

      {/* Forecasts */}
      <div
        className={cn(
          "p-4",
          compact
            ? "flex gap-2 overflow-x-auto"
            : "grid gap-3",
          !compact && forecasts.length <= 3 && "grid-cols-1 sm:grid-cols-3",
          !compact && forecasts.length > 3 && "grid-cols-2 sm:grid-cols-4"
        )}
      >
        {forecasts.map((forecast, index) => (
          <DayForecastCard
            key={index}
            forecast={forecast}
            index={index}
            unit={unit}
            compact={compact}
            showDetails={showDetails}
            onClick={onDayClick ? () => onDayClick(forecast, index) : undefined}
            t={t}
            locale={locale}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Weather strip for inline display
 */
export function WeatherStrip({
  forecasts,
  unit = "celsius",
}: {
  forecasts: DailyForecast[];
  unit?: "celsius" | "fahrenheit";
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  
  return (
    <div className="flex gap-1 overflow-x-auto py-1">
      {forecasts.slice(0, 7).map((forecast, index) => {
        const Icon = CONDITION_ICONS[forecast.condition];
        const conditionLabel = t(`planner.weather.conditions.${forecast.condition}`);
        return (
          <div
            key={index}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded bg-muted/50 min-w-[48px]"
            title={conditionLabel}
          >
            <span className="text-[10px] text-muted-foreground">
              {formatDayName(forecast.date, index, t, locale).slice(0, 3)}
            </span>
            <Icon size={16} className={CONDITION_COLORS[forecast.condition]} />
            <span className="text-xs font-medium">{forecast.tempHigh}°</span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Weather badge for quick info
 */
export function WeatherBadge({
  condition,
  temp,
  precipitationChance,
}: {
  condition: WeatherCondition;
  temp: number;
  precipitationChance?: number;
}) {
  const Icon = CONDITION_ICONS[condition];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
        CONDITION_BG[condition]
      )}
    >
      <Icon size={16} className={CONDITION_COLORS[condition]} />
      <span className="font-medium">{temp}°</span>
      {precipitationChance !== undefined && precipitationChance > 30 && (
        <span className="flex items-center gap-0.5 text-xs text-blue-500">
          <Droplets size={10} />
          {precipitationChance}%
        </span>
      )}
    </div>
  );
}

export default WeatherWidget;
