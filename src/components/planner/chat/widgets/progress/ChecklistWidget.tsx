/**
 * ChecklistWidget - Interactive trip component checklist
 *
 * Visual checklist showing trip components (flights, hotels, activities)
 * with their completion status and quick actions.
 */

import { cn } from "@/lib/utils";
import {
  Check,
  Circle,
  Plane,
  Hotel,
  Compass,
  Car,
  Utensils,
  Shield,
  ChevronRight,
  Plus,
  Sparkles,
} from "lucide-react";

/**
 * Checklist item type
 */
export type ChecklistItemType =
  | "flights"
  | "hotels"
  | "activities"
  | "transfers"
  | "restaurants"
  | "insurance"
  | "custom";

/**
 * Checklist item
 */
export interface ChecklistItem {
  id: string;
  type: ChecklistItemType;
  label: string;
  checked: boolean;
  /** Item count (e.g., "2 vols") */
  count?: number;
  /** Summary text when checked */
  summary?: string;
  /** Price if available */
  price?: number;
  /** Required for trip */
  required?: boolean;
  /** Disabled (can't interact) */
  disabled?: boolean;
}

/**
 * ChecklistWidget props
 */
interface ChecklistWidgetProps {
  /** Checklist items */
  items: ChecklistItem[];
  /** Callback when item is clicked */
  onItemClick: (itemId: string) => void;
  /** Callback when item checkbox is toggled */
  onItemToggle?: (itemId: string, checked: boolean) => void;
  /** Title */
  title?: string;
  /** Show prices */
  showPrices?: boolean;
  /** Currency */
  currency?: string;
  /** Size variant */
  size?: "sm" | "md";
  /** Show add button for unchecked items */
  showAddButton?: boolean;
  /** Compact horizontal layout */
  horizontal?: boolean;
}

/**
 * Get icon for item type
 */
function ItemIcon({ type, size = 16 }: { type: ChecklistItemType; size?: number }) {
  switch (type) {
    case "flights":
      return <Plane size={size} />;
    case "hotels":
      return <Hotel size={size} />;
    case "activities":
      return <Compass size={size} />;
    case "transfers":
      return <Car size={size} />;
    case "restaurants":
      return <Utensils size={size} />;
    case "insurance":
      return <Shield size={size} />;
    default:
      return <Circle size={size} />;
  }
}

/**
 * Horizontal compact item
 */
function HorizontalItem({
  item,
  onClick,
  size,
}: {
  item: ChecklistItem;
  onClick: () => void;
  size: "sm" | "md";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={item.disabled}
      className={cn(
        "flex flex-col items-center gap-1 rounded-lg border transition-all",
        "hover:scale-[1.02] active:scale-[0.98]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        size === "sm" ? "p-2 min-w-[60px]" : "p-3 min-w-[70px]",
        item.checked
          ? "bg-primary/10 border-primary/30 text-primary"
          : "bg-muted/30 border-border text-muted-foreground hover:border-primary/50"
      )}
    >
      <div className="relative">
        <ItemIcon type={item.type} size={size === "sm" ? 18 : 20} />
        {item.checked && (
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary flex items-center justify-center">
            <Check size={8} className="text-primary-foreground" />
          </div>
        )}
      </div>
      <span className={cn("font-medium", size === "sm" ? "text-[10px]" : "text-xs")}>
        {item.label}
      </span>
      {item.count !== undefined && item.checked && (
        <span className="text-[10px] text-muted-foreground">{item.count}</span>
      )}
    </button>
  );
}

/**
 * Vertical list item
 */
