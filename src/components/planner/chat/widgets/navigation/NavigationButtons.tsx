/**
 * NavigationButtons - Action buttons for chat navigation
 *
 * Includes SearchAgainButton, ViewMoreButton, BackButton, ResetButton
 * for controlling the planning workflow from the chat.
 */

import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  RotateCcw,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Home,
  Loader2,
  Check,
  X,
} from "lucide-react";

/**
 * SearchAgainButton props
 */
interface SearchAgainButtonProps {
  /** Click handler */
  onClick: () => void;
  /** Loading state */
  isLoading?: boolean;
  /** Button label */
  label?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Variant style */
  variant?: "primary" | "secondary" | "outline" | "ghost";
  /** Disabled state */
  disabled?: boolean;
  /** Show icon */
  showIcon?: boolean;
}

/**
 * SearchAgainButton - Modify or redo search
 *
 * @example
 * ```tsx
 * <SearchAgainButton
 *   onClick={() => openSearchPanel()}
 *   label="Modifier la recherche"
 * />
 * ```
 */
export function SearchAgainButton({
  onClick,
  isLoading = false,
  label = "Modifier la recherche",
  size = "md",
  variant = "outline",
  disabled = false,
  showIcon = true,
}: SearchAgainButtonProps) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2",
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  };

  const variantClasses = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-muted text-foreground hover:bg-muted/80",
    outline: "border border-border bg-transparent hover:bg-muted",
    ghost: "hover:bg-muted",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all",
        "hover:scale-[1.01] active:scale-[0.99]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        sizeClasses[size],
        variantClasses[variant]
      )}
    >
      {showIcon && (
        isLoading ? (
          <Loader2 size={iconSizes[size]} className="animate-spin" />
        ) : (
          <Search size={iconSizes[size]} />
        )
      )}
      <span>{label}</span>
    </button>
  );
}

/**
 * ViewMoreButton props
 */
interface ViewMoreButtonProps {
  /** Click handler */
  onClick: () => void;
  /** Loading state */
  isLoading?: boolean;
  /** Remaining count */
  remainingCount?: number;
  /** Button label */
  label?: string;
  /** Size variant */
  size?: "sm" | "md";
  /** Variant style */
  variant?: "text" | "button" | "expand";
  /** Disabled state */
  disabled?: boolean;
}

/**
 * ViewMoreButton - Load more results
 *
 * @example
 * ```tsx
 * <ViewMoreButton
 *   onClick={() => loadMore()}
 *   remainingCount={24}
 *   variant="button"
 * />
 * ```
 */
export function ViewMoreButton({
  onClick,
  isLoading = false,
  remainingCount,
  label,
  size = "md",
  variant = "button",
  disabled = false,
}: ViewMoreButtonProps) {
  const getLabel = () => {
    if (label) return label;
    if (remainingCount !== undefined && remainingCount > 0) {
      return `Voir ${remainingCount} résultat${remainingCount > 1 ? "s" : ""} de plus`;
    }
    return "Voir plus";
  };

  const sizeClasses = {
    sm: variant === "text" ? "text-xs" : "px-3 py-1.5 text-xs gap-1.5",
    md: variant === "text" ? "text-sm" : "px-4 py-2 text-sm gap-2",
  };

  const iconSize = size === "sm" ? 14 : 16;

  if (variant === "text") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center gap-1 text-primary hover:text-primary/80",
          "transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
          sizeClasses[size]
        )}
      >
        {isLoading ? (
          <Loader2 size={iconSize} className="animate-spin" />
        ) : (
          <ChevronDown size={iconSize} />
        )}
        <span>{getLabel()}</span>
      </button>
    );
  }

  if (variant === "expand") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || isLoading}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-2 rounded-lg",
          "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground",
          "transition-all disabled:opacity-50 disabled:cursor-not-allowed",
          sizeClasses[size]
        )}
      >
        {isLoading ? (
          <Loader2 size={iconSize} className="animate-spin" />
        ) : (
          <ChevronDown size={iconSize} />
        )}
        <span>{getLabel()}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium",
        "border border-border bg-transparent hover:bg-muted",
        "transition-all hover:scale-[1.01] active:scale-[0.99]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        sizeClasses[size]
      )}
    >
      {isLoading ? (
        <Loader2 size={iconSize} className="animate-spin" />
      ) : (
        <ChevronDown size={iconSize} />
      )}
      <span>{getLabel()}</span>
    </button>
  );
}

