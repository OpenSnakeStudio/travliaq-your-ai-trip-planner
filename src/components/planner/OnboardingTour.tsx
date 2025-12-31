import { useState, useEffect, useCallback } from "react";
import Joyride, { CallBackProps, STATUS, Step, ACTIONS, EVENTS } from "react-joyride";
import { eventBus } from "@/lib/eventBus";
import type { TabType } from "@/pages/TravelPlanner";

interface OnboardingTourProps {
  /** Force-show the tour even if already seen */
  forceShow?: boolean;
  /** Callback when tour ends */
  onComplete?: () => void;
}

const STORAGE_KEY = "travliaq_onboarding_completed";

// Map step indices to required tabs
const STEP_TAB_MAP: Record<number, TabType> = {
  4: "flights",     // Flights panel step
  5: "stays",       // Stays panel step  
  6: "activities",  // Activities panel step
  7: "preferences", // Preferences panel step
};

/**
 * Onboarding tour for the Planner page.
 * Shows only once for new users (tracked in localStorage).
 * Automatically opens the correct tab when focusing on a panel.
 */
export default function OnboardingTour({ forceShow = false, onComplete }: OnboardingTourProps) {
  const [runTour, setRunTour] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // Check if user has already seen the tour
  useEffect(() => {
    if (forceShow) {
      setRunTour(true);
      return;
    }

    const hasSeenTour = localStorage.getItem(STORAGE_KEY) === "true";
    if (!hasSeenTour) {
      // Wait a bit for the page to fully load
      const timer = setTimeout(() => setRunTour(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [forceShow]);

  // Open the correct tab when step changes
  const openTabForStep = useCallback((index: number) => {
    const requiredTab = STEP_TAB_MAP[index];
    if (requiredTab) {
      eventBus.emit("tab:change", { tab: requiredTab });
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, index, type } = data;

    // Handle step transitions
    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      // Navigate to next/previous step
      const nextIndex = action === ACTIONS.PREV ? index - 1 : index + 1;
      setStepIndex(nextIndex);
      openTabForStep(nextIndex);
    }

    // Handle tour completion
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      setStepIndex(0);
      localStorage.setItem(STORAGE_KEY, "true");
      // Return to flights tab
      eventBus.emit("tab:change", { tab: "flights" });
      onComplete?.();
    }
  };

  const steps: Step[] = [
    {
      target: "body",
      placement: "center",
      title: "Bienvenue sur Travliaq ! ✈️",
      content: (
        <div className="space-y-2">
          <p>Planifiez votre voyage de façon simple et fluide.</p>
          <p className="text-muted-foreground text-sm">
            Ce guide vous montre les fonctionnalités principales. Vous pouvez le passer à tout moment.
          </p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: '[data-tour="chat-panel"]',
      placement: "right",
      title: "Assistant Intelligent 💬",
      content: (
        <div className="space-y-2">
          <p>Parlez à notre assistant comme à un ami.</p>
          <p className="text-muted-foreground text-sm">
            Dites-lui simplement "Je veux partir à Barcelone en mars" et il s'occupe du reste !
          </p>
        </div>
      ),
    },
    {
      target: '[data-tour="map-area"]',
      placement: "left",
      title: "Carte Interactive 🗺️",
      content: (
        <div className="space-y-2">
          <p>Visualisez vos destinations en un coup d'œil.</p>
          <p className="text-muted-foreground text-sm">
            Cliquez sur les pays pour explorer les villes et voir les trajets de vol.
          </p>
        </div>
      ),
    },
    {
      target: '[data-tour="tabs-bar"]',
      placement: "bottom",
      title: "Vos Outils de Planification 🛠️",
      content: (
        <div className="space-y-2">
          <p>Passez d'un onglet à l'autre pour configurer chaque aspect de votre voyage.</p>
          <p className="text-muted-foreground text-sm">
            Vols → Hébergements → Activités → Préférences. Tout est synchronisé automatiquement !
          </p>
        </div>
      ),
    },
    {
      target: '[data-tour="flights-panel"]',
      placement: "auto",
      title: "1. Recherche de Vols ✈️",
      content: (
        <div className="space-y-2">
          <p>Commencez par configurer vos vols.</p>
          <p className="text-muted-foreground text-sm">
            Multi-destinations, classes de voyage, bagages... Les dates et destinations se synchronisent avec vos hébergements.
          </p>
        </div>
      ),
    },
    {
      target: '[data-tour="stays-panel"]',
      placement: "auto",
      title: "2. Hébergements 🏨",
      content: (
        <div className="space-y-2">
          <p>Trouvez l'hébergement parfait pour chaque destination.</p>
          <p className="text-muted-foreground text-sm">
            Les dates et villes sont automatiquement reprises de vos vols. Filtrez par confort, équipements et budget.
          </p>
        </div>
      ),
    },
    {
      target: '[data-tour="activities-panel"]',
      placement: "auto",
      title: "3. Activités 🎭",
      content: (
        <div className="space-y-2">
          <p>Planifiez vos activités par destination.</p>
          <p className="text-muted-foreground text-sm">
            Culture, gastronomie, nature... Laissez l'IA vous suggérer les incontournables ou ajoutez les vôtres.
          </p>
        </div>
      ),
    },
    {
      target: '[data-tour="preferences-panel"]',
      placement: "auto",
      title: "4. Préférences Globales ⚙️",
      content: (
        <div className="space-y-2">
          <p>Définissez votre style de voyage.</p>
          <p className="text-muted-foreground text-sm">
            Rythme, confort, centres d'intérêt, restrictions alimentaires... Toutes ces préférences affectent les suggestions de l'IA.
          </p>
        </div>
      ),
    },
    {
      target: "body",
      placement: "center",
      title: "C'est parti ! 🚀",
      content: (
        <div className="space-y-2">
          <p>Vous êtes prêt à planifier votre prochain voyage.</p>
          <p className="text-muted-foreground text-sm">
            Commencez par dire bonjour à l'assistant ou configurez vos vols directement !
          </p>
        </div>
      ),
    },
  ];

  return (
    <Joyride
      steps={steps}
      run={runTour}
      stepIndex={stepIndex}
      continuous
      scrollToFirstStep
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      locale={{
        back: "Précédent",
        close: "Fermer",
        last: "Terminer",
        next: "Suivant",
        skip: "Passer",
      }}
      styles={{
        options: {
          primaryColor: "hsl(var(--primary))",
          zIndex: 10000,
          arrowColor: "hsl(var(--card))",
          backgroundColor: "hsl(var(--card))",
          textColor: "hsl(var(--foreground))",
        },
        tooltip: {
          borderRadius: 16,
          padding: 20,
        },
        buttonNext: {
          borderRadius: 12,
          padding: "10px 20px",
          fontWeight: 600,
        },
        buttonBack: {
          borderRadius: 12,
          marginRight: 8,
        },
        buttonSkip: {
          color: "hsl(var(--muted-foreground))",
        },
      }}
    />
  );
}
