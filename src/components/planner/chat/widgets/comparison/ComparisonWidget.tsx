/**
 * ComparisonWidget - Side-by-side comparison of items
 *
 * Generic comparison widget that works with flights, hotels,
 * or activities. Shows key metrics and highlights differences.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  X,
  Check,
  Minus,
  ChevronDown,
  ChevronUp,
  Trophy,
  ThumbsUp,
  AlertCircle,
  Plane,
  Hotel,
  Compass,
} from "lucide-react";

/**
 * Comparison item type
 */
export type ComparisonItemType = "flight" | "hotel" | "activity";

/**
 * Metric comparison
 */
export interface ComparisonMetric {
  id: string;
  label: string;
  /** Value for each item being compared */
  values: Array<{
    value: string | number;
    /** Is this the best value? */
    isBest?: boolean;
    /** Is this the worst value? */
    isWorst?: boolean;
    /** Formatted display */
    display?: string;
  }>;
  /** Higher is better (for highlighting) */
  higherIsBetter?: boolean;
  /** Category for grouping */
  category?: string;
}

/**
 * Item being compared
 */
export interface ComparisonItem {
  id: string;
  type: ComparisonItemType;
  name: string;
  subtitle?: string;
  image?: string;
  price: number;
  currency?: string;
  /** Rating if applicable */
  rating?: number;
  /** Tags/badges */
  tags?: Array<{
    label: string;
    type: "success" | "warning" | "info" | "default";
  }>;
  /** Is this the recommended choice? */
  isRecommended?: boolean;
  /** Custom data for display */
  data?: Record<string, any>;
}

/**
 * ComparisonWidget props
 */
interface ComparisonWidgetProps {
  /** Items to compare (2-4) */
  items: ComparisonItem[];
  /** Metrics to compare */
  metrics: ComparisonMetric[];
  /** Selected item callback */
  onSelect?: (itemId: string) => void;
  /** Remove item from comparison */
  onRemove?: (itemId: string) => void;
  /** Size variant */
  size?: "sm" | "md";
  /** Show expand/collapse */
  expandable?: boolean;
  /** Initially expanded */
  defaultExpanded?: boolean;
  /** Highlight best values */
  highlightBest?: boolean;
  /** Show winner badge */
  showWinner?: boolean;
}

/**
 * Get icon for item type
 */
function ItemTypeIcon({ type, size = 16 }: { type: ComparisonItemType; size?: number }) {
  switch (type) {
    case "flight":
      return <Plane size={size} />;
    case "hotel":
      return <Hotel size={size} />;
    case "activity":
      return <Compass size={size} />;
  }
}

/**
 * Metric value cell
 */
function MetricCell({
  value,
  isBest,
  isWorst,
  display,
  highlightBest,
}: {
  value: string | number;
  isBest?: boolean;
  isWorst?: boolean;
  display?: string;
  highlightBest: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center py-2 px-3 text-sm font-medium",
        highlightBest && isBest && "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
        highlightBest && isWorst && "text-muted-foreground"
      )}
    >
      {isBest && highlightBest && <Check size={14} className="mr-1 text-green-500" />}
      <span>{display || value}</span>
    </div>
  );
}

/**
 * ComparisonWidget Component
 *
 * @example
 * ```tsx
 * <ComparisonWidget
 *   items={[
 *     { id: "1", type: "hotel", name: "Hotel A", price: 120, rating: 4.5 },
 *     { id: "2", type: "hotel", name: "Hotel B", price: 95, rating: 4.2, isRecommended: true },
 *   ]}
 *   metrics={[
 *     { id: "price", label: "Prix/nuit", values: [{ value: 120 }, { value: 95, isBest: true }] },
 *     { id: "rating", label: "Note", values: [{ value: 4.5, isBest: true }, { value: 4.2 }] },
 *   ]}
 *   onSelect={(id) => selectHotel(id)}
 *   highlightBest
 * />
 * ```
 */
