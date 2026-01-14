/**
 * BudgetProgressWidget - Budget tracking and progress visualization
 *
 * Shows how much of the budget has been used with breakdown by category.
 * Includes visual progress bars and alerts for over-budget situations.
 */

import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  Wallet,
  Plane,
  Hotel,
  Compass,
  Car,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

/**
 * Budget category
 */
export interface BudgetCategory {
  id: string;
  label: string;
  type: "flights" | "hotels" | "activities" | "transfers" | "other";
  amount: number;
  /** Allocated budget for this category */
  allocated?: number;
}

/**
 * BudgetProgressWidget props
 */
interface BudgetProgressWidgetProps {
  /** Total budget */
  totalBudget: number;
  /** Spent/committed amounts by category */
  categories: BudgetCategory[];
  /** Currency */
  currency?: string;
  /** Per person or total */
  perPerson?: boolean;
  /** Number of people (for per-person calculation) */
  peopleCount?: number;
  /** Size variant */
  size?: "sm" | "md";
  /** Show category breakdown */
  showBreakdown?: boolean;
  /** Variant style */
  variant?: "bar" | "circular" | "compact";
  /** Callback when budget exceeded */
  onBudgetExceeded?: () => void;
}

/**
 * Get icon for category
 */
function CategoryIcon({ type, size = 14 }: { type: BudgetCategory["type"]; size?: number }) {
  switch (type) {
    case "flights":
      return <Plane size={size} />;
    case "hotels":
      return <Hotel size={size} />;
    case "activities":
      return <Compass size={size} />;
    case "transfers":
      return <Car size={size} />;
    default:
      return <Wallet size={size} />;
  }
}

/**
 * Format currency amount
 */
