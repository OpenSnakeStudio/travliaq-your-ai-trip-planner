import { useState, useEffect, useCallback, useRef } from "react";
import { driver, type DriveStep, type Config } from "driver.js";
import "driver.js/dist/driver.css";
import { eventBus } from "@/lib/eventBus";
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

// Inject custom CSS for Driver.js with improved visibility
function injectDriverStyles() {
  if (document.getElementById("driver-custom-styles")) return;
  
  const style = document.createElement("style");
  style.id = "driver-custom-styles";
  style.textContent = `
    /* ============================================
       DRIVER.JS OVERLAY & STAGE
       ============================================ */
    .driver-overlay {
      background: rgba(0, 0, 0, 0.88) !important;
      z-index: 9998 !important;
    }

    .driver-stage {
      background: transparent !important;
      z-index: 9999 !important;
    }

    /* ============================================
       HIGHLIGHTED ELEMENT - MAXIMUM VISIBILITY
       ============================================ */
    .driver-active-element {
      position: relative !important;
      z-index: 10001 !important;
      opacity: 1 !important;
      filter: none !important;
      isolation: isolate !important;
      border-radius: 16px !important;
      background: hsl(var(--card)) !important;
      animation: travliaq-glow-pulse 2s ease-in-out infinite !important;
      box-shadow:
        0 0 0 4px hsl(var(--primary)),
        0 0 0 8px hsl(var(--primary) / 0.3),
        0 0 40px 15px hsl(var(--primary) / 0.4),
        0 0 80px 30px hsl(var(--primary) / 0.2) !important;
    }

    .driver-active-element * {
      opacity: 1 !important;
      filter: none !important;
    }

    @keyframes travliaq-glow-pulse {
      0%, 100% {
        box-shadow:
          0 0 0 4px hsl(var(--primary)),
          0 0 0 8px hsl(var(--primary) / 0.3),
          0 0 40px 15px hsl(var(--primary) / 0.4),
          0 0 80px 30px hsl(var(--primary) / 0.2);
      }
      50% {
        box-shadow:
          0 0 0 6px hsl(var(--primary)),
          0 0 0 12px hsl(var(--primary) / 0.4),
          0 0 60px 25px hsl(var(--primary) / 0.5),
          0 0 100px 40px hsl(var(--primary) / 0.25);
      }
    }

    /* ============================================
       SECONDARY HIGHLIGHT (Tab buttons)
       ============================================ */
    .travliaq-secondary-highlight {
      position: relative !important;
      z-index: 10001 !important;
      border-radius: 12px !important;
      background: hsl(var(--primary) / 0.15) !important;
      box-shadow:
        0 0 0 3px hsl(var(--primary)),
        0 0 20px 8px hsl(var(--primary) / 0.35) !important;
      animation: travliaq-tab-pulse 1.5s ease-in-out infinite !important;
    }

    @keyframes travliaq-tab-pulse {
      0%, 100% {
        box-shadow:
          0 0 0 3px hsl(var(--primary)),
          0 0 20px 8px hsl(var(--primary) / 0.35);
      }
      50% {
        box-shadow:
          0 0 0 4px hsl(var(--primary)),
          0 0 30px 12px hsl(var(--primary) / 0.45);
      }
    }

    /* ============================================
       POPOVER STYLING - CLEAN & READABLE
       ============================================ */
    .driver-popover {
      z-index: 10002 !important;
      background: hsl(var(--card)) !important;
      border: 1px solid hsl(var(--border) / 0.6) !important;
      border-radius: 20px !important;
      box-shadow: 
        0 25px 60px -15px rgba(0, 0, 0, 0.6),
        0 0 0 1px hsl(var(--border) / 0.3) !important;
      padding: 0 !important;
      max-width: min(440px, calc(100vw - 40px)) !important;
      min-width: 320px !important;
      overflow: hidden !important;
    }

    .driver-popover-arrow {
      display: none !important;
    }

    /* ============================================
       POPOVER HEADER
       ============================================ */
    .driver-popover-title {
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;
      font-size: 1.25rem !important;
      font-weight: 700 !important;
      color: hsl(var(--foreground)) !important;
      padding: 24px 24px 8px 24px !important;
      margin: 0 !important;
      line-height: 1.3 !important;
    }

    /* ============================================
       POPOVER DESCRIPTION - WELL STRUCTURED
       ============================================ */
    .driver-popover-description {
      color: hsl(var(--foreground)) !important;
      padding: 8px 24px 16px 24px !important;
      margin: 0 !important;
      font-size: 0.9375rem !important;
      line-height: 1.7 !important;
    }

    .driver-popover-description p {
      margin: 0 0 12px 0 !important;
    }

    .driver-popover-description p:last-child {
      margin-bottom: 0 !important;
    }

    .driver-popover-description .highlight-label {
      display: inline-block !important;
      background: hsl(var(--primary) / 0.15) !important;
      color: hsl(var(--primary)) !important;
      font-weight: 600 !important;
      padding: 4px 10px !important;
      border-radius: 6px !important;
      font-size: 0.8125rem !important;
      margin-bottom: 12px !important;
    }

    .driver-popover-description .intro-text {
      color: hsl(var(--muted-foreground)) !important;
      font-size: 0.875rem !important;
      margin-bottom: 16px !important;
    }

    .driver-popover-description ul {
      margin: 12px 0 !important;
      padding: 0 !important;
      list-style: none !important;
    }

    .driver-popover-description li {
      display: flex !important;
      align-items: flex-start !important;
      gap: 10px !important;
      margin: 8px 0 !important;
      padding: 8px 12px !important;
      background: hsl(var(--muted) / 0.4) !important;
      border-radius: 10px !important;
      font-size: 0.875rem !important;
      color: hsl(var(--foreground)) !important;
    }

    .driver-popover-description li::before {
      content: "•" !important;
      color: hsl(var(--primary)) !important;
      font-weight: bold !important;
      font-size: 1.2em !important;
      line-height: 1 !important;
    }

    .driver-popover-description strong {
      color: hsl(var(--foreground)) !important;
      font-weight: 600 !important;
    }

    .driver-popover-description .tip-box {
      display: flex !important;
      align-items: flex-start !important;
      gap: 10px !important;
      background: hsl(var(--primary) / 0.1) !important;
      border: 1px solid hsl(var(--primary) / 0.2) !important;
      border-radius: 12px !important;
      padding: 12px 14px !important;
      margin-top: 16px !important;
      font-size: 0.8125rem !important;
      color: hsl(var(--primary)) !important;
    }

    .driver-popover-description .tip-box strong {
      color: hsl(var(--primary)) !important;
    }

    /* Feature grid for tabs overview */
    .driver-popover-description .feature-grid {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 8px !important;
      margin: 12px 0 !important;
    }

    .driver-popover-description .feature-item {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      background: hsl(var(--muted) / 0.5) !important;
      border-radius: 10px !important;
      padding: 10px 12px !important;
      font-size: 0.875rem !important;
      font-weight: 500 !important;
      color: hsl(var(--foreground)) !important;
    }

    .driver-popover-description .feature-item .icon {
      font-size: 1.25rem !important;
    }

    /* CTA box for final step */
    .driver-popover-description .cta-box {
      background: linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--primary) / 0.05)) !important;
      border: 1px solid hsl(var(--primary) / 0.2) !important;
      border-radius: 14px !important;
      padding: 16px !important;
      margin-top: 16px !important;
    }

    .driver-popover-description .cta-title {
      font-weight: 700 !important;
      color: hsl(var(--primary)) !important;
      margin-bottom: 8px !important;
      font-size: 0.9375rem !important;
    }

    .driver-popover-description .cta-list {
      margin: 0 !important;
      padding: 0 !important;
    }

    .driver-popover-description .cta-list li {
      background: transparent !important;
      padding: 4px 0 !important;
      margin: 0 !important;
    }

    .driver-popover-description .cta-list li::before {
      content: "→" !important;
    }

    /* ============================================
       PROGRESS INDICATOR
       ============================================ */
    .driver-popover-progress-text {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 6px 14px !important;
      border-radius: 20px !important;
      background: hsl(var(--muted) / 0.6) !important;
      border: 1px solid hsl(var(--border) / 0.4) !important;
      color: hsl(var(--muted-foreground)) !important;
      font-size: 0.75rem !important;
      font-weight: 600 !important;
      letter-spacing: 0.03em !important;
    }

    .travliaq-progress-container {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      padding: 12px 24px !important;
      border-bottom: 1px solid hsl(var(--border) / 0.3) !important;
      margin-bottom: 0 !important;
    }

    .travliaq-progress-dots {
      display: flex !important;
      gap: 6px !important;
      align-items: center !important;
    }

    .travliaq-dot {
      width: 8px !important;
      height: 8px !important;
      border-radius: 50% !important;
      background: hsl(var(--muted-foreground) / 0.25) !important;
      border: 1px solid hsl(var(--border) / 0.4) !important;
      transition: all 0.2s ease !important;
    }

    .travliaq-dot.is-active {
      background: hsl(var(--primary)) !important;
      border-color: hsl(var(--primary)) !important;
      box-shadow: 0 0 0 3px hsl(var(--primary) / 0.2) !important;
      transform: scale(1.2) !important;
    }

    .travliaq-dot.is-completed {
      background: hsl(var(--primary) / 0.5) !important;
      border-color: hsl(var(--primary) / 0.5) !important;
    }

    /* ============================================
       FOOTER WITH BUTTONS
       ============================================ */
    .driver-popover-footer {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      padding: 16px 24px !important;
      border-top: 1px solid hsl(var(--border) / 0.3) !important;
      background: hsl(var(--muted) / 0.2) !important;
      margin: 0 !important;
    }

    /* Close/Skip button */
    .driver-popover-close-btn {
      background: transparent !important;
      border: none !important;
      color: hsl(var(--muted-foreground)) !important;
      font-size: 0.8125rem !important;
      cursor: pointer !important;
      padding: 6px 12px !important;
      border-radius: 8px !important;
      transition: all 0.2s !important;
    }

    .driver-popover-close-btn:hover {
      color: hsl(var(--foreground)) !important;
      background: hsl(var(--muted) / 0.5) !important;
    }

    /* Navigation buttons container */
    .driver-popover-navigation-btns {
      display: flex !important;
      align-items: center !important;
      gap: 10px !important;
    }

    /* Previous button */
    .driver-popover-prev-btn {
      background: hsl(var(--background)) !important;
      border: 1px solid hsl(var(--border)) !important;
      color: hsl(var(--foreground)) !important;
      padding: 10px 18px !important;
      border-radius: 10px !important;
      font-size: 0.875rem !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: all 0.2s !important;
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
    }

    .driver-popover-prev-btn:hover {
      background: hsl(var(--muted)) !important;
      border-color: hsl(var(--border)) !important;
    }

    /* Next button */
    .driver-popover-next-btn {
      background: hsl(var(--primary)) !important;
      border: none !important;
      color: hsl(var(--primary-foreground)) !important;
      padding: 10px 22px !important;
      border-radius: 10px !important;
      font-size: 0.875rem !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: all 0.2s !important;
      box-shadow: 0 4px 14px hsl(var(--primary) / 0.3) !important;
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
    }

    .driver-popover-next-btn:hover {
      background: hsl(var(--primary) / 0.9) !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 6px 20px hsl(var(--primary) / 0.4) !important;
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
          // Refresh driver after tab change to recalculate element positions
          setTimeout(() => driverRef.current?.refresh(), 120);
        }, 150);
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
    const el = document.querySelector(`[data-tour="${tab}-tab"]`);
    if (el instanceof HTMLElement) {
      el.classList.add("travliaq-secondary-highlight");
    }
  }, [clearSecondaryHighlights]);

  const renderProgressDots = useCallback(
    (popoverEl: HTMLElement, currentIndex: number, total: number) => {
      // Remove old progress container if exists
      const oldContainer = popoverEl.querySelector(".travliaq-progress-container");
      if (oldContainer) oldContainer.remove();

      // Create new progress container
      const container = document.createElement("div");
      container.className = "travliaq-progress-container";

      // Step counter
      const counter = document.createElement("span");
      counter.className = "driver-popover-progress-text";
      counter.textContent = `${currentIndex + 1} / ${total}`;
      container.appendChild(counter);

      // Dots
      const dots = document.createElement("div");
      dots.className = "travliaq-progress-dots";
      for (let i = 0; i < total; i++) {
        const dot = document.createElement("span");
        dot.className = `travliaq-dot${i === currentIndex ? " is-active" : i < currentIndex ? " is-completed" : ""}`;
        dots.appendChild(dot);
      }
      container.appendChild(dots);

      // Insert at the top of popover
      const title = popoverEl.querySelector(".driver-popover-title");
      if (title) {
        title.parentElement?.insertBefore(container, title);
      } else {
        popoverEl.prepend(container);
      }

      // Hide the default progress text
      const defaultProgress = popoverEl.querySelector(".driver-popover-progress-text:not(.travliaq-progress-container .driver-popover-progress-text)");
      if (defaultProgress && defaultProgress.parentElement?.classList.contains("driver-popover-footer")) {
        (defaultProgress as HTMLElement).style.display = "none";
      }
    },
    []
  );

  const steps: DriveStep[] = [
    // Step 0: Welcome
    {
      element: "#root",
      popover: {
        title: "✨ Bienvenue sur Travliaq !",
        description: `
          <p class="intro-text">Planifiez votre voyage de façon simple et fluide grâce à notre assistant intelligent.</p>
          <p style="color: hsl(var(--muted-foreground)); font-size: 0.8125rem;">
            Ce guide vous présente les fonctionnalités principales.<br/>
            Vous pouvez le passer à tout moment.
          </p>
        `,
      },
    },
    // Step 1: Chat panel
    {
      element: '[data-tour="chat-panel"]',
      popover: {
        title: "💬 Votre Assistant IA",
        description: `
          <span class="highlight-label">Zone surlignée : le chat intelligent</span>
          <p>Parlez naturellement à l'assistant pour planifier votre voyage.</p>
          <ul>
            <li><strong>Demandez</strong> des recommandations de destinations</li>
            <li><strong>Configurez</strong> votre voyage par la conversation</li>
            <li><strong>L'IA synchronise</strong> tout automatiquement</li>
          </ul>
        `,
      },
    },
    // Step 2: Tabs navigation - target the actual nav bar
    {
      element: '[data-tour="tabs-nav"]',
      popover: {
        title: "🛠️ Barre d'Outils",
        description: `
          <span class="highlight-label">Zone surlignée : les onglets de navigation</span>
          <p>Accédez rapidement à chaque aspect de votre voyage :</p>
          <div class="feature-grid">
            <div class="feature-item"><span class="icon">✈️</span> Vols</div>
            <div class="feature-item"><span class="icon">🏨</span> Hébergements</div>
            <div class="feature-item"><span class="icon">🎭</span> Activités</div>
            <div class="feature-item"><span class="icon">⚙️</span> Préférences</div>
          </div>
        `,
      },
    },
    // Step 3: Map area
    {
      element: '[data-tour="map-area"]',
      popover: {
        title: "🗺️ Carte Interactive",
        description: `
          <span class="highlight-label">Zone surlignée : la carte du monde</span>
          <p>Visualisez votre voyage en temps réel :</p>
          <ul>
            <li><strong>Cliquez</strong> sur une ville pour voir les prix</li>
            <li><strong>Les itinéraires</strong> s'affichent automatiquement</li>
            <li><strong>Zoomez</strong> pour découvrir plus d'options</li>
          </ul>
        `,
      },
    },
    // Step 4: Flights widget - target the wrapper div
    {
      element: '[data-tour="widget-flights"]',
      popover: {
        title: "✈️ Widget Vols",
        description: `
          <span class="highlight-label">Zone surlignée : le widget Vols</span>
          <p>Configurez vos vols ici :</p>
          <ul>
            <li><strong>Type de trajet</strong> : aller-simple, aller-retour, multi-destinations</li>
            <li><strong>Villes</strong> : départ et destination</li>
            <li><strong>Dates</strong> : calendrier interactif</li>
            <li><strong>Voyageurs</strong> : adultes, enfants, bagages</li>
          </ul>
          <div class="tip-box">
            💡 <span>L'onglet <strong>Vols</strong> est aussi mis en avant</span>
          </div>
        `,
      },
    },
    // Step 5: Stays widget
    {
      element: '[data-tour="widget-stays"]',
      popover: {
        title: "🏨 Widget Hébergements",
        description: `
          <span class="highlight-label">Zone surlignée : le widget Hébergements</span>
          <p>Trouvez le logement idéal :</p>
          <ul>
            <li><strong>Destination</strong> : synchronisée avec vos vols</li>
            <li><strong>Budget</strong> : définissez votre fourchette de prix</li>
            <li><strong>Type</strong> : hôtel, appartement, villa...</li>
            <li><strong>Équipements</strong> : wifi, piscine, parking...</li>
          </ul>
          <div class="tip-box">
            💡 <span>L'onglet <strong>Hébergements</strong> est aussi mis en avant</span>
          </div>
        `,
      },
    },
    // Step 6: Activities widget
    {
      element: '[data-tour="widget-activities"]',
      popover: {
        title: "🎭 Widget Activités",
        description: `
          <span class="highlight-label">Zone surlignée : le widget Activités</span>
          <p>Découvrez que faire sur place :</p>
          <ul>
            <li><strong>Catégories</strong> : culture, nature, gastronomie...</li>
            <li><strong>Filtres</strong> : prix, durée, accessibilité</li>
            <li><strong>Recherche</strong> : par ville ou sur la carte</li>
          </ul>
          <div class="tip-box">
            💡 <span>L'onglet <strong>Activités</strong> est aussi mis en avant</span>
          </div>
        `,
      },
    },
    // Step 7: Preferences widget
    {
      element: '[data-tour="widget-preferences"]',
      popover: {
        title: "⚙️ Widget Préférences",
        description: `
          <span class="highlight-label">Zone surlignée : le widget Préférences</span>
          <p>Personnalisez votre expérience :</p>
          <ul>
            <li><strong>Rythme</strong> : intensif, équilibré, détendu</li>
            <li><strong>Confort</strong> : budget, standard, luxe</li>
            <li><strong>Centres d'intérêt</strong> : ce qui vous passionne</li>
            <li><strong>Restrictions</strong> : alimentaires, accessibilité</li>
          </ul>
          <div class="tip-box">
            💡 <span>L'onglet <strong>Préférences</strong> est aussi mis en avant</span>
          </div>
        `,
      },
    },
    // Step 8: Final
    {
      element: "#root",
      popover: {
        title: "🚀 C'est parti !",
        description: `
          <p style="font-weight: 600; font-size: 1rem;">Vous êtes prêt à planifier votre prochain voyage.</p>
          <div class="cta-box">
            <p class="cta-title">Commencez par :</p>
            <ul class="cta-list">
              <li>Dire bonjour à l'assistant 💬</li>
              <li>Ou configurer vos vols directement ✈️</li>
            </ul>
          </div>
          <p style="font-size: 0.75rem; color: hsl(var(--muted-foreground)); margin-top: 14px;">
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
          showProgress: false, // We use custom progress
          allowClose: true,
          overlayOpacity: 0.88,
          stagePadding: 16,
          stageRadius: 20,
          animate: true,
          smoothScroll: false,
          disableActiveInteraction: false,
          popoverClass: "travliaq-popover",
          nextBtnText: "Suivant →",
          prevBtnText: "← Précédent",
          doneBtnText: "C'est parti ! ✨",
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
        }, 150);
      }, forceShow ? 0 : 800);

      return () => clearTimeout(timer);
    }
  }, [forceShow, onPanelVisibilityChange, configureStep, handleComplete, highlightTabButton, clearSecondaryHighlights, renderProgressDots, steps]);

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
