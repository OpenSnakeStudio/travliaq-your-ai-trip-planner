/**
 * FlightComparisonCard - Specialized flight comparison
 *
 * Side-by-side comparison of 2-4 flights with flight-specific
 * metrics like duration, stops, times, and baggage.
 */

import { cn } from "@/lib/utils";
import {
  Plane,
  Clock,
  Luggage,
  ArrowRight,
  Check,
  AlertCircle,
  Trophy,
  Zap,
} from "lucide-react";

/**
 * Flight leg data for comparison
 */
export interface FlightLegComparison {
  departureTime: string;
  arrivalTime: string;
  departureAirport: string;
  arrivalAirport: string;
  duration: string;
  durationMinutes: number;
  stops: number;
  stopCities?: string[];
  airline: string;
  airlineLogo?: string;
  flightNumber?: string;
}

/**
 * Full flight data for comparison
 */
export interface FlightComparison {
  id: string;
  outbound: FlightLegComparison;
  return?: FlightLegComparison;
  price: number;
  pricePerPerson?: number;
  currency?: string;
  /** Baggage included */
  baggageIncluded?: {
    cabin: boolean;
    checked: boolean;
    checkedKg?: number;
  };
  /** Seat selection included */
  seatSelection?: boolean;
  /** Refundable */
  refundable?: boolean;
  /** Flexible change */
  flexibleChange?: boolean;
  /** CO2 emissions (kg) */
  co2?: number;
  /** Best for category */
  bestFor?: "price" | "duration" | "comfort" | "schedule";
  /** Tags */
  tags?: string[];
}

/**
 * FlightComparisonCard props
 */
interface FlightComparisonCardProps {
  /** Flights to compare (2-4) */
  flights: FlightComparison[];
  /** Select flight callback */
  onSelect?: (flightId: string) => void;
  /** Size variant */
  size?: "sm" | "md";
  /** Show detailed comparison */
  showDetails?: boolean;
  /** Currency */
  currency?: string;
}

