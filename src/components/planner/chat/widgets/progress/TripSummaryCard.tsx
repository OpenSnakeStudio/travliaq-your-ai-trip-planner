/**
 * TripSummaryCard - Compact trip summary with inline editing
 *
 * Displays a summary of the planned trip with editable fields
 * for quick modifications without starting over.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Calendar,
  Users,
  Plane,
  Hotel,
  Compass,
  Edit2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

/**
 * Trip summary data
 */
export interface TripSummaryData {
  /** Destination info */
  destination?: {
    city: string;
    country: string;
    countryCode?: string;
  };
  /** Date range */
  dates?: {
    departure: Date | string;
    return?: Date | string;
    nights?: number;
  };
  /** Travelers */
  travelers?: {
    adults: number;
    children: number;
    infants: number;
  };
  /** Flight info (if booked/selected) */
  flight?: {
    airline?: string;
    departureTime?: string;
    price?: number;
  };
  /** Hotel info (if booked/selected) */
  hotel?: {
    name?: string;
    stars?: number;
    price?: number;
  };
  /** Activities count */
  activitiesCount?: number;
  /** Total price */
  totalPrice?: number;
  /** Currency */
  currency?: string;
}

/**
 * TripSummaryCard props
 */
interface TripSummaryCardProps {
  /** Trip data */
  data: TripSummaryData;
  /** Field edit callbacks */
  onEditDestination?: () => void;
  onEditDates?: () => void;
  onEditTravelers?: () => void;
  onEditFlight?: () => void;
  onEditHotel?: () => void;
  /** Size variant */
  size?: "sm" | "md";
  /** Expandable details */
  expandable?: boolean;
  /** Initially expanded */
  defaultExpanded?: boolean;
  /** Show total price */
  showTotal?: boolean;
}

/**
 * Format date for display
 */
function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

/**
 * Calculate nights between dates
 */
function calculateNights(departure: Date | string, returnDate: Date | string): number {
  const d1 = typeof departure === "string" ? new Date(departure) : departure;
  const d2 = typeof returnDate === "string" ? new Date(returnDate) : returnDate;
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Editable field wrapper
 */
function EditableField({
  icon: Icon,
  label,
  value,
  onEdit,
  size,
  highlight = false,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  onEdit?: () => void;
  size: "sm" | "md";
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 group",
        onEdit && "cursor-pointer hover:bg-muted/50 rounded-lg -mx-1 px-1 py-0.5 transition-colors"
      )}
      onClick={onEdit}
    >
      <Icon
        size={size === "sm" ? 14 : 16}
        className={cn("flex-shrink-0", highlight ? "text-primary" : "text-muted-foreground")}
      />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
        <div className={cn("font-medium truncate", size === "sm" ? "text-sm" : "text-base")}>
          {value}
        </div>
      </div>
      {onEdit && (
        <Edit2
          size={12}
          className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        />
      )}
    </div>
  );
}

/**
 * TripSummaryCard Component
 *
 * @example
 * ```tsx
 * <TripSummaryCard
 *   data={{
 *     destination: { city: "Barcelone", country: "Espagne" },
 *     dates: { departure: new Date(), return: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
 *     travelers: { adults: 2, children: 1, infants: 0 },
 *     flight: { airline: "Vueling", price: 230 },
 *     hotel: { name: "Hotel Barcelona", stars: 4, price: 450 },
 *     totalPrice: 680,
 *   }}
 *   onEditDestination={() => openDestinationPicker()}
 *   onEditDates={() => openDatePicker()}
 *   expandable
 * />
 * ```
 */
