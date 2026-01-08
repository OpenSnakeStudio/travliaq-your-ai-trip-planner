/**
 * ProactiveAlerts Service - Intelligent alert generation
 *
 * Generates proactive alerts based on context, price changes,
 * availability, timing, and user behavior patterns.
 */

import type { WorkflowContext, StepSelections } from "../machines/workflowMachine";
import type { PriceAlert, PriceAlertType, AlertSeverity } from "../widgets/alerts/PriceAlertBanner";
import { detectConflicts, type Conflict } from "./conflictDetector";
import { getSeasonalInfo } from "./contextualSuggestions";

/**
 * Alert priority for ordering
 */
export type AlertPriority = "critical" | "high" | "medium" | "low";

/**
 * Proactive alert (extends PriceAlert with more context)
 */
export interface ProactiveAlert extends PriceAlert {
  /** Priority for ordering */
  priority: AlertPriority;
  /** Category for grouping */
  category: "price" | "availability" | "timing" | "conflict" | "suggestion";
  /** Target step if relevant */
  step?: string;
  /** Should auto-dismiss after viewing */
  autoExpire?: boolean;
  /** Tracking metadata */
  metadata?: Record<string, any>;
}

/**
 * Price tracking data (simulated - would come from real API)
 */
interface TrackedPrice {
  itemId: string;
  itemType: "flight" | "hotel" | "activity";
  itemName: string;
  currentPrice: number;
  previousPrice: number;
  lowestPrice: number;
  highestPrice: number;
  currency: string;
  priceHistory: Array<{ date: Date; price: number }>;
  lastUpdated: Date;
}

/**
 * Availability data (simulated)
 */
interface AvailabilityData {
  itemId: string;
  itemType: "flight" | "hotel" | "activity";
  itemName: string;
  remainingUnits: number;
  totalUnits: number;
  expiresAt?: Date;
  isLastMinute?: boolean;
}

/**
 * Alert generation configuration
 */