/**
 * Format duration from minutes
 */
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h${mins > 0 ? ` ${mins}m` : ""}`;
}

/**
 * Best badge mapping
 */
const BEST_FOR_BADGES: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  price: { label: "Meilleur prix", icon: Trophy, color: "text-green-600 bg-green-100 dark:bg-green-900/40" },
  duration: { label: "Plus rapide", icon: Zap, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/40" },
  comfort: { label: "Plus confortable", icon: Check, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/40" },
  schedule: { label: "Meilleurs horaires", icon: Clock, color: "text-amber-600 bg-amber-100 dark:bg-amber-900/40" },
};

/**
 * Flight leg display
 */
function FlightLegDisplay({
  leg,
  label,
  size,
}: {
  leg: FlightLegComparison;
  label: string;
  size: "sm" | "md";
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="flex items-center gap-2">
        {/* Airline logo or icon */}
        {leg.airlineLogo ? (
          <img src={leg.airlineLogo} alt={leg.airline} className="w-6 h-6 object-contain" />
        ) : (
          <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
            <Plane size={12} />
          </div>
        )}

        {/* Times */}
        <div className="flex items-center gap-1 text-sm font-medium">
          <span>{leg.departureTime}</span>
          <ArrowRight size={12} className="text-muted-foreground" />
          <span>{leg.arrivalTime}</span>
        </div>
      </div>

      {/* Duration and stops */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{leg.duration}</span>
        <span>·</span>
        <span className={leg.stops === 0 ? "text-green-600" : ""}>
          {leg.stops === 0 ? "Direct" : `${leg.stops} escale${leg.stops > 1 ? "s" : ""}`}
        </span>
      </div>

      {/* Airports */}
      <div className="text-xs text-muted-foreground">
        {leg.departureAirport} → {leg.arrivalAirport}
      </div>
    </div>
  );
}

/**
 * FlightComparisonCard Component
 *
 * @example
 * ```tsx
 * <FlightComparisonCard
 *   flights={[
 *     {
 *       id: "1",
 *       outbound: { ... },
 *       return: { ... },
 *       price: 245,
 *       bestFor: "price",
 *     },
 *     {
 *       id: "2",
 *       outbound: { ... },
 *       return: { ... },
 *       price: 320,
 *       bestFor: "duration",
 *     },
 *   ]}
 *   onSelect={(id) => selectFlight(id)}
 * />
 * ```
 */
export function FlightComparisonCard({
  flights,
  onSelect,
  size = "md",
  showDetails = true,
  currency = "€",
}: FlightComparisonCardProps) {
  // Find best values
  const cheapest = Math.min(...flights.map((f) => f.price));
  const fastestOutbound = Math.min(...flights.map((f) => f.outbound.durationMinutes));
  const fewestStops = Math.min(...flights.map((f) => f.outbound.stops + (f.return?.stops || 0)));

  const itemWidth = `${100 / flights.length}%`;

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Flight cards row */}
      <div className="flex">
        {flights.map((flight, index) => {
          const isCheapest = flight.price === cheapest;
          const isFastest = flight.outbound.durationMinutes === fastestOutbound;
          const hasFewestStops =
            flight.outbound.stops + (flight.return?.stops || 0) === fewestStops;

          return (
            <div
              key={flight.id}
              className={cn(
                "flex-1 p-4",
                index < flights.length - 1 && "border-r border-border"
              )}
              style={{ width: itemWidth }}
            >
              {/* Best for badge */}
              {flight.bestFor && (
                <div className="mb-3">
                  {(() => {
                    const badge = BEST_FOR_BADGES[flight.bestFor];
                    const Icon = badge.icon;
                    return (
                      <div
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                          badge.color
                        )}
                      >
                        <Icon size={12} />
                        {badge.label}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Airline */}
              <div className="flex items-center gap-2 mb-3">
                {flight.outbound.airlineLogo ? (
                  <img
                    src={flight.outbound.airlineLogo}
                    alt={flight.outbound.airline}
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                    <Plane size={16} />
                  </div>
                )}
                <span className="text-sm font-medium">{flight.outbound.airline}</span>
              </div>

              {/* Outbound */}
              <FlightLegDisplay leg={flight.outbound} label="Aller" size={size} />

              {/* Return */}
              {flight.return && (
                <div className="mt-3 pt-3 border-t border-border">
                  <FlightLegDisplay leg={flight.return} label="Retour" size={size} />
                </div>
              )}

              {/* Price */}
              <div className="mt-4 pt-3 border-t border-border">
                <div className="flex items-baseline gap-1">
                  <span
                    className={cn(
                      "font-bold",
                      size === "sm" ? "text-xl" : "text-2xl",
                      isCheapest && "text-green-600"
                    )}
                  >
                    {flight.price}
                    {currency}
                  </span>
                  {flight.pricePerPerson && (
                    <span className="text-xs text-muted-foreground">/pers.</span>
                  )}
                </div>

                {/* Highlights */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {isCheapest && (
                    <span className="px-1.5 py-0.5 rounded text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                      Moins cher
                    </span>
                  )}
                  {isFastest && (
                    <span className="px-1.5 py-0.5 rounded text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                      Plus rapide
                    </span>
                  )}
                  {hasFewestStops && fewestStops === 0 && (
                    <span className="px-1.5 py-0.5 rounded text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                      Direct
                    </span>
                  )}
                </div>
              </div>

              {/* Select button */}
              {onSelect && (
                <button
                  type="button"
                  onClick={() => onSelect(flight.id)}
                  className={cn(
                    "w-full mt-4 py-2 rounded-lg font-medium transition-all",
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    size === "sm" ? "text-xs" : "text-sm"
                  )}
                >
                  Sélectionner
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Detailed comparison */}
      {showDetails && (
        <div className="border-t divide-y divide-border">
          {/* Duration row */}
          <div className="flex">
            <div className="w-1/4 min-w-[100px] flex items-center px-3 py-2 bg-muted/20 text-sm text-muted-foreground">
              <Clock size={14} className="mr-2" />
              Durée totale
            </div>
            <div className="flex-1 flex">
              {flights.map((flight, index) => {
                const totalMinutes =
                  flight.outbound.durationMinutes + (flight.return?.durationMinutes || 0);
                const isBest = totalMinutes === Math.min(
                  ...flights.map((f) => f.outbound.durationMinutes + (f.return?.durationMinutes || 0))
                );
                return (
                  <div
                    key={flight.id}
                    className={cn(
                      "flex-1 flex items-center justify-center py-2 text-sm font-medium",
                      index < flights.length - 1 && "border-r border-border",
                      isBest && "text-green-600 bg-green-50 dark:bg-green-900/20"
                    )}
                  >
                    {isBest && <Check size={14} className="mr-1" />}
                    {formatDuration(totalMinutes)}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stops row */}
          <div className="flex">
            <div className="w-1/4 min-w-[100px] flex items-center px-3 py-2 bg-muted/20 text-sm text-muted-foreground">
              <Plane size={14} className="mr-2" />
              Escales
            </div>
            <div className="flex-1 flex">
              {flights.map((flight, index) => {
                const totalStops = flight.outbound.stops + (flight.return?.stops || 0);
                const isBest = totalStops === fewestStops;
                return (
                  <div
                    key={flight.id}
                    className={cn(
                      "flex-1 flex items-center justify-center py-2 text-sm font-medium",
                      index < flights.length - 1 && "border-r border-border",
                      isBest && "text-green-600 bg-green-50 dark:bg-green-900/20"
                    )}
                  >
                    {isBest && <Check size={14} className="mr-1" />}
                    {totalStops === 0 ? "Direct" : totalStops}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Baggage row */}
          <div className="flex">
            <div className="w-1/4 min-w-[100px] flex items-center px-3 py-2 bg-muted/20 text-sm text-muted-foreground">
              <Luggage size={14} className="mr-2" />
              Bagages
            </div>
            <div className="flex-1 flex">
              {flights.map((flight, index) => (
                <div
                  key={flight.id}
                  className={cn(
                    "flex-1 flex items-center justify-center py-2 text-sm",
                    index < flights.length - 1 && "border-r border-border"
                  )}
                >
                  {flight.baggageIncluded?.checked ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <Check size={14} />
                      {flight.baggageIncluded.checkedKg
                        ? `${flight.baggageIncluded.checkedKg}kg`
                        : "Inclus"}
                    </span>
                  ) : flight.baggageIncluded?.cabin ? (
                    <span className="text-muted-foreground">Cabine seul.</span>
                  ) : (
                    <span className="text-muted-foreground">Non inclus</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Flexibility row */}
          <div className="flex">
            <div className="w-1/4 min-w-[100px] flex items-center px-3 py-2 bg-muted/20 text-sm text-muted-foreground">
              Flexibilité
            </div>
            <div className="flex-1 flex">
              {flights.map((flight, index) => (
                <div
                  key={flight.id}
                  className={cn(
                    "flex-1 flex items-center justify-center py-2 text-sm",
                    index < flights.length - 1 && "border-r border-border"
                  )}
                >
                  {flight.refundable ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <Check size={14} />
                      Remboursable
                    </span>
                  ) : flight.flexibleChange ? (
                    <span className="text-amber-600">Modifiable</span>
                  ) : (
                    <span className="text-muted-foreground">Non flex.</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FlightComparisonCard;
