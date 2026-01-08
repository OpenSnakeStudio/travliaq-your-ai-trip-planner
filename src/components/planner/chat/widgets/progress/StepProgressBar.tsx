/**
 * StepProgressBar - Visual progress indicator for planning workflow
 *
 * Shows the current step in the travel planning process with
 * a visual progress bar and step indicators.
 */

import { cn } from "@/lib/utils";
import {
  MapPin,
  Calendar,
  Users,
  Plane,
  Hotel,
  Compass,
  CheckCircle2,
  Circle,
} from "lucide-react";

/**
 * Step definition
 */
export interface ProgressStep {
  id: string;
  label: string;
  labelShort?: string;
  icon?: "destination" | "dates" | "travelers" | "flights" | "hotels" | "activities" | "custom";
  status: "completed" | "current" | "upcoming";
}

/**
 * Default planning steps
 */
export const DEFAULT_PLANNING_STEPS: Omit<ProgressStep, "status">[] = [
  { id: "destination", label: "Destination", labelShort: "Dest.", icon: "destination" },
  { id: "dates", label: "Dates", labelShort: "Dates", icon: "dates" },
  { id: "travelers", label: "Voyageurs", labelShort: "Voy.", icon: "travelers" },
  { id: "flights", label: "Vols", labelShort: "Vols", icon: "flights" },
  { id: "hotels", label: "Hébergement", labelShort: "Hôtel", icon: "hotels" },
  { id: "activities", label: "Activités", labelShort: "Act.", icon: "activities" },
];

/**
 * StepProgressBar props
 */
interface StepProgressBarProps {
  /** Steps with their status */
  steps: ProgressStep[];
  /** Current step index (0-based) */
  currentStep?: number;
  /** Variant style */
  variant?: "dots" | "bar" | "steps";
  /** Size */
  size?: "sm" | "md";
  /** Show labels */
  showLabels?: boolean;
  /** Clickable steps */
  onStepClick?: (stepId: string, index: number) => void;
  /** Compact mode (horizontal scroll) */
  compact?: boolean;
}

/**
 * Get icon for step type
 */
function StepIcon({ type, size = 16 }: { type: ProgressStep["icon"]; size?: number }) {
  switch (type) {
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
      return <Compass size={size} />;
    default:
      return <Circle size={size} />;
  }
}

/**
 * Dots variant - Simple dot indicators
 */
function DotsVariant({
  steps,
  size,
  onStepClick,
}: {
  steps: ProgressStep[];
  size: "sm" | "md";
  onStepClick?: StepProgressBarProps["onStepClick"];
}) {
  const dotSize = size === "sm" ? "w-2 h-2" : "w-3 h-3";

  return (
    <div className="flex items-center gap-1.5">
      {steps.map((step, index) => (
        <button
          key={step.id}
          type="button"
          onClick={() => onStepClick?.(step.id, index)}
          disabled={!onStepClick}
          className={cn(
            "rounded-full transition-all",
            dotSize,
            step.status === "completed" && "bg-primary",
            step.status === "current" && "bg-primary ring-2 ring-primary/30",
            step.status === "upcoming" && "bg-muted",
            onStepClick && "cursor-pointer hover:scale-125"
          )}
          aria-label={step.label}
        />
      ))}
    </div>
  );
}

/**
 * Bar variant - Progress bar with percentage
 */
