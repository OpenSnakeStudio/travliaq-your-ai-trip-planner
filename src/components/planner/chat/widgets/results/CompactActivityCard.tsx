/**
 * CompactActivityCard - Compact activity/experience card for chat
 *
 * Displays activity information in a compact format with quick actions.
 * Designed to be embedded in chat messages.
 */

import { cn } from "@/lib/utils";
import {
  Compass,
  Clock,
  Star,
  MapPin,
  Users,
  Calendar,
  ChevronRight,
  Plus,
  Check,
  GitCompare,
  Zap,
  Heart,
} from "lucide-react";
import { ResultBadge, type BadgeType } from "../advice/ResultBadges";

/**
 * Activity category
 */
export type ActivityCategory =
  | "tour"
  | "attraction"
  | "experience"
  | "food"
  | "outdoor"
  | "culture"
  | "entertainment"
  | "wellness";

/**
 * Compact activity data
 */
export interface CompactActivityData {
  id: string;
  /** Activity name */
  name: string;
  /** Category */
  category?: ActivityCategory;
  /** Rating (0-5) */
  rating?: number;
  /** Number of reviews */
  reviewCount?: number;
  /** Location */
  location?: string;
  /** Duration in minutes */
  duration?: number;
  /** Duration display string */
  durationText?: string;
  /** Price */
  price: number;
  /** Original price (if discounted) */
  originalPrice?: number;
  /** Currency */
  currency?: string;
  /** Per person */
  perPerson?: boolean;
  /** Available times */
  availableTimes?: string[];
  /** Next available date */
  nextAvailable?: string;
  /** Image URL */
  image?: string;
  /** Badges */
  badges?: BadgeType[];
  /** Is selected */
  selected?: boolean;
  /** Is favorite */
  favorite?: boolean;
  /** Group size */
  maxGroupSize?: number;
  /** Instant confirmation */
  instantConfirmation?: boolean;
  /** Free cancellation */
  freeCancellation?: boolean;
}

/**
 * CompactActivityCard props
 */
interface CompactActivityCardProps {
  activity: CompactActivityData;
  /** Select/add to trip */
  onSelect?: () => void;
  /** View details */
  onViewDetails?: () => void;
  /** Compare */
  onCompare?: () => void;
  /** Toggle favorite */
  onToggleFavorite?: () => void;
  /** Size variant */
  size?: "sm" | "md";
  /** Inline compact mode */
  inline?: boolean;
}

/**
 * Format duration
 */
