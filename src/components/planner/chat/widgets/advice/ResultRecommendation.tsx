/**
 * ResultRecommendation - Recommendation card with explanation
 *
 * Shows why a particular result is recommended to the user,
 * with personalized reasons and match indicators.
 */

import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Check,
  MapPin,
  DollarSign,
  Clock,
  Star,
  Users,
  Plane,
  Hotel,
  Activity,
  ChevronRight,
  ThumbsUp,
} from "lucide-react";

/**
 * Recommendation reason
 */
export interface RecommendationReason {
  id: string;
  text: string;
  icon?: "price" | "location" | "time" | "rating" | "family" | "popular";
}

/**
 * Recommendation data
 */
export interface RecommendationData {
  /** Item type */
  type: "flight" | "hotel" | "activity";
  /** Item title/name */
  title: string;
  /** Match score (0-100) */
  matchScore?: number;
  /** Why it's recommended */
  reasons: RecommendationReason[];
  /** Main recommendation text */
  summary: string;
  /** Price if applicable */
  price?: {
    amount: number;
    currency: string;
    perPerson?: boolean;
  };
  /** Rating if applicable */
  rating?: number;
  /** Image URL */
  image?: string;
}

/**
 * ResultRecommendation props
 */
interface ResultRecommendationProps {
  data: RecommendationData;
  /** Primary action */
  onSelect?: () => void;
  /** View details action */
  onViewDetails?: () => void;
  /** Size variant */
  size?: "sm" | "md";
  /** Show match score */
  showMatchScore?: boolean;
  /** Compact mode */
  compact?: boolean;
}

/**
 * Get icon for reason
 */
function ReasonIcon({ type, size = 14 }: { type: RecommendationReason["icon"]; size?: number }) {
  switch (type) {
    case "price":
      return <DollarSign size={size} className="text-green-600" />;
    case "location":
      return <MapPin size={size} className="text-blue-600" />;
    case "time":
      return <Clock size={size} className="text-purple-600" />;
    case "rating":
      return <Star size={size} className="text-amber-500" />;
    case "family":
      return <Users size={size} className="text-pink-600" />;
    case "popular":
      return <ThumbsUp size={size} className="text-indigo-600" />;
    default:
      return <Check size={size} className="text-primary" />;
  }
}

/**
 * Get type icon
 */
function TypeIcon({ type, size = 16 }: { type: RecommendationData["type"]; size?: number }) {
  switch (type) {
    case "flight":
      return <Plane size={size} />;
    case "hotel":
      return <Hotel size={size} />;
    case "activity":
      return <Activity size={size} />;
    default:
      return <Sparkles size={size} />;
  }
}

/**
 * Match score indicator
 */
function MatchScore({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 90) return "text-green-600 bg-green-100 dark:bg-green-900/40";
    if (score >= 70) return "text-blue-600 bg-blue-100 dark:bg-blue-900/40";
    if (score >= 50) return "text-amber-600 bg-amber-100 dark:bg-amber-900/40";
    return "text-slate-600 bg-slate-100 dark:bg-slate-800";
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        getColor()
      )}
    >
      <span>{score}%</span>
      <span className="text-[10px] opacity-70">match</span>
    </div>
  );
}

/**
 * ResultRecommendation Component
 *
 * @example
 * ```tsx
 * <ResultRecommendation
 *   data={{
 *     type: "hotel",
 *     title: "Hôtel Barcelona Center",
 *     matchScore: 92,
 *     summary: "Parfait pour votre séjour en famille",
 *     reasons: [
 *       { id: "1", text: "Proche des attractions que vous voulez visiter", icon: "location" },
 *       { id: "2", text: "Excellent rapport qualité-prix", icon: "price" },
 *       { id: "3", text: "Piscine adaptée aux enfants", icon: "family" },
 *     ],
 *     price: { amount: 156, currency: "€" },
 *     rating: 4.6,
 *   }}
 *   onSelect={() => selectHotel(hotel)}
 * />
 * ```
 */