function BarVariant({
  steps,
  size,
}: {
  steps: ProgressStep[];
  size: "sm" | "md";
}) {
  const completedCount = steps.filter((s) => s.status === "completed").length;
  const currentIndex = steps.findIndex((s) => s.status === "current");
  const progress = currentIndex >= 0
    ? ((completedCount + 0.5) / steps.length) * 100
    : (completedCount / steps.length) * 100;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className={cn("text-muted-foreground", size === "sm" ? "text-xs" : "text-sm")}>
          Étape {completedCount + (currentIndex >= 0 ? 1 : 0)}/{steps.length}
        </span>
        <span className={cn("font-medium", size === "sm" ? "text-xs" : "text-sm")}>
          {Math.round(progress)}%
        </span>
      </div>
      <div className={cn("w-full rounded-full bg-muted overflow-hidden", size === "sm" ? "h-1.5" : "h-2")}>
        <div
          className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Steps variant - Full step indicators with icons
 */
function StepsVariant({
  steps,
  size,
  showLabels,
  onStepClick,
  compact,
}: {
  steps: ProgressStep[];
  size: "sm" | "md";
  showLabels: boolean;
  onStepClick?: StepProgressBarProps["onStepClick"];
  compact: boolean;
}) {
  const iconSize = size === "sm" ? 14 : 16;
  const circleSize = size === "sm" ? "w-6 h-6" : "w-8 h-8";

  return (
    <div
      className={cn(
        "flex items-center",
        compact ? "overflow-x-auto pb-1 gap-1" : "justify-between gap-2"
      )}
    >
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          {/* Step indicator */}
          <button
            type="button"
            onClick={() => onStepClick?.(step.id, index)}
            disabled={!onStepClick}
            className={cn(
              "flex flex-col items-center gap-1",
              onStepClick && "cursor-pointer group"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center rounded-full transition-all",
                circleSize,
                step.status === "completed" && "bg-primary text-primary-foreground",
                step.status === "current" && "bg-primary/20 text-primary ring-2 ring-primary",
                step.status === "upcoming" && "bg-muted text-muted-foreground",
                onStepClick && "group-hover:scale-110"
              )}
            >
              {step.status === "completed" ? (
                <CheckCircle2 size={iconSize} />
              ) : (
                <StepIcon type={step.icon} size={iconSize} />
              )}
            </div>
            {showLabels && (
              <span
                className={cn(
                  "whitespace-nowrap",
                  size === "sm" ? "text-[10px]" : "text-xs",
                  step.status === "current" ? "text-primary font-medium" : "text-muted-foreground"
                )}
              >
                {compact ? step.labelShort || step.label : step.label}
              </span>
            )}
          </button>

          {/* Connector line */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                "flex-1 mx-1",
                size === "sm" ? "h-0.5 min-w-4" : "h-0.5 min-w-6",
                index < steps.findIndex((s) => s.status === "current") ||
                  (steps.findIndex((s) => s.status === "current") === -1 &&
                    step.status === "completed")
                  ? "bg-primary"
                  : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * StepProgressBar Component
 *
 * @example
 * ```tsx
 * <StepProgressBar
 *   steps={[
 *     { id: "dest", label: "Destination", icon: "destination", status: "completed" },
 *     { id: "dates", label: "Dates", icon: "dates", status: "current" },
 *     { id: "travelers", label: "Voyageurs", icon: "travelers", status: "upcoming" },
 *   ]}
 *   variant="steps"
 *   showLabels
 * />
 * ```
 */
export function StepProgressBar({
  steps,
  variant = "steps",
  size = "md",
  showLabels = true,
  onStepClick,
  compact = false,
}: StepProgressBarProps) {
  if (variant === "dots") {
    return <DotsVariant steps={steps} size={size} onStepClick={onStepClick} />;
  }

  if (variant === "bar") {
    return <BarVariant steps={steps} size={size} />;
  }

  return (
    <StepsVariant
      steps={steps}
      size={size}
      showLabels={showLabels}
      onStepClick={onStepClick}
      compact={compact}
    />
  );
}

/**
 * Helper: Create steps from current step index
 */
export function createStepsFromIndex(
  currentIndex: number,
  stepDefinitions: Omit<ProgressStep, "status">[] = DEFAULT_PLANNING_STEPS
): ProgressStep[] {
  return stepDefinitions.map((step, index) => ({
    ...step,
    status:
      index < currentIndex
        ? "completed"
        : index === currentIndex
        ? "current"
        : "upcoming",
  }));
}

/**
 * Compact inline progress indicator
 */
export function InlineProgress({
  current,
  total,
  label,
}: {
  current: number;
  total: number;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex items-center gap-1">
        <span className="font-medium text-primary">{current}</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-muted-foreground">{total}</span>
      </div>
      {label && <span className="text-muted-foreground">{label}</span>}
      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden min-w-[60px]">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default StepProgressBar;
