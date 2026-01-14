/**
 * HotelComparisonCard - Specialized hotel comparison
 *
 * Side-by-side comparison of 2-4 hotels with hotel-specific
 * metrics like amenities, location, rating, and room types.
 */

import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  Hotel,
  MapPin,
  Star,
  Check,
  X,
  Wifi,
  Car,
  Utensils,
  Waves,
  Dumbbell,
  Wind,
  Coffee,
  Bath,
  Trophy,
  Heart,
  ThumbsUp,
} from "lucide-react";

/**
 * Hotel amenity
 */
export interface HotelAmenityComparison {
  id: string;
  label: string;
  icon?: string;
}

/**
 * Hotel data for comparison
 */
export interface HotelComparison {
  id: string;
  name: string;
  image?: string;
  images?: string[];
  /** Star rating (1-5) */
  stars: number;
  /** Guest rating (0-10) */
  rating?: number;
  /** Number of reviews */
  reviewCount?: number;
  /** Location/neighborhood */
  location?: string;
  /** Distance from center or POI */
  distance?: string;
  /** Price per night */
  pricePerNight: number;
  /** Total price for stay */
  totalPrice?: number;
  /** Number of nights */
  nights?: number;
  /** Currency */
  currency?: string;
  /** Room type */
  roomType?: string;
  /** Amenities */
  amenities?: string[];
  /** Breakfast included */
  breakfastIncluded?: boolean;
  /** Free cancellation */
  freeCancellation?: boolean;
  /** Pay at property */
  payAtProperty?: boolean;
  /** Best for category */
  bestFor?: "price" | "rating" | "location" | "value";
  /** Is recommended */
  isRecommended?: boolean;
  /** Highlight tags */
  tags?: string[];
}

/**
 * HotelComparisonCard props
 */
interface HotelComparisonCardProps {
  /** Hotels to compare (2-4) */
  hotels: HotelComparison[];
  /** Select hotel callback */
  onSelect?: (hotelId: string) => void;
  /** Size variant */
  size?: "sm" | "md";
  /** Show detailed comparison */
  showDetails?: boolean;
  /** Currency */
  currency?: string;
  /** Number of nights for price display */
  nights?: number;
}

/**
 * Amenity icon mapping
 */
const AMENITY_ICONS: Record<string, React.ElementType> = {
  wifi: Wifi,
  parking: Car,
  restaurant: Utensils,
  pool: Waves,
  gym: Dumbbell,
  fitness: Dumbbell,
  spa: Bath,
  ac: Wind,
  aircon: Wind,
  breakfast: Coffee,
};

/**
 * Get icon for amenity
 */
