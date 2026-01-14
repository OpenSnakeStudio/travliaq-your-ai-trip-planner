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
import i18n from "@/i18n/config";

/**
 * Alert priority for ordering
 */
export type AlertPriority = "critical" | "high" | "medium" | "low";

/**
 * Proactive alert (extends PriceAlert with more context)
 */
export interface ProactiveAlert extends PriceAlert {
  priority: AlertPriority;
  category: "price" | "availability" | "timing" | "conflict" | "suggestion";
  step?: string;
  autoExpire?: boolean;
  metadata?: Record<string, any>;
}

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

interface AvailabilityData {
  itemId: string;
  itemType: "flight" | "hotel" | "activity";
  itemName: string;
  remainingUnits: number;
  totalUnits: number;
  expiresAt?: Date;
  isLastMinute?: boolean;
}

interface AlertConfig {
  priceDrops: boolean;
  priceIncreases: boolean;
  lowAvailability: boolean;
  timingSuggestions: boolean;
  conflicts: boolean;
  minPriceDropPercent: number;
  maxPriceIncreasePercent: number;
  lowAvailabilityThreshold: number;
  timingAlertDays: number;
}

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

function calculatePercentChange(oldPrice: number, newPrice: number): number {
  if (oldPrice === 0) return 0;
  return Math.round(((newPrice - oldPrice) / oldPrice) * 100);
}

function getPriorityForSeverity(severity: AlertSeverity): AlertPriority {
  switch (severity) {
    case "urgent": return "critical";
    case "warning": return "high";
    case "success": return "medium";
    default: return "low";
  }
}

function getItemTypeLabel(itemType: "flight" | "hotel" | "activity"): string {
  const t = i18n.t.bind(i18n);
  switch (itemType) {
    case "flight": return t("planner.alert.itemFlight");
    case "hotel": return t("planner.alert.itemHotel");
    case "activity": return t("planner.alert.itemActivity");
  }
}

function generatePriceDropAlert(tracked: TrackedPrice, config: AlertConfig): ProactiveAlert | null {
  const t = i18n.t.bind(i18n);
  const percentChange = calculatePercentChange(tracked.previousPrice, tracked.currentPrice);
  if (percentChange >= -config.minPriceDropPercent) return null;

  const isHistoricLow = tracked.currentPrice <= tracked.lowestPrice;
  const severity: AlertSeverity = isHistoricLow ? "urgent" : "success";

  return {
    id: `price-drop-${tracked.itemId}-${Date.now()}`,
    type: "price_drop",
    severity,
    priority: isHistoricLow ? "critical" : "high",
    category: "price",
    title: isHistoricLow ? t("planner.alert.historicLow") : t("planner.alert.priceDrop"),
    message: t("planner.alert.priceDropMessage", { itemType: getItemTypeLabel(tracked.itemType), itemName: tracked.itemName }),
    item: { id: tracked.itemId, name: tracked.itemName, type: tracked.itemType },
    priceChange: { oldPrice: tracked.previousPrice, newPrice: tracked.currentPrice, currency: tracked.currency, percentChange },
    actions: [
      { label: t("planner.alert.viewOffer"), action: `view_${tracked.itemType}_${tracked.itemId}`, primary: true },
      { label: t("planner.alert.bookNow"), action: `book_${tracked.itemType}_${tracked.itemId}` },
    ],
    dismissible: true,
    createdAt: new Date(),
    metadata: { lowestPrice: tracked.lowestPrice, isHistoricLow },
  };
}

