/**
 * ActionButtons - Reusable action buttons for result cards
 *
 * Includes AddToTripButton and QuickCompareButton for consistent
 * action handling across all result card types.
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Plus,
  Check,
  GitCompare,
  X,
  Loader2,
  ShoppingBag,
  Bookmark,
  BookmarkCheck,
  Share2,
  ExternalLink,
} from "lucide-react";

/**
 * Item type for context
 */
export type ResultItemType = "flight" | "hotel" | "activity" | "transfer" | "other";

/**
 * AddToTripButton props
 */
interface AddToTripButtonProps {
  /** Whether item is already added */
  isAdded?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Item type for context */
  itemType?: ResultItemType;
  /** Click handler */
  onClick: () => void;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Show label */
  showLabel?: boolean;
  /** Custom label */
  label?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Variant style */
  variant?: "primary" | "secondary" | "outline";
}

/**
 * AddToTripButton Component
 *
 * @example
 * ```tsx
 * <AddToTripButton
 *   isAdded={flight.selected}
 *   onClick={() => toggleFlightSelection(flight.id)}
 *   itemType="flight"
 *   showLabel
 * />
 * ```
 */
export function AddToTripButton({
  isAdded = false,
  isLoading = false,
  itemType = "other",
  onClick,
  size = "md",
  showLabel = false,
  label,
  disabled = false,
  variant = "primary",
}: AddToTripButtonProps) {
  const getLabel = () => {
    if (label) return label;
    if (isAdded) return "Ajouté";
    switch (itemType) {
      case "flight":
        return "Sélectionner ce vol";
      case "hotel":
        return "Réserver cet hôtel";
      case "activity":
        return "Ajouter cette activité";
      default:
        return "Ajouter au voyage";
    }
  };

  const sizeClasses = {
    sm: showLabel ? "px-3 py-1.5 text-xs gap-1.5" : "p-1.5",
    md: showLabel ? "px-4 py-2 text-sm gap-2" : "p-2",
    lg: showLabel ? "px-5 py-2.5 text-base gap-2" : "p-2.5",
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  };

  const variantClasses = {
    primary: isAdded
      ? "bg-primary text-primary-foreground"
      : "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: isAdded
      ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
      : "bg-muted text-foreground hover:bg-muted/80",
    outline: isAdded
      ? "border-primary bg-primary/10 text-primary"
      : "border-border bg-transparent text-foreground hover:bg-muted",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition-all",
        "hover:scale-[1.02] active:scale-[0.98]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        variant === "outline" && "border",
        sizeClasses[size],
        variantClasses[variant]
      )}
    >
      {isLoading ? (
        <Loader2 size={iconSizes[size]} className="animate-spin" />
      ) : isAdded ? (
        <Check size={iconSizes[size]} />
      ) : (
        <Plus size={iconSizes[size]} />
      )}
      {showLabel && <span>{getLabel()}</span>}
    </button>
  );
}

/**
 * QuickCompareButton props
 */
interface QuickCompareButtonProps {
  /** Whether item is in compare list */
  isComparing?: boolean;
  /** Click handler */
  onClick: () => void;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Show label */
  showLabel?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Compare count (items in list) */
  compareCount?: number;
  /** Max compare items */
  maxCompare?: number;
}

/**
 * QuickCompareButton Component
 *
 * @example
 * ```tsx
 * <QuickCompareButton
 *   isComparing={compareList.includes(hotel.id)}
 *   onClick={() => toggleCompare(hotel.id)}
 *   compareCount={compareList.length}
 *   maxCompare={4}
 * />
 * ```
 */
export function QuickCompareButton({
  isComparing = false,
  onClick,
  size = "md",
  showLabel = false,
  disabled = false,
  compareCount = 0,
  maxCompare = 4,
}: QuickCompareButtonProps) {
  const isMaxReached = compareCount >= maxCompare && !isComparing;

  const sizeClasses = {
    sm: showLabel ? "px-3 py-1.5 text-xs gap-1.5" : "p-1.5",
    md: showLabel ? "px-4 py-2 text-sm gap-2" : "p-2",
    lg: showLabel ? "px-5 py-2.5 text-base gap-2" : "p-2.5",
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isMaxReached}
      title={isMaxReached ? `Maximum ${maxCompare} éléments` : isComparing ? "Retirer de la comparaison" : "Comparer"}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition-all",
        "hover:scale-[1.02] active:scale-[0.98]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        sizeClasses[size],
        isComparing
          ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
          : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
      )}
    >
      {isComparing ? <X size={iconSizes[size]} /> : <GitCompare size={iconSizes[size]} />}
      {showLabel && <span>{isComparing ? "Retirer" : "Comparer"}</span>}
    </button>
  );
}

/**
 * SaveButton - Bookmark/save for later
 */
interface SaveButtonProps {
  isSaved?: boolean;
  onClick: () => void;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  disabled?: boolean;
}

export function SaveButton({
  isSaved = false,
  onClick,
  size = "md",
  showLabel = false,
  disabled = false,
}: SaveButtonProps) {
  const sizeClasses = {
    sm: showLabel ? "px-3 py-1.5 text-xs gap-1.5" : "p-1.5",
    md: showLabel ? "px-4 py-2 text-sm gap-2" : "p-2",
    lg: showLabel ? "px-5 py-2.5 text-base gap-2" : "p-2.5",
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={isSaved ? "Retirer des favoris" : "Sauvegarder"}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition-all",
        "hover:scale-[1.02] active:scale-[0.98]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        sizeClasses[size],
        isSaved
          ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
          : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
      )}
    >
      {isSaved ? (
        <BookmarkCheck size={iconSizes[size]} />
      ) : (
        <Bookmark size={iconSizes[size]} />
      )}
      {showLabel && <span>{isSaved ? "Sauvegardé" : "Sauvegarder"}</span>}
    </button>
  );
}

/**
 * ShareButton - Share result
 */
interface ShareButtonProps {
  onClick: () => void;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  disabled?: boolean;
}

export function ShareButton({
  onClick,
  size = "md",
  showLabel = false,
  disabled = false,
}: ShareButtonProps) {
  const sizeClasses = {
    sm: showLabel ? "px-3 py-1.5 text-xs gap-1.5" : "p-1.5",
    md: showLabel ? "px-4 py-2 text-sm gap-2" : "p-2",
    lg: showLabel ? "px-5 py-2.5 text-base gap-2" : "p-2.5",
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title="Partager"
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition-all",
        "hover:scale-[1.02] active:scale-[0.98]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        sizeClasses[size],
        "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
      )}
    >
      <Share2 size={iconSizes[size]} />
      {showLabel && <span>Partager</span>}
    </button>
  );
}

/**
 * ViewDetailsButton - Link to full details
 */
interface ViewDetailsButtonProps {
  onClick: () => void;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
  disabled?: boolean;
  external?: boolean;
}

export function ViewDetailsButton({
  onClick,
  size = "md",
  showLabel = true,
  label = "Voir détails",
  disabled = false,
  external = false,
}: ViewDetailsButtonProps) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2",
  };

  const iconSizes = {
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
        "inline-flex items-center justify-center font-medium transition-all",
        "text-primary hover:text-primary/80 hover:underline",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        sizeClasses[size]
      )}
    >
      <span>{label}</span>
      {external ? (
        <ExternalLink size={iconSizes[size]} />
      ) : (
        <span>→</span>
      )}
    </button>
  );
}

/**
 * ActionButtonGroup - Group of action buttons
 */
interface ActionButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function ActionButtonGroup({ children, className }: ActionButtonGroupProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {children}
    </div>
  );
}

export default AddToTripButton;