function formatAmount(amount: number, currency: string): string {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}k${currency}`;
  }
  return `${Math.round(amount)}${currency}`;
}

/**
 * Circular progress indicator
 */
function CircularProgress({
  percentage,
  size = 80,
  strokeWidth = 6,
  isOverBudget,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  isOverBudget: boolean;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(
            "transition-all duration-500",
            isOverBudget ? "text-red-500" : percentage > 80 ? "text-amber-500" : "text-primary"
          )}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={cn(
            "font-bold",
            isOverBudget ? "text-red-500" : "text-foreground",
            size > 60 ? "text-lg" : "text-sm"
          )}
        >
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}

/**
 * Bar progress variant
 */
function BarVariant({
  totalBudget,
  spent,
  remaining,
  categories,
  currency,
  size,
  showBreakdown,
  isOverBudget,
}: {
  totalBudget: number;
  spent: number;
  remaining: number;
  categories: BudgetCategory[];
  currency: string;
  size: "sm" | "md";
  showBreakdown: boolean;
  isOverBudget: boolean;
}) {
  const { t } = useTranslation();
  const percentage = (spent / totalBudget) * 100;

  return (
    <div className="space-y-3">
      {/* Main progress bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className={cn("text-muted-foreground", size === "sm" ? "text-xs" : "text-sm")}>
            {t("planner.budget.spent")}
          </span>
          <span className={cn("font-semibold", size === "sm" ? "text-sm" : "text-base")}>
            {formatAmount(spent, currency)} / {formatAmount(totalBudget, currency)}
          </span>
        </div>
        <div className={cn("w-full bg-muted rounded-full overflow-hidden", size === "sm" ? "h-2" : "h-3")}>
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isOverBudget
                ? "bg-red-500"
                : percentage > 80
                ? "bg-amber-500"
                : "bg-primary"
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Remaining amount */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {isOverBudget ? (
            <>
              <AlertTriangle size={14} className="text-red-500" />
              <span className="text-sm text-red-500 font-medium">{t("planner.budget.overspent")}</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={14} className="text-green-500" />
              <span className="text-sm text-muted-foreground">{t("planner.budget.remaining")}</span>
            </>
          )}
        </div>
        <span
          className={cn(
            "font-semibold",
            isOverBudget ? "text-red-500" : "text-green-600",
            size === "sm" ? "text-sm" : "text-base"
          )}
        >
          {isOverBudget ? "+" : ""}
          {formatAmount(Math.abs(remaining), currency)}
        </span>
      </div>

      {/* Category breakdown */}
      {showBreakdown && categories.length > 0 && (
        <div className="pt-2 border-t border-border space-y-2">
          {categories
            .filter((c) => c.amount > 0)
            .map((category) => (
              <div key={category.id} className="flex items-center gap-2">
                <CategoryIcon type={category.type} size={12} />
                <span className="flex-1 text-xs text-muted-foreground">{category.label}</span>
                <span className="text-xs font-medium">{formatAmount(category.amount, currency)}</span>
                <span className="text-[10px] text-muted-foreground">
                  ({Math.round((category.amount / totalBudget) * 100)}%)
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

/**
 * Compact variant
 */
function CompactVariant({
  totalBudget,
  spent,
  currency,
  isOverBudget,
}: {
  totalBudget: number;
  spent: number;
  currency: string;
  isOverBudget: boolean;
}) {
  const { t } = useTranslation();
  const percentage = Math.round((spent / totalBudget) * 100);

  return (
    <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">
      <Wallet size={16} className="text-muted-foreground" />
      <div className="flex-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t("planner.budget.label")}</span>
          <span className="font-medium">
            {formatAmount(spent, currency)} / {formatAmount(totalBudget, currency)}
          </span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full",
              isOverBudget ? "bg-red-500" : percentage > 80 ? "bg-amber-500" : "bg-primary"
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
      {isOverBudget ? (
        <TrendingUp size={16} className="text-red-500" />
      ) : (
        <TrendingDown size={16} className="text-green-500" />
      )}
    </div>
  );
}

/**
 * BudgetProgressWidget Component
 *
 * @example
 * ```tsx
 * <BudgetProgressWidget
 *   totalBudget={2000}
 *   categories={[
 *     { id: "flights", type: "flights", label: "Vols", amount: 450 },
 *     { id: "hotels", type: "hotels", label: "Hôtel", amount: 320 },
 *     { id: "activities", type: "activities", label: "Activités", amount: 150 },
 *   ]}
 *   currency="€"
 *   showBreakdown
 * />
 * ```
 */
export function BudgetProgressWidget({
  totalBudget,
  categories,
  currency = "€",
  perPerson = false,
  peopleCount = 1,
  size = "md",
  showBreakdown = true,
  variant = "bar",
}: BudgetProgressWidgetProps) {
  const { t } = useTranslation();
  const spent = categories.reduce((sum, cat) => sum + cat.amount, 0);
  const remaining = totalBudget - spent;
  const isOverBudget = spent > totalBudget;
  const percentage = (spent / totalBudget) * 100;

  // Adjust for per-person display
  const displayBudget = perPerson ? totalBudget * peopleCount : totalBudget;
  const displaySpent = perPerson ? spent * peopleCount : spent;

  if (variant === "compact") {
    return (
      <CompactVariant
        totalBudget={displayBudget}
        spent={displaySpent}
        currency={currency}
        isOverBudget={isOverBudget}
      />
    );
  }

  if (variant === "circular") {
    return (
      <div className="flex items-center gap-4">
        <CircularProgress
          percentage={percentage}
          size={size === "sm" ? 60 : 80}
          isOverBudget={isOverBudget}
        />
        <div className="flex-1">
          <div className="text-sm text-muted-foreground">{t("planner.budget.budgetUsed")}</div>
          <div className={cn("font-bold", size === "sm" ? "text-lg" : "text-xl")}>
            {formatAmount(displaySpent, currency)}
          </div>
          <div className="text-xs text-muted-foreground">
            sur {formatAmount(displayBudget, currency)}
            {perPerson && ` (${peopleCount} pers.)`}
          </div>
        </div>
      </div>
    );
  }

  return (
    <BarVariant
      totalBudget={displayBudget}
      spent={displaySpent}
      remaining={remaining * (perPerson ? peopleCount : 1)}
      categories={categories}
      currency={currency}
      size={size}
      showBreakdown={showBreakdown}
      isOverBudget={isOverBudget}
    />
  );
}

export default BudgetProgressWidget;
