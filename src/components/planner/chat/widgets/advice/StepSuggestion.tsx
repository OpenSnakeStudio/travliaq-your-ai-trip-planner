/**
 * StepSuggestion - Next step suggestion widget
 *
 * Suggests the next action to the user with a prominent call-to-action button.
 * Used to guide users through the planning workflow.
 */

import { cn } from "@/lib/utils";
import {
  Plane,
  Hotel,
  MapPin,
  Calendar,
  Users,
  Search,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

/**
 * Step type for different planning stages
 */
export type StepType =
  | "destination"
  | "dates"
  | "travelers"
  | "flights"
  | "hotels"
  | "activities"
  | "search"
  | "complete"
  | "custom";

/**
 * StepSuggestion props
 */
interface StepSuggestionProps {
  /** Step type (affects icon) */
  step: StepType;
  /** Main message */
  message: string;
  /** Button label */
  buttonLabel: string;
  /** Button click handler */
  onAction: () => void;
  /** Secondary/skip action */
  skipAction?: {
    label: string;
    onClick: () => void;
  };
  /** Show as completed step */
  completed?: boolean;
  /** Custom icon (for step="custom") */
  customIcon?: React.ReactNode;
  /** Size variant */
  size?: "sm" | "md";
  /** Disabled state */
  disabled?: boolean;
  /** Show sparkle effect for AI suggestion */
  aiSuggestion?: boolean;
}

/**
 * Get icon for step type
 */
function getStepIcon(step: StepType, size: number) {
  switch (step) {
    case "destination":
      return <MapPin size={size} />;
    case "dates":
      return <Calendar size={size} />;
    case "travelers":
      return <Users size={size} />;
    case "flights":
      return <Plane size={size} />;
    case "hotels":
      return <Hotel size={size} />;
    case "activities":
      return <MapPin size={size} />;
    case "search":
      return <Search size={size} />;
    case "complete":
      return <CheckCircle2 size={size} />;
    default:
      return <ArrowRight size={size} />;
  }
}

/**
 * StepSuggestion Component
 *
 * @example
 * ```tsx
 * <StepSuggestion
 *   step="dates"
 *   message="Maintenant, choisissons vos dates de voyage"
 *   buttonLabel="Sélectionner les dates"
 *   onAction={() => showDatePicker()}
 *   skipAction={{
 *     label: "Je suis flexible",
 *     onClick: () => setFlexibleDates(true)
 *   }}
 * />
 * ```
 */
export function StepSuggestion({
  step,
  message,
  buttonLabel,
  onAction,
  skipAction,
  completed = false,
  customIcon,
  size = "md",
  disabled = false,
  aiSuggestion = false,
}: StepSuggestionProps) {
  const iconSize = size === "sm" ? 16 : 18;
  const Icon = step === "custom" && customIcon ? customIcon : getStepIcon(step, iconSize);

  if (completed) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800",
          size === "sm" ? "px-3 py-2" : "px-4 py-3"
        )}
      >
        <CheckCircle2
          size={iconSize}
          className="text-green-600 dark:text-green-400 flex-shrink-0"
        />
        <span
          className={cn(
            "text-green-800 dark:text-green-200",
            size === "sm" ? "text-sm" : "text-base"
          )}
        >
          {message}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20",
        size === "sm" ? "p-3" : "p-4"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            "flex-shrink-0 rounded-full bg-primary/10 text-primary",
            size === "sm" ? "p-2" : "p-2.5"
          )}
        >
          {Icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* Message */}
          <p
            className={cn(
              "text-foreground font-medium",
              size === "sm" ? "text-sm" : "text-base"
            )}
          >
            {message}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-3">
            <button
              type="button"
              onClick={onAction}
              disabled={disabled}
              className={cn(
                "inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-medium transition-all",
                "hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                size === "sm" ? "px-4 py-1.5 text-sm" : "px-5 py-2 text-sm"
              )}
            >
              {buttonLabel}
              <ArrowRight size={14} />
            </button>

            {skipAction && (
              <button
                type="button"
                onClick={skipAction.onClick}
                disabled={disabled}
                className={cn(
                  "text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  size === "sm" ? "text-xs" : "text-sm"
                )}
              >
                {skipAction.label}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact inline step suggestion
 */
interface InlineStepSuggestionProps {
  message: string;
  buttonLabel: string;
  onAction: () => void;
  disabled?: boolean;
}

export function InlineStepSuggestion({
  message,
  buttonLabel,
  onAction,
  disabled = false,
}: InlineStepSuggestionProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2">
      <span className="text-sm text-muted-foreground">{message}</span>
      <button
        type="button"
        onClick={onAction}
        disabled={disabled}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 transition-all",
          "hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        )}
      >
        {buttonLabel}
        <ArrowRight size={12} />
      </button>
    </div>
  );
}

/**
 * Preset step suggestions for common workflow points
 */
export const STEP_SUGGESTIONS = {
  selectDestination: {
    step: "destination" as StepType,
    message: "Commençons par choisir votre destination",
    buttonLabel: "Choisir une destination",
  },
  selectDates: {
    step: "dates" as StepType,
    message: "Parfait ! Maintenant, sélectionnons vos dates de voyage",
    buttonLabel: "Choisir les dates",
  },
  selectTravelers: {
    step: "travelers" as StepType,
    message: "Combien de voyageurs serez-vous ?",
    buttonLabel: "Indiquer les voyageurs",
  },
  searchFlights: {
    step: "search" as StepType,
    message: "Tout est prêt ! Recherchons les meilleurs vols",
    buttonLabel: "Rechercher les vols",
  },
  selectHotel: {
    step: "hotels" as StepType,
    message: "Vol sélectionné ! Trouvons maintenant un hébergement",
    buttonLabel: "Voir les hôtels",
  },
  selectActivities: {
    step: "activities" as StepType,
    message: "Excellent choix ! Ajoutons des activités à votre séjour",
    buttonLabel: "Découvrir les activités",
  },
  tripComplete: {
    step: "complete" as StepType,
    message: "Votre voyage est prêt ! Voici le récapitulatif",
    buttonLabel: "Voir le récapitulatif",
  },
};

export default StepSuggestion;