function generatePriceIncreaseAlert(tracked: TrackedPrice, config: AlertConfig): ProactiveAlert | null {
  const t = i18n.t.bind(i18n);
  const percentChange = calculatePercentChange(tracked.previousPrice, tracked.currentPrice);
  if (percentChange <= config.maxPriceIncreasePercent) return null;

  return {
    id: `price-increase-${tracked.itemId}-${Date.now()}`,
    type: "price_increase",
    severity: "warning",
    priority: "medium",
    category: "price",
    title: t("planner.alert.priceIncrease"),
    message: t("planner.alert.priceIncreaseMessage", { percent: percentChange }),
    item: { id: tracked.itemId, name: tracked.itemName, type: tracked.itemType },
    priceChange: { oldPrice: tracked.previousPrice, newPrice: tracked.currentPrice, currency: tracked.currency, percentChange },
    actions: [{ label: t("planner.alert.bookNow"), action: `book_${tracked.itemType}_${tracked.itemId}`, primary: true }],
    dismissible: true,
    createdAt: new Date(),
  };
}

function generateAvailabilityAlert(availability: AvailabilityData, config: AlertConfig): ProactiveAlert | null {
  const t = i18n.t.bind(i18n);
  if (availability.remainingUnits > config.lowAvailabilityThreshold) return null;

  const isUrgent = availability.remainingUnits <= 2;
  const isLastMinute = availability.isLastMinute;

  let severity: AlertSeverity = "warning";
  let type: PriceAlertType = "low_availability";
  let title = t("planner.alert.limitedAvailability");
  let message = t("planner.alert.spotsRemaining", { count: availability.remainingUnits });

  if (isUrgent) {
    severity = "urgent";
    title = t("planner.alert.lastSpots");
    message = availability.remainingUnits === 1 
      ? t("planner.alert.lastSpotRemaining", { count: 1 })
      : t("planner.alert.lastSpotsRemaining", { count: availability.remainingUnits });
  }

  if (isLastMinute) {
    type = "flash_sale";
    title = t("planner.alert.lastMinuteOffer");
  }

  return {
    id: `availability-${availability.itemId}-${Date.now()}`,
    type,
    severity,
    priority: isUrgent ? "critical" : "high",
    category: "availability",
    title,
    message,
    item: { id: availability.itemId, name: availability.itemName, type: availability.itemType },
    expiry: availability.expiresAt ? { expiresAt: availability.expiresAt, remainingUnits: availability.remainingUnits } : undefined,
    actions: [{ label: t("planner.alert.book"), action: `book_${availability.itemType}_${availability.itemId}`, primary: true }],
    dismissible: false,
    createdAt: new Date(),
  };
}

