/**
 * Activity Card Component
 *
 * Enhanced card component for displaying activities in different contexts:
 * - "search" mode: Display search results with "Add" button
 * - "planned" mode: Display planned activities with "View Details" and "Remove" buttons
 */

import { Star, Clock, MapPin, Plus, Trash2, Eye, Users, Award, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ViatorActivity, ActivityEntry } from "@/types/activity";

export interface ActivityCardProps {
  activity: ViatorActivity | ActivityEntry;
  mode: "search" | "planned";
  onAdd?: () => void;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
  compact?: boolean;
}

function isViatorActivity(activity: ViatorActivity | ActivityEntry): activity is ViatorActivity {
  return "booking_url" in activity && !("destinationId" in activity);
}

function isActivityEntry(activity: ViatorActivity | ActivityEntry): activity is ActivityEntry {
  return "destinationId" in activity;
}

function getDiscountPercentage(activity: ViatorActivity | ActivityEntry): number | null {
  const { from_price, original_price } = activity.pricing;
  if (original_price && original_price > from_price) {
    return Math.round(((original_price - from_price) / original_price) * 100);
  }
  return null;
}

function isPopular(activity: ViatorActivity | ActivityEntry): boolean {
  return activity.rating.count >= 500;
}

function isTopRated(activity: ViatorActivity | ActivityEntry): boolean {
  return activity.rating.average >= 4.8;
}

function formatDuration(activity: ViatorActivity | ActivityEntry): string {
  if (activity.duration) {
    return activity.duration.formatted || `${activity.duration.minutes}min`;
  }
  return "Durée non spécifiée";
}

function getImageUrl(activity: ViatorActivity | ActivityEntry, size: "small" | "medium" | "large" = "medium"): string | null {
  const images = activity.images;
  if (!images || images.length === 0) return null;

  const primaryImage = images[0];

  if (primaryImage.variants && primaryImage.variants[size]) {
    return primaryImage.variants[size];
  }

  return primaryImage.url || null;
}

function renderStars(rating: number) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3 w-3",
            i < fullStars
              ? "fill-amber-400 text-amber-400"
              : i === fullStars && hasHalfStar
              ? "fill-amber-400/50 text-amber-400"
              : "fill-muted text-muted"
          )}
        />
      ))}
    </div>
  );
}

export const ActivityCard = ({ activity, mode, onAdd, onClick, onRemove, className, compact = false }: ActivityCardProps) => {
  const imageUrl = getImageUrl(activity, compact ? "small" : "medium");
  const discountPercentage = getDiscountPercentage(activity);
  const popular = isPopular(activity);
  const topRated = isTopRated(activity);

  const title = activity.title;
  const rating = activity.rating;
  const pricing = activity.pricing;
  const categories = activity.categories || [];

  if (compact) {
    return (
      <div
        className={cn(
          "group relative bg-card rounded-lg border border-border overflow-hidden transition-all hover:shadow-sm flex",
          onClick && "cursor-pointer",
          className
        )}
        onClick={onClick}
      >
        {/* Small Image */}
        <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin className="h-6 w-6 text-muted-foreground/20" />
            </div>
          )}
          {discountPercentage && (
            <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-2 min-w-0 flex flex-col justify-between">
          <h4 className="font-medium text-xs text-foreground line-clamp-2 leading-tight">
            {title}
          </h4>
          <div className="flex items-center justify-between gap-2 mt-1">
            <div className="flex items-center gap-1">
              {rating && (
                <>
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="text-[10px] text-muted-foreground">{rating.average.toFixed(1)}</span>
                </>
              )}
            </div>
            {pricing && (
              <span className="text-xs font-bold text-primary">
                {pricing.from_price}€
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative bg-card rounded-xl border border-border overflow-hidden transition-all hover:shadow-md",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="h-12 w-12 text-muted-foreground/20" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discountPercentage && (
            <span className="px-2 py-0.5 bg-destructive text-destructive-foreground text-xs font-bold rounded-md flex items-center gap-1">
              <Percent className="h-3 w-3" />
              -{discountPercentage}%
            </span>
          )}
          {popular && (
            <span className="px-2 py-0.5 bg-accent text-accent-foreground text-xs font-medium rounded-md flex items-center gap-1">
              <Users className="h-3 w-3" />
              Populaire
            </span>
          )}
          {topRated && !popular && (
            <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-md flex items-center gap-1">
              <Award className="h-3 w-3" />
              Top
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Title */}
        <h4 className="font-semibold text-sm text-foreground line-clamp-2 leading-snug min-h-[2.5rem]">
          {title}
        </h4>

        {/* Rating & Duration */}
        <div className="flex items-center justify-between">
          {rating && (
            <div className="flex items-center gap-1.5">
              {renderStars(rating.average)}
              <span className="text-xs text-muted-foreground">
                ({rating.count.toLocaleString()})
              </span>
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatDuration(activity)}</span>
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {categories.slice(0, 2).map((category, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] font-medium rounded-full"
              >
                {category}
              </span>
            ))}
            {categories.length > 2 && (
              <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] font-medium rounded-full">
                +{categories.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Pricing & Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex flex-col">
            {pricing && (
              <>
                {pricing.original_price && pricing.original_price > pricing.from_price && (
                  <span className="text-xs text-muted-foreground line-through">
                    {pricing.original_price}€
                  </span>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-primary">
                    {pricing.from_price}€
                  </span>
                  <span className="text-xs text-muted-foreground">/ pers</span>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {mode === "search" && onAdd && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd();
                }}
                className="px-3 py-1.5 bg-primary text-primary-foreground hover:opacity-90 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Ajouter
              </button>
            )}

            {mode === "planned" && (
              <>
                {onClick && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClick();
                    }}
                    className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Détails
                  </button>
                )}
                {onRemove && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove();
                    }}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                    title="Supprimer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