function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h${mins}`;
}

/**
 * Inline activity display
 */
function InlineActivityDisplay({
  activity,
  onSelect,
  onViewDetails,
}: {
  activity: CompactActivityData;
  onSelect?: () => void;
  onViewDetails?: () => void;
}) {
  const { name, rating, price, currency = "€", duration, durationText, selected } = activity;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border p-2 transition-all",
        selected
          ? "bg-primary/5 border-primary/30"
          : "bg-background border-border hover:border-primary/30"
      )}
    >
      <Compass size={16} className="text-green-500 flex-shrink-0" />

      <div className="flex-1 min-w-0">
        <span className="font-medium text-sm truncate block">{name}</span>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {rating && (
            <span className="flex items-center gap-0.5">
              <Star size={10} className="fill-amber-400 text-amber-400" />
              {rating.toFixed(1)}
            </span>
          )}
          {(duration || durationText) && (
            <span className="flex items-center gap-0.5">
              <Clock size={10} />
              {durationText || formatDuration(duration!)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="font-bold text-sm">
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
 * CompactActivityCard Component
 *
 * @example
 * ```tsx
 * <CompactActivityCard
 *   activity={{
 *     id: "activity-1",
 *     name: "Sagrada Familia Skip-the-Line Tour",
 *     category: "tour",
 *     rating: 4.8,
 *     reviewCount: 2543,
 *     location: "Barcelona",
 *     duration: 90,
 *     price: 45,
 *     originalPrice: 55,
 *     image: "/sagrada.jpg",
 *     badges: ["popular", "bestDeal"],
 *     instantConfirmation: true,
 *     freeCancellation: true,
 *   }}
 *   onSelect={() => addActivityToTrip(activity)}
 * />
 * ```
 */
export function CompactActivityCard({
  activity,
  onSelect,
  onViewDetails,
  onCompare,
  onToggleFavorite,
  size = "md",
  inline = false,
}: CompactActivityCardProps) {
  const {
    name,
    rating,
    reviewCount,
    location,
    duration,
    durationText,
    price,
    originalPrice,
    currency = "€",
    perPerson = true,
    availableTimes,
    nextAvailable,
    image,
    badges,
    selected,
    favorite,
    instantConfirmation,
    freeCancellation,
  } = activity;

  if (inline) {
    return (
      <InlineActivityDisplay
        activity={activity}
        onSelect={onSelect}
        onViewDetails={onViewDetails}
      />
    );
  }

  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div
      className={cn(
        "rounded-lg border overflow-hidden transition-all",
        selected
          ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20"
          : "bg-card border-border hover:border-primary/30"
      )}
    >
      {/* Image section */}
      {image && (
        <div className={cn("relative", size === "sm" ? "h-24" : "h-32")}>
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
          {/* Badges overlay */}
          {badges && badges.length > 0 && (
            <div className="absolute top-2 left-2 flex gap-1">
              {badges.slice(0, 2).map((badge) => (
                <ResultBadge key={badge} type={badge} size="xs" />
              ))}
            </div>
          )}
          {/* Discount badge */}
          {hasDiscount && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
              -{discountPercent}%
            </div>
          )}
          {/* Favorite button */}
          {onToggleFavorite && (
            <button
              type="button"
              onClick={onToggleFavorite}
              className={cn(
                "absolute bottom-2 right-2 rounded-full p-1.5 transition-all",
                favorite
                  ? "bg-red-500 text-white"
                  : "bg-white/80 text-muted-foreground hover:text-red-500"
              )}
            >
              <Heart size={14} className={favorite ? "fill-current" : ""} />
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <div className={cn(size === "sm" ? "p-2" : "p-3")}>
        {/* Title and rating */}
        <div className="flex items-start justify-between gap-2">
          <h4
            className={cn(
              "font-semibold text-foreground line-clamp-2",
              size === "sm" ? "text-sm" : "text-base"
            )}
          >
            {name}
          </h4>
          {rating && (
            <div className="flex-shrink-0 flex items-center gap-1 text-sm">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span className="font-medium">{rating.toFixed(1)}</span>
              {reviewCount && (
                <span className="text-xs text-muted-foreground">
                  ({reviewCount > 1000 ? `${(reviewCount / 1000).toFixed(1)}k` : reviewCount})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Location & Duration */}
        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
          {location && (
            <span className="flex items-center gap-0.5">
              <MapPin size={10} />
              {location}
            </span>
          )}
          {(duration || durationText) && (
            <span className="flex items-center gap-0.5">
              <Clock size={10} />
              {durationText || formatDuration(duration!)}
            </span>
          )}
        </div>

        {/* Available times */}
        {availableTimes && availableTimes.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            <Calendar size={10} className="text-muted-foreground" />
            <div className="flex gap-1">
              {availableTimes.slice(0, 3).map((time) => (
                <span
                  key={time}
                  className="text-[10px] bg-muted px-1.5 py-0.5 rounded"
                >
                  {time}
                </span>
              ))}
              {availableTimes.length > 3 && (
                <span className="text-[10px] text-muted-foreground">
                  +{availableTimes.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Feature badges */}
        {(instantConfirmation || freeCancellation) && (
          <div className="flex items-center gap-2 mt-2">
            {instantConfirmation && (
              <span className="flex items-center gap-0.5 text-[10px] text-green-600">
                <Zap size={10} />
                Confirmation instantanée
              </span>
            )}
            {freeCancellation && (
              <span className="text-[10px] text-green-600">
                Annulation gratuite
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className={cn(
          "flex items-center justify-between border-t border-border bg-muted/30",
          size === "sm" ? "px-2 py-1.5" : "px-3 py-2"
        )}
      >
        {/* Next available */}
        <div className="text-xs text-muted-foreground">
          {nextAvailable && `Dispo: ${nextAvailable}`}
        </div>

        {/* Price and actions */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            {hasDiscount && (
              <div className="text-xs text-muted-foreground line-through">
                {originalPrice}
                {currency}
              </div>
            )}
            <div className={cn("font-bold text-foreground", size === "sm" ? "text-base" : "text-lg")}>
              {price}
              {currency}
            </div>
            {perPerson && (
              <div className="text-[10px] text-muted-foreground">/personne</div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {onCompare && (
              <button
                type="button"
                onClick={onCompare}
                className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Comparer"
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

export default CompactActivityCard;
