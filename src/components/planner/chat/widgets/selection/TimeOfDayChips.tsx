/**
 * TimeOfDayChips - Time of day filter chips for activities
 *
 * Allows users to filter activities by preferred time slot.
 * Useful for scheduling and preference-based filtering.
 */

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Sunrise, Sun, Sunset, Moon } from "lucide-react";

/**
 * Time of day option
 */
export interface TimeOfDayOption {
  id: string;
  label: string;
  labelShort: string;
  /** Start hour (0-23) */
  startHour: number;
  /** End hour (0-23) */
  endHour: number;
  icon: "dawn" | "morning" | "afternoon" | "evening" | "night";
}

/**
 * Default time of day options
 */
export const DEFAULT_TIME_OPTIONS: TimeOfDayOption[] = [
  { id: "morning", label: "Matin", labelShort: "Matin", startHour: 6, endHour: 12, icon: "morning" },
  { id: "afternoon", label: "Après-midi", labelShort: "Après-midi", startHour: 12, endHour: 17, icon: "afternoon" },
  { id: "evening", label: "Soir", labelShort: "Soir", startHour: 17, endHour: 21, icon: "evening" },
  { id: "night", label: "Nuit", labelShort: "Nuit", startHour: 21, endHour: 6, icon: "night" },
];

/**
 * Simplified options (without night)
 */
export const SIMPLE_TIME_OPTIONS: TimeOfDayOption[] = [
  { id: "morning", label: "Matin", labelShort: "Matin", startHour: 6, endHour: 12, icon: "morning" },
  { id: "afternoon", label: "Après-midi", labelShort: "A-M", startHour: 12, endHour: 18, icon: "afternoon" },
  { id: "evening", label: "Soir", labelShort: "Soir", startHour: 18, endHour: 22, icon: "evening" },
];

/**
 * Props for TimeOfDayChips
 */
interface TimeOfDayChipsProps {
  /** Callback when time selection changes */
  onTimeChange: (times: TimeOfDayOption[]) => void;
  /** Initial selected time IDs */
  initialSelected?: string[];
  /** Custom time options */
  options?: TimeOfDayOption[];
  /** Allow multiple selections (default: true) */
  multiSelect?: boolean;
  /** Size variant */
  size?: "sm" | "md";
  /** Disable interaction */
  disabled?: boolean;
  /** Label to display above */
  label?: string;
  /** Use short labels */
  shortLabels?: boolean;
  /** Layout style */
  layout?: "wrap" | "inline";
}

/**
 * Get icon component for time of day
 */
function TimeIcon({ type, size = 14, isSelected = false }: { type: TimeOfDayOption["icon"]; size?: number; isSelected?: boolean }) {
  const baseClass = isSelected ? "text-white" : "";

  switch (type) {
    case "dawn":
    case "morning":
      return <Sunrise size={size} className={cn(baseClass, !isSelected && "text-orange-400")} />;
    case "afternoon":
      return <Sun size={size} className={cn(baseClass, !isSelected && "text-yellow-500")} />;
    case "evening":
      return <Sunset size={size} className={cn(baseClass, !isSelected && "text-orange-500")} />;
    case "night":
      return <Moon size={size} className={cn(baseClass, !isSelected && "text-indigo-400")} />;
    default:
      return <Sun size={size} className={baseClass} />;
  }
}

/**
 * TimeOfDayChips Component
 *
 * @example
 * ```tsx
 * <TimeOfDayChips
 *   onTimeChange={(times) => {
 *     console.log('Selected times:', times);
 *   }}
 *   initialSelected={["morning", "afternoon"]}
 *   label="Horaire préféré"
 * />
 * ```
 */
export function TimeOfDayChips({
  onTimeChange,
  initialSelected = [],
  options = SIMPLE_TIME_OPTIONS,
  multiSelect = true,
  size = "md",
  disabled = false,
  label,
  shortLabels = false,
  layout = "wrap",
}: TimeOfDayChipsProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initialSelected)
  );

  const handleChipClick = useCallback(
    (optionId: string) => {
      setSelectedIds((prev) => {
        const newSet = new Set(prev);

        if (multiSelect) {
          if (newSet.has(optionId)) {
            newSet.delete(optionId);
          } else {
            newSet.add(optionId);
          }
        } else {
          if (newSet.has(optionId)) {
            newSet.clear();
          } else {
            newSet.clear();
            newSet.add(optionId);
          }
        }

        const selectedOptions = options.filter((opt) => newSet.has(opt.id));
        onTimeChange(selectedOptions);

        return newSet;
      });
    },
    [multiSelect, options, onTimeChange]
  );

  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs gap-1",
    md: "px-3 py-1.5 text-sm gap-1.5",
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </div>
      )}
      <div
        className={cn(
          "flex gap-2",
          layout === "inline" ? "overflow-x-auto pb-1" : "flex-wrap"
        )}
      >
        {options.map((option) => {
          const isSelected = selectedIds.has(option.id);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleChipClick(option.id)}
              disabled={disabled}
              className={cn(
                "inline-flex items-center rounded-full border transition-all duration-200",
                "hover:scale-[1.02] active:scale-[0.98]",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                sizeClasses[size],
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                  : "bg-background text-foreground border-border hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <TimeIcon
                type={option.icon}
                size={size === "sm" ? 12 : 14}
                isSelected={isSelected}
              />
              <span className="font-medium whitespace-nowrap">
                {shortLabels ? option.labelShort : option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Helper: Check if a time falls within a time option
 */
export function isTimeInSlot(hour: number, option: TimeOfDayOption): boolean {
  if (option.startHour < option.endHour) {
    return hour >= option.startHour && hour < option.endHour;
  }
  // Handle overnight slots (e.g., night: 21-6)
  return hour >= option.startHour || hour < option.endHour;
}

/**
 * Helper: Get time range string
 */
export function getTimeRangeString(option: TimeOfDayOption): string {
  const formatHour = (h: number) => `${h.toString().padStart(2, "0")}:00`;
  return `${formatHour(option.startHour)} - ${formatHour(option.endHour)}`;
}

export default TimeOfDayChips;