function getAmenityIcon(amenity: string): React.ElementType | null {
  const lower = amenity.toLowerCase();
  for (const [key, icon] of Object.entries(AMENITY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return null;
}

/**
 * Best badge config (without labels - those come from i18n)
 */
const BEST_FOR_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  price: { icon: Trophy, color: "text-green-600 bg-green-100 dark:bg-green-900/40" },
  rating: { icon: Star, color: "text-amber-600 bg-amber-100 dark:bg-amber-900/40" },
  location: { icon: MapPin, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/40" },
  value: { icon: Heart, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/40" },
};

/**
 * Star rating display
 */
function StarRating({ stars, size = 14 }: { stars: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            i < stars ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}

/**
 * HotelComparisonCard Component
 *
 * @example
 * ```tsx
 * <HotelComparisonCard
 *   hotels={[
 *     {
 *       id: "1",
 *       name: "Hotel Barcelona",
 *       stars: 4,
 *       rating: 8.5,
 *       pricePerNight: 120,
 *       amenities: ["wifi", "pool", "breakfast"],
 *       bestFor: "value",
 *     },
 *     {
 *       id: "2",
 *       name: "Luxury Resort",
 *       stars: 5,
 *       rating: 9.2,
 *       pricePerNight: 250,
 *       amenities: ["wifi", "pool", "spa", "gym"],
 *       bestFor: "rating",
 *     },
 *   ]}
 *   onSelect={(id) => selectHotel(id)}
 *   nights={7}
 * />
 * ```
 */
export function HotelComparisonCard({
  hotels,
  onSelect,
  size = "md",
  showDetails = true,
  currency = "€",
  nights,
}: HotelComparisonCardProps) {
  const { t } = useTranslation();
  
  // Find best values
  const cheapest = Math.min(...hotels.map((h) => h.pricePerNight));
  const bestRated = Math.max(...hotels.filter((h) => h.rating).map((h) => h.rating!));
  const mostStars = Math.max(...hotels.map((h) => h.stars));

  // Collect all unique amenities for comparison
  const allAmenities = [...new Set(hotels.flatMap((h) => h.amenities || []))];

  const itemWidth = `${100 / hotels.length}%`;
  
  // i18n labels for best badges
  const BEST_FOR_LABELS: Record<string, string> = {
    price: t("planner.comparison.bestPrice"),
    rating: t("planner.comparison.bestRated"),
    location: t("planner.comparison.bestLocation"),
    value: t("planner.comparison.bestValue"),
  };

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Hotel cards row */}
      <div className="flex">
        {hotels.map((hotel, index) => {
          const isCheapest = hotel.pricePerNight === cheapest;
          const isBestRated = hotel.rating === bestRated;
          const hasMostStars = hotel.stars === mostStars;

          return (
            <div
              key={hotel.id}
              className={cn(
                "flex-1 p-4",
                index < hotels.length - 1 && "border-r border-border"
              )}
              style={{ width: itemWidth }}
            >
              {/* Best for badge */}
              {hotel.bestFor && (
                <div className="mb-3">
                  {(() => {
                    const config = BEST_FOR_CONFIG[hotel.bestFor];
                    const Icon = config.icon;
                    return (
                      <div
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                          config.color
                        )}
                      >
                        <Icon size={12} />
                        {BEST_FOR_LABELS[hotel.bestFor]}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Recommended badge */}
              {hotel.isRecommended && !hotel.bestFor && (
                <div className="mb-3">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    <ThumbsUp size={12} />
                    {t("planner.comparison.recommended")}
                  </div>
                </div>
              )}

              {/* Image */}
              {hotel.image && (
                <div className="aspect-[4/3] rounded-lg overflow-hidden mb-3 bg-muted">
                  <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Hotel info */}
              <div>
                {/* Stars */}
                <StarRating stars={hotel.stars} size={12} />

                {/* Name */}
                <h4
                  className={cn(
                    "font-semibold mt-1 line-clamp-2",
                    size === "sm" ? "text-sm" : "text-base"
                  )}
                >
                  {hotel.name}
                </h4>

                {/* Location */}
                {hotel.location && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <MapPin size={12} />
                    <span className="truncate">{hotel.location}</span>
                  </div>
                )}

                {/* Distance */}
                {hotel.distance && (
                  <div className="text-xs text-muted-foreground">{hotel.distance}</div>
                )}

                {/* Rating */}
                {hotel.rating !== undefined && (
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded font-bold text-sm",
                        hotel.rating >= 9
                          ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                          : hotel.rating >= 8
                          ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                          : "bg-muted text-foreground"
                      )}
                    >
                      {hotel.rating.toFixed(1)}
                    </span>
                    {hotel.reviewCount && (
                      <span className="text-xs text-muted-foreground">
                        {t("planner.comparison.reviews", { count: hotel.reviewCount })}
                      </span>
                    )}
                  </div>
                )}

                {/* Room type */}
                {hotel.roomType && (
                  <div className="mt-2 text-xs text-muted-foreground">{hotel.roomType}</div>
                )}

                {/* Quick tags */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {hotel.breakfastIncluded && (
                    <span className="px-1.5 py-0.5 rounded text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                      {t("planner.comparison.breakfastIncluded")}
                    </span>
                  )}
                  {hotel.freeCancellation && (
                    <span className="px-1.5 py-0.5 rounded text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                      {t("planner.comparison.freeCancellation")}
                    </span>
                  )}
                </div>

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
                      {hotel.pricePerNight}
                      {currency}
                    </span>
                    <span className="text-xs text-muted-foreground">/{t("planner.comparison.night")}</span>
                  </div>

                  {/* Total price */}
                  {(hotel.totalPrice || (nights && hotel.pricePerNight)) && (
                    <div className="text-sm text-muted-foreground">
                      {t("common.total")}: {hotel.totalPrice || hotel.pricePerNight * nights!}
                      {currency}
                      {nights && ` (${t("planner.comparison.nights", { count: nights })})`}
                    </div>
                  )}

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {isCheapest && (
                      <span className="px-1.5 py-0.5 rounded text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                        {t("planner.comparison.cheapest")}
                      </span>
                    )}
                    {isBestRated && (
                      <span className="px-1.5 py-0.5 rounded text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                        {t("planner.comparison.bestRated")}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Select button */}
              {onSelect && (
                <button
                  type="button"
                  onClick={() => onSelect(hotel.id)}
                  className={cn(
                    "w-full mt-4 py-2 rounded-lg font-medium transition-all",
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    size === "sm" ? "text-xs" : "text-sm"
                  )}
                >
                  {t("planner.comparison.book")}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Amenities comparison */}
      {showDetails && allAmenities.length > 0 && (
        <div className="border-t">
          <div className="px-3 py-2 bg-muted/30 text-sm font-medium text-muted-foreground">
            {t("planner.comparison.amenities")}
          </div>
          <div className="divide-y divide-border">
            {allAmenities.slice(0, 6).map((amenity) => {
              const Icon = getAmenityIcon(amenity);
              return (
                <div key={amenity} className="flex">
                  <div className="w-1/4 min-w-[100px] flex items-center gap-2 px-3 py-2 bg-muted/20 text-sm text-muted-foreground">
                    {Icon && <Icon size={14} />}
                    <span className="capitalize truncate">{amenity}</span>
                  </div>
                  <div className="flex-1 flex">
                    {hotels.map((hotel, index) => {
                      const hasAmenity = hotel.amenities?.includes(amenity);
                      return (
                        <div
                          key={hotel.id}
                          className={cn(
                            "flex-1 flex items-center justify-center py-2",
                            index < hotels.length - 1 && "border-r border-border"
                          )}
                        >
                          {hasAmenity ? (
                            <Check size={16} className="text-green-500" />
                          ) : (
                            <X size={16} className="text-muted-foreground/30" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Additional comparison rows */}
      {showDetails && (
        <div className="border-t divide-y divide-border">
          {/* Cancellation policy */}
          <div className="flex">
            <div className="w-1/4 min-w-[100px] flex items-center px-3 py-2 bg-muted/20 text-sm text-muted-foreground">
              {t("planner.comparison.cancellation")}
            </div>
            <div className="flex-1 flex">
              {hotels.map((hotel, index) => (
                <div
                  key={hotel.id}
                  className={cn(
                    "flex-1 flex items-center justify-center py-2 text-sm",
                    index < hotels.length - 1 && "border-r border-border"
                  )}
                >
                  {hotel.freeCancellation ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <Check size={14} />
                      {t("planner.comparison.free")}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">{t("planner.comparison.nonRefundable")}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div className="flex">
            <div className="w-1/4 min-w-[100px] flex items-center px-3 py-2 bg-muted/20 text-sm text-muted-foreground">
              {t("planner.comparison.payment")}
            </div>
            <div className="flex-1 flex">
              {hotels.map((hotel, index) => (
                <div
                  key={hotel.id}
                  className={cn(
                    "flex-1 flex items-center justify-center py-2 text-sm text-center",
                    index < hotels.length - 1 && "border-r border-border"
                  )}
                >
                  {hotel.payAtProperty ? (
                    <span className="text-green-600">{t("planner.comparison.payOnSite")}</span>
                  ) : (
                    <span className="text-muted-foreground">{t("planner.comparison.payNow")}</span>
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

export default HotelComparisonCard;