export function ComparisonWidget({
  items,
  metrics,
  onSelect,
  onRemove,
  size = "md",
  expandable = false,
  defaultExpanded = true,
  highlightBest = true,
  showWinner = true,
}: ComparisonWidgetProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(defaultExpanded);

  // Determine winner (item with most "best" values)
  const winner = showWinner
    ? items.reduce(
        (best, item, index) => {
          const bestCount = metrics.filter((m) => m.values[index]?.isBest).length;
          if (bestCount > best.count) {
            return { id: item.id, count: bestCount };
          }
          return best;
        },
        { id: "", count: 0 }
      )
    : null;

  const itemWidth = `${100 / items.length}%`;

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Header with items */}
      <div className="flex border-b bg-muted/30">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "flex-1 p-3 relative",
              index < items.length - 1 && "border-r border-border"
            )}
            style={{ width: itemWidth }}
          >
            {/* Remove button */}
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="absolute top-2 right-2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X size={14} />
              </button>
            )}

            {/* Winner badge */}
            {showWinner && winner?.id === item.id && winner.count > 0 && (
              <div className="absolute top-2 left-2">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-medium">
                  <Trophy size={12} />
                  {t("planner.comparison.bestChoice")}
                </div>
              </div>
            )}

            {/* Recommended badge */}
            {item.isRecommended && winner?.id !== item.id && (
              <div className="absolute top-2 left-2">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  <ThumbsUp size={12} />
                  {t("planner.comparison.recommended")}
                </div>
              </div>
            )}

            {/* Item info */}
            <div className={cn("text-center", (showWinner || item.isRecommended) && "mt-6")}>
              {/* Image */}
              {item.image && (
                <div className="w-16 h-16 mx-auto mb-2 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Type icon if no image */}
              {!item.image && (
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
                  <ItemTypeIcon type={item.type} size={20} />
                </div>
              )}

              {/* Name */}
              <h4 className={cn("font-semibold truncate", size === "sm" ? "text-sm" : "text-base")}>
                {item.name}
              </h4>

              {/* Subtitle */}
              {item.subtitle && (
                <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
              )}

              {/* Rating */}
              {item.rating !== undefined && (
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span className="text-amber-500">★</span>
                  <span className="text-sm font-medium">{item.rating.toFixed(1)}</span>
                </div>
              )}

              {/* Price */}
              <div className={cn("font-bold text-primary mt-2", size === "sm" ? "text-lg" : "text-xl")}>
                {item.price}
                {item.currency || "€"}
              </div>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1 mt-2">
                  {item.tags.slice(0, 2).map((tag, i) => (
                    <span
                      key={i}
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        tag.type === "success" && "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
                        tag.type === "warning" && "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
                        tag.type === "info" && "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
                        tag.type === "default" && "bg-muted text-muted-foreground"
                      )}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              )}

              {/* Select button */}
              {onSelect && (
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className={cn(
                    "w-full mt-3 py-2 rounded-lg font-medium transition-all",
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    size === "sm" ? "text-xs" : "text-sm"
                  )}
                >
                  {t("planner.comparison.selectItem")}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Metrics comparison */}
      {expandable && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <span>{t("planner.comparison.viewDetails")}</span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      )}

      {(!expandable || expanded) && metrics.length > 0 && (
        <div className="divide-y divide-border">
          {metrics.map((metric) => (
            <div key={metric.id} className="flex">
              {/* Metric label */}
              <div className="w-1/4 min-w-[100px] flex items-center px-3 py-2 bg-muted/20 text-sm text-muted-foreground">
                {metric.label}
              </div>

              {/* Values */}
              <div className="flex-1 flex">
                {metric.values.map((value, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex-1",
                      index < metric.values.length - 1 && "border-r border-border"
                    )}
                  >
                    <MetricCell
                      value={value.value}
                      isBest={value.isBest}
                      isWorst={value.isWorst}
                      display={value.display}
                      highlightBest={highlightBest}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Compact comparison bar for inline use
 */
export function CompactComparisonBar({
  items,
  onClear,
  onCompare,
  maxItems = 4,
}: {
  items: Array<{ id: string; name: string; price: number }>;
  onClear: () => void;
  onCompare: () => void;
  maxItems?: number;
}) {
  const { t } = useTranslation();

  if (items.length === 0) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-2">
      <span className="text-sm text-muted-foreground">
        {t("planner.comparison.compareCount", { current: items.length, max: maxItems })}:
      </span>
      <div className="flex items-center gap-2 flex-1 overflow-x-auto">
        {items.map((item) => (
          <span
            key={item.id}
            className="px-2 py-1 rounded bg-background border text-sm whitespace-nowrap"
          >
            {item.name}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClear}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("planner.comparison.clear")}
        </button>
        <button
          type="button"
          onClick={onCompare}
          disabled={items.length < 2}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
            items.length >= 2
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {t("planner.comparison.compare")}
        </button>
      </div>
    </div>
  );
}

/**
 * Simple metric comparison list
 */
export function MetricComparisonList({
  metrics,
  className,
}: {
  metrics: Array<{
    label: string;
    item1: { value: string; isBetter?: boolean };
    item2: { value: string; isBetter?: boolean };
  }>;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {metrics.map((metric, index) => (
        <div key={index} className="flex items-center text-sm">
          <span className="w-1/3 text-muted-foreground">{metric.label}</span>
          <div className="flex-1 flex items-center gap-4">
            <span
              className={cn(
                "flex-1 text-center",
                metric.item1.isBetter && "text-green-600 font-medium"
              )}
            >
              {metric.item1.value}
            </span>
            <Minus size={12} className="text-muted-foreground" />
            <span
              className={cn(
                "flex-1 text-center",
                metric.item2.isBetter && "text-green-600 font-medium"
              )}
            >
              {metric.item2.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ComparisonWidget;
