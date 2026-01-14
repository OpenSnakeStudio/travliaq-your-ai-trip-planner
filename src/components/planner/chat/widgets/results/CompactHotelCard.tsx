/**
 * CompactHotelCard - Compact hotel result card for chat
 *
 * Displays hotel information in a compact format with quick actions.
 * Designed to be embedded in chat messages.
 */

import { cn } from "@/lib/utils";
import {
  Hotel,
  Star,
  MapPin,
  Wifi,
  Car,
  Coffee,
  Waves,
  ChevronRight,
  Plus,
  Check,
  GitCompare,
  Users,
} from "lucide-react";
import { ResultBadge, type BadgeType } from "../advice/ResultBadges";
import { useTranslation } from "react-i18next";

/**
 * Hotel amenity type
 */
export type HotelAmenity = "wifi" | "parking" | "breakfast" | "pool" | "gym" | "spa" | "ac" | "restaurant";

/**
 * Compact hotel data
 */
export interface CompactHotelData {
  id: string;
  /** Hotel name */
  name: string;
  /** Star rating (1-5) */
  stars?: number;
  /** User rating (0-10 or 0-5) */
  rating?: number;
  /** Number of reviews */
  reviewCount?: number;
  /** Location/neighborhood */
  location?: string;
  /** Distance from center or POI */
  distance?: string;
  /** Price per night */
  pricePerNight: number;
  /** Total price (if showing total) */
  totalPrice?: number;
  /** Currency */
  currency?: string;
  /** Number of nights */
  nights?: number;
  /** Room type */
  roomType?: string;
  /** Main amenities */
  amenities?: HotelAmenity[];
  /** Image URL */
  image?: string;
  /** Badges */
  badges?: BadgeType[];
  /** Is selected */
  selected?: boolean;
  /** Capacity */
  capacity?: number;
}

/**
 * CompactHotelCard props
 */
interface CompactHotelCardProps {
  hotel: CompactHotelData;
  /** Select/add to trip */
  onSelect?: () => void;
  /** View details */
  onViewDetails?: () => void;
  /** Compare */
  onCompare?: () => void;
  /** Size variant */
  size?: "sm" | "md";
  /** Show total price instead of per night */
  showTotalPrice?: boolean;
  /** Inline compact mode */
  inline?: boolean;
}

/**
 * Get amenity icon
 */
function AmenityIcon({ amenity, size = 12 }: { amenity: HotelAmenity; size?: number }) {
  switch (amenity) {
    case "wifi":
      return <Wifi size={size} />;
    case "parking":
      return <Car size={size} />;
    case "breakfast":
      return <Coffee size={size} />;
    case "pool":
      return <Waves size={size} />;
    default:
      return null;
  }
}

/**
 * Star rating display
 */
function StarRating({ stars, size = "sm" }: { stars: number; size?: "sm" | "md" }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: stars }).map((_, i) => (
        <Star
          key={i}
          size={size === "sm" ? 10 : 12}
          className="fill-amber-400 text-amber-400"
        />
      ))}
    </div>
  );
}

/**
 * Inline hotel display
 */
