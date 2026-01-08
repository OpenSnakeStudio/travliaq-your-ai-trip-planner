/**
 * ResultBadges - Badges for highlighting results
 *
 * Visual badges to highlight special results like best deals,
 * popular choices, recommended options, etc.
 */

import { cn } from "@/lib/utils";
import {
  Sparkles,
  TrendingUp,
  Heart,
  Award,
  Clock,
  Zap,
  ThumbsUp,
  Star,
  Flame,
  Crown,
} from "lucide-react";

/**
 * Badge type
 */
export type BadgeType =
  | "bestDeal"
  | "popular"
  | "recommended"
  | "topRated"
  | "lastMinute"
  | "fastSelling"
  | "favorite"
  | "new"
  | "trending"
  | "premium";

/**
 * Badge configuration
 */
interface BadgeConfig {
  icon: React.ElementType;
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

/**
 * Get badge configuration
 */
function getBadgeConfig(type: BadgeType): BadgeConfig {
  switch (type) {
    case "bestDeal":
      return {
        icon: Award,
        label: "Meilleure offre",
        bgColor: "bg-green-100 dark:bg-green-900/40",
        textColor: "text-green-700 dark:text-green-300",
        borderColor: "border-green-200 dark:border-green-700",
      };
    case "popular":
      return {
        icon: TrendingUp,
        label: "Populaire",
        bgColor: "bg-blue-100 dark:bg-blue-900/40",
        textColor: "text-blue-700 dark:text-blue-300",
        borderColor: "border-blue-200 dark:border-blue-700",
      };
    case "recommended":
      return {
        icon: Sparkles,
        label: "Recommandé",
        bgColor: "bg-purple-100 dark:bg-purple-900/40",
        textColor: "text-purple-700 dark:text-purple-300",
        borderColor: "border-purple-200 dark:border-purple-700",
      };
    case "topRated":
      return {
        icon: Star,
        label: "Mieux noté",
        bgColor: "bg-amber-100 dark:bg-amber-900/40",
        textColor: "text-amber-700 dark:text-amber-300",
        borderColor: "border-amber-200 dark:border-amber-700",
      };
    case "lastMinute":
      return {
        icon: Clock,
        label: "Dernière minute",
        bgColor: "bg-red-100 dark:bg-red-900/40",
        textColor: "text-red-700 dark:text-red-300",
        borderColor: "border-red-200 dark:border-red-700",
      };
    case "fastSelling":
      return {
        icon: Zap,
        label: "Se vend vite",
        bgColor: "bg-orange-100 dark:bg-orange-900/40",
        textColor: "text-orange-700 dark:text-orange-300",
        borderColor: "border-orange-200 dark:border-orange-700",
      };
    case "favorite":
      return {
        icon: Heart,
        label: "Coup de cœur",
        bgColor: "bg-pink-100 dark:bg-pink-900/40",
        textColor: "text-pink-700 dark:text-pink-300",
        borderColor: "border-pink-200 dark:border-pink-700",
      };
    case "new":
      return {
        icon: Sparkles,
        label: "Nouveau",
        bgColor: "bg-teal-100 dark:bg-teal-900/40",
        textColor: "text-teal-700 dark:text-teal-300",
        borderColor: "border-teal-200 dark:border-teal-700",
      };
    case "trending":
      return {
        icon: Flame,
        label: "Tendance",
        bgColor: "bg-rose-100 dark:bg-rose-900/40",
        textColor: "text-rose-700 dark:text-rose-300",
        borderColor: "border-rose-200 dark:border-rose-700",
      };
    case "premium":
      return {
        icon: Crown,
        label: "Premium",
        bgColor: "bg-yellow-100 dark:bg-yellow-900/40",
        textColor: "text-yellow-700 dark:text-yellow-300",
        borderColor: "border-yellow-200 dark:border-yellow-700",
      };
    default:
      return {
        icon: ThumbsUp,
        label: "Recommandé",
        bgColor: "bg-slate-100 dark:bg-slate-800",
        textColor: "text-slate-700 dark:text-slate-300",
        borderColor: "border-slate-200 dark:border-slate-600",
      };
  }
}

/**
 * ResultBadge props
 */
interface ResultBadgeProps {
  /** Badge type */
  type: BadgeType;
  /** Custom label (overrides default) */
  label?: string;
  /** Size variant */
  size?: "xs" | "sm" | "md";
  /** Show icon */
  showIcon?: boolean;
  /** Pill style (rounded) */
  pill?: boolean;
  /** Animate on hover */
  animated?: boolean;
}

/**
 * ResultBadge Component
 *
 * @example
 * ```tsx
 * <ResultBadge type="bestDeal" />
 * <ResultBadge type="popular" size="sm" />
 * <ResultBadge type="recommended" label="Pour vous" />
 * ```
 */
export function ResultBadge({
  type,
  label: customLabel,
  size = "sm",
  showIcon = true,
  pill = true,
  animated = false,
}: ResultBadgeProps) {
  const config = getBadgeConfig(type);
  const Icon = config.icon;
  const label = customLabel || config.label;

  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-[10px] gap-0.5",
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-sm gap-1.5",
  };

  const iconSizes = {
    xs: 10,
    sm: 12,
    md: 14,
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium border",
        config.bgColor,
        config.textColor,
        config.borderColor,
        sizeClasses[size],
        pill ? "rounded-full" : "rounded",
        animated && "transition-transform hover:scale-105"
      )}
    >
      {showIcon && <Icon size={iconSizes[size]} />}
      <span>{label}</span>
    </span>
  );
}

/**
 * BestDealBadge - Shortcut component
 */
export function BestDealBadge(props: Omit<ResultBadgeProps, "type">) {
  return <ResultBadge type="bestDeal" {...props} />;
}

/**
 * PopularChoiceBadge - Shortcut component
 */
export function PopularChoiceBadge(props: Omit<ResultBadgeProps, "type">) {
  return <ResultBadge type="popular" {...props} />;
}

/**
 * RecommendedBadge - Shortcut component
 */
export function RecommendedBadge(props: Omit<ResultBadgeProps, "type">) {
  return <ResultBadge type="recommended" {...props} />;
}

/**
 * TopRatedBadge - Shortcut component
 */
export function TopRatedBadge(props: Omit<ResultBadgeProps, "type">) {
  return <ResultBadge type="topRated" {...props} />;
}

/**
 * Multiple badges container
 */
interface BadgeGroupProps {
  badges: BadgeType[];
  size?: "xs" | "sm" | "md";
  maxVisible?: number;
}

export function BadgeGroup({
  badges,
  size = "sm",
  maxVisible = 2,
}: BadgeGroupProps) {
  const visibleBadges = badges.slice(0, maxVisible);
  const hiddenCount = badges.length - maxVisible;

  return (
    <div className="flex flex-wrap gap-1">
      {visibleBadges.map((badge) => (
        <ResultBadge key={badge} type={badge} size={size} />
      ))}
      {hiddenCount > 0 && (
        <span
          className={cn(
            "inline-flex items-center rounded-full bg-muted text-muted-foreground",
            size === "xs" ? "px-1.5 py-0.5 text-[10px]" : size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm"
          )}
        >
          +{hiddenCount}
        </span>
      )}
    </div>
  );
}

export default ResultBadge;
