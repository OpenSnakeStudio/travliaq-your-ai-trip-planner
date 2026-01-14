/**
 * TimelineWidget - Day-by-day trip visualization
 *
 * Displays the trip itinerary in a vertical timeline format
 * with activities, flights, and hotels positioned by day.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  Plane,
  Hotel,
  MapPin,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  Sun,
  Moon,
  Coffee,
  Utensils,
  Camera,
  ShoppingBag,
  Music,
  Waves,
  Mountain,
  Landmark,
} from "lucide-react";

/**
 * Timeline item type
 */
export type TimelineItemType =
  | "flight_departure"
  | "flight_arrival"
  | "hotel_checkin"
  | "hotel_checkout"
  | "activity"
  | "transfer"
  | "meal"
  | "free_time";

/**
 * Time of day
 */
export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

/**
 * Timeline item
 */
export interface TimelineItem {
  id: string;
  type: TimelineItemType;
  /** Display title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Start time (HH:mm format) */
  startTime?: string;
  /** End time (HH:mm format) */
  endTime?: string;
  /** Duration in minutes */
  duration?: number;
  /** Location */
  location?: string;
  /** Price */
  price?: number;
  /** Currency */
  currency?: string;
  /** Image URL */
  image?: string;
  /** Status */
  status?: "confirmed" | "pending" | "suggested";
  /** Is editable */
  editable?: boolean;
  /** Custom icon name */
  iconName?: string;
  /** Additional data */
  data?: Record<string, any>;
}

/**
 * Day in the timeline
 */
export interface TimelineDay {
  /** Date */
  date: Date;
  /** Day label (e.g., "Jour 1", "Lundi 15 Mars") */
  label: string;
  /** Items for this day */
  items: TimelineItem[];
  /** Weather info */
  weather?: {
    icon: string;
    temp: number;
    description: string;
  };
  /** Is this day expandable */
  expandable?: boolean;
}

/**
 * TimelineWidget props
 */
interface TimelineWidgetProps {
  /** Days to display */
  days: TimelineDay[];
  /** Item click handler */
  onItemClick?: (item: TimelineItem, dayIndex: number) => void;
  /** Add item handler */
  onAddItem?: (dayIndex: number, timeOfDay: TimeOfDay) => void;
  /** Edit item handler */
  onEditItem?: (item: TimelineItem, dayIndex: number) => void;
  /** Remove item handler */
  onRemoveItem?: (itemId: string, dayIndex: number) => void;
  /** Compact mode */
  compact?: boolean;
  /** Show weather */
  showWeather?: boolean;
  /** Allow editing */
  editable?: boolean;
  /** Initially expanded days */
  defaultExpandedDays?: number[];
}

/**
 * Icon mapping for item types
 */
const TYPE_ICONS: Record<TimelineItemType, React.ElementType> = {
  flight_departure: Plane,
  flight_arrival: Plane,
  hotel_checkin: Hotel,
  hotel_checkout: Hotel,
  activity: Camera,
  transfer: MapPin,
  meal: Utensils,
  free_time: Coffee,
};

/**
 * Activity category icons
 */
const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  culture: Landmark,
  nature: Mountain,
  beach: Waves,
  shopping: ShoppingBag,
  nightlife: Music,
  food: Utensils,
  default: Camera,
};

/**
 * Get icon for timeline item
 */
function getItemIcon(item: TimelineItem): React.ElementType {
  if (item.iconName && ACTIVITY_ICONS[item.iconName]) {
    return ACTIVITY_ICONS[item.iconName];
  }
  return TYPE_ICONS[item.type] || Camera;
}

/**
 * Get time of day from hour
 */
function getTimeOfDay(time?: string): TimeOfDay {
  if (!time) return "morning";
  const hour = parseInt(time.split(":")[0], 10);
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
}

/**
 * Time of day icon
 */
function TimeOfDayIcon({ timeOfDay }: { timeOfDay: TimeOfDay }) {
  switch (timeOfDay) {
    case "morning":
      return <Sun size={12} className="text-amber-500" />;
    case "afternoon":
      return <Sun size={12} className="text-orange-500" />;
    case "evening":
      return <Moon size={12} className="text-indigo-500" />;
    case "night":
      return <Moon size={12} className="text-slate-500" />;
  }
}

/**
 * Format duration
 */