function InlineHotelDisplay({
  hotel,
  onSelect,
  onViewDetails,
}: {
  hotel: CompactHotelData;
  onSelect?: () => void;
  onViewDetails?: () => void;
}) {
  const { t } = useTranslation();
  const { name, stars, rating, pricePerNight, currency = "€", location, selected } = hotel;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border p-2 transition-all",
        selected
          ? "bg-primary/5 border-primary/30"
          : "bg-background border-border hover:border-primary/30"
      )}
    >
      <Hotel size={16} className="text-purple-500 flex-shrink-0" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{name}</span>
          {stars && <StarRating stars={stars} size="sm" />}
        </div>
        {location && (
          <div className="text-xs text-muted-foreground truncate">{location}</div>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {rating && (
          <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded font-medium">
            {rating.toFixed(1)}
          </span>
        )}
        <div className="text-right">
          <span className="font-bold text-sm">
            {pricePerNight}
            {currency}
          </span>
          <span className="text-[10px] text-muted-foreground">{t("planner.hotel.perNight")}</span>
        </div>
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
 * CompactHotelCard Component
 */
export function CompactHotelCard({
  hotel,
  onSelect,
  onViewDetails,
  onCompare,
  size = "md",
  showTotalPrice = false,
  inline = false,
}: CompactHotelCardProps) {
  const { t } = useTranslation();
  const {
    name,
    stars,
    rating,
    reviewCount,
    location,
    distance,
    pricePerNight,
    totalPrice,
    currency = "€",
    nights,
    roomType,
    amenities,
    image,
    badges,
    selected,
    capacity,
  } = hotel;

  if (inline) {
    return (
      <InlineHotelDisplay
        hotel={hotel}
        onSelect={onSelect}
        onViewDetails={onViewDetails}
      />
    );
  }

  const displayPrice = showTotalPrice && totalPrice ? totalPrice : pricePerNight;

  const getNightsLabel = (nights: number) => {
    if (nights === 1) return `1 ${t("planner.hotel.night")}`;
    return `${nights} ${t("planner.hotel.nights")}`;
  };

  return (
    <div
      className={cn(
        "rounded-lg border overflow-hidden transition-all",
        selected
          ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20"
          : "bg-card border-border hover:border-primary/30"
      )}
    >
      <div className="flex">
        {/* Image */}
        {image && (
          <div className={cn("flex-shrink-0 relative", size === "sm" ? "w-20" : "w-28")}>
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
            />
            {badges && badges.length > 0 && (
              <div className="absolute top-1 left-1">
                <ResultBadge type={badges[0]} size="xs" />
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className={cn("flex-1 min-w-0", size === "sm" ? "p-2" : "p-3")}>
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4
                  className={cn(
                    "font-semibold text-foreground truncate",
                    size === "sm" ? "text-sm" : "text-base"
                  )}
                >
                  {name}
                </h4>
                {stars && <StarRating stars={stars} size={size} />}
              </div>

              {/* Location */}
              {(location || distance) && (
                <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                  <MapPin size={10} />
                  <span className="truncate">
                    {location}
                    {distance && ` · ${distance}`}
                  </span>
                </div>
              )}
            </div>

            {/* Rating */}
            {rating && (
              <div className="flex-shrink-0 text-right">
                <div className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded">
                  <span className="font-bold text-sm">{rating.toFixed(1)}</span>
                </div>
                {reviewCount && (
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {reviewCount.toLocaleString()} {t("planner.common.reviews")}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Room type & capacity */}
          {(roomType || capacity) && (
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              {roomType && <span>{roomType}</span>}
              {capacity && (
                <span className="flex items-center gap-0.5">
                  <Users size={10} />
                  {capacity}
                </span>
              )}
            </div>
          )}

          {/* Amenities */}
          {amenities && amenities.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              {amenities.slice(0, 4).map((amenity) => (
                <div
                  key={amenity}
                  className="p-1 rounded bg-muted text-muted-foreground"
                  title={amenity}
                >
                  <AmenityIcon amenity={amenity} size={12} />
                </div>
              ))}
              {amenities.length > 4 && (
                <span className="text-xs text-muted-foreground">
                  +{amenities.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        className={cn(
          "flex items-center justify-between border-t border-border bg-muted/30",
          size === "sm" ? "px-2 py-1.5" : "px-3 py-2"
        )}
      >
        {/* Nights info */}
        <div className="text-xs text-muted-foreground">
          {nights && getNightsLabel(nights)}
        </div>

        {/* Price and actions */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className={cn("font-bold text-foreground", size === "sm" ? "text-base" : "text-lg")}>
              {displayPrice}
              {currency}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {showTotalPrice ? t("planner.hotel.total") : t("planner.hotel.perNight")}
            </div>
          </div>

          {/* Actions */}
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

export default CompactHotelCard;
