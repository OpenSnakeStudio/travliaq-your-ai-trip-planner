/**
 * DirectFlightToggle - Toggle for direct flights only filter
 *
 * Simple toggle or chip-based selector for filtering direct vs connecting flights.
 */

import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Plane, ArrowRight, RefreshCw } from "lucide-react";

/**
 * Stop option configuration
 */
export interface StopOption {
  id: string;
  label: string;
  value: number | null; // null = any, 0 = direct, 1 = 1 stop, etc.
  icon?: React.ReactNode;
}

/**
 * Default stop options
 */
export const DEFAULT_STOP_OPTIONS: StopOption[] = [
  { id: "any", label: "planner.flights.toggle.all", value: null },
  { id: "direct", label: "planner.flights.toggle.direct", value: 0 },
  { id: "1stop", label: "planner.flights.toggle.maxOneStop", value: 1 },
];

/**
 * Props for DirectFlightToggle
 */
interface DirectFlightToggleProps {
  /** Callback when selection changes */
  onChange: (directOnly: boolean) => void;
  /** Initial state */
  initialValue?: boolean;
  /** Size variant */
  size?: "sm" | "md";
  /** Disable interaction */
  disabled?: boolean;
  /** Display style */
  variant?: "toggle" | "chips";
  /** Label to display */
  label?: string;
}

/**
 * Simple toggle version
 */
function ToggleVersion({
  isDirectOnly,
  onToggle,
  size,
  disabled,
}: {
  isDirectOnly: boolean;
  onToggle: () => void;
  size: "sm" | "md";
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "relative inline-flex items-center rounded-full transition-all duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        size === "sm" ? "h-6 w-11" : "h-7 w-[52px]",
        isDirectOnly ? "bg-primary" : "bg-muted"
      )}
      role="switch"
      aria-checked={isDirectOnly}
    >
      <span
        className={cn(
          "absolute rounded-full bg-white shadow-sm transition-transform duration-200",
          size === "sm" ? "h-4 w-4" : "h-5 w-5",
          size === "sm"
            ? isDirectOnly
              ? "translate-x-6"
              : "translate-x-1"
            : isDirectOnly
            ? "translate-x-7"
            : "translate-x-1"
        )}
      />
    </button>
  );
}

/**
 * Chips version
 */
function ChipsVersion({
  isDirectOnly,
  onChange,
  size,
  disabled,
}: {
  isDirectOnly: boolean;
  onChange: (directOnly: boolean) => void;
  size: "sm" | "md";
  disabled: boolean;
}) {
  const { t } = useTranslation();
  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs gap-1",
    md: "px-3 py-1.5 text-sm gap-1.5",
  };

  const options = [
    { id: "any", label: t("planner.flights.toggle.allFlights"), value: false, icon: <RefreshCw size={14} /> },
    { id: "direct", label: t("planner.flights.toggle.directOnly"), value: true, icon: <ArrowRight size={14} /> },
  ];

  return (
    <div className="flex gap-2">
      {options.map((option) => {
        const isSelected = isDirectOnly === option.value;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.value)}
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
            <span className={isSelected ? "text-primary-foreground" : "text-muted-foreground"}>
              {option.icon}
            </span>
            <span className="font-medium whitespace-nowrap">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * DirectFlightToggle Component
 *
 * @example
 * ```tsx
 * // Toggle variant
 * <DirectFlightToggle
 *   onChange={(directOnly) => console.log(directOnly)}
 *   initialValue={false}
 *   variant="toggle"
 *   label="Vols directs uniquement"
 * />
 *
 * // Chips variant
 * <DirectFlightToggle
 *   onChange={(directOnly) => console.log(directOnly)}
 *   variant="chips"
 * />
 * ```
 */
export function DirectFlightToggle({
  onChange,
  initialValue = false,
  size = "md",
  disabled = false,
  variant = "chips",
  label,
}: DirectFlightToggleProps) {
  const [isDirectOnly, setIsDirectOnly] = useState(initialValue);

  const handleToggle = useCallback(() => {
    setIsDirectOnly((prev) => {
      const newValue = !prev;
      onChange(newValue);
      return newValue;
    });
  }, [onChange]);

  const handleChange = useCallback(
    (directOnly: boolean) => {
      setIsDirectOnly(directOnly);
      onChange(directOnly);
    },
    [onChange]
  );

  if (variant === "toggle") {
    return (
      <div className="flex items-center justify-between gap-3">
        {label && (
          <div className="flex items-center gap-2">
            <Plane size={16} className="text-muted-foreground" />
            <span className={cn("font-medium", size === "sm" ? "text-xs" : "text-sm")}>
              {label}
            </span>
          </div>
        )}
        <ToggleVersion
          isDirectOnly={isDirectOnly}
          onToggle={handleToggle}
          size={size}
          disabled={disabled}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && (
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </div>
      )}
      <ChipsVersion
        isDirectOnly={isDirectOnly}
        onChange={handleChange}
        size={size}
        disabled={disabled}
      />
    </div>
  );
}

/**
 * Extended version with stop count options
 */
interface StopCountSelectorProps {
  /** Callback when selection changes */
  onStopChange: (maxStops: number | null) => void;
  /** Initial max stops (null = any) */
  initialValue?: number | null;
  /** Custom options */
  options?: StopOption[];
  /** Size variant */
  size?: "sm" | "md";
  /** Disable interaction */
  disabled?: boolean;
  /** Label */
  label?: string;
}

export function StopCountSelector({
  onStopChange,
  initialValue = null,
  options = DEFAULT_STOP_OPTIONS,
  size = "md",
  disabled = false,
  label,
}: StopCountSelectorProps) {
  const [selectedValue, setSelectedValue] = useState<number | null>(initialValue);

  const handleSelect = useCallback(
    (value: number | null) => {
      setSelectedValue(value);
      onStopChange(value);
    },
    [onStopChange]
  );

  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedValue === option.value;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.value)}
              disabled={disabled}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border transition-all duration-200",
                "hover:scale-[1.02] active:scale-[0.98]",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                sizeClasses[size],
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                  : "bg-background text-foreground border-border hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <span className="font-medium whitespace-nowrap">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default DirectFlightToggle;