function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h${mins}` : `${hours}h`;
}

/**
 * Status badge
 */
function StatusBadge({ status }: { status: TimelineItem["status"] }) {
  if (!status || status === "confirmed") return null;

  return (
    <span
      className={cn(
        "px-1.5 py-0.5 rounded text-xs font-medium",
        status === "pending" &&
          "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
        status === "suggested" &&
          "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
      )}
    >
      {status === "pending" ? "En attente" : "Suggéré"}
    </span>
  );
}

/**
 * Single timeline item component
 */
function TimelineItemCard({
  item,
  onClick,
  onEdit,
  onRemove,
  compact,
  editable,
}: {
  item: TimelineItem;
  onClick?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
  compact?: boolean;
  editable?: boolean;
}) {
  const Icon = getItemIcon(item);
  const timeOfDay = getTimeOfDay(item.startTime);

  const isTransport =
    item.type === "flight_departure" ||
    item.type === "flight_arrival" ||
    item.type === "transfer";

  return (
    <div
      className={cn(
        "group relative flex gap-3 rounded-lg border bg-card p-3",
        "transition-all hover:shadow-md",
        onClick && "cursor-pointer hover:border-primary/50",
        item.status === "suggested" && "border-dashed opacity-80"
      )}
      onClick={onClick}
    >
      {/* Drag handle (if editable) */}
      {editable && (
        <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
          <GripVertical size={14} className="text-muted-foreground" />
        </div>
      )}

      {/* Icon */}
      <div
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
          isTransport
            ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
            : item.type === "hotel_checkin" || item.type === "hotel_checkout"
            ? "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400"
            : item.type === "meal"
            ? "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400"
            : "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400"
        )}
      >
        <Icon size={18} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className={cn("font-medium truncate", compact ? "text-sm" : "text-base")}>
              {item.title}
            </h4>
            {item.subtitle && (
              <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
            )}
          </div>
          <StatusBadge status={item.status} />
        </div>

        {/* Time and location */}
        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
          {item.startTime && (
            <div className="flex items-center gap-1">
              <TimeOfDayIcon timeOfDay={timeOfDay} />
              <span>
                {item.startTime}
                {item.endTime && ` - ${item.endTime}`}
              </span>
            </div>
          )}
          {item.duration && (
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{formatDuration(item.duration)}</span>
            </div>
          )}
          {item.location && (
            <div className="flex items-center gap-1">
              <MapPin size={12} />
              <span className="truncate max-w-[150px]">{item.location}</span>
            </div>
          )}
        </div>

        {/* Price */}
        {item.price !== undefined && (
          <div className="mt-2 text-sm font-medium text-primary">
            {item.price}
            {item.currency || "€"}
          </div>
        )}
      </div>

      {/* Image (if not compact) */}
      {!compact && item.image && (
        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted">
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Edit/Remove buttons */}
      {editable && (onEdit || onRemove) && (
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Edit2 size={12} />
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-1 rounded bg-muted hover:bg-red-100 dark:hover:bg-red-900/40 text-muted-foreground hover:text-red-600 transition-colors"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Add item button
 */
function AddItemButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-center gap-2 py-2 px-3",
        "rounded-lg border-2 border-dashed border-muted-foreground/30",
        "text-sm text-muted-foreground",
        "hover:border-primary/50 hover:text-primary hover:bg-primary/5",
        "transition-all"
      )}
    >
      <Plus size={16} />
      <span>{label}</span>
    </button>
  );
}

/**
 * TimelineWidget Component
 *
 * @example
 * ```tsx
 * <TimelineWidget
 *   days={[
 *     {
 *       date: new Date("2024-07-15"),
 *       label: "Jour 1 - Lundi 15 Juillet",
 *       items: [
 *         {
 *           id: "1",
 *           type: "flight_departure",
 *           title: "Vol Paris → Barcelone",
 *           startTime: "08:30",
 *           duration: 120,
 *         },
 *         {
 *           id: "2",
 *           type: "hotel_checkin",
 *           title: "Check-in Hotel Barcelona",
 *           startTime: "14:00",
 *         },
 *       ],
 *       weather: { icon: "sun", temp: 28, description: "Ensoleillé" },
 *     },
 *   ]}
 *   onItemClick={(item) => showDetails(item)}
 *   editable
 * />
 * ```
 */
export function TimelineWidget({
  days,
  onItemClick,
  onAddItem,
  onEditItem,
  onRemoveItem,
  compact = false,
  showWeather = true,
  editable = false,
  defaultExpandedDays,
}: TimelineWidgetProps) {
  const { t } = useTranslation();
  const [expandedDays, setExpandedDays] = useState<Set<number>>(
    new Set(defaultExpandedDays || days.map((_, i) => i))
  );

  const toggleDay = (index: number) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {days.map((day, dayIndex) => {
        const isExpanded = expandedDays.has(dayIndex);
        const itemCount = day.items.length;

        return (
          <div key={dayIndex} className="relative">
            {/* Timeline connector line */}
            {dayIndex < days.length - 1 && (
              <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-border" />
            )}

            {/* Day header */}
            <button
              type="button"
              onClick={() => day.expandable !== false && toggleDay(dayIndex)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg",
                "bg-muted/50 hover:bg-muted transition-colors",
                day.expandable !== false && "cursor-pointer"
              )}
            >
              {/* Day indicator */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                {dayIndex + 1}
              </div>

              {/* Day info */}
              <div className="flex-1 text-left">
                <h3 className="font-semibold">{day.label}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar size={12} />
                  <span>
                    {day.date.toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </span>
                  <span>•</span>
                  <span>
                    {itemCount} activité{itemCount > 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Weather */}
              {showWeather && day.weather && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-lg">
                    {day.weather.icon === "sun" ? "☀️" : day.weather.icon === "cloud" ? "☁️" : "🌤️"}
                  </span>
                  <span className="font-medium">{day.weather.temp}°</span>
                </div>
              )}

              {/* Expand/collapse */}
              {day.expandable !== false && (
                <div className="text-muted-foreground">
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              )}
            </button>

            {/* Day items */}
            {isExpanded && (
              <div className="mt-2 ml-5 pl-8 border-l-2 border-border space-y-3">
                {day.items.map((item) => (
                  <TimelineItemCard
                    key={item.id}
                    item={item}
                    onClick={onItemClick ? () => onItemClick(item, dayIndex) : undefined}
                    onEdit={
                      editable && onEditItem
                        ? () => onEditItem(item, dayIndex)
                        : undefined
                    }
                    onRemove={
                      editable && onRemoveItem
                        ? () => onRemoveItem(item.id, dayIndex)
                        : undefined
                    }
                    compact={compact}
                    editable={editable}
                  />
                ))}

                {/* Add item button */}
                {editable && onAddItem && (
                  <AddItemButton
                    onClick={() => onAddItem(dayIndex, "afternoon")}
                    label={t("planner.common.addActivity")}
                  />
                )}

                {/* Empty state */}
                {day.items.length === 0 && !editable && (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    {t("planner.common.noActivityPlanned")}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Compact timeline for chat messages
 */
export function CompactTimeline({
  days,
  onViewFull,
}: {
  days: TimelineDay[];
  onViewFull?: () => void;
}) {
  const { t } = useTranslation();
  const totalItems = days.reduce((sum, d) => sum + d.items.length, 0);

  return (
    <div className="rounded-lg border bg-card p-3">
      {/* Summary */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="text-primary" size={18} />
          <span className="font-medium">
            {days.length} {days.length > 1 ? t("planner.common.days") : t("planner.common.day")} • {totalItems} {totalItems > 1 ? t("planner.common.activities") : t("planner.common.activity")}
          </span>
        </div>
        {onViewFull && (
          <button
            type="button"
            onClick={onViewFull}
            className="text-sm text-primary hover:underline"
          >
            {t("planner.common.viewPlanning")}
          </button>
        )}
      </div>

      {/* Mini timeline */}
      <div className="flex gap-1">
        {days.slice(0, 7).map((day, index) => (
          <div
            key={index}
            className={cn(
              "flex-1 h-8 rounded",
              day.items.length > 0
                ? "bg-primary/20"
                : "bg-muted"
            )}
            title={`Jour ${index + 1}: ${day.items.length} activités`}
          >
            <div
              className="h-full bg-primary rounded"
              style={{
                width: `${Math.min(100, day.items.length * 25)}%`,
              }}
            />
          </div>
        ))}
        {days.length > 7 && (
          <div className="flex items-center text-xs text-muted-foreground">
            +{days.length - 7}
          </div>
        )}
      </div>
    </div>
  );
}

export default TimelineWidget;
