/**
 * BudgetRangeSlider - Budget range selection widget
 *
 * A dual-handle slider for selecting budget range with preset quick options.
 * Supports both slider and chip-based selection modes.
 */

import { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";

/**
 * Budget range value
 */
export interface BudgetRange {
  min: number;
  max: number;
}

/**
 * Preset budget option
 */
export interface BudgetPreset {
  id: string;
  label: string;
  range: BudgetRange;
  icon?: string;
}

/**
 * Default budget presets
 */
export const BUDGET_PRESETS: BudgetPreset[] = [
  { id: "budget", label: "Économique", range: { min: 0, max: 50 }, icon: "💰" },
  { id: "mid", label: "Modéré", range: { min: 50, max: 150 }, icon: "💵" },
  { id: "comfort", label: "Confort", range: { min: 150, max: 300 }, icon: "💳" },
  { id: "premium", label: "Premium", range: { min: 300, max: 500 }, icon: "💎" },
  { id: "luxury", label: "Luxe", range: { min: 500, max: 1000 }, icon: "👑" },
];

/**
 * Hotel budget presets
 */
export const HOTEL_BUDGET_PRESETS: BudgetPreset[] = [
  { id: "budget", label: "< 80€/nuit", range: { min: 0, max: 80 }, icon: "💰" },
  { id: "mid", label: "80-150€", range: { min: 80, max: 150 }, icon: "💵" },
  { id: "comfort", label: "150-250€", range: { min: 150, max: 250 }, icon: "💳" },
  { id: "premium", label: "> 250€", range: { min: 250, max: 1000 }, icon: "💎" },
];

/**
 * Activity budget presets
 */
export const ACTIVITY_BUDGET_PRESETS: BudgetPreset[] = [
  { id: "free", label: "Gratuit", range: { min: 0, max: 0 }, icon: "🆓" },
  { id: "cheap", label: "< 30€", range: { min: 0, max: 30 }, icon: "💰" },
  { id: "mid", label: "30-80€", range: { min: 30, max: 80 }, icon: "💵" },
  { id: "premium", label: "> 80€", range: { min: 80, max: 500 }, icon: "💎" },
];

/**
 * Props for BudgetRangeSlider
 */
interface BudgetRangeSliderProps {
  /** Callback when budget changes */
  onBudgetChange: (range: BudgetRange | null) => void;
  /** Initial budget range */
  initialRange?: BudgetRange;
  /** Minimum possible value */
  min?: number;
  /** Maximum possible value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Currency symbol */
  currency?: string;
  /** Presets to show */
  presets?: BudgetPreset[];
  /** Size variant */
  size?: "sm" | "md";
  /** Disable interaction */
  disabled?: boolean;
  /** Label */
  label?: string;
  /** Show slider */
  showSlider?: boolean;
  /** Per person or total */
  perPerson?: boolean;
}

/**
 * Format budget value for display
 */
function formatBudget(value: number, currency: string): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k${currency}`;
  }
  return `${value}${currency}`;
}

/**
 * BudgetRangeSlider Component
 *
 * @example
 * ```tsx
 * <BudgetRangeSlider
 *   onBudgetChange={(range) => console.log(range)}
 *   presets={HOTEL_BUDGET_PRESETS}
 *   label="Budget par nuit"
 *   currency="€"
 * />
 * ```
 */
export function BudgetRangeSlider({
  onBudgetChange,
  initialRange,
  min = 0,
  max = 1000,
  step = 10,
  currency = "€",
  presets = BUDGET_PRESETS,
  size = "md",
  disabled = false,
  label,
  showSlider = false,
  perPerson = false,
}: BudgetRangeSliderProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(() => {
    if (!initialRange) return null;
    const matching = presets.find(
      (p) => p.range.min === initialRange.min && p.range.max === initialRange.max
    );
    return matching?.id || null;
  });

  const [customRange, setCustomRange] = useState<BudgetRange>(
    initialRange || { min, max: Math.min(max, 500) }
  );

  const handlePresetClick = useCallback(
    (presetId: string) => {
      const preset = presets.find((p) => p.id === presetId);
      if (!preset) return;

      setSelectedPresetId((prev) => {
        const newId = prev === presetId ? null : presetId;
        if (newId) {
          setCustomRange(preset.range);
          onBudgetChange(preset.range);
        } else {
          onBudgetChange(null);
        }
        return newId;
      });
    },
    [presets, onBudgetChange]
  );

  const handleSliderChange = useCallback(
    (type: "min" | "max", value: number) => {
      setCustomRange((prev) => {
        const newRange = { ...prev };
        if (type === "min") {
          newRange.min = Math.min(value, prev.max - step);
        } else {
          newRange.max = Math.max(value, prev.min + step);
        }
        setSelectedPresetId(null);
        onBudgetChange(newRange);
        return newRange;
      });
    },
    [step, onBudgetChange]
  );

  const rangeDisplay = useMemo(() => {
    if (selectedPresetId) {
      const preset = presets.find((p) => p.id === selectedPresetId);
      return preset?.label || "";
    }
    if (customRange.min === min && customRange.max === max) {
      return "Tout budget";
    }
    return `${formatBudget(customRange.min, currency)} - ${formatBudget(customRange.max, currency)}`;
  }, [selectedPresetId, presets, customRange, min, max, currency]);

  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs gap-1",
    md: "px-3 py-1.5 text-sm gap-1.5",
  };

  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
            {perPerson && (
              <span className="text-muted-foreground/60 ml-1">/pers.</span>
            )}
          </span>
          {(selectedPresetId || showSlider) && (
            <span className="text-sm font-medium text-foreground">
              {rangeDisplay}
            </span>
          )}
        </div>
      )}

      {/* Preset chips */}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePresetClick(preset.id)}
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
              {preset.icon && (
                <span className="text-base leading-none">{preset.icon}</span>
              )}
              <span className="font-medium whitespace-nowrap">{preset.label}</span>
            </button>
          );
        })}
      </div>

      {/* Slider (optional) */}
      {showSlider && (
        <div className="space-y-2 pt-2">
          <div className="relative h-2 bg-muted rounded-full">
            {/* Track fill */}
            <div
              className="absolute h-full bg-primary rounded-full"
              style={{
                left: `${((customRange.min - min) / (max - min)) * 100}%`,
                right: `${100 - ((customRange.max - min) / (max - min)) * 100}%`,
              }}
            />
            {/* Min handle */}
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={customRange.min}
              onChange={(e) => handleSliderChange("min", Number(e.target.value))}
              disabled={disabled}
              className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
            />
            {/* Max handle */}
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={customRange.max}
              onChange={(e) => handleSliderChange("max", Number(e.target.value))}
              disabled={disabled}
              className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatBudget(min, currency)}</span>
            <span>{formatBudget(max, currency)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact budget selector (chips only)
 */
interface BudgetChipsProps {
  /** Callback when budget changes */
  onBudgetChange: (presetId: string | null, range: BudgetRange | null) => void;
  /** Initial selected preset */
  initialSelected?: string;
  /** Presets */
  presets?: BudgetPreset[];
  /** Size */
  size?: "sm" | "md";
  /** Disabled */
  disabled?: boolean;
  /** Label */
  label?: string;
  /** Multi-select */
  multiSelect?: boolean;
}

export function BudgetChips({
  onBudgetChange,
  initialSelected,
  presets = BUDGET_PRESETS,
  size = "md",
  disabled = false,
  label,
  multiSelect = false,
}: BudgetChipsProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initialSelected ? [initialSelected] : [])
  );

  const handleClick = useCallback(
    (presetId: string) => {
      const preset = presets.find((p) => p.id === presetId);
      if (!preset) return;

      setSelectedIds((prev) => {
        const newSet = new Set(prev);

        if (multiSelect) {
          if (newSet.has(presetId)) {
            newSet.delete(presetId);
          } else {
            newSet.add(presetId);
          }
        } else {
          if (newSet.has(presetId)) {
            newSet.clear();
          } else {
            newSet.clear();
            newSet.add(presetId);
          }
        }

        const selectedPreset = newSet.size === 1 ? presets.find((p) => newSet.has(p.id)) : null;
        onBudgetChange(
          selectedPreset?.id || null,
          selectedPreset?.range || null
        );

        return newSet;
      });
    },
    [multiSelect, presets, onBudgetChange]
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
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => {
          const isSelected = selectedIds.has(preset.id);
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleClick(preset.id)}
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
              {preset.icon && (
                <span className="text-base leading-none">{preset.icon}</span>
              )}
              <span className="font-medium whitespace-nowrap">{preset.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default BudgetRangeSlider;
