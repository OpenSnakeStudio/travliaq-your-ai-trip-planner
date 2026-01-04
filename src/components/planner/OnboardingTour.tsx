import { useState, useEffect, useCallback, useRef } from "react";
import { driver, type DriveStep, type Config } from "driver.js";
import "driver.js/dist/driver.css";
import { eventBus } from "@/lib/eventBus";
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { TabType } from "@/pages/TravelPlanner";

interface OnboardingTourProps {
  forceShow?: boolean;
  onComplete?: () => void;
  onPanelVisibilityChange?: (visible: boolean) => void;
  onRequestAnimation?: () => void;
}

const STORAGE_KEY = "travliaq_onboarding_completed";

interface StepConfig {
  tab?: TabType;
  panelOpen?: boolean;
}

const STEP_CONFIG: Record<number, StepConfig> = {
  0: { panelOpen: false },
  1: { panelOpen: false },
  2: { panelOpen: false },
  3: { panelOpen: false },
  4: { tab: "flights", panelOpen: true },
  5: { tab: "stays", panelOpen: true },
  6: { tab: "activities", panelOpen: true },
  7: { tab: "preferences", panelOpen: true },
  8: { panelOpen: false },
};

const STEP_ICONS = ["✨", "💬", "🛠️", "🗺️", "✈️", "🏨", "🎭", "⚙️", "🚀"];

