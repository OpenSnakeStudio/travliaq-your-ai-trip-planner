/**
 * DurationChips - Activity duration filter chips
 *
 * Allows users to filter activities by duration with predefined ranges.
 * Optimized for activity searches.
 */

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Clock, Zap, Sun, Sunrise } from "lucide-react";

/**
 * Duration option configuration
 */
export interface DurationOption {
  id: string;
  label: string;
  /** Duration in minutes */
  minMinutes: number;
  /** Duration in minutes (null = no upper limit) */
  maxMinutes: number | null;
  icon: "quick" | "short" | "half" | "full" | "multi";
}

/**
 * Default duration options
 */
export const DEFAULT_DURATION_OPTIONS: DurationOption[] = [
  { id: "quick", label: "< 1h", minMinutes: 0, maxMinutes: 60, icon: "quick" },
  { id: "short", label: "1-2h", minMinutes: 60, maxMinutes: 120, icon: "short" },
  { id: "half", label: "2-4h", minMinutes: 120, maxMinutes: 240, icon: "half" },
  { id: "halfday", label: "Demi-journée", minMinutes: 240, maxMinutes: 360, icon: "half" },
  { id: "full", label: "Journée", minMinutes: 360, maxMinutes: 600, icon: "full" },
  { id: "multi", label: "Multi-jours", minMinutes: 600, maxMinutes: null, icon: "multi" },
];

/**
 * Props for DurationChips
 */
interface DurationChipsProps {
  /** Callback when duration selection changes */
  onDurationChange: (durations: DurationOption[]) => void;
  /** Initial selected duration IDs */
  initialSelected?: string[];
  /** Custom duration options (defaults to DEFAULT_DURATION_OPTIONS) */
  options?: DurationOption[];
  /** Allow multiple selections (default: true) */
  multiSelect?: boolean;
  /** Size variant */
  size?: "sm" | "md";
  /** Disable interaction */
  disabled?: boolean;
  /** Label to display above */
  label?: string;
  /** Show clear button */
  showClear?: boolean;
}

/**
 * Get icon component for duration type
 */
function DurationIcon({ type, size = 14 }: { type: DurationOption["icon"]; size?: number }) {
  switch (type) {
    case "quick":
      return <Zap size={size} className="text-yellow-500" />;
    case "short":
      return <Clock size={size} className="text-blue-500" />;
    case "half":
      return <Sunrise size={size} className="text-orange-500" />;
    case "full":
      return <Sun size={size} className="text-amber-500" />;
    case "multi":
      return <Sun size={size} className="text-purple-500" />;
    default:
      return <Clock size={size} />;
  }
}

/**
 * DurationChips Component
 *
 * @example
 * ```tsx
 * <DurationChips
 *   onDurationChange={(durations) => {
 *     console.log('Selected:', durations);
 *     // Filter activities by duration range
 *   }}
 *   initialSelected={["short", "half"]}
 *   label="Durée de l'activité"
 * />
 * ```
 */
export function DurationChips({
  onDurationChange,
  initialSelected = [],
  options = DEFAULT_DURATION_OPTIONS,
  multiSelect = true,
  size = "md",
  disabled = false,
  label,
  showClear = false,
}: DurationChipsProps) {
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

        // Return selected options
        const selectedOptions = options.filter((opt) => newSet.has(opt.id));
        onDurationChange(selectedOptions);

        return newSet;
      });
    },
    [multiSelect, options, onDurationChange]
  );

  const handleClear = useCallback(() => {
    setSelectedIds(new Set());
    onDurationChange([]);
  }, [onDurationChange]);

  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs gap-1",
    md: "px-3 py-1.5 text-sm gap-1.5",
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </span>
          {showClear && selectedIds.size > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Effacer
            </button>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
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
              <DurationIcon type={option.icon} size={size === "sm" ? 12 : 14} />
              <span className="font-medium whitespace-nowrap">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Helper function to format duration in human-readable format
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h${remainingMinutes}`;
}

/**
 * Helper function to get duration range string
 */
export function getDurationRangeString(option: DurationOption): string {
  if (option.maxMinutes === null) {
    return `${formatDuration(option.minMinutes)}+`;
  }
  return `${formatDuration(option.minMinutes)} - ${formatDuration(option.maxMinutes)}`;
}

export default DurationChips;
