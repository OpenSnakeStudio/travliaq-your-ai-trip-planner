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
  0: { panelOpen: true, tab: "flights" },  // Welcome - show flights panel
  1: { panelOpen: true, tab: "flights" },  // Chat
  2: { panelOpen: true, tab: "flights" },  // Tabs bar
  3: { panelOpen: false },                  // Map
  4: { panelOpen: true, tab: "flights" },  // Flights widget
  5: { panelOpen: true, tab: "stays" },    // Stays widget
  6: { panelOpen: true, tab: "activities" }, // Activities widget
  7: { panelOpen: true, tab: "preferences" }, // Preferences widget
  8: { panelOpen: true, tab: "flights" },  // Final
};

// Enhanced CSS with smooth animations for driver.js
function injectDriverStyles() {
  if (document.getElementById("driver-custom-styles")) return;
  
  const style = document.createElement("style");
  style.id = "driver-custom-styles";
  style.textContent = `
    /* Smooth overlay transition */
    .driver-overlay {
      background: rgba(0, 0, 0, 0.75) !important;
      transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    /* Highlighted element with smooth glow animation */
    .driver-active-element {
      z-index: 10001 !important;
      border-radius: 16px !important;
      box-shadow:
        0 0 0 4px hsl(var(--primary)),
        0 0 30px 10px hsl(var(--primary) / 0.4) !important;
      animation: travliaq-pulse-glow 2s ease-in-out infinite !important;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    @keyframes travliaq-pulse-glow {
      0%, 100% {
        box-shadow:
          0 0 0 4px hsl(var(--primary)),
          0 0 30px 10px hsl(var(--primary) / 0.4);
      }
      50% {
        box-shadow:
          0 0 0 6px hsl(var(--primary)),
          0 0 50px 15px hsl(var(--primary) / 0.5);
      }
    }

    /* Tab highlight with smooth animation */
    .travliaq-tab-highlight {
      position: relative !important;
      z-index: 10001 !important;
      box-shadow:
        0 0 0 3px hsl(var(--primary)),
        0 0 20px 5px hsl(var(--primary) / 0.3) !important;
      border-radius: 10px !important;
      animation: travliaq-tab-glow 1.5s ease-in-out infinite !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    @keyframes travliaq-tab-glow {
      0%, 100% {
        box-shadow:
          0 0 0 3px hsl(var(--primary)),
          0 0 20px 5px hsl(var(--primary) / 0.3);
      }
      50% {
        box-shadow:
          0 0 0 4px hsl(var(--primary)),
          0 0 30px 8px hsl(var(--primary) / 0.4);
      }
    }

    /* Popover with smooth entrance animation */
    .driver-popover {
      background: hsl(var(--card)) !important;
      border: 1px solid hsl(var(--border)) !important;
      border-radius: 16px !important;
      box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.5) !important;
      padding: 0 !important;
      max-width: 400px !important;
      min-width: 320px !important;
      overflow: visible !important;
      animation: travliaq-popover-enter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
      transform-origin: center center !important;
    }

    @keyframes travliaq-popover-enter {
      0% {
        opacity: 0;
        transform: scale(0.9) translateY(10px);
      }
      100% {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .driver-popover-arrow {
      display: none !important;
    }

    /* Progress header with fade-in */
    .travliaq-progress-header {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      padding: 16px 20px !important;
      border-bottom: 1px solid hsl(var(--border) / 0.5) !important;
      background: hsl(var(--muted) / 0.3) !important;
      border-radius: 16px 16px 0 0 !important;
      animation: travliaq-fade-in 0.3s ease-out 0.1s both !important;
    }

    @keyframes travliaq-fade-in {
      from {
        opacity: 0;
        transform: translateY(-5px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .travliaq-step-counter {
      font-size: 0.8125rem !important;
      font-weight: 600 !important;
      color: hsl(var(--muted-foreground)) !important;
      background: hsl(var(--background)) !important;
      padding: 6px 12px !important;
      border-radius: 8px !important;
      border: 1px solid hsl(var(--border) / 0.5) !important;
      transition: all 0.3s ease !important;
    }

    .travliaq-progress-dots {
      display: flex !important;
      gap: 6px !important;
    }

    .travliaq-dot {
      width: 8px !important;
      height: 8px !important;
      border-radius: 50% !important;
      background: hsl(var(--muted-foreground) / 0.3) !important;
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
    }

    .travliaq-dot.active {
      background: hsl(var(--primary)) !important;
      transform: scale(1.4) !important;
      box-shadow: 0 0 8px hsl(var(--primary) / 0.5) !important;
    }

    .travliaq-dot.completed {
      background: hsl(var(--primary) / 0.6) !important;
      transform: scale(1.1) !important;
    }

    /* Close button with smooth hover */
    .travliaq-close-btn {
      width: 28px !important;
      height: 28px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      background: hsl(var(--muted) / 0.5) !important;
      border: 1px solid hsl(var(--border) / 0.5) !important;
      border-radius: 8px !important;
      color: hsl(var(--muted-foreground)) !important;
      font-size: 16px !important;
      cursor: pointer !important;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
      margin-left: 12px !important;
    }

    .travliaq-close-btn:hover {
      background: hsl(var(--destructive) / 0.1) !important;
      color: hsl(var(--destructive)) !important;
      border-color: hsl(var(--destructive) / 0.3) !important;
      transform: scale(1.1) !important;
    }

    /* Hide default close button */
    .driver-popover-close-btn {
      display: none !important;
    }

    /* Title with staggered animation */
    .driver-popover-title {
      font-size: 1.25rem !important;
      font-weight: 700 !important;
      color: hsl(var(--foreground)) !important;
      padding: 20px 20px 10px 20px !important;
      margin: 0 !important;
      line-height: 1.3 !important;
      animation: travliaq-slide-up 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.15s both !important;
    }

    @keyframes travliaq-slide-up {
      from {
        opacity: 0;
        transform: translateY(15px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Description with staggered animation */
    .driver-popover-description {
      color: hsl(var(--foreground)) !important;
      padding: 0 20px 16px 20px !important;
      font-size: 0.9375rem !important;
      line-height: 1.6 !important;
      animation: travliaq-slide-up 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both !important;
    }

    .driver-popover-description p {
      margin: 0 0 12px 0 !important;
      color: hsl(var(--muted-foreground)) !important;
    }

    .driver-popover-description p:last-child {
      margin-bottom: 0 !important;
    }

    .driver-popover-description .highlight-badge {
      display: inline-block !important;
      background: hsl(var(--primary) / 0.15) !important;
      color: hsl(var(--primary)) !important;
      font-weight: 600 !important;
      padding: 4px 10px !important;
      border-radius: 6px !important;
      font-size: 0.75rem !important;
      margin-bottom: 12px !important;
      animation: travliaq-badge-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both !important;
    }

    @keyframes travliaq-badge-pop {
      0% {
        opacity: 0;
        transform: scale(0.8);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    .driver-popover-description ul {
      margin: 10px 0 !important;
      padding: 0 !important;
      list-style: none !important;
    }

    .driver-popover-description li {
      display: flex !important;
      align-items: flex-start !important;
      gap: 8px !important;
      padding: 8px 12px !important;
      margin: 6px 0 !important;
      background: hsl(var(--muted) / 0.4) !important;
      border-radius: 8px !important;
      font-size: 0.875rem !important;
      color: hsl(var(--foreground)) !important;
      opacity: 0 !important;
      animation: travliaq-list-item-enter 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards !important;
    }

    .driver-popover-description li:nth-child(1) { animation-delay: 0.25s !important; }
    .driver-popover-description li:nth-child(2) { animation-delay: 0.35s !important; }
    .driver-popover-description li:nth-child(3) { animation-delay: 0.45s !important; }
    .driver-popover-description li:nth-child(4) { animation-delay: 0.55s !important; }

    @keyframes travliaq-list-item-enter {
      from {
        opacity: 0;
        transform: translateX(-10px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .driver-popover-description li::before {
      content: "•" !important;
      color: hsl(var(--primary)) !important;
      font-weight: bold !important;
    }

    .driver-popover-description strong {
      color: hsl(var(--foreground)) !important;
      font-weight: 600 !important;
    }

    .driver-popover-description .tip-box {
      display: flex !important;
      align-items: flex-start !important;
      gap: 8px !important;
      background: hsl(var(--primary) / 0.1) !important;
      border: 1px solid hsl(var(--primary) / 0.2) !important;
      border-radius: 10px !important;
      padding: 10px 12px !important;
      margin-top: 12px !important;
      font-size: 0.8125rem !important;
      color: hsl(var(--primary)) !important;
      animation: travliaq-tip-enter 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.5s both !important;
    }

    @keyframes travliaq-tip-enter {
      from {
        opacity: 0;
        transform: translateY(10px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .driver-popover-description .feature-grid {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 6px !important;
      margin: 10px 0 !important;
    }

    .driver-popover-description .feature-item {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      background: hsl(var(--muted) / 0.5) !important;
      border-radius: 8px !important;
      padding: 8px 10px !important;
      font-size: 0.8125rem !important;
      font-weight: 500 !important;
      color: hsl(var(--foreground)) !important;
      opacity: 0 !important;
      animation: travliaq-feature-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards !important;
      transition: transform 0.2s ease, background 0.2s ease !important;
    }

    .driver-popover-description .feature-item:hover {
      transform: scale(1.03) !important;
      background: hsl(var(--muted) / 0.7) !important;
    }

    .driver-popover-description .feature-item:nth-child(1) { animation-delay: 0.3s !important; }
    .driver-popover-description .feature-item:nth-child(2) { animation-delay: 0.4s !important; }
    .driver-popover-description .feature-item:nth-child(3) { animation-delay: 0.5s !important; }
    .driver-popover-description .feature-item:nth-child(4) { animation-delay: 0.6s !important; }

    @keyframes travliaq-feature-pop {
      0% {
        opacity: 0;
        transform: scale(0.8);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    /* Footer with slide-up animation */
    .driver-popover-footer {
      display: flex !important;
      align-items: center !important;
      justify-content: flex-end !important;
      gap: 10px !important;
      padding: 16px 20px !important;
      border-top: 1px solid hsl(var(--border) / 0.5) !important;
      background: hsl(var(--muted) / 0.2) !important;
      border-radius: 0 0 16px 16px !important;
      animation: travliaq-footer-enter 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.25s both !important;
    }

    @keyframes travliaq-footer-enter {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Hide default progress text in footer */
    .driver-popover-footer .driver-popover-progress-text {
      display: none !important;
    }

    /* Prev button with smooth transitions */
    .driver-popover-prev-btn {
      background: hsl(var(--background)) !important;
      border: 1px solid hsl(var(--border)) !important;
      color: hsl(var(--foreground)) !important;
      padding: 10px 16px !important;
      border-radius: 8px !important;
      font-size: 0.875rem !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    .driver-popover-prev-btn:hover {
      background: hsl(var(--muted)) !important;
      transform: translateX(-2px) !important;
    }

    .driver-popover-prev-btn:active {
      transform: translateX(-4px) scale(0.98) !important;
    }

    /* Next button with smooth transitions */
    .driver-popover-next-btn {
      background: hsl(var(--primary)) !important;
      border: none !important;
      color: hsl(var(--primary-foreground)) !important;
      padding: 10px 20px !important;
      border-radius: 8px !important;
      font-size: 0.875rem !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
      box-shadow: 0 4px 12px hsl(var(--primary) / 0.3) !important;
      animation: travliaq-button-glow 2s ease-in-out infinite !important;
    }

    @keyframes travliaq-button-glow {
      0%, 100% {
        box-shadow: 0 4px 12px hsl(var(--primary) / 0.3);
      }
      50% {
        box-shadow: 0 6px 20px hsl(var(--primary) / 0.5);
      }
    }

    .driver-popover-next-btn:hover {
      transform: translateY(-2px) scale(1.02) !important;
      box-shadow: 0 8px 25px hsl(var(--primary) / 0.4) !important;
    }

    .driver-popover-next-btn:active {
      transform: translateY(0) scale(0.98) !important;
    }

    /* Center popover class - position at center of screen */
    .center-popover.driver-popover {
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      z-index: 10002 !important;
    }

    /* Right popover for widget steps (avoid covering the left widgets panel) */
    .travliaq-popover-right.driver-popover {
      position: fixed !important;
      top: 50% !important;
      right: 24px !important;
      left: auto !important;
      transform: translateY(-50%) !important;
      z-index: 10002 !important;
    }

    @media (max-width: 768px) {
      .travliaq-popover-right.driver-popover {
        left: 50% !important;
        right: auto !important;
        transform: translate(-50%, -50%) !important;
        width: min(92vw, 420px) !important;
      }
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
        eventBus.emit("tab:change", { tab: config.tab });
      }
    },
    [onPanelVisibilityChange]
  );

  const handleComplete = useCallback(() => {
    setIsRunning(false);
    localStorage.setItem(STORAGE_KEY, "true");
    // Clean up highlights
    document.querySelectorAll(".travliaq-tab-highlight").forEach((el) => {
      el.classList.remove("travliaq-tab-highlight");
    });
    onPanelVisibilityChange?.(false);
    eventBus.emit("tab:change", { tab: "flights" });

    setTimeout(() => {
      onRequestAnimation?.();
    }, 300);

    onComplete?.();
  }, [onComplete, onPanelVisibilityChange, onRequestAnimation]);

  const highlightTab = useCallback((tab?: TabType) => {
    // Clear previous highlights
    document.querySelectorAll(".travliaq-tab-highlight").forEach((el) => {
      el.classList.remove("travliaq-tab-highlight");
    });
    
    if (!tab) return;
    
    const tabEl = document.querySelector(`[data-tour="${tab}-tab"]`);
    if (tabEl) {
      tabEl.classList.add("travliaq-tab-highlight");
    }
  }, []);

  const renderProgressHeader = useCallback(
    (popoverEl: HTMLElement, currentIndex: number, total: number, driverInstance: ReturnType<typeof driver>) => {
      // Remove old header if exists
      const oldHeader = popoverEl.querySelector(".travliaq-progress-header");
      if (oldHeader) oldHeader.remove();

      // Create header
      const header = document.createElement("div");
      header.className = "travliaq-progress-header";

      // Step counter
      const counter = document.createElement("span");
      counter.className = "travliaq-step-counter";
      counter.textContent = `${currentIndex + 1} / ${total}`;
      header.appendChild(counter);

      // Dots
      const dots = document.createElement("div");
      dots.className = "travliaq-progress-dots";
      for (let i = 0; i < total; i++) {
        const dot = document.createElement("span");
        dot.className = `travliaq-dot${i === currentIndex ? " active" : i < currentIndex ? " completed" : ""}`;
        dots.appendChild(dot);
      }
      header.appendChild(dots);

      // Close button
      const closeBtn = document.createElement("button");
      closeBtn.className = "travliaq-close-btn";
      closeBtn.innerHTML = "×";
      closeBtn.title = "Passer le guide";
      closeBtn.onclick = () => {
        driverInstance.destroy();
      };
      header.appendChild(closeBtn);

      // Insert at the top
      popoverEl.prepend(header);
    },
    []
  );

  const steps: DriveStep[] = [
    // Step 0: Welcome - target chat panel
    {
      element: '[data-tour="chat-panel"]',
      popover: {
        title: "✨ Bienvenue sur Travliaq !",
        description: `
          <p>Planifiez votre voyage simplement grâce à notre assistant intelligent.</p>
          <p style="font-size: 0.8125rem;">Ce guide rapide vous présente les fonctionnalités principales. Vous pouvez le passer à tout moment.</p>
        `,
        side: "right",
        align: "center",
      },
    },
    // Step 1: Chat
    {
      element: '[data-tour="chat-panel"]',
      popover: {
        title: "💬 Assistant IA",
        description: `
          <span class="highlight-badge">Chat intelligent</span>
          <p>Parlez naturellement pour planifier votre voyage.</p>
          <ul>
            <li><strong>Demandez</strong> des recommandations</li>
            <li><strong>Configurez</strong> votre voyage</li>
            <li><strong>L'IA synchronise</strong> tout automatiquement</li>
          </ul>
        `,
        side: "right",
        align: "center",
      },
    },
    // Step 2: Tabs bar
    {
      element: '[data-tour="tabs-nav"]',
      popover: {
        title: "🛠️ Barre d'Outils",
        description: `
          <span class="highlight-badge">Navigation rapide</span>
          <p>Accédez à chaque aspect de votre voyage :</p>
          <div class="feature-grid">
            <div class="feature-item">✈️ Vols</div>
            <div class="feature-item">🏨 Hébergements</div>
            <div class="feature-item">🎭 Activités</div>
            <div class="feature-item">⚙️ Préférences</div>
          </div>
        `,
        side: "bottom",
        align: "center",
        popoverClass: "center-popover",
      },
    },
    // Step 3: Map
    {
      element: '[data-tour="map-area"]',
      popover: {
        title: "🗺️ Carte Interactive",
        description: `
          <span class="highlight-badge">Visualisation en temps réel</span>
          <p>Explorez votre voyage sur la carte :</p>
          <ul>
            <li><strong>Cliquez</strong> sur une ville pour les prix</li>
            <li><strong>Itinéraires</strong> affichés automatiquement</li>
            <li><strong>Zoomez</strong> pour plus d'options</li>
          </ul>
        `,
        side: "left",
        align: "center",
      },
    },
    // Step 4: Flights widget
    {
      element: '[data-tour="widget-flights"]',
      popover: {
        title: "✈️ Widget Vols",
        description: `
          <span class="highlight-badge">Configurez vos vols</span>
          <p>Ce widget sert à rechercher et comparer les vols (prix, horaires, escales).</p>
          <ul>
            <li><strong>Choisissez</strong> le type : aller-retour, aller simple, multi-destinations</li>
            <li><strong>Saisissez</strong> départ + destination (aéroports/villes)</li>
            <li><strong>Définissez</strong> les dates et le nombre de voyageurs</li>
            <li><strong>Affinez</strong> avec les options (vols directs, dates flexibles…)</li>
          </ul>
          <div class="tip-box">💡 L'onglet Vols est aussi surligné</div>
        `,
        side: "right",
        align: "center",
        popoverClass: "travliaq-popover-right",
      },
    },
    // Step 5: Stays widget
    {
      element: '[data-tour="widget-stays"]',
      popover: {
        title: "🏨 Widget Hébergements",
        description: `
          <span class="highlight-badge">Trouvez votre logement</span>
          <p>Ce widget permet de trouver un hébergement adapté à votre budget et vos critères.</p>
          <ul>
            <li><strong>Destination</strong> synchronisée avec le reste du voyage</li>
            <li><strong>Budget</strong> par nuit et niveau de confort</li>
            <li><strong>Type</strong> : hôtel, appart, villa, auberge…</li>
            <li><strong>Filtres</strong> (note, équipements) + résultats détaillés</li>
          </ul>
          <div class="tip-box">💡 L'onglet Hébergements est surligné</div>
        `,
        side: "right",
        align: "center",
        popoverClass: "travliaq-popover-right",
      },
    },
    // Step 6: Activities widget
    {
      element: '[data-tour="widget-activities"]',
      popover: {
        title: "🎭 Widget Activités",
        description: `
          <span class="highlight-badge">Découvrez que faire</span>
          <p>Ce widget sert à explorer des activités et à construire votre programme sur place.</p>
          <ul>
            <li><strong>Catégories</strong> : culture, nature, gastronomie…</li>
            <li><strong>Filtres</strong> : prix, durée, popularité</li>
            <li><strong>Recherche</strong> : par ville et via la carte</li>
            <li><strong>Détails</strong> : description, horaires, localisation</li>
          </ul>
          <div class="tip-box">💡 L'onglet Activités est surligné</div>
        `,
        side: "right",
        align: "center",
        popoverClass: "travliaq-popover-right",
      },
    },
    // Step 7: Preferences widget
    {
      element: '[data-tour="widget-preferences"]',
      popover: {
        title: "⚙️ Widget Préférences",
        description: `
          <span class="highlight-badge">Personnalisez votre voyage</span>
          <p>Vos préférences guident l'IA pour proposer des vols/activités/hébergements cohérents.</p>
          <ul>
            <li><strong>Rythme</strong> : détente, modéré, intensif</li>
            <li><strong>Confort</strong> : économique → premium</li>
            <li><strong>Centres d'intérêt</strong> : culture, nature, plage…</li>
            <li><strong>Style</strong> : solo, couple, famille, amis</li>
          </ul>
          <div class="tip-box">💡 L'onglet Préférences est surligné</div>
        `,
        side: "right",
        align: "center",
        popoverClass: "travliaq-popover-right",
      },
    },
    // Step 8: Final
    {
      element: '[data-tour="chat-panel"]',
      popover: {
        title: "🚀 C'est parti !",
        description: `
          <p style="font-weight: 600; color: hsl(var(--foreground));">Vous êtes prêt à planifier votre voyage.</p>
          <div class="tip-box" style="background: hsl(var(--primary) / 0.15);">
            🎯 <span><strong>Commencez par :</strong> dites bonjour à l'assistant ou configurez vos vols !</span>
          </div>
          <p style="font-size: 0.75rem; margin-top: 12px;">Relancez ce guide depuis les paramètres à tout moment.</p>
        `,
        side: "right",
        align: "center",
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
        
        // Configure first step before starting
        configureStep(0);
        
        const driverConfig: Config = {
          showButtons: ['next', 'previous'],
          showProgress: false,
          allowClose: true,
          overlayOpacity: 0.75,
          stagePadding: 12,
          stageRadius: 16,
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
            renderProgressHeader(popover.wrapper, idx, total, opts.driver);
          },
          onHighlightStarted: (_el, step, opts) => {
            const idx = opts.state.activeIndex ?? 0;
            const tab = STEP_CONFIG[idx]?.tab;
            highlightTab(tab);
          },
          onNextClick: (_el, _step, opts) => {
            const idx = opts.state.activeIndex ?? 0;
            const nextIndex = idx + 1;
            if (nextIndex < steps.length) {
              configureStep(nextIndex);
              // Small delay to let UI update before driver moves
              setTimeout(() => {
                opts.driver.moveNext();
              }, 150);
            }
          },
          onPrevClick: (_el, _step, opts) => {
            const idx = opts.state.activeIndex ?? 0;
            const prevIndex = Math.max(0, idx - 1);
            configureStep(prevIndex);
            setTimeout(() => {
              opts.driver.movePrevious();
            }, 150);
          },
          steps: steps,
          onDestroyed: () => {
            handleComplete();
          },
        };

        driverRef.current = driver(driverConfig);
        
        // Start after a short delay to ensure elements are ready
        setTimeout(() => {
          driverRef.current?.drive();
        }, 200);
      }, forceShow ? 0 : 800);

      return () => clearTimeout(timer);
    }
  }, [forceShow]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (driverRef.current) {
        driverRef.current.destroy();
      }
      // Clean up any remaining highlights
      document.querySelectorAll(".travliaq-tab-highlight").forEach((el) => {
        el.classList.remove("travliaq-tab-highlight");
      });
    };
  }, []);

  return null;
}
