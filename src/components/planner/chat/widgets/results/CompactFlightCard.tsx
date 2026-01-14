/**
 * CompactFlightCard - Compact flight result card for chat
 *
 * Displays flight information in a compact format with quick actions.
 * Designed to be embedded in chat messages.
 */

import { cn } from "@/lib/utils";
import {
  Plane,
  Clock,
  ArrowRight,
  Luggage,
  ChevronRight,
  Plus,
  Check,
  GitCompare,
} from "lucide-react";
import { ResultBadge, type BadgeType } from "../advice/ResultBadges";
import { useTranslation } from "react-i18next";

/**
 * Flight segment data
 */
export interface FlightSegment {
  departureTime: string;
  arrivalTime: string;
  departureAirport: string;
  arrivalAirport: string;
  duration: string;
  airline?: string;
  airlineLogo?: string;
  flightNumber?: string;
}

/**
 * Compact flight data
 */
export interface CompactFlightData {
  id: string;
  /** Outbound flight */
  outbound: FlightSegment;
  /** Return flight (optional for one-way) */
  return?: FlightSegment;
  /** Total price */
  price: number;
  /** Currency */
  currency?: string;
  /** Per person or total */
  pricePerPerson?: boolean;
  /** Number of stops */
  stops?: number;
  /** Cabin class */
  cabinClass?: string;
  /** Baggage included */
  baggageIncluded?: boolean;
  /** Badges to show */
  badges?: BadgeType[];
  /** Is selected/added to trip */
  selected?: boolean;
}

/**
 * CompactFlightCard props
 */
interface CompactFlightCardProps {
  flight: CompactFlightData;
  /** Select/add to trip action */
  onSelect?: () => void;
  /** View details action */
  onViewDetails?: () => void;
  /** Compare action */
  onCompare?: () => void;
  /** Size variant */
  size?: "sm" | "md";
  /** Show return flight */
  showReturn?: boolean;
  /** Compact single-line mode */
  inline?: boolean;
}

/**
 * Flight segment display
 */
