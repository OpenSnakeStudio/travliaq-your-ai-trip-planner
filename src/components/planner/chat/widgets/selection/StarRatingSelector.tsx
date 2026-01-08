/**
 * StarRatingSelector - Interactive star rating selector for hotels
 *
 * Allows users to filter hotels by star rating with visual star icons.
 * Supports single or multi-select modes.
 */

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

/**
 * Props for StarRatingSelector
 */
interface StarRatingSelectorProps {
  /** Callback when rating selection changes */
  onRatingChange: (ratings: number[]) => void;
  /** Initial selected ratings */
  initialRatings?: number[];
  /** Allow multiple selections (default: true) */
  multiSelect?: boolean;
  /** Minimum stars to show (default: 1) */
  minStars?: number;
  /** Maximum stars to show (default: 5) */
  maxStars?: number;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Disable interaction */
  disabled?: boolean;
  /** Show "Any" option */
  showAnyOption?: boolean;
  /** Label to display above */
  label?: string;
}

/**
 * Individual star rating button
 */
function StarRatingButton({
  rating,
  isSelected,
  onClick,
  size = "md",
  disabled = false,
}: {
  rating: number;
  isSelected: boolean;
  onClick: () => void;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}) {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-0.5",
    md: "px-3 py-1.5 text-sm gap-1",
    lg: "px-4 py-2 text-base gap-1.5",
  };

  const starSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center rounded-full border transition-all duration-200",
        "hover:scale-[1.02] active:scale-[0.98]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        sizeClasses[size],
        isSelected
          ? "bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-500/20"
          : "bg-background text-foreground border-border hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20"
      )}
    >
      {Array.from({ length: rating }).map((_, i) => (
        <Star
          key={i}
          size={starSizes[size]}
          className={cn(
            "fill-current",
            isSelected ? "text-white" : "text-amber-400"
          )}
        />
      ))}
      <span className="font-medium ml-0.5">{rating}</span>
    </button>
  );
}

/**
 * StarRatingSelector Component
 *
 * @example
 * ```tsx
 * <StarRatingSelector
 *   onRatingChange={(ratings) => console.log(ratings)}
 *   initialRatings={[4, 5]}
 *   multiSelect={true}
 *   label="Catégorie d'hôtel"
 * />
 * ```
 */
export function StarRatingSelector({
  onRatingChange,
  initialRatings = [],
  multiSelect = true,
  minStars = 2,
  maxStars = 5,
  size = "md",
  disabled = false,
  showAnyOption = false,
  label,
}: StarRatingSelectorProps) {
  const [selectedRatings, setSelectedRatings] = useState<Set<number>>(
    new Set(initialRatings)
  );
  const [anySelected, setAnySelected] = useState(initialRatings.length === 0 && showAnyOption);

  const handleRatingClick = useCallback(
    (rating: number) => {
      setSelectedRatings((prev) => {
        const newSet = new Set(prev);

        if (multiSelect) {
          if (newSet.has(rating)) {
            newSet.delete(rating);
          } else {
            newSet.add(rating);
          }
        } else {
          if (newSet.has(rating)) {
            newSet.clear();
          } else {
            newSet.clear();
            newSet.add(rating);
          }
        }

        setAnySelected(false);
        onRatingChange(Array.from(newSet).sort());
        return newSet;
      });
    },
    [multiSelect, onRatingChange]
  );

  const handleAnyClick = useCallback(() => {
    setAnySelected(true);
    setSelectedRatings(new Set());
    onRatingChange([]);
  }, [onRatingChange]);

  // Generate rating options
  const ratings = Array.from(
    { length: maxStars - minStars + 1 },
    (_, i) => minStars + i
  );

  return (
    <div className="space-y-2">
      {label && (
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {showAnyOption && (
          <button
            type="button"
            onClick={handleAnyClick}
            disabled={disabled}
            className={cn(
              "inline-flex items-center rounded-full border transition-all duration-200",
              "hover:scale-[1.02] active:scale-[0.98]",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
              size === "sm" ? "px-2.5 py-1 text-xs" : size === "lg" ? "px-4 py-2 text-base" : "px-3 py-1.5 text-sm",
              anySelected
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background text-foreground border-border hover:border-primary/50 hover:bg-muted/50"
            )}
          >
            Tous
          </button>
        )}
        {ratings.map((rating) => (
          <StarRatingButton
            key={rating}
            rating={rating}
            isSelected={selectedRatings.has(rating)}
            onClick={() => handleRatingClick(rating)}
            size={size}
            disabled={disabled}
          />
        ))}
      </div>
      {multiSelect && selectedRatings.size > 0 && (
        <div className="text-xs text-muted-foreground">
          {selectedRatings.size} catégorie{selectedRatings.size > 1 ? "s" : ""} sélectionnée{selectedRatings.size > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

export default StarRatingSelector;
