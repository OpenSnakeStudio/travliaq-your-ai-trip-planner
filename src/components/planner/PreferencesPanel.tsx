/**
 * Preferences Panel v3 - Modular & Lazy Loaded
 * Features: Lazy-loaded steps, framer-motion animations, memoized components
 */

import { useState, lazy, Suspense, memo } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { usePreferenceMemory } from "@/contexts/preferences";
import { AIConflictBadge } from "./preferences";
import { StepIndicator, StepErrorBoundary, type Step } from "./preferences/widgets";

// Lazy-loaded steps for code splitting
const BaseStep = lazy(() => import("./preferences/steps/BaseStep"));
const StyleStep = lazy(() => import("./preferences/steps/StyleStep"));
const CriteriaStep = lazy(() => import("./preferences/steps/CriteriaStep"));

// ============================================================================
// STEP LOADER
// ============================================================================

const StepLoader = memo(function StepLoader() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="w-5 h-5 text-primary animate-spin" />
    </div>
  );
});

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const stepVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const stepTransition = {
  duration: 0.2,
  ease: "easeInOut",
};

// ============================================================================
// MAIN PANEL COMPONENT
// ============================================================================

const PreferencesPanel = memo(function PreferencesPanel() {
  const {
    memory: { preferences },
    getProfileCompletion,
    updatePreferences,
  } = usePreferenceMemory();

  const [currentStep, setCurrentStep] = useState<Step>("base");
  const completion = getProfileCompletion();

  return (
    <div className="space-y-4" data-tour="preferences-panel">
      {/* AI Conflict Badge */}
      <AIConflictBadge
        onApply={(field, value) => {
          updatePreferences({ [field]: value }, true);
        }}
      />

      {/* AI Detection Badge */}
      <AnimatePresence>
        {preferences.detectedFromChat && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-blue-700 dark:text-blue-400">
              Preferences detectees par l'IA
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step Indicator */}
      <StepIndicator
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        completion={completion}
      />

      {/* Animated Step Content */}
      <StepErrorBoundary onRetry={() => setCurrentStep(currentStep)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={stepTransition}
          >
            <Suspense fallback={<StepLoader />}>
              {currentStep === "base" && (
                <BaseStep onNextStep={() => setCurrentStep("style")} />
              )}
              {currentStep === "style" && (
                <StyleStep onNextStep={() => setCurrentStep("musts")} />
              )}
              {currentStep === "musts" && (
                <CriteriaStep onGoBack={() => setCurrentStep("base")} />
              )}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </StepErrorBoundary>
    </div>
  );
});

export default PreferencesPanel;