function FlightSegmentDisplay({
  segment,
  label,
  size,
}: {
  segment: FlightSegment;
  label?: string;
  size: "sm" | "md";
}) {
  return (
    <div className="flex items-center gap-3">
      {/* Airline logo or icon */}
      <div className="flex-shrink-0">
        {segment.airlineLogo ? (
          <img
            src={segment.airlineLogo}
            alt={segment.airline}
            className={cn("rounded", size === "sm" ? "w-6 h-6" : "w-8 h-8")}
          />
        ) : (
          <div
            className={cn(
              "rounded bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center",
              size === "sm" ? "w-6 h-6" : "w-8 h-8"
            )}
          >
            <Plane size={size === "sm" ? 12 : 14} className="text-blue-600" />
          </div>
        )}
      </div>

      {/* Times and airports */}
      <div className="flex-1 min-w-0">
        {label && (
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
            {label}
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="text-center">
            <div className={cn("font-bold", size === "sm" ? "text-sm" : "text-base")}>
              {segment.departureTime}
            </div>
            <div className="text-[10px] text-muted-foreground">{segment.departureAirport}</div>
          </div>

          <div className="flex-1 flex items-center gap-1 px-2">
            <div className="flex-1 h-px bg-border" />
            <Plane size={12} className="text-muted-foreground" />
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="text-center">
            <div className={cn("font-bold", size === "sm" ? "text-sm" : "text-base")}>
              {segment.arrivalTime}
            </div>
            <div className="text-[10px] text-muted-foreground">{segment.arrivalAirport}</div>
          </div>
        </div>
      </div>

      {/* Duration */}
      <div className="text-right flex-shrink-0">
        <div className={cn("text-muted-foreground", size === "sm" ? "text-xs" : "text-sm")}>
          {segment.duration}
        </div>
        {segment.airline && (
          <div className="text-[10px] text-muted-foreground">{segment.airline}</div>
        )}
      </div>
    </div>
  );
}

/**
 * Inline compact flight display
 */
function InlineFlightDisplay({
  flight,
  onSelect,
  onViewDetails,
}: {
  flight: CompactFlightData;
  onSelect?: () => void;
  onViewDetails?: () => void;
}) {
  const { t } = useTranslation();
  const { outbound, price, currency = "€", stops, selected } = flight;

  const getStopsLabel = (stops: number) => {
    if (stops === 0) return t("planner.flight.direct");
    if (stops === 1) return t("planner.flight.stopover", { count: stops });
    return t("planner.flight.stopovers", { count: stops });
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border p-2 transition-all",
        selected
          ? "bg-primary/5 border-primary/30"
          : "bg-background border-border hover:border-primary/30"
      )}
    >
      <Plane size={16} className="text-blue-500 flex-shrink-0" />

      <div className="flex items-center gap-2 flex-1 min-w-0 text-sm">
        <span className="font-medium">{outbound.departureTime}</span>
        <span className="text-muted-foreground">{outbound.departureAirport}</span>
        <ArrowRight size={12} className="text-muted-foreground" />
        <span className="font-medium">{outbound.arrivalTime}</span>
        <span className="text-muted-foreground">{outbound.arrivalAirport}</span>
        {stops !== undefined && (
          <span className="text-xs text-muted-foreground">
            · {getStopsLabel(stops)}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="font-bold">
          {price}
          {currency}
        </span>
        {onSelect && (
          <button
            type="button"
            onClick={onSelect}
            className={cn(
              "rounded-full p-1.5 transition-colors",
              selected
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-primary/20 text-muted-foreground hover:text-primary"
            )}
          >
            {selected ? <Check size={14} /> : <Plus size={14} />}
          </button>
        )}
        {onViewDetails && (
          <button
            type="button"
            onClick={onViewDetails}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * CompactFlightCard Component
 */
export function CompactFlightCard({
  flight,
  onSelect,
  onViewDetails,
  onCompare,
  size = "md",
  showReturn = true,
  inline = false,
}: CompactFlightCardProps) {
  const { t } = useTranslation();
  const {
    outbound,
    return: returnFlight,
    price,
    currency = "€",
    pricePerPerson,
    stops,
    cabinClass,
    baggageIncluded,
    badges,
    selected,
  } = flight;

  const getStopsLabel = (stops: number) => {
    if (stops === 0) return t("planner.flight.direct");
    if (stops === 1) return t("planner.flight.stopover", { count: stops });
    return t("planner.flight.stopovers", { count: stops });
  };

  if (inline) {
    return (
      <InlineFlightDisplay
        flight={flight}
        onSelect={onSelect}
        onViewDetails={onViewDetails}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border overflow-hidden transition-all",
        selected
          ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20"
          : "bg-card border-border hover:border-primary/30"
      )}
    >
      {/* Badges */}
      {badges && badges.length > 0 && (
        <div className="flex gap-1.5 px-3 pt-2">
          {badges.map((badge) => (
            <ResultBadge key={badge} type={badge} size="xs" />
          ))}
        </div>
      )}

      {/* Flight segments */}
      <div className={cn("space-y-3", size === "sm" ? "p-2" : "p-3")}>
        <FlightSegmentDisplay
          segment={outbound}
          label={returnFlight ? t("planner.flight.outbound") : undefined}
          size={size}
        />

        {showReturn && returnFlight && (
          <>
            <div className="border-t border-dashed border-border" />
            <FlightSegmentDisplay segment={returnFlight} label={t("planner.flight.return")} size={size} />
          </>
        )}
      </div>

      {/* Footer with price and actions */}
      <div
        className={cn(
          "flex items-center justify-between border-t border-border bg-muted/30",
          size === "sm" ? "px-2 py-1.5" : "px-3 py-2"
        )}
      >
        {/* Info badges */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {stops !== undefined && (
            <span className={stops === 0 ? "text-green-600 font-medium" : ""}>
              {getStopsLabel(stops)}
            </span>
          )}
          {cabinClass && (
            <>
              <span>·</span>
              <span>{cabinClass}</span>
            </>
          )}
          {baggageIncluded && (
            <>
              <span>·</span>
              <Luggage size={12} />
            </>
          )}
        </div>

        {/* Price and actions */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className={cn("font-bold text-foreground", size === "sm" ? "text-base" : "text-lg")}>
              {price}
              {currency}
            </div>
            {pricePerPerson && (
              <div className="text-[10px] text-muted-foreground">{t("planner.common.perPerson")}</div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {onCompare && (
              <button
                type="button"
                onClick={onCompare}
                className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title={t("planner.action.compare")}
              >
                <GitCompare size={16} />
              </button>
            )}
            {onSelect && (
              <button
                type="button"
                onClick={onSelect}
                className={cn(
                  "rounded-full transition-all",
                  size === "sm" ? "p-1.5" : "p-2",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                )}
              >
                {selected ? <Check size={16} /> : <Plus size={16} />}
              </button>
            )}
            {onViewDetails && (
              <button
                type="button"
                onClick={onViewDetails}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompactFlightCard;
