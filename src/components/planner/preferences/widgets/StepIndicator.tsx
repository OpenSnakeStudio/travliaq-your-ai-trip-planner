/**
 * Step Indicator Component
 * Navigation tabs for preferences panel steps
 */

import { memo } from "react";
import { User, Sliders, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export type Step = "base" | "style" | "musts";

interface StepConfig {
  id: Step;
  labelKey: string;
  icon: React.ElementType;
}

const STEPS: StepConfig[] = [
  { id: "base", labelKey: "planner.preferences.steps.base", icon: User },
  { id: "style", labelKey: "planner.preferences.steps.style", icon: Sliders },
  { id: "musts", labelKey: "planner.preferences.steps.criteria", icon: Shield },
];

interface StepIndicatorProps {
  currentStep: Step;
  onStepChange: (step: Step) => void;
  completion: number;
}

export const StepIndicator = memo(function StepIndicator({
  currentStep,
  onStepChange,
  completion
}: StepIndicatorProps) {
  const { t } = useTranslation();
  const currentIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/30">
      {STEPS.map((step, index) => {
        const Icon = step.icon;
        const isActive = step.id === currentStep;
        const isPast = index < currentIndex;

        return (
          <button
            key={step.id}
            onClick={() => onStepChange(step.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              isActive
                ? "bg-primary text-primary-foreground"
                : isPast
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{t(step.labelKey)}</span>
          </button>
        );
      })}

      {/* Mini completion indicator */}
      <div className={cn(
        "flex items-center gap-1 text-xs font-medium",
        completion >= 75 ? "text-green-500" : "text-muted-foreground"
      )}>
        <span>{completion}%</span>
      </div>
    </div>
  );
});

export default StepIndicator;