function generateTimingAlert(context: WorkflowContext, config: AlertConfig): ProactiveAlert | null {
  const t = i18n.t.bind(i18n);
  const departure = context.selections.dates?.departure;
  if (!departure) return null;

  const now = new Date();
  const daysUntilDeparture = Math.ceil((new Date(departure).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntilDeparture > 60) return null;

  const hasFlights = !!context.selections.flights?.outbound;
  if (daysUntilDeparture <= config.timingAlertDays && !hasFlights) {
    const isUrgent = daysUntilDeparture <= 7;
    return {
      id: `timing-${Date.now()}`,
      type: "expiring_deal",
      severity: isUrgent ? "urgent" : "warning",
      priority: isUrgent ? "critical" : "high",
      category: "timing",
      title: isUrgent ? t("planner.alert.departureClose") : t("planner.alert.timeToBook"),
      message: isUrgent
        ? t("planner.alert.departureCloseMessage", { days: daysUntilDeparture })
        : t("planner.alert.timeToBookMessage", { days: daysUntilDeparture }),
      step: "flights",
      actions: [{ label: t("planner.alert.searchFlights"), action: "search_flights", primary: true }],
      dismissible: !isUrgent,
      createdAt: new Date(),
      metadata: { daysUntilDeparture },
    };
  }
  return null;
}

function generateSeasonalAlert(context: WorkflowContext): ProactiveAlert | null {
  const t = i18n.t.bind(i18n);
  const { destination, dates } = context.selections;
  if (!destination?.countryCode || !dates?.departure) return null;

  const seasonal = getSeasonalInfo(destination.countryCode, new Date(dates.departure));
  if (!seasonal || (seasonal.season !== "peak" && seasonal.season !== "high")) return null;

  const isPeak = seasonal.season === "peak";
  const percent = Math.round((seasonal.priceMultiplier - 1) * 100);

  return {
    id: `seasonal-${destination.countryCode}-${Date.now()}`,
    type: "new_deal",
    severity: isPeak ? "warning" : "info",
    priority: isPeak ? "medium" : "low",
    category: "suggestion",
    title: isPeak ? t("planner.alert.peakSeason") : t("planner.alert.highSeason"),
    message: isPeak
      ? t("planner.alert.peakSeasonMessage", { city: destination.city, percent })
      : t("planner.alert.highSeasonMessage", { city: destination.city, percent }),
    actions: [{ label: t("planner.alert.viewOtherDates"), action: "change_dates" }],
    dismissible: true,
    createdAt: new Date(),
    metadata: { season: seasonal.season, priceMultiplier: seasonal.priceMultiplier },
  };
}

function conflictToAlert(conflict: Conflict): ProactiveAlert {
  const severity: AlertSeverity = conflict.severity === "error" ? "urgent" : conflict.severity === "warning" ? "warning" : "info";
  return {
    id: `conflict-${conflict.id}`,
    type: "new_deal",
    severity,
    priority: getPriorityForSeverity(severity),
    category: "conflict",
    title: conflict.title,
    message: conflict.message,
    actions: conflict.action ? [{ label: conflict.action.label, action: JSON.stringify(conflict.action), primary: true }] : undefined,
    dismissible: conflict.severity !== "error",
    createdAt: new Date(),
    metadata: { conflictType: conflict.type, items: conflict.items },
  };
}

export function getProactiveAlerts(
  context: WorkflowContext,
  trackedPrices: TrackedPrice[] = [],
  availabilityData: AvailabilityData[] = [],
  config: Partial<AlertConfig> = {}
): ProactiveAlert[] {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const alerts: ProactiveAlert[] = [];

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

  if (fullConfig.lowAvailability) {
    for (const availability of availabilityData) {
      const availAlert = generateAvailabilityAlert(availability, fullConfig);
      if (availAlert) alerts.push(availAlert);
    }
  }

  if (fullConfig.timingSuggestions) {
    const timingAlert = generateTimingAlert(context, fullConfig);
    if (timingAlert) alerts.push(timingAlert);
    const seasonalAlert = generateSeasonalAlert(context);
    if (seasonalAlert) alerts.push(seasonalAlert);
  }

  if (fullConfig.conflicts) {
    const conflictResult = detectConflicts(context);
    const criticalConflicts = conflictResult.conflicts.filter((c) => c.severity === "error" || c.severity === "warning");
    for (const conflict of criticalConflicts) {
      alerts.push(conflictToAlert(conflict));
    }
  }

  const priorityOrder: Record<AlertPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  return alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

export function filterAlertsByCategory(alerts: ProactiveAlert[], category: ProactiveAlert["category"]): ProactiveAlert[] {
  return alerts.filter((a) => a.category === category);
}

export function filterAlertsByStep(alerts: ProactiveAlert[], step: string): ProactiveAlert[] {
  return alerts.filter((a) => !a.step || a.step === step);
}

export function getCriticalAlertsCount(alerts: ProactiveAlert[]): number {
  return alerts.filter((a) => a.priority === "critical").length;
}

export function getAlertsSummary(alerts: ProactiveAlert[]): { critical: number; high: number; medium: number; low: number } {
  return {
    critical: alerts.filter((a) => a.priority === "critical").length,
    high: alerts.filter((a) => a.priority === "high").length,
    medium: alerts.filter((a) => a.priority === "medium").length,
    low: alerts.filter((a) => a.priority === "low").length,
  };
}

export function simulatePriceTracking(): TrackedPrice[] {
  return [];
}

export function simulateAvailabilityData(): AvailabilityData[] {
  return [];
}
