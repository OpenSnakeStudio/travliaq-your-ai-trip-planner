/**
 * CabinClassSelector - Flight cabin class selection widget
 *
 * Allows users to select their preferred cabin class for flights.
 * Supports single selection with visual feedback.
 */

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

/**
 * Cabin class option
 */
export interface CabinClassOption {
  id: string;
  label: string;
  labelShort: string;
  /** API value to send */
  value: string;
  icon: string;
  description?: string;
}

/**
 * Default cabin class options
 */
export const CABIN_CLASS_OPTIONS: CabinClassOption[] = [
  {
    id: "economy",
    label: "Économique",
    labelShort: "Éco",
    value: "economy",
    icon: "💺",
    description: "Prix avantageux",
  },
  {
    id: "premium_economy",
    label: "Premium Éco",
    labelShort: "Premium",
    value: "premium_economy",
    icon: "🛋️",
    description: "Plus d'espace",
  },
  {
    id: "business",
    label: "Business",
    labelShort: "Business",
    value: "business",
    icon: "💼",
    description: "Confort supérieur",
  },
  {
    id: "first",
    label: "Première",
    labelShort: "1ère",
    value: "first",
    icon: "👑",
    description: "Luxe & exclusivité",
  },
];

/**
 * Simplified cabin options (3 choices)
 */
export const SIMPLE_CABIN_OPTIONS: CabinClassOption[] = [
  {
    id: "economy",
    label: "Économique",
    labelShort: "Éco",
    value: "economy",
    icon: "💺",
  },
  {
    id: "business",
    label: "Business",
    labelShort: "Business",
    value: "business",
    icon: "💼",
  },
  {
    id: "first",
    label: "Première",
    labelShort: "1ère",
    value: "first",
    icon: "👑",
  },
];

/**
 * Props for CabinClassSelector
 */
interface CabinClassSelectorProps {
  /** Callback when cabin class changes */
  onCabinChange: (cabin: CabinClassOption | null) => void;
  /** Initial selected cabin ID */
  initialSelected?: string;
  /** Custom cabin options */
  options?: CabinClassOption[];
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Disable interaction */
  disabled?: boolean;
  /** Label to display above */
  label?: string;
  /** Show descriptions */
  showDescriptions?: boolean;
  /** Allow deselection */
  allowDeselect?: boolean;
  /** Layout style */
  layout?: "chips" | "cards";
}

/**
 * CabinClassSelector Component
 *
 * @example
 * ```tsx
 * <CabinClassSelector
 *   onCabinChange={(cabin) => console.log(cabin?.value)}
 *   initialSelected="economy"
 *   label="Classe de voyage"
 * />
 * ```
 */
export function CabinClassSelector({
  onCabinChange,
  initialSelected = "economy",
  options = CABIN_CLASS_OPTIONS,
  size = "md",
  disabled = false,
  label,
  showDescriptions = false,
  allowDeselect = false,
  layout = "chips",
}: CabinClassSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(initialSelected);

  const handleSelect = useCallback(
    (optionId: string) => {
      setSelectedId((prev) => {
        const newId = allowDeselect && prev === optionId ? null : optionId;
        const selectedOption = newId
          ? options.find((opt) => opt.id === newId) || null
          : null;
        onCabinChange(selectedOption);
        return newId;
      });
    },
    [allowDeselect, options, onCabinChange]
  );

  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-3.5 py-2 text-sm",
    lg: "px-4 py-2.5 text-base",
  };

  if (layout === "cards") {
    return (
      <div className="space-y-2">
        {label && (
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          {options.map((option) => {
            const isSelected = selectedId === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option.id)}
                disabled={disabled}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200",
                  "hover:scale-[1.02] active:scale-[0.98]",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-foreground border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <span className="text-2xl mb-1">{option.icon}</span>
                <span className="font-medium text-sm">{option.label}</span>
                {showDescriptions && option.description && (
                  <span
                    className={cn(
                      "text-xs mt-0.5",
                      isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                    )}
                  >
                    {option.description}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Chips layout (default)
  return (
    <div className="space-y-2">
      {label && (
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedId === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id)}
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
              <span className="text-base leading-none">{option.icon}</span>
              <span className="font-medium whitespace-nowrap">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Helper: Get cabin class display name
 */
export function getCabinDisplayName(value: string): string {
  const option = CABIN_CLASS_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
}

/**
 * Helper: Get cabin class icon
 */
export function getCabinIcon(value: string): string {
  const option = CABIN_CLASS_OPTIONS.find((opt) => opt.value === value);
  return option?.icon || "💺";
}

export default CabinClassSelector;