// Inject custom CSS for Driver.js
function injectDriverStyles() {
  if (document.getElementById("driver-custom-styles")) return;
  
  const style = document.createElement("style");
  style.id = "driver-custom-styles";
   style.textContent = `
     /* Override Driver.js default styles */
      .driver-overlay {
        background: rgba(0, 0, 0, 0.85) !important;
        z-index: 9998 !important;
      }

      .driver-stage {
        background: transparent !important;
        z-index: 9999 !important;
      }

      .driver-popover {
        z-index: 10002 !important;
      }

      /* Make sure the highlighted element is truly above the overlay (stacking context safe) */
      .driver-active-element {
        position: relative !important;
        z-index: 10001 !important;
        opacity: 1 !important;
        filter: none !important;
        isolation: isolate !important;
        border-radius: 16px !important;
        animation: travliaq-pulse-shadow 2s ease-in-out infinite !important;
        box-shadow:
          0 0 0 4px hsl(var(--primary)),
          0 0 30px 10px hsl(var(--primary) / 0.35),
          0 0 60px 20px hsl(var(--primary) / 0.18) !important;
      }

      .driver-active-element * {
        opacity: 1 !important;
        filter: none !important;
      }

      /* Secondary highlight (ex: tab button while a widget is highlighted) */
      .travliaq-secondary-highlight {
        position: relative !important;
        z-index: 10001 !important;
        border-radius: 14px !important;
        box-shadow:
          0 0 0 3px hsl(var(--primary)),
          0 0 24px 8px hsl(var(--primary) / 0.30) !important;
      }

      @keyframes travliaq-pulse-shadow {
        0%, 100% {
          box-shadow:
            0 0 0 4px hsl(var(--primary)),
            0 0 30px 10px hsl(var(--primary) / 0.35),
            0 0 60px 20px hsl(var(--primary) / 0.18);
        }
        50% {
          box-shadow:
            0 0 0 6px hsl(var(--primary)),
            0 0 50px 18px hsl(var(--primary) / 0.45),
            0 0 90px 32px hsl(var(--primary) / 0.26);
        }
      }

      /* Custom popover styling */
      .driver-popover {
        background: hsl(var(--card)) !important;
        border: 1px solid hsl(var(--border) / 0.5) !important;
        border-radius: 16px !important;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
        padding: 0 !important;
        max-width: min(420px, calc(100vw - 32px)) !important;
        overflow: hidden !important;
      }

      .driver-popover-arrow {
        display: none !important;
      }

      /* Popover header */
      .driver-popover-title {
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
        font-size: 1.125rem !important;
        font-weight: 700 !important;
        color: hsl(var(--foreground)) !important;
        padding: 20px 20px 0 20px !important;
        margin: 0 !important;
      }

      .driver-popover-title::before {
        content: attr(data-icon);
        font-size: 1.75rem;
      }

      /* Popover description */
      .driver-popover-description {
        color: hsl(var(--foreground) / 0.9) !important;
        padding: 12px 20px !important;
        margin: 0 !important;
        font-size: 0.9375rem !important;
        line-height: 1.6 !important;
      }

      .driver-popover-description .highlight-text {
        color: hsl(var(--primary)) !important;
        font-weight: 600 !important;
      }

      .driver-popover-description ul {
        margin: 8px 0 !important;
        padding-left: 20px !important;
      }

      .driver-popover-description li {
        margin: 4px 0 !important;
        color: hsl(var(--muted-foreground)) !important;
        font-size: 0.875rem !important;
      }

      .driver-popover-description strong {
        color: hsl(var(--foreground)) !important;
      }

      .driver-popover-description .tip {
        font-size: 0.75rem !important;
        color: hsl(var(--primary) / 0.8) !important;
        margin-top: 12px !important;
      }

      .driver-popover-description .cta-box {
        background: hsl(var(--primary) / 0.1) !important;
        border-radius: 8px !important;
        padding: 12px !important;
        margin-top: 12px !important;
      }

      .driver-popover-description .cta-box-title {
        font-weight: 600 !important;
        color: hsl(var(--primary)) !important;
        margin-bottom: 4px !important;
      }

      .driver-popover-description .grid-2 {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 8px !important;
        margin-top: 8px !important;
      }

      .driver-popover-description .grid-item {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        background: hsl(var(--muted) / 0.5) !important;
        border-radius: 8px !important;
        padding: 6px 10px !important;
        font-size: 0.875rem !important;
      }

      /* Progress indicator */
      .driver-popover-progress-text {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        margin: 10px 20px 0 20px !important;
        padding: 6px 10px !important;
        border-radius: 999px !important;
        background: hsl(var(--muted) / 0.6) !important;
        border: 1px solid hsl(var(--border) / 0.35) !important;
        color: hsl(var(--muted-foreground)) !important;
        font-size: 0.75rem !important;
        font-weight: 600 !important;
        letter-spacing: 0.02em !important;
      }

      .travliaq-progress-dots {
        display: flex !important;
        gap: 6px !important;
        align-items: center !important;
        margin: 8px 20px 0 20px !important;
      }

      .travliaq-dot {
        width: 7px;
        height: 7px;
        border-radius: 999px;
        background: hsl(var(--muted-foreground) / 0.25);
        border: 1px solid hsl(var(--border) / 0.4);
      }

      .travliaq-dot.is-active {
        background: hsl(var(--primary));
        border-color: hsl(var(--primary));
        box-shadow: 0 0 0 3px hsl(var(--primary) / 0.18);
        transform: scale(1.15);
      }

      /* Footer with buttons */
      .driver-popover-footer {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 16px 20px !important;
        border-top: 1px solid hsl(var(--border) / 0.3) !important;
        margin: 0 !important;
      }

      /* Skip button */
      .driver-popover-close-btn {
        background: transparent !important;
        border: none !important;
        color: hsl(var(--muted-foreground)) !important;
        font-size: 0.875rem !important;
        cursor: pointer !important;
        padding: 4px 8px !important;
        transition: color 0.2s !important;
      }

      .driver-popover-close-btn:hover {
        color: hsl(var(--foreground)) !important;
      }

      /* Navigation buttons container */
      .driver-popover-navigation-btns {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
      }

      /* Previous button */
      .driver-popover-prev-btn {
        background: transparent !important;
        border: 1px solid hsl(var(--border)) !important;
        color: hsl(var(--foreground)) !important;
        padding: 8px 16px !important;
        border-radius: 8px !important;
        font-size: 0.875rem !important;
        font-weight: 500 !important;
        cursor: pointer !important;
        transition: all 0.2s !important;
        display: flex !important;
        align-items: center !important;
        gap: 4px !important;
      }

      .driver-popover-prev-btn:hover {
        background: hsl(var(--muted)) !important;
      }

      /* Next button */
      .driver-popover-next-btn {
        background: hsl(var(--primary)) !important;
        border: none !important;
        color: hsl(var(--primary-foreground)) !important;
        padding: 8px 20px !important;
        border-radius: 8px !important;
        font-size: 0.875rem !important;
        font-weight: 500 !important;
        cursor: pointer !important;
        transition: all 0.2s !important;
        box-shadow: 0 4px 12px hsl(var(--primary) / 0.25) !important;
        display: flex !important;
        align-items: center !important;
        gap: 4px !important;
      }

      .driver-popover-next-btn:hover {
        background: hsl(var(--primary) / 0.9) !important;
        transform: translateY(-1px) !important;
      }
    `;
  document.head.appendChild(style);
}

