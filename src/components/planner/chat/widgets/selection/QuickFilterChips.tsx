/**
 * QuickFilterChips - Clickable filter chips for quick filtering
 *
 * Used after results are displayed to allow quick filtering without typing.
 * Supports multiple chip types: price, ratings, amenities, duration, etc.
 */

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

/**
 * Single filter chip configuration
 */
export interface FilterChip {
  id: string;
  label: string;
  value: string | number | boolean;
  icon?: string; // Emoji or icon
  active?: boolean;
}

/**
 * Filter chip group configuration
 */
export interface FilterChipGroup {
  id: string;
  label?: string;
  chips: FilterChip[];
  multiSelect?: boolean; // Allow multiple selections (default: true)
  required?: boolean; // At least one must be selected
}

/**
 * Props for QuickFilterChips
 */
interface QuickFilterChipsProps {
  /** Groups of filter chips to display */
  groups: FilterChipGroup[];
  /** Callback when filters change */
  onFilterChange: (filters: Record<string, (string | number | boolean)[]>) => void;
  /** Optional: Show as inline (horizontal scroll) or wrapped */
  layout?: "inline" | "wrap";
  /** Optional: Size variant */
  size?: "sm" | "md";
  /** Optional: Disable all chips */
  disabled?: boolean;
  /** Optional: Show clear all button */
  showClearAll?: boolean;
}

/**
 * Individual chip button component
 */
function ChipButton({
  chip,
  isActive,
  onClick,
  size = "md",
  disabled = false,
}: {
  chip: FilterChip;
  isActive: boolean;
  onClick: () => void;
  size?: "sm" | "md";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border transition-all duration-200",
        "hover:scale-[1.02] active:scale-[0.98]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm",
        isActive
          ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
          : "bg-background text-foreground border-border hover:border-primary/50 hover:bg-muted/50"
      )}
    >
      {chip.icon && <span className="text-base leading-none">{chip.icon}</span>}
      <span className="font-medium whitespace-nowrap">{chip.label}</span>
    </button>
  );
}

/**
 * QuickFilterChips Component
 *
 * @example
 * ```tsx
 * <QuickFilterChips
 *   groups={[
 *     {
 *       id: "price",
 *       label: "Prix",
 *       chips: [
 *         { id: "cheap", label: "< 100€", value: 100, icon: "💰" },
 *         { id: "mid", label: "100-200€", value: 200, icon: "💵" },
 *         { id: "premium", label: "> 200€", value: 300, icon: "💎" },
 *       ],
 *     },
 *     {
 *       id: "amenities",
 *       label: "Équipements",
 *       chips: [
 *         { id: "wifi", label: "WiFi", value: "wifi", icon: "📶" },
 *         { id: "pool", label: "Piscine", value: "pool", icon: "🏊" },
 *         { id: "breakfast", label: "Petit-déj", value: "breakfast", icon: "🥐" },
 *       ],
 *       multiSelect: true,
 *     },
 *   ]}
 *   onFilterChange={(filters) => console.log(filters)}
 * />
 * ```
 */
