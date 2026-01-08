/**
 * QuickEditChips - Quick edit actions for trip parameters
 *
 * Provides clickable chips for quickly modifying trip details
 * like dates, travelers, airports, and budget.
 */

import { cn } from "@/lib/utils";
import {
  Calendar,
  Users,
  Plane,
  MapPin,
  Wallet,
  Clock,
  Star,
  Settings,
  Edit2,
  X,
  Plus,
} from "lucide-react";

/**
 * Edit action types
 */
export type EditAction =
  | "dates"
  | "travelers"
  | "departure_airport"
  | "arrival_airport"
  | "destination"
  | "budget"
  | "duration"
  | "preferences"
  | "filters"
  | "custom";

/**
 * Edit chip configuration
 */
export interface EditChip {
  id: string;
  action: EditAction;
  label: string;
  /** Current value to display */
  value?: string;
  /** Icon override */
  icon?: React.ElementType;
  /** Highlight as editable */
  highlighted?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * QuickEditChips props
 */
interface QuickEditChipsProps {
  /** Edit chips to display */
  chips: EditChip[];
  /** Click handler */
  onChipClick: (action: EditAction, chipId: string) => void;
  /** Size variant */
  size?: "sm" | "md";
  /** Layout variant */
  variant?: "chips" | "list" | "inline";
  /** Show edit icon on hover */
  showEditIcon?: boolean;
  /** Allow dismissing chips */
  dismissible?: boolean;
  /** Dismiss handler */
  onDismiss?: (chipId: string) => void;
}

/**
 * Get icon for action type
 */
function ActionIcon({ action, size = 14 }: { action: EditAction; size?: number }) {
  const icons: Record<EditAction, React.ElementType> = {
    dates: Calendar,
    travelers: Users,
    departure_airport: Plane,
    arrival_airport: Plane,
    destination: MapPin,
    budget: Wallet,
    duration: Clock,
    preferences: Star,
    filters: Settings,
    custom: Edit2,
  };

  const Icon = icons[action];
  return <Icon size={size} />;
}

/**
 * QuickEditChips Component
 *
 * @example
 * ```tsx
 * <QuickEditChips
 *   chips={[
 *     { id: "dates", action: "dates", label: "Dates", value: "15-22 juil." },
 *     { id: "travelers", action: "travelers", label: "Voyageurs", value: "2 adultes" },
 *     { id: "budget", action: "budget", label: "Budget", value: "2000€", highlighted: true },
 *   ]}
 *   onChipClick={(action) => openEditPanel(action)}
 * />
 * ```
 */
export function QuickEditChips({
  chips,
  onChipClick,
  size = "md",
  variant = "chips",
  showEditIcon = true,
  dismissible = false,
  onDismiss,
}: QuickEditChipsProps) {
  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs gap-1.5",
    md: "px-3 py-1.5 text-sm gap-2",
  };

  const iconSizes = {
    sm: 12,
    md: 14,
  };