export default function OnboardingTour({
  forceShow = false,
  onComplete,
  onPanelVisibilityChange,
  onRequestAnimation,
}: OnboardingTourProps) {
  const [isRunning, setIsRunning] = useState(false);
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);

  // Configure step: open tab and panel as needed
  const configureStep = useCallback(
    (index: number) => {
      const config = STEP_CONFIG[index];
      if (!config) return;

      if (config.panelOpen !== undefined) {
        onPanelVisibilityChange?.(config.panelOpen);
      }

      if (config.tab) {
        setTimeout(() => {
          eventBus.emit("tab:change", { tab: config.tab! });
          // Important: driver calcule la scène sur l'élément actif; après un changement d'onglet,
          // on force un refresh pour éviter les highlights "vides" (souvent sur le widget Vols au 1er passage).
          setTimeout(() => driverRef.current?.refresh(), 80);
        }, 100);
      }
    },
    [onPanelVisibilityChange]
  );

  const handleComplete = useCallback(() => {
    setIsRunning(false);
    localStorage.setItem(STORAGE_KEY, "true");
    onPanelVisibilityChange?.(false);
    eventBus.emit("tab:change", { tab: "flights" });

    setTimeout(() => {
      onRequestAnimation?.();
    }, 300);

    onComplete?.();
  }, [onComplete, onPanelVisibilityChange, onRequestAnimation]);

  const clearSecondaryHighlights = useCallback(() => {
    document
      .querySelectorAll(".travliaq-secondary-highlight")
      .forEach((el) => el.classList.remove("travliaq-secondary-highlight"));
  }, []);

  const highlightTabButton = useCallback((tab?: TabType) => {
    clearSecondaryHighlights();
    if (!tab) return;
    const el = document.querySelector(`[data-tour=\"${tab}-tab\"]`);
    if (el instanceof HTMLElement) {
      el.classList.add("travliaq-secondary-highlight");
    }
  }, [clearSecondaryHighlights]);

  const renderProgressDots = useCallback(
    (popoverEl: HTMLElement, currentIndex: number, total: number) => {
      let dots = popoverEl.querySelector(".travliaq-progress-dots") as HTMLElement | null;
      if (!dots) {
        dots = document.createElement("div");
        dots.className = "travliaq-progress-dots";
        const progressText = popoverEl.querySelector(".driver-popover-progress-text");
        if (progressText?.parentElement) {
          progressText.parentElement.insertBefore(dots, progressText.nextSibling);
        } else {
          popoverEl.prepend(dots);
        }
      }

      dots.innerHTML = "";
      for (let i = 0; i < total; i++) {
        const dot = document.createElement("span");
        dot.className = `travliaq-dot${i === currentIndex ? " is-active" : ""}`;
        dots.appendChild(dot);
      }
    },
    []
  );

  const steps: DriveStep[] = [
    {
      element: "#root",
      popover: {
        title: "Bienvenue sur Travliaq !",
        description: `
          <p>Planifiez votre voyage de façon simple et fluide.</p>
          <p style="color: hsl(var(--muted-foreground)); font-size: 0.875rem; margin-top: 8px;">
            Ce guide vous montre les fonctionnalités principales. Vous pouvez le passer à tout moment.
          </p>
        `,
      },
    },
    {
      element: '[data-tour="chat-panel"]',
      popover: {
        title: "💬 Votre Assistant IA",
        description: `
          <p><span class="highlight-text">Zone surlignée</span> : le chat intelligent</p>
          <p style="margin-top: 8px;">Parlez naturellement à l'assistant : <em>"Je veux partir à Barcelone en mars"</em></p>
          <ul>
            <li>Demandez des recommandations de destinations</li>
            <li>Configurez votre voyage par la conversation</li>
            <li>L'IA synchronise tout automatiquement</li>
          </ul>
        `,
      },
    },
    {
      element: '[data-tour="tabs-nav"]',
      popover: {
        title: "🛠️ Barre d'Outils",
        description: `
          <p><span class="highlight-text">Zone surlignée</span> : les onglets de navigation</p>
          <p style="margin-top: 8px;">Accédez rapidement à chaque aspect de votre voyage :</p>
          <div class="grid-2">
            <div class="grid-item"><span>✈️</span> <span>Vols</span></div>
            <div class="grid-item"><span>🏨</span> <span>Hébergements</span></div>
            <div class="grid-item"><span>🎭</span> <span>Activités</span></div>
            <div class="grid-item"><span>⚙️</span> <span>Préférences</span></div>
          </div>
        `,
      },
    },
    {
      element: '[data-tour="map-area"]',
      popover: {
        title: "🗺️ Carte Interactive",
        description: `
          <p><span class="highlight-text">Zone surlignée</span> : la carte du monde</p>
          <p style="margin-top: 8px;">Visualisez votre voyage en temps réel :</p>
          <ul>
            <li>Cliquez sur une ville pour voir les prix</li>
            <li>Les itinéraires s'affichent automatiquement</li>
            <li>Zoomez pour découvrir plus d'options</li>
          </ul>
        `,
      },
    },
    {
      element: '[data-tour="widget-flights"]',
      popover: {
        title: "✈️ Widget Vols",
        description: `
          <p><span class="highlight-text">Zone surlignée</span> : le widget Vols</p>
          <p style="margin-top: 8px;">Configurez vos vols ici :</p>
          <ul>
            <li><strong>Type de trajet</strong> : aller-simple, aller-retour, multi-destinations</li>
            <li><strong>Villes</strong> : départ et destination</li>
            <li><strong>Dates</strong> : calendrier interactif</li>
            <li><strong>Voyageurs</strong> : adultes, enfants, bagages</li>
          </ul>
          <p class="tip">💡 L'onglet <strong>Vols</strong> est aussi mis en avant pour montrer où cliquer</p>
        `,
      },
    },
    {
      element: '[data-tour="widget-stays"]',
      popover: {
        title: "🏨 Widget Hébergements",
        description: `
          <p><span class="highlight-text">Zone surlignée</span> : le widget Hébergements</p>
          <p style="margin-top: 8px;">Trouvez le logement idéal :</p>
          <ul>
            <li><strong>Destination</strong> : synchronisée avec vos vols</li>
            <li><strong>Budget</strong> : définissez votre fourchette de prix</li>
            <li><strong>Type</strong> : hôtel, appartement, villa...</li>
            <li><strong>Équipements</strong> : wifi, piscine, parking...</li>
          </ul>
          <p class="tip">💡 L'onglet <strong>Hébergements</strong> est aussi mis en avant</p>
        `,
      },
    },
    {
      element: '[data-tour="widget-activities"]',
      popover: {
        title: "🎭 Widget Activités",
        description: `
          <p><span class="highlight-text">Zone surlignée</span> : le widget Activités</p>
          <p style="margin-top: 8px;">Découvrez que faire sur place :</p>
          <ul>
            <li><strong>Catégories</strong> : culture, nature, gastronomie...</li>
            <li><strong>Filtres</strong> : prix, durée, accessibilité</li>
            <li><strong>Recherche</strong> : par ville ou directement sur la carte</li>
          </ul>
          <p class="tip">💡 L'onglet <strong>Activités</strong> est aussi mis en avant</p>
        `,
      },
    },
    {
      element: '[data-tour="widget-preferences"]',
      popover: {
        title: "⚙️ Widget Préférences",
        description: `
          <p><span class="highlight-text">Zone surlignée</span> : le widget Préférences</p>
          <p style="margin-top: 8px;">Personnalisez votre expérience :</p>
          <ul>
            <li><strong>Rythme</strong> : intensif, équilibré, détendu</li>
            <li><strong>Confort</strong> : budget, standard, luxe</li>
            <li><strong>Centres d'intérêt</strong> : ce qui vous passionne</li>
            <li><strong>Restrictions</strong> : alimentaires, accessibilité</li>
          </ul>
          <p class="tip">💡 L'onglet <strong>Préférences</strong> est aussi mis en avant</p>
        `,
      },
    },
    {
      element: "#root",
      popover: {
        title: "🚀 C'est parti !",
        description: `
          <p style="font-weight: 500;">Vous êtes prêt à planifier votre prochain voyage.</p>
          <div class="cta-box">
            <p class="cta-box-title">Commencez par :</p>
            <ul style="color: hsl(var(--muted-foreground)); margin: 0; padding-left: 20px;">
              <li>Dire bonjour à l'assistant 💬</li>
              <li>Ou configurer vos vols directement ✈️</li>
            </ul>
          </div>
          <p style="font-size: 0.75rem; color: hsl(var(--muted-foreground)); margin-top: 12px;">
            Vous pouvez relancer ce guide à tout moment depuis les paramètres.
          </p>
        `,
      },
    },
  ];

  // Initialize driver
  useEffect(() => {
    const hasSeenTour = localStorage.getItem(STORAGE_KEY) === "true";
    
    if (forceShow || !hasSeenTour) {
      const timer = setTimeout(() => {
        injectDriverStyles();
        setIsRunning(true);
        onPanelVisibilityChange?.(false);
        
        const driverConfig: Config = {
          showButtons: ['next', 'previous', 'close'],
          showProgress: true,
          allowClose: true,
          overlayOpacity: 0.85,
          stagePadding: 12,
          stageRadius: 16,
          animate: true,
          smoothScroll: false,
          // Important: garder l'UI du popover cliquable même quand on cible des conteneurs larges.
          // (Avec certains targets comme body/#root, le mode "disableActiveInteraction" peut bloquer les clics.)
          disableActiveInteraction: false,
          popoverClass: "travliaq-popover",
          nextBtnText: "Suivant →",
          prevBtnText: "← Précédent",
          doneBtnText: "C'est parti ! ✨",
          progressText: "{{current}} / {{total}}",
          onPopoverRender: (popover, opts) => {
            const idx = opts.state.activeIndex ?? 0;
            const total = opts.config.steps?.length ?? steps.length;
            renderProgressDots(popover.wrapper, idx, total);
          },
          steps: steps.map((step, index) => ({
            ...step,
            onHighlightStarted: () => {
              configureStep(index);
              const tab = STEP_CONFIG[index]?.tab;
              highlightTabButton(tab);
            },
            onDeselected: () => {
              clearSecondaryHighlights();
            },
          })),
          onDestroyed: () => {
            clearSecondaryHighlights();
            handleComplete();
          },
        };

        driverRef.current = driver(driverConfig);
        configureStep(0);
        
        setTimeout(() => {
          driverRef.current?.drive();
        }, 100);
      }, forceShow ? 0 : 800);

      return () => clearTimeout(timer);
    }
  }, [forceShow, onPanelVisibilityChange, configureStep, handleComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (driverRef.current) {
        driverRef.current.destroy();
      }
    };
  }, []);

  return null;
}