/**
 * BackButton props
 */
interface BackButtonProps {
  /** Click handler */
  onClick: () => void;
  /** Button label */
  label?: string;
  /** Size variant */
  size?: "sm" | "md";
  /** Variant style */
  variant?: "text" | "button" | "icon";
  /** Disabled state */
  disabled?: boolean;
}

/**
 * BackButton - Go back to previous step
 *
 * @example
 * ```tsx
 * <BackButton
 *   onClick={() => goToPreviousStep()}
 *   label="Revenir aux dates"
 * />
 * ```
 */
export function BackButton({
  onClick,
  label = "Retour",
  size = "md",
  variant = "text",
  disabled = false,
}: BackButtonProps) {
  const sizeClasses = {
    sm: variant === "icon" ? "p-1.5" : "text-xs gap-1",
    md: variant === "icon" ? "p-2" : "text-sm gap-1.5",
  };

  const iconSize = size === "sm" ? 14 : 16;

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={label}
        className={cn(
          "inline-flex items-center justify-center rounded-full",
          "text-muted-foreground hover:text-foreground hover:bg-muted",
          "transition-all disabled:opacity-50 disabled:cursor-not-allowed",
          sizeClasses[size]
        )}
      >
        <ArrowLeft size={iconSize} />
      </button>
    );
  }

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "inline-flex items-center rounded-lg font-medium",
          "border border-border bg-transparent hover:bg-muted",
          "transition-all disabled:opacity-50 disabled:cursor-not-allowed",
          size === "sm" ? "px-3 py-1.5 text-xs gap-1.5" : "px-4 py-2 text-sm gap-2"
        )}
      >
        <ChevronLeft size={iconSize} />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center text-muted-foreground hover:text-foreground",
        "transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        sizeClasses[size]
      )}
    >
      <ChevronLeft size={iconSize} />
      <span>{label}</span>
    </button>
  );
}

/**
 * ResetButton props
 */
interface ResetButtonProps {
  /** Click handler */
  onClick: () => void;
  /** Button label */
  label?: string;
  /** Size variant */
  size?: "sm" | "md";
  /** Variant style */
  variant?: "text" | "button" | "icon";
  /** Confirmation required */
  confirmRequired?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * ResetButton - Reset planning/start over
 *
 * @example
 * ```tsx
 * <ResetButton
 *   onClick={() => resetPlanning()}
 *   confirmRequired
 * />
 * ```
 */
export function ResetButton({
  onClick,
  label = "Recommencer",
  size = "md",
  variant = "text",
  confirmRequired = false,
  disabled = false,
}: ResetButtonProps) {
  const handleClick = () => {
    if (confirmRequired) {
      if (window.confirm("Êtes-vous sûr de vouloir recommencer la planification ?")) {
        onClick();
      }
    } else {
      onClick();
    }
  };

  const iconSize = size === "sm" ? 14 : 16;

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        title={label}
        className={cn(
          "inline-flex items-center justify-center rounded-full",
          "text-muted-foreground hover:text-foreground hover:bg-muted",
          "transition-all disabled:opacity-50 disabled:cursor-not-allowed",
          size === "sm" ? "p-1.5" : "p-2"
        )}
      >
        <RotateCcw size={iconSize} />
      </button>
    );
  }

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          "inline-flex items-center rounded-lg font-medium",
          "border border-border bg-transparent hover:bg-muted",
          "transition-all disabled:opacity-50 disabled:cursor-not-allowed",
          size === "sm" ? "px-3 py-1.5 text-xs gap-1.5" : "px-4 py-2 text-sm gap-2"
        )}
      >
        <RotateCcw size={iconSize} />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center text-muted-foreground hover:text-foreground",
        "transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        size === "sm" ? "text-xs gap-1" : "text-sm gap-1.5"
      )}
    >
      <RotateCcw size={iconSize} />
      <span>{label}</span>
    </button>
  );
}

