/**
 * Preferences Panel v2 - Hub Central Intelligent
 * Features: Compact design, style equalizer, AI-generated summary
 */

import { useState } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  User,
  Sliders,
  Shield,
  Utensils,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePreferenceMemory } from "@/contexts/PreferenceMemoryContext";
import { 
  StyleEqualizer, 
  InterestPicker, 
  MustHavesSwitches, 
  TravelStyleSelector,
  OccasionSelector,
  PreferenceSummary,
} from "./preferences";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// ============================================================================
// STEP INDICATOR
// ============================================================================

type Step = "base" | "style" | "musts";

const STEPS: Array<{ id: Step; label: string; icon: React.ElementType }> = [
  { id: "base", label: "Base", icon: User },
  { id: "style", label: "Style", icon: Sliders },
  { id: "musts", label: "Critères", icon: Shield },
];

interface StepIndicatorProps {
  currentStep: Step;
  onStepChange: (step: Step) => void;
  completion: number;
}

function StepIndicator({ currentStep, onStepChange, completion }: StepIndicatorProps) {
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
            <span>{step.label}</span>
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
}

// ============================================================================
// SECTION HEADER
// ============================================================================

interface SectionHeaderProps {
  icon: React.ElementType;
  title: string;
  badge?: string;
}

function SectionHeader({ icon: Icon, title, badge }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center">
        <Icon className="h-3 w-3 text-primary" />
      </div>
      <span className="text-xs font-medium text-foreground">{title}</span>
      {badge && (
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
          {badge}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// MAIN PANEL COMPONENT
// ============================================================================

const PreferencesPanel = () => {
  const {
    memory: { preferences },
    setTravelStyle,
    setStyleAxis,
    toggleInterest,
    toggleMustHave,
    setOccasion,
    toggleDietaryRestriction,
    getProfileCompletion,
  } = usePreferenceMemory();

  const [currentStep, setCurrentStep] = useState<Step>("base");
  const [showDietary, setShowDietary] = useState(false);

  const completion = getProfileCompletion();

  return (
    <div className="space-y-4" data-tour="preferences-panel">
      {/* AI Detection Badge */}
      {preferences.detectedFromChat && (
        <div className="px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span className="text-xs text-blue-700 dark:text-blue-400">
            Préférences mises à jour par l'IA
          </span>
        </div>
      )}

      {/* Step Indicator */}
      <StepIndicator 
        currentStep={currentStep} 
        onStepChange={setCurrentStep}
        completion={completion}
      />

      {/* STEP 1: BASE */}
      {currentStep === "base" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Travel Style - Single line */}
          <div data-tour="preferences-widget">
            <SectionHeader icon={Users} title="Voyageurs" />
            <TravelStyleSelector
              selected={preferences.travelStyle}
              onSelect={setTravelStyle}
            />
          </div>

          {/* Occasion - Grid layout */}
          <div>
            <SectionHeader icon={Sparkles} title="Occasion du voyage" badge="optionnel" />
            <OccasionSelector
              selected={preferences.tripContext.occasion}
              onSelect={setOccasion}
            />
          </div>

          {/* AI Summary */}
          <PreferenceSummary />

          {/* Next step hint */}
          <button
            onClick={() => setCurrentStep("style")}
            className="w-full py-2.5 px-4 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
          >
            Définir votre style
            <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
          </button>
        </div>
      )}

      {/* STEP 2: STYLE (Equalizer) */}
      {currentStep === "style" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Style Equalizer */}
          <div>
            <SectionHeader icon={Sliders} title="Votre style de voyage" />
            <StyleEqualizer
              axes={preferences.styleAxes}
              onAxisChange={setStyleAxis}
            />
          </div>

          {/* Interests - Grid */}
          <div>
            <SectionHeader icon={Sparkles} title="Centres d'intérêt" />
            <InterestPicker
              selected={preferences.interests}
              onToggle={toggleInterest}
              maxSelections={5}
            />
          </div>

          {/* Next step hint */}
          <button
            onClick={() => setCurrentStep("musts")}
            className="w-full py-2.5 px-4 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
          >
            Définir vos critères
            <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
          </button>
        </div>
      )}

      {/* STEP 3: MUST-HAVES */}
      {currentStep === "musts" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Must-Haves - Grid */}
          <div>
            <SectionHeader icon={Shield} title="Critères obligatoires" />
            <MustHavesSwitches
              mustHaves={preferences.mustHaves}
              onToggle={toggleMustHave}
            />
          </div>

          {/* Dietary Restrictions (Collapsible) */}
          <Collapsible open={showDietary} onOpenChange={setShowDietary}>
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between py-2 px-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                <div className="flex items-center gap-2">
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Restrictions alimentaires</span>
                </div>
                {showDietary ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "vegetarian", label: "Végétarien" },
                  { id: "vegan", label: "Végan" },
                  { id: "halal", label: "Halal" },
                  { id: "kosher", label: "Kosher" },
                  { id: "gluten-free", label: "Sans gluten" },
                ].map((diet) => {
                  const isSelected = preferences.dietaryRestrictions.includes(diet.id);
                  return (
                    <button
                      key={diet.id}
                      onClick={() => toggleDietaryRestriction(diet.id)}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {diet.label}
                    </button>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Final summary in Base step - show button to go back */}
          <button
            onClick={() => setCurrentStep("base")}
            className="w-full py-2.5 px-4 rounded-xl bg-muted/50 text-muted-foreground text-sm font-medium hover:bg-muted hover:text-foreground transition-colors flex items-center justify-center gap-2"
          >
            <User className="w-4 h-4" />
            Voir le résumé
          </button>
        </div>
      )}
    </div>
  );
};

export default PreferencesPanel;