export function TripSummaryCard({
  data,
  onEditDestination,
  onEditDates,
  onEditTravelers,
  onEditFlight,
  onEditHotel,
  size = "md",
  expandable = false,
  defaultExpanded = true,
  showTotal = true,
}: TripSummaryCardProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(defaultExpanded);

  const {
    destination,
    dates,
    travelers,
    flight,
    hotel,
    activitiesCount,
    totalPrice,
    currency = "€",
  } = data;

  // Calculate nights if dates provided
  const nights =
    dates?.nights ||
    (dates?.departure && dates?.return
      ? calculateNights(dates.departure, dates.return)
      : undefined);

  // Format travelers string
  const travelersString = travelers
    ? [
        travelers.adults > 0 && `${travelers.adults} adulte${travelers.adults > 1 ? "s" : ""}`,
        travelers.children > 0 && `${travelers.children} enfant${travelers.children > 1 ? "s" : ""}`,
        travelers.infants > 0 && `${travelers.infants} bébé${travelers.infants > 1 ? "s" : ""}`,
      ]
        .filter(Boolean)
        .join(", ")
    : undefined;

  return (
    <div className={cn("rounded-lg border bg-card", size === "sm" ? "p-3" : "p-4")}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className={cn("font-semibold text-foreground", size === "sm" ? "text-sm" : "text-base")}>
          {destination ? `Voyage à ${destination.city}` : "Votre voyage"}
        </h4>
        {expandable && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        )}
      </div>

      {/* Main info - always visible */}
      <div className="grid grid-cols-2 gap-3">
        {destination && (
          <EditableField
            icon={MapPin}
            label="Destination"
            value={`${destination.city}, ${destination.country}`}
            onEdit={onEditDestination}
            size={size}
            highlight
          />
        )}

        {dates && (
          <EditableField
            icon={Calendar}
            label="Dates"
            value={
              dates.return
                ? `${formatDate(dates.departure)} - ${formatDate(dates.return)}${nights ? ` (${nights} nuits)` : ""}`
                : formatDate(dates.departure)
            }
            onEdit={onEditDates}
            size={size}
          />
        )}

        {travelers && (
          <EditableField
            icon={Users}
            label="Voyageurs"
            value={travelersString}
            onEdit={onEditTravelers}
            size={size}
          />
        )}
      </div>

      {/* Expanded details */}
      {(!expandable || expanded) && (flight || hotel || activitiesCount) && (
        <div className="mt-3 pt-3 border-t border-border space-y-2">
          {flight && (
            <div
              className={cn(
                "flex items-center justify-between",
                onEditFlight && "cursor-pointer hover:bg-muted/50 rounded -mx-1 px-1 py-0.5"
              )}
              onClick={onEditFlight}
            >
              <div className="flex items-center gap-2">
                <Plane size={14} className="text-blue-500" />
                <span className="text-sm">
                  {flight.airline || "Vol"}{" "}
                  {flight.departureTime && <span className="text-muted-foreground">· {flight.departureTime}</span>}
                </span>
              </div>
              {flight.price && (
                <span className="text-sm font-medium">
                  {flight.price}
                  {currency}
                </span>
              )}
            </div>
          )}

          {hotel && (
            <div
              className={cn(
                "flex items-center justify-between",
                onEditHotel && "cursor-pointer hover:bg-muted/50 rounded -mx-1 px-1 py-0.5"
              )}
              onClick={onEditHotel}
            >
              <div className="flex items-center gap-2">
                <Hotel size={14} className="text-purple-500" />
                <span className="text-sm">
                  {hotel.name || "Hôtel"}{" "}
                  {hotel.stars && (
                    <span className="text-amber-500">{"★".repeat(hotel.stars)}</span>
                  )}
                </span>
              </div>
              {hotel.price && (
                <span className="text-sm font-medium">
                  {hotel.price}
                  {currency}
                </span>
              )}
            </div>
          )}

          {activitiesCount !== undefined && activitiesCount > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass size={14} className="text-green-500" />
                <span className="text-sm">
                  {activitiesCount} activité{activitiesCount > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Total price */}
      {showTotal && totalPrice !== undefined && (
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
          <span className={cn("font-medium", size === "sm" ? "text-sm" : "text-base")}>{t("planner.tripSummary.total")}</span>
          <span className={cn("font-bold text-primary", size === "sm" ? "text-lg" : "text-xl")}>
            {totalPrice}
            {currency}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Compact inline trip summary
 */
export function InlineTripSummary({
  destination,
  dates,
  travelers,
  onEdit,
}: {
  destination?: string;
  dates?: string;
  travelers?: string;
  onEdit?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2 text-sm",
        onEdit && "cursor-pointer hover:bg-muted transition-colors"
      )}
      onClick={onEdit}
    >
      {destination && (
        <span className="flex items-center gap-1">
          <MapPin size={14} className="text-muted-foreground" />
          {destination}
        </span>
      )}
      {dates && (
        <>
          <span className="text-muted-foreground">·</span>
          <span className="flex items-center gap-1">
            <Calendar size={14} className="text-muted-foreground" />
            {dates}
          </span>
        </>
      )}
      {travelers && (
        <>
          <span className="text-muted-foreground">·</span>
          <span className="flex items-center gap-1">
            <Users size={14} className="text-muted-foreground" />
            {travelers}
          </span>
        </>
      )}
      {onEdit && <Edit2 size={14} className="ml-auto text-muted-foreground" />}
    </div>
  );
}

export default TripSummaryCard;