  if (variant === "list") {
    return (
      <div className="space-y-1.5">
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => onChipClick(chip.action, chip.id)}
            disabled={chip.disabled}
            className={cn(
              "w-full flex items-center justify-between rounded-lg border transition-all",
              "hover:border-primary/50 hover:bg-muted/50",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              chip.highlighted ? "border-primary/30 bg-primary/5" : "border-border bg-background",
              size === "sm" ? "p-2" : "p-3"
            )}
          >
            <div className="flex items-center gap-2">
              {chip.icon ? (
                <chip.icon size={iconSizes[size]} className="text-muted-foreground" />
              ) : (
                <ActionIcon action={chip.action} size={iconSizes[size]} />
              )}
              <span className="font-medium text-foreground">{chip.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {chip.value && (
                <span className="text-muted-foreground">{chip.value}</span>
              )}
              {showEditIcon && (
                <Edit2
                  size={12}
                  className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                />
              )}
            </div>
          </button>
        ))}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-2 text-sm">
        {chips.map((chip, index) => (
          <span key={chip.id} className="flex items-center gap-1">
            {index > 0 && <span className="text-muted-foreground">·</span>}
            <button
              type="button"
              onClick={() => onChipClick(chip.action, chip.id)}
              disabled={chip.disabled}
              className={cn(
                "inline-flex items-center gap-1 transition-colors",
                "hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed",
                chip.highlighted ? "text-primary" : "text-foreground"
              )}
            >
              {chip.icon ? (
                <chip.icon size={12} />
              ) : (
                <ActionIcon action={chip.action} size={12} />
              )}
              {chip.value || chip.label}
            </button>
          </span>
        ))}
      </div>
    );
  }

  // Default chips variant
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <div key={chip.id} className="relative group">
          <button
            type="button"
            onClick={() => onChipClick(chip.action, chip.id)}
            disabled={chip.disabled}
            className={cn(
              "inline-flex items-center rounded-full border transition-all",
              "hover:scale-[1.02] active:scale-[0.98]",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
              chip.highlighted
                ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
                : "border-border bg-background text-foreground hover:border-primary/50",
              sizeClasses[size]
            )}
          >
            {chip.icon ? (
              <chip.icon size={iconSizes[size]} />
            ) : (
              <ActionIcon action={chip.action} size={iconSizes[size]} />
            )}
            <span className="font-medium">{chip.label}</span>
            {chip.value && (
              <>
                <span className="text-muted-foreground">:</span>
                <span className={cn(chip.highlighted ? "text-primary" : "text-muted-foreground")}>
                  {chip.value}
                </span>
              </>
            )}
            {showEditIcon && (
              <Edit2
                size={10}
                className="ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            )}
          </button>
          {dismissible && onDismiss && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(chip.id);
              }}
              className={cn(
                "absolute -top-1 -right-1 rounded-full bg-muted p-0.5",
                "opacity-0 group-hover:opacity-100 transition-opacity",
                "hover:bg-destructive hover:text-destructive-foreground"
              )}
            >
              <X size={10} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Common edit chip presets
 */
export const COMMON_EDIT_CHIPS: Omit<EditChip, "value">[] = [
  { id: "dates", action: "dates", label: "Dates" },
  { id: "travelers", action: "travelers", label: "Voyageurs" },
  { id: "departure", action: "departure_airport", label: "Départ" },
  { id: "destination", action: "destination", label: "Destination" },
  { id: "budget", action: "budget", label: "Budget" },
];

/**
 * Single edit button for inline use
 */
export function EditButton({
  label,
  value,
  action,
  onClick,
  size = "md",
  highlighted = false,
  disabled = false,
}: {
  label: string;
  value?: string;
  action: EditAction;
  onClick: () => void;
  size?: "sm" | "md";
  highlighted?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border transition-all group",
        "hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed",
        highlighted ? "border-primary/30 bg-primary/5" : "border-border bg-background",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"
      )}
    >
      <ActionIcon action={action} size={size === "sm" ? 12 : 14} />
      <span className="font-medium">{label}</span>
      {value && <span className="text-muted-foreground">{value}</span>}
      <Edit2
        size={10}
        className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </button>
  );
}

/**
 * Add new item chip
 */
export function AddChip({
  label,
  onClick,
  size = "md",
  disabled = false,
}: {
  label: string;
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
        "inline-flex items-center gap-1.5 rounded-full border border-dashed",
        "border-border text-muted-foreground hover:text-foreground hover:border-primary/50",
        "transition-all disabled:opacity-50 disabled:cursor-not-allowed",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"
      )}
    >
      <Plus size={size === "sm" ? 12 : 14} />
      <span>{label}</span>
    </button>
  );
}

/**
 * Trip parameters summary with edit capabilities
 */
export function TripParametersBar({
  destination,
  dates,
  travelers,
  budget,
  onEdit,
  size = "sm",
}: {
  destination?: string;
  dates?: string;
  travelers?: string;
  budget?: string;
  onEdit: (action: EditAction) => void;
  size?: "sm" | "md";
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
      {destination && (
        <button
          type="button"
          onClick={() => onEdit("destination")}
          className="inline-flex items-center gap-1 text-sm hover:text-primary transition-colors"
        >
          <MapPin size={14} className="text-muted-foreground" />
          {destination}
        </button>
      )}
      {dates && (
        <>
          {destination && <span className="text-muted-foreground">·</span>}
          <button
            type="button"
            onClick={() => onEdit("dates")}
            className="inline-flex items-center gap-1 text-sm hover:text-primary transition-colors"
          >
            <Calendar size={14} className="text-muted-foreground" />
            {dates}
          </button>
        </>
      )}
      {travelers && (
        <>
          {(destination || dates) && <span className="text-muted-foreground">·</span>}
          <button
            type="button"
            onClick={() => onEdit("travelers")}
            className="inline-flex items-center gap-1 text-sm hover:text-primary transition-colors"
          >
            <Users size={14} className="text-muted-foreground" />
            {travelers}
          </button>
        </>
      )}
      {budget && (
        <>
          {(destination || dates || travelers) && <span className="text-muted-foreground">·</span>}
          <button
            type="button"
            onClick={() => onEdit("budget")}
            className="inline-flex items-center gap-1 text-sm hover:text-primary transition-colors"
          >
            <Wallet size={14} className="text-muted-foreground" />
            {budget}
          </button>
        </>
      )}
      <button
        type="button"
        onClick={() => onEdit("filters")}
        className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
        title="Plus d'options"
      >
        <Settings size={14} />
      </button>
    </div>
  );
}

export default QuickEditChips;