function VerticalItem({
  item,
  onClick,
  onToggle,
  showPrices,
  currency,
  size,
  showAddButton,
}: {
  item: ChecklistItem;
  onClick: () => void;
  onToggle?: (checked: boolean) => void;
  showPrices: boolean;
  currency: string;
  size: "sm" | "md";
  showAddButton: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border transition-all",
        size === "sm" ? "p-2" : "p-3",
        item.checked
          ? "bg-primary/5 border-primary/20"
          : "bg-background border-border hover:border-primary/30"
      )}
    >
      {/* Checkbox */}
      {onToggle && (
        <button
          type="button"
          onClick={() => onToggle(!item.checked)}
          disabled={item.disabled}
          className={cn(
            "flex-shrink-0 rounded-full border-2 transition-all",
            size === "sm" ? "w-5 h-5" : "w-6 h-6",
            item.checked
              ? "bg-primary border-primary"
              : "border-muted-foreground/30 hover:border-primary/50"
          )}
        >
          {item.checked && (
            <Check size={size === "sm" ? 12 : 14} className="text-primary-foreground m-auto" />
          )}
        </button>
      )}

      {/* Icon */}
      <div
        className={cn(
          "flex-shrink-0 rounded-full p-1.5",
          item.checked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}
      >
        <ItemIcon type={item.type} size={size === "sm" ? 14 : 16} />
      </div>

      {/* Content */}
      <button
        type="button"
        onClick={onClick}
        disabled={item.disabled}
        className="flex-1 text-left min-w-0 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-medium truncate",
              size === "sm" ? "text-sm" : "text-base",
              item.checked ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {item.label}
          </span>
          {item.required && !item.checked && (
            <span className="text-[10px] text-amber-600 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">
              Requis
            </span>
          )}
          {item.count !== undefined && item.checked && (
            <span className="text-xs text-muted-foreground">({item.count})</span>
          )}
        </div>
        {item.summary && item.checked && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{item.summary}</p>
        )}
      </button>

      {/* Price or Add button */}
      <div className="flex-shrink-0 flex items-center gap-2">
        {showPrices && item.price !== undefined && item.checked && (
          <span className="text-sm font-medium text-foreground">
            {item.price}{currency}
          </span>
        )}
        {!item.checked && showAddButton && (
          <button
            type="button"
            onClick={onClick}
            className="text-primary hover:text-primary/80 transition-colors"
          >
            <Plus size={18} />
          </button>
        )}
        {item.checked && (
          <ChevronRight size={16} className="text-muted-foreground" />
        )}
      </div>
    </div>
  );
}

/**
 * ChecklistWidget Component
 *
 * @example
 * ```tsx
 * <ChecklistWidget
 *   items={[
 *     { id: "flights", type: "flights", label: "Vols", checked: true, count: 2, price: 450 },
 *     { id: "hotels", type: "hotels", label: "Hôtel", checked: true, count: 1, price: 320 },
 *     { id: "activities", type: "activities", label: "Activités", checked: false, required: false },
 *   ]}
 *   onItemClick={(id) => navigateToSection(id)}
 *   showPrices
 *   currency="€"
 * />
 * ```
 */
export function ChecklistWidget({
  items,
  onItemClick,
  onItemToggle,
  title,
  showPrices = false,
  currency = "€",
  size = "md",
  showAddButton = true,
  horizontal = false,
}: ChecklistWidgetProps) {
  const checkedCount = items.filter((i) => i.checked).length;
  const totalPrice = items.reduce((sum, item) => sum + (item.price || 0), 0);

  if (horizontal) {
    return (
      <div className="space-y-2">
        {title && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </span>
            <span className="text-xs text-muted-foreground">
              {checkedCount}/{items.length}
            </span>
          </div>
        )}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {items.map((item) => (
            <HorizontalItem
              key={item.id}
              item={item}
              onClick={() => onItemClick(item.id)}
              size={size}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      {(title || showPrices) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {title && (
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {title}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {checkedCount}/{items.length}
            </span>
          </div>
          {showPrices && totalPrice > 0 && (
            <span className="text-sm font-semibold text-foreground">
              Total: {totalPrice}{currency}
            </span>
          )}
        </div>
      )}

      {/* Items */}
      <div className="space-y-2">
        {items.map((item) => (
          <VerticalItem
            key={item.id}
            item={item}
            onClick={() => onItemClick(item.id)}
            onToggle={onItemToggle ? (checked) => onItemToggle(item.id, checked) : undefined}
            showPrices={showPrices}
            currency={currency}
            size={size}
            showAddButton={showAddButton}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Default trip checklist items
 */
export const DEFAULT_TRIP_CHECKLIST: Omit<ChecklistItem, "checked">[] = [
  { id: "flights", type: "flights", label: "Vols", required: true },
  { id: "hotels", type: "hotels", label: "Hébergement", required: true },
  { id: "activities", type: "activities", label: "Activités", required: false },
  { id: "transfers", type: "transfers", label: "Transferts", required: false },
  { id: "insurance", type: "insurance", label: "Assurance", required: false },
];

export default ChecklistWidget;