export function ResultRecommendation({
  data,
  onSelect,
  onViewDetails,
  size = "md",
  showMatchScore = true,
  compact = false,
}: ResultRecommendationProps) {
  const { t } = useTranslation();
  const { type, title, matchScore, reasons, summary, price, rating, image } = data;

  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
      <div className="flex-shrink-0 rounded-full bg-primary/10 p-2 text-primary">
          <Sparkles size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-primary">{t("planner.recommendation.recommendedForYou")}</span>
            {matchScore && showMatchScore && <MatchScore score={matchScore} />}
          </div>
          <p className="text-sm font-medium text-foreground truncate">{title}</p>
        </div>
        {onSelect && (
          <button
            type="button"
            onClick={onSelect}
            className="flex-shrink-0 text-primary hover:text-primary/80"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden",
        size === "sm" ? "p-3" : "p-4"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 rounded-full bg-primary/10 p-1.5 text-primary">
            <Sparkles size={14} />
          </div>
          <span className="text-xs font-medium text-primary uppercase tracking-wide">
            {t("planner.recommendation.recommendedForYou")}
          </span>
        </div>
        {matchScore !== undefined && showMatchScore && <MatchScore score={matchScore} />}
      </div>

      {/* Content */}
      <div className="mt-3 flex gap-3">
        {/* Image */}
        {image && (
          <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Title with type icon */}
          <div className="flex items-center gap-2">
            <TypeIcon type={type} size={14} />
            <h4
              className={cn(
                "font-semibold text-foreground truncate",
                size === "sm" ? "text-sm" : "text-base"
              )}
            >
              {title}
            </h4>
          </div>

          {/* Price and rating */}
          {(price || rating) && (
            <div className="flex items-center gap-3 mt-1">
              {price && (
                <span className="text-sm font-medium text-foreground">
                  {price.amount}{price.currency}
                  {price.perPerson && (
                    <span className="text-xs text-muted-foreground">/pers.</span>
                  )}
                </span>
              )}
              {rating && (
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-amber-500 fill-amber-500" />
                  <span className="text-sm">{rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          )}

          {/* Summary */}
          <p
            className={cn(
              "mt-2 text-muted-foreground",
              size === "sm" ? "text-xs" : "text-sm"
            )}
          >
            {summary}
          </p>
        </div>
      </div>

      {/* Reasons */}
      {reasons.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {reasons.slice(0, 3).map((reason) => (
            <div key={reason.id} className="flex items-center gap-2">
              <ReasonIcon type={reason.icon} size={12} />
              <span className="text-xs text-foreground/80">{reason.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2">
        {onSelect && (
          <button
            type="button"
            onClick={onSelect}
            className={cn(
              "flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground font-medium transition-all",
              "hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]",
              size === "sm" ? "px-4 py-1.5 text-sm" : "px-5 py-2 text-sm"
            )}
          >
            {t("planner.recommendation.select")}
            <ChevronRight size={14} />
          </button>
        )}
        {onViewDetails && (
          <button
            type="button"
            onClick={onViewDetails}
            className={cn(
              "px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            )}
          >
            {t("planner.recommendation.details")}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Inline recommendation (simpler version)
 */
interface InlineRecommendationProps {
  message: string;
  onAction?: () => void;
  actionLabel?: string;
}

export function InlineRecommendation({
  message,
  onAction,
  actionLabel,
}: InlineRecommendationProps) {
  const { t } = useTranslation();
  const label = actionLabel || t("planner.recommendation.view");
  
  return (
    <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5">
      <Sparkles size={14} className="text-primary flex-shrink-0" />
      <span className="text-sm text-foreground">{message}</span>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="text-sm font-medium text-primary hover:underline"
        >
          {label} →
        </button>
      )}
    </div>
  );
}

export default ResultRecommendation;