export function QuickFilterChips({
  groups,
  onFilterChange,
  layout = "wrap",
  size = "md",
  disabled = false,
  showClearAll = false,
}: QuickFilterChipsProps) {
  // Track active filters by group
  const [activeFilters, setActiveFilters] = useState<Record<string, Set<string>>>(() => {
    const initial: Record<string, Set<string>> = {};
    groups.forEach((group) => {
      const activeChips = group.chips.filter((c) => c.active).map((c) => c.id);
      initial[group.id] = new Set(activeChips);
    });
    return initial;
  });

  // Handle chip click
  const handleChipClick = useCallback(
    (groupId: string, chipId: string, multiSelect: boolean) => {
      setActiveFilters((prev) => {
        const newFilters = { ...prev };
        const currentSet = new Set(prev[groupId] || []);

        if (multiSelect) {
          // Toggle the chip
          if (currentSet.has(chipId)) {
            currentSet.delete(chipId);
          } else {
            currentSet.add(chipId);
          }
        } else {
          // Single select - clear others and set this one (or toggle off)
          if (currentSet.has(chipId)) {
            currentSet.clear();
          } else {
            currentSet.clear();
            currentSet.add(chipId);
          }
        }

        newFilters[groupId] = currentSet;

        // Convert to output format and notify
        const outputFilters: Record<string, (string | number | boolean)[]> = {};
        groups.forEach((group) => {
          const activeChipIds = newFilters[group.id] || new Set();
          outputFilters[group.id] = group.chips
            .filter((c) => activeChipIds.has(c.id))
            .map((c) => c.value);
        });
        onFilterChange(outputFilters);

        return newFilters;
      });
    },
    [groups, onFilterChange]
  );

  // Clear all filters
  const handleClearAll = useCallback(() => {
    const clearedFilters: Record<string, Set<string>> = {};
    groups.forEach((group) => {
      clearedFilters[group.id] = new Set();
    });
    setActiveFilters(clearedFilters);

    const emptyOutput: Record<string, (string | number | boolean)[]> = {};
    groups.forEach((group) => {
      emptyOutput[group.id] = [];
    });
    onFilterChange(emptyOutput);
  }, [groups, onFilterChange]);

  // Check if any filter is active
  const hasActiveFilters = Object.values(activeFilters).some((set) => set.size > 0);

  return (
    <div className="mt-3 space-y-3">
      {groups.map((group) => (
        <div key={group.id} className="space-y-1.5">
          {group.label && (
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {group.label}
            </div>
          )}
          <div
            className={cn(
              "flex gap-2",
              layout === "inline"
                ? "overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1"
                : "flex-wrap"
            )}
          >
            {group.chips.map((chip) => (
              <ChipButton
                key={chip.id}
                chip={chip}
                isActive={activeFilters[group.id]?.has(chip.id) || false}
                onClick={() =>
                  handleChipClick(group.id, chip.id, group.multiSelect ?? true)
                }
                size={size}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      ))}

      {showClearAll && hasActiveFilters && (
        <button
          type="button"
          onClick={handleClearAll}
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
        >
          Effacer tous les filtres
        </button>
      )}
    </div>
  );
}

// ==========================================
// Preset Filter Configurations
// ==========================================

/**
 * Preset: Price filters for hotels/activities
 */
export const PRICE_FILTER_CHIPS: FilterChip[] = [
  { id: "budget", label: "< 50€", value: 50, icon: "💰" },
  { id: "mid", label: "50-100€", value: 100, icon: "💵" },
  { id: "comfort", label: "100-200€", value: 200, icon: "💳" },
  { id: "premium", label: "> 200€", value: 300, icon: "💎" },
];

/**
 * Preset: Star rating filters for hotels
 */
export const STAR_RATING_CHIPS: FilterChip[] = [
  { id: "3star", label: "3★", value: 3 },
  { id: "4star", label: "4★", value: 4 },
  { id: "5star", label: "5★", value: 5 },
];

/**
 * Preset: Hotel amenities filters
 */
export const HOTEL_AMENITY_CHIPS: FilterChip[] = [
  { id: "wifi", label: "WiFi", value: "wifi", icon: "📶" },
  { id: "pool", label: "Piscine", value: "pool", icon: "🏊" },
  { id: "breakfast", label: "Petit-déj", value: "breakfast", icon: "🥐" },
  { id: "parking", label: "Parking", value: "parking", icon: "🅿️" },
  { id: "ac", label: "Climatisation", value: "ac", icon: "❄️" },
  { id: "gym", label: "Salle de sport", value: "gym", icon: "🏋️" },
];

/**
 * Preset: Activity duration filters
 */
export const DURATION_CHIPS: FilterChip[] = [
  { id: "short", label: "< 1h", value: 60, icon: "⚡" },
  { id: "medium", label: "1-4h", value: 240, icon: "⏱️" },
  { id: "halfday", label: "Demi-journée", value: 360, icon: "🌤️" },
  { id: "fullday", label: "Journée", value: 480, icon: "☀️" },
];

/**
 * Preset: Time of day filters
 */
export const TIME_OF_DAY_CHIPS: FilterChip[] = [
  { id: "morning", label: "Matin", value: "morning", icon: "🌅" },
  { id: "afternoon", label: "Après-midi", value: "afternoon", icon: "☀️" },
  { id: "evening", label: "Soir", value: "evening", icon: "🌆" },
];

/**
 * Preset: Flight cabin class filters
 */
export const CABIN_CLASS_CHIPS: FilterChip[] = [
  { id: "economy", label: "Économique", value: "economy", icon: "💺" },
  { id: "premium", label: "Premium", value: "premium_economy", icon: "🛋️" },
  { id: "business", label: "Business", value: "business", icon: "💼" },
  { id: "first", label: "Première", value: "first", icon: "👑" },
];

/**
 * Preset: Flight type filters
 */
export const FLIGHT_TYPE_CHIPS: FilterChip[] = [
  { id: "direct", label: "Direct", value: true, icon: "✈️" },
  { id: "1stop", label: "1 escale", value: 1, icon: "🔄" },
];

export default QuickFilterChips;
