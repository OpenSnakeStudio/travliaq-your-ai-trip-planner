/**
 * Preferences Panel v2.1 - Hub Central Intelligent
 * Features: Compact design, style equalizer, AI-generated summary, quick presets
 */

import { useState, useCallback } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  User,
  Sliders,
  Shield,
  Utensils,
  Users,
  Heart,
  PartyPopper,
  Briefcase,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePreferenceMemory, type TravelStyle, type StyleAxes, type TripContext } from "@/contexts/PreferenceMemoryContext";
import { 
  StyleEqualizer, 
  InterestPicker, 
  MustHavesSwitches, 
  TravelStyleSelector,
  OccasionSelector,
  PreferenceSummary,
  DietaryPicker,
  AIConflictBadge,
} from "./preferences";
import { eventBus } from "@/lib/eventBus";

// ============================================================================
// QUICK PRESETS
// ============================================================================

interface PresetConfig {
  id: string;
  label: string;
  emoji: string;
  icon: React.ElementType;
  travelStyle: TravelStyle;
  styleAxes: Partial<StyleAxes>;
  interests: string[];
  occasion?: TripContext["occasion"];
  color: string;
}

const QUICK_PRESETS: PresetConfig[] = [
  {
    id: "romantic",
    label: "Escapade romantique",
    emoji: "💑",
    icon: Heart,
    travelStyle: "couple",
    styleAxes: { chillVsIntense: 30, ecoVsLuxury: 75, cityVsNature: 50 },
    interests: ["food", "wellness", "culture"],
    occasion: "honeymoon",
    color: "rose",
  },
  {
    id: "adventure",
    label: "Aventure entre amis",
    emoji: "🎒",
    icon: PartyPopper,
    travelStyle: "friends",
    styleAxes: { chillVsIntense: 80, ecoVsLuxury: 35, cityVsNature: 70, touristVsLocal: 65 },
    interests: ["adventure", "nature", "nightlife"],
    occasion: "vacation",
    color: "orange",
  },
  {
    id: "family",
    label: "Vacances en famille",
    emoji: "👨‍👩‍👧‍👦",
    icon: Users,
    travelStyle: "family",
    styleAxes: { chillVsIntense: 40, ecoVsLuxury: 55, cityVsNature: 45 },
    interests: ["culture", "beach", "nature"],
    occasion: "vacation",
    color: "blue",
  },
  {
    id: "workation",
    label: "Workation",
    emoji: "💻",
    icon: Briefcase,
    travelStyle: "solo",
    styleAxes: { chillVsIntense: 45, ecoVsLuxury: 60, cityVsNature: 25 },
    interests: ["workation", "food", "culture"],
    occasion: "workation",
    color: "violet",
  },
];

interface QuickPresetsProps {
  onApply: (preset: PresetConfig) => void;
}

function QuickPresets({ onApply }: QuickPresetsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {QUICK_PRESETS.map((preset) => {
        const Icon = preset.icon;
        return (
          <button
            key={preset.id}
            onClick={() => onApply(preset)}
            className={cn(
              "flex items-center gap-2 p-2.5 rounded-xl border border-border/50 text-left transition-all",
              "hover:border-primary/50 hover:bg-primary/5 group"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center text-lg",
              preset.color === "rose" && "bg-rose-100 dark:bg-rose-900/30",
              preset.color === "orange" && "bg-orange-100 dark:bg-orange-900/30",
              preset.color === "blue" && "bg-blue-100 dark:bg-blue-900/30",
              preset.color === "violet" && "bg-violet-100 dark:bg-violet-900/30",
            )}>
              {preset.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{preset.label}</p>
              <p className="text-[10px] text-muted-foreground">Remplir en 1 clic</p>
            </div>
            <Zap className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        );
      })}
    </div>
  );
}

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
    updatePreferences,
    getPreferenceSummary,
  } = usePreferenceMemory();

  const [currentStep, setCurrentStep] = useState<Step>("base");
  const [showDietary, setShowDietary] = useState(false);
  const [showPresets, setShowPresets] = useState(true);

  const completion = getProfileCompletion();

  const handleApplyPreset = useCallback((preset: PresetConfig) => {
    // Apply all preset values at once
    updatePreferences({
      travelStyle: preset.travelStyle,
      styleAxes: {
        ...preferences.styleAxes,
        ...preset.styleAxes,
      },
      interests: preset.interests,
      tripContext: {
        ...preferences.tripContext,
        occasion: preset.occasion,
      },
    }, false);
    
    setShowPresets(false);
    
    // Emit event for other widgets
    eventBus.emit("preferences:updated", {
      preferences: { ...preferences, ...preset },
      source: "manual",
      fields: ["travelStyle", "styleAxes", "interests", "occasion"],
    });
  }, [preferences, updatePreferences]);

  return (
    <div className="space-y-4" data-tour="preferences-panel">
      {/* AI Conflict Badge */}
      <AIConflictBadge 
        onApply={(field, value) => {
          updatePreferences({ [field]: value }, true);
        }}
      />

      {/* AI Detection Badge */}
      {preferences.detectedFromChat && (
        <div className="px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span className="text-xs text-blue-700 dark:text-blue-400">
            Préférences détectées par l'IA
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
          {/* Quick Presets (collapsible) */}
          {showPresets && completion < 30 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Démarrage rapide
                </span>
                <button
                  onClick={() => setShowPresets(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Fermer
                </button>
              </div>
              <QuickPresets onApply={handleApplyPreset} />
            </div>
          )}

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

          {/* AI Summary - only this, no ProfileCompletionCard */}
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

          {/* Dietary Restrictions - ALWAYS visible, no collapsible */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center">
                <Utensils className="h-3 w-3 text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground">Restrictions alimentaires</span>
              {preferences.dietaryRestrictions.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">
                  {preferences.dietaryRestrictions.length}
                </span>
              )}
            </div>
            <DietaryPicker
              selected={preferences.dietaryRestrictions}
              onToggle={toggleDietaryRestriction}
            />
          </div>

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