interface AlertConfig {
  /** Enable price drop alerts */
  priceDrops: boolean;
  /** Enable price increase alerts */
  priceIncreases: boolean;
  /** Enable low availability alerts */
  lowAvailability: boolean;
  /** Enable timing suggestions */
  timingSuggestions: boolean;
  /** Enable conflict alerts */
  conflicts: boolean;
  /** Minimum price drop percentage to alert */
  minPriceDropPercent: number;
  /** Maximum price increase percentage before alert */
  maxPriceIncreasePercent: number;
  /** Low availability threshold */
  lowAvailabilityThreshold: number;
  /** Days before departure for timing alerts */
  timingAlertDays: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: AlertConfig = {
  priceDrops: true,
  priceIncreases: true,
  lowAvailability: true,
  timingSuggestions: true,
  conflicts: true,
  minPriceDropPercent: 5,
  maxPriceIncreasePercent: 10,
  lowAvailabilityThreshold: 5,
  timingAlertDays: 14,
};

/**
 * Calculate percent change
 */
function calculatePercentChange(oldPrice: number, newPrice: number): number {
  if (oldPrice === 0) return 0;
  return Math.round(((newPrice - oldPrice) / oldPrice) * 100);
}

/**
 * Get priority for severity
 */
function getPriorityForSeverity(severity: AlertSeverity): AlertPriority {
  switch (severity) {
    case "urgent":
      return "critical";
    case "warning":
      return "high";
    case "success":
      return "medium";
    default:
      return "low";
  }
}

/**
 * Generate price drop alert
 */
function generatePriceDropAlert(
  tracked: TrackedPrice,
  config: AlertConfig
): ProactiveAlert | null {
  const percentChange = calculatePercentChange(
    tracked.previousPrice,
    tracked.currentPrice
  );

  // Only alert if drop is significant
  if (percentChange >= -config.minPriceDropPercent) return null;

  const isHistoricLow = tracked.currentPrice <= tracked.lowestPrice;
  const severity: AlertSeverity = isHistoricLow ? "urgent" : "success";

  return {
    id: `price-drop-${tracked.itemId}-${Date.now()}`,
    type: "price_drop",
    severity,
    priority: isHistoricLow ? "critical" : "high",
    category: "price",
    title: isHistoricLow ? "Prix historiquement bas !" : "Baisse de prix !",
    message: `Le prix ${tracked.itemType === "flight" ? "du vol" : tracked.itemType === "hotel" ? "de l'hôtel" : "de l'activité"} "${tracked.itemName}" a baissé.`,
    item: {
      id: tracked.itemId,
      name: tracked.itemName,
      type: tracked.itemType,
    },
    priceChange: {
      oldPrice: tracked.previousPrice,
      newPrice: tracked.currentPrice,
      currency: tracked.currency,
      percentChange,
    },
    actions: [
      {
        label: "Voir l'offre",
        action: `view_${tracked.itemType}_${tracked.itemId}`,
        primary: true,
      },
      {
        label: "Réserver maintenant",
        action: `book_${tracked.itemType}_${tracked.itemId}`,
      },
    ],
    dismissible: true,
    createdAt: new Date(),
    metadata: {
      lowestPrice: tracked.lowestPrice,
      isHistoricLow,
    },
  };
}

/**
 * Generate price increase alert
 */
function generatePriceIncreaseAlert(
  tracked: TrackedPrice,
  config: AlertConfig
): ProactiveAlert | null {
  const percentChange = calculatePercentChange(
    tracked.previousPrice,
    tracked.currentPrice
  );

  // Only alert if increase is significant
  if (percentChange <= config.maxPriceIncreasePercent) return null;

  return {
    id: `price-increase-${tracked.itemId}-${Date.now()}`,
    type: "price_increase",
    severity: "warning",
    priority: "medium",
    category: "price",
    title: "Prix en hausse",
    message: `Le prix a augmenté de ${percentChange}%. Réservez rapidement avant une nouvelle hausse.`,
    item: {
      id: tracked.itemId,
      name: tracked.itemName,
      type: tracked.itemType,
    },
    priceChange: {
      oldPrice: tracked.previousPrice,
      newPrice: tracked.currentPrice,
      currency: tracked.currency,
      percentChange,
    },
    actions: [
      {
        label: "Réserver maintenant",
        action: `book_${tracked.itemType}_${tracked.itemId}`,
        primary: true,
      },
    ],
    dismissible: true,
    createdAt: new Date(),
  };
}

/**
 * Generate low availability alert
 */
function generateAvailabilityAlert(
  availability: AvailabilityData,
  config: AlertConfig
): ProactiveAlert | null {
  // Only alert if availability is low
  if (availability.remainingUnits > config.lowAvailabilityThreshold) {
    return null;
  }

  const isUrgent = availability.remainingUnits <= 2;
  const isLastMinute = availability.isLastMinute;

  let severity: AlertSeverity = "warning";
  let type: PriceAlertType = "low_availability";
  let title = "Disponibilité limitée";
  let message = `Plus que ${availability.remainingUnits} places disponibles.`;

  if (isUrgent) {
    severity = "urgent";
    title = "Dernières places !";
    message = `Il ne reste que ${availability.remainingUnits} place${availability.remainingUnits > 1 ? "s" : ""} !`;
  }

  if (isLastMinute) {
    type = "flash_sale";
    title = "Offre de dernière minute";
  }

  return {
    id: `availability-${availability.itemId}-${Date.now()}`,
    type,
    severity,
    priority: isUrgent ? "critical" : "high",
    category: "availability",
    title,
    message,
    item: {
      id: availability.itemId,
      name: availability.itemName,
      type: availability.itemType,
    },
    expiry: availability.expiresAt
      ? {
          expiresAt: availability.expiresAt,
          remainingUnits: availability.remainingUnits,
        }
      : undefined,
    actions: [
      {
        label: "Réserver",
        action: `book_${availability.itemType}_${availability.itemId}`,
        primary: true,
      },
    ],
    dismissible: false,
    createdAt: new Date(),
  };
}

/**
 * Generate timing suggestion alert
 */
function generateTimingAlert(
  context: WorkflowContext,
  config: AlertConfig
): ProactiveAlert | null {
  const departure = context.selections.dates?.departure;
  if (!departure) return null;

  const now = new Date();
  const daysUntilDeparture = Math.ceil(
    (new Date(departure).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Too far out - no urgency
  if (daysUntilDeparture > 60) return null;

  // Check if flights are booked
  const hasFlights = !!context.selections.flights?.outbound;

  if (daysUntilDeparture <= config.timingAlertDays && !hasFlights) {
    const isUrgent = daysUntilDeparture <= 7;

    return {
      id: `timing-${Date.now()}`,
      type: "expiring_deal",
      severity: isUrgent ? "urgent" : "warning",
      priority: isUrgent ? "critical" : "high",
      category: "timing",
      title: isUrgent
        ? "Départ très proche !"
        : "Il est temps de réserver",
      message: isUrgent
        ? `Votre départ est dans ${daysUntilDeparture} jours et vous n'avez pas encore de vol. Les prix augmentent fortement à l'approche du départ.`
        : `Votre départ est dans ${daysUntilDeparture} jours. Réservez vos vols maintenant pour les meilleurs prix.`,
      step: "flights",
      actions: [
        {
          label: "Rechercher des vols",
          action: "search_flights",
          primary: true,
        },
      ],
      dismissible: !isUrgent,
      createdAt: new Date(),
      metadata: {
        daysUntilDeparture,
      },
    };
  }

  return null;
}

/**
 * Generate seasonal alert
 */
function generateSeasonalAlert(
  context: WorkflowContext
): ProactiveAlert | null {
  const { destination, dates } = context.selections;

  if (!destination?.countryCode || !dates?.departure) return null;

  const seasonal = getSeasonalInfo(
    destination.countryCode,
    new Date(dates.departure)
  );

  if (!seasonal) return null;

  // Only alert for peak/high season
  if (seasonal.season !== "peak" && seasonal.season !== "high") return null;

  const isPeak = seasonal.season === "peak";

  return {
    id: `seasonal-${destination.countryCode}-${Date.now()}`,
    type: "new_deal",
    severity: isPeak ? "warning" : "info",
    priority: isPeak ? "medium" : "low",
    category: "suggestion",
    title: isPeak ? "Très haute saison" : "Haute saison",
    message: isPeak
      ? `C'est la très haute saison à ${destination.city}. Attendez-vous à des prix ${Math.round((seasonal.priceMultiplier - 1) * 100)}% plus élevés et des sites très fréquentés.`
      : `C'est la haute saison à ${destination.city}. Les prix sont environ ${Math.round((seasonal.priceMultiplier - 1) * 100)}% plus élevés que d'habitude.`,
    actions: [
      {
        label: "Voir d'autres dates",
        action: "change_dates",
      },
    ],
    dismissible: true,
    createdAt: new Date(),
    metadata: {
      season: seasonal.season,
      priceMultiplier: seasonal.priceMultiplier,
    },
  };
}

/**
 * Convert conflict to proactive alert
 */
function conflictToAlert(conflict: Conflict): ProactiveAlert {
  const severity: AlertSeverity =
    conflict.severity === "error"
      ? "urgent"
      : conflict.severity === "warning"
      ? "warning"
      : "info";

  return {
    id: `conflict-${conflict.id}`,
    type: "new_deal",
    severity,
    priority: getPriorityForSeverity(severity),
    category: "conflict",
    title: conflict.title,
    message: conflict.message,
    actions: conflict.action
      ? [
          {
            label: conflict.action.label,
            action: JSON.stringify(conflict.action),
            primary: true,
          },
        ]
      : undefined,
    dismissible: conflict.severity !== "error",
    createdAt: new Date(),
    metadata: {
      conflictType: conflict.type,
      items: conflict.items,
    },
  };
}

/**
 * Get all proactive alerts for context
 */
export function getProactiveAlerts(
  context: WorkflowContext,
  trackedPrices: TrackedPrice[] = [],
  availabilityData: AvailabilityData[] = [],
  config: Partial<AlertConfig> = {}
): ProactiveAlert[] {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const alerts: ProactiveAlert[] = [];

  // Price alerts
  if (fullConfig.priceDrops || fullConfig.priceIncreases) {
    for (const tracked of trackedPrices) {
      if (fullConfig.priceDrops) {
        const dropAlert = generatePriceDropAlert(tracked, fullConfig);
        if (dropAlert) alerts.push(dropAlert);
      }
      if (fullConfig.priceIncreases) {
        const increaseAlert = generatePriceIncreaseAlert(tracked, fullConfig);
        if (increaseAlert) alerts.push(increaseAlert);
      }
    }
  }

  // Availability alerts
  if (fullConfig.lowAvailability) {
    for (const availability of availabilityData) {
      const availAlert = generateAvailabilityAlert(availability, fullConfig);
      if (availAlert) alerts.push(availAlert);
    }
  }

  // Timing alerts
  if (fullConfig.timingSuggestions) {
    const timingAlert = generateTimingAlert(context, fullConfig);
    if (timingAlert) alerts.push(timingAlert);

    const seasonalAlert = generateSeasonalAlert(context);
    if (seasonalAlert) alerts.push(seasonalAlert);
  }

  // Conflict alerts
  if (fullConfig.conflicts) {
    const conflictResult = detectConflicts(context);
    const criticalConflicts = conflictResult.conflicts.filter(
      (c) => c.severity === "error" || c.severity === "warning"
    );
    for (const conflict of criticalConflicts) {
      alerts.push(conflictToAlert(conflict));
    }
  }

  // Sort by priority
  const priorityOrder: Record<AlertPriority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  return alerts.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );
}

/**
 * Filter alerts by category
 */
export function filterAlertsByCategory(
  alerts: ProactiveAlert[],
  category: ProactiveAlert["category"]
): ProactiveAlert[] {
  return alerts.filter((a) => a.category === category);
}

/**
 * Filter alerts by step
 */
export function filterAlertsByStep(
  alerts: ProactiveAlert[],
  step: string
): ProactiveAlert[] {
  return alerts.filter((a) => !a.step || a.step === step);
}

/**
 * Get critical alerts count
 */
export function getCriticalAlertsCount(alerts: ProactiveAlert[]): number {
  return alerts.filter((a) => a.priority === "critical").length;
}

/**
 * Get alerts summary
 */
export function getAlertsSummary(alerts: ProactiveAlert[]): {
  total: number;
  critical: number;
  high: number;
  byCategory: Record<string, number>;
} {
  const byCategory: Record<string, number> = {};

  for (const alert of alerts) {
    byCategory[alert.category] = (byCategory[alert.category] || 0) + 1;
  }

  return {
    total: alerts.length,
    critical: alerts.filter((a) => a.priority === "critical").length,
    high: alerts.filter((a) => a.priority === "high").length,
    byCategory,
  };
}

/**
 * Simulated price tracking (for demo - would use real API)
 */
export function simulatePriceTracking(
  selections: StepSelections
): TrackedPrice[] {
  const tracked: TrackedPrice[] = [];

  // Simulate flight price tracking
  if (selections.flights?.outbound) {
    const currentPrice = selections.flights.outbound.price;
    // Simulate a random price change
    const previousPrice = currentPrice * (1 + (Math.random() * 0.3 - 0.15));

    tracked.push({
      itemId: selections.flights.outbound.id,
      itemType: "flight",
      itemName: "Vol aller",
      currentPrice,
      previousPrice: Math.round(previousPrice),
      lowestPrice: Math.round(currentPrice * 0.85),
      highestPrice: Math.round(currentPrice * 1.3),
      currency: "€",
      priceHistory: [],
      lastUpdated: new Date(),
    });
  }

  // Simulate hotel price tracking
  if (selections.hotels?.price) {
    const currentPrice = selections.hotels.price;
    const previousPrice = currentPrice * (1 + (Math.random() * 0.2 - 0.1));

    tracked.push({
      itemId: selections.hotels.id || "hotel-1",
      itemType: "hotel",
      itemName: selections.hotels.name || "Hôtel sélectionné",
      currentPrice,
      previousPrice: Math.round(previousPrice),
      lowestPrice: Math.round(currentPrice * 0.9),
      highestPrice: Math.round(currentPrice * 1.2),
      currency: "€",
      priceHistory: [],
      lastUpdated: new Date(),
    });
  }

  return tracked;
}

/**
 * Simulated availability data (for demo)
 */
export function simulateAvailabilityData(
  selections: StepSelections
): AvailabilityData[] {
  const availability: AvailabilityData[] = [];

  // Randomly simulate low availability for demo
  if (selections.flights?.outbound && Math.random() > 0.7) {
    availability.push({
      itemId: selections.flights.outbound.id,
      itemType: "flight",
      itemName: "Vol aller",
      remainingUnits: Math.floor(Math.random() * 5) + 1,
      totalUnits: 150,
    });
  }

  if (selections.hotels?.id && Math.random() > 0.7) {
    availability.push({
      itemId: selections.hotels.id,
      itemType: "hotel",
      itemName: selections.hotels.name || "Hôtel",
      remainingUnits: Math.floor(Math.random() * 3) + 1,
      totalUnits: 20,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  }

  return availability;
}