/**
 * RefreshButton - Refresh current results
 */
export function RefreshButton({
  onClick,
  isLoading = false,
  label = "Actualiser",
  size = "md",
  showLabel = false,
  disabled = false,
}: {
  onClick: () => void;
  isLoading?: boolean;
  label?: string;
  size?: "sm" | "md";
  showLabel?: boolean;
  disabled?: boolean;
}) {
  const iconSize = size === "sm" ? 14 : 16;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      title={label}
      className={cn(
        "inline-flex items-center justify-center rounded-full",
        "text-muted-foreground hover:text-foreground hover:bg-muted",
        "transition-all disabled:opacity-50 disabled:cursor-not-allowed",
        showLabel
          ? size === "sm" ? "px-3 py-1.5 text-xs gap-1.5" : "px-4 py-2 text-sm gap-2"
          : size === "sm" ? "p-1.5" : "p-2"
      )}
    >
      {isLoading ? (
        <Loader2 size={iconSize} className="animate-spin" />
      ) : (
        <RefreshCw size={iconSize} />
      )}
      {showLabel && <span>{label}</span>}
    </button>
  );
}

/**
 * HomeButton - Go back to start
 */
export function HomeButton({
  onClick,
  label = "Accueil",
  size = "md",
  showLabel = false,
  disabled = false,
}: {
  onClick: () => void;
  label?: string;
  size?: "sm" | "md";
  showLabel?: boolean;
  disabled?: boolean;
}) {
  const iconSize = size === "sm" ? 14 : 16;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={cn(
        "inline-flex items-center justify-center rounded-full",
        "text-muted-foreground hover:text-foreground hover:bg-muted",
        "transition-all disabled:opacity-50 disabled:cursor-not-allowed",
        showLabel
          ? size === "sm" ? "px-3 py-1.5 text-xs gap-1.5" : "px-4 py-2 text-sm gap-2"
          : size === "sm" ? "p-1.5" : "p-2"
      )}
    >
      <Home size={iconSize} />
      {showLabel && <span>{label}</span>}
    </button>
  );
}

/**
 * Navigation button group
 */
export function NavigationButtonGroup({
  children,
  className,
  align = "left",
}: {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right" | "between";
}) {
  const alignClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
    between: "justify-between",
  };

  return (
    <div className={cn("flex items-center gap-2", alignClasses[align], className)}>
      {children}
    </div>
  );
}

/**
 * Pagination controls for results
 */
export function PaginationControls({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  onPageChange,
  size = "md",
  showPageNumbers = true,
}: {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  onPageChange?: (page: number) => void;
  size?: "sm" | "md";
  showPageNumbers?: boolean;
}) {
  const iconSize = size === "sm" ? 14 : 16;
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onPrevious}
        disabled={!hasPrevious}
        className={cn(
          "inline-flex items-center justify-center rounded-full",
          "border border-border bg-transparent hover:bg-muted",
          "transition-all disabled:opacity-50 disabled:cursor-not-allowed",
          size === "sm" ? "p-1.5" : "p-2"
        )}
      >
        <ArrowLeft size={iconSize} />
      </button>

      {showPageNumbers && (
        <span className={cn("text-muted-foreground", size === "sm" ? "text-xs" : "text-sm")}>
          {currentPage} / {totalPages}
        </span>
      )}

      <button
        type="button"
        onClick={onNext}
        disabled={!hasNext}
        className={cn(
          "inline-flex items-center justify-center rounded-full",
          "border border-border bg-transparent hover:bg-muted",
          "transition-all disabled:opacity-50 disabled:cursor-not-allowed",
          size === "sm" ? "p-1.5" : "p-2"
        )}
      >
        <ArrowRight size={iconSize} />
      </button>
    </div>
  );
}

export default SearchAgainButton;
