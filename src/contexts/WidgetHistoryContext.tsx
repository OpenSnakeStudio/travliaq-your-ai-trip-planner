/**
 * WidgetHistoryContext - Tracks all widget interactions for LLM context
 * 
 * This context maintains a history of all widgets shown to the user and their
 * selections. This data is sent to the LLM to provide better conversational context.
 */

import { createContext, useContext, useCallback, useState, useRef, type ReactNode } from "react";

// ===== Types =====

export type WidgetInteractionType =
  | "date_selected"
  | "date_range_selected"
  | "travelers_selected"
  | "trip_type_selected"
  | "city_selected"
  | "airport_selected"
  | "style_configured"
  | "interests_selected"
  | "must_haves_configured"
  | "dietary_configured"
  | "destination_selected"
  | "quick_filter_applied";

export interface WidgetInteraction {
  id: string;
  timestamp: number;
  widgetType: string;
  interactionType: WidgetInteractionType;
  data: Record<string, unknown>;
  // Human-readable summary for LLM context
  summary: string;
}

export interface ActiveWidget {
  id: string;
  messageId: string;
  widgetType: string;
  createdAt: number;
  state: "pending" | "completed" | "dismissed";
  selectedValue?: unknown;
  displayLabel?: string;
  options?: string[]; // Available options for "choose for me" functionality
}

interface WidgetHistoryContextValue {
  // History of all widget interactions
  interactions: WidgetInteraction[];
  
  // Currently active widgets (not yet completed)
  activeWidgets: ActiveWidget[];
  
  // Record a widget being shown
  registerWidget: (messageId: string, widgetType: string, options?: string[]) => string;
  
  // Record a widget interaction (selection, completion, etc.)
  recordInteraction: (
    widgetId: string,
    interactionType: WidgetInteractionType,
    data: Record<string, unknown>,
    summary: string
  ) => void;
  
  // Mark widget as completed (keeps it visible with selection shown)
  completeWidget: (widgetId: string, selectedValue: unknown, displayLabel: string) => void;
  
  // Dismiss a widget without completing (hides it)
  dismissWidget: (widgetId: string) => void;
  
  // Get widget state by message ID
  getWidgetByMessageId: (messageId: string) => ActiveWidget | undefined;
  
  // Get serialized context for LLM
  getContextForLLM: () => string;
  
  // Get active widgets context for LLM (pending widgets with their options)
  getActiveWidgetsContext: () => string;
  
  // Get recent interactions summary
  getRecentInteractionsSummary: (count?: number) => string;
  
  // Clear all history (on session reset)
  clearHistory: () => void;
}

// ===== Context =====

const WidgetHistoryContext = createContext<WidgetHistoryContextValue | null>(null);

// ===== Provider =====

interface WidgetHistoryProviderProps {
  children: ReactNode;
}

export function WidgetHistoryProvider({ children }: WidgetHistoryProviderProps) {
  const [interactions, setInteractions] = useState<WidgetInteraction[]>([]);
  const [activeWidgets, setActiveWidgets] = useState<ActiveWidget[]>([]);
  const widgetIdCounter = useRef(0);

  const registerWidget = useCallback((messageId: string, widgetType: string, options?: string[]): string => {
    const widgetId = `widget-${widgetType}-${Date.now()}-${++widgetIdCounter.current}`;
    
    setActiveWidgets((prev) => [
      ...prev,
      {
        id: widgetId,
        messageId,
        widgetType,
        createdAt: Date.now(),
        state: "pending",
        options,
      },
    ]);
    
    return widgetId;
  }, []);

  const recordInteraction = useCallback((
    widgetId: string,
    interactionType: WidgetInteractionType,
    data: Record<string, unknown>,
    summary: string
  ) => {
    const widget = activeWidgets.find((w) => w.id === widgetId);
    
    const interaction: WidgetInteraction = {
      id: `interaction-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      widgetType: widget?.widgetType || "unknown",
      interactionType,
      data,
      summary,
    };
    
    setInteractions((prev) => [...prev.slice(-50), interaction]); // Keep last 50
  }, [activeWidgets]);

  const completeWidget = useCallback((widgetId: string, selectedValue: unknown, displayLabel: string) => {
    setActiveWidgets((prev) =>
      prev.map((w) =>
        w.id === widgetId
          ? { ...w, state: "completed" as const, selectedValue, displayLabel }
          : w
      )
    );
  }, []);

  const dismissWidget = useCallback((widgetId: string) => {
    setActiveWidgets((prev) =>
      prev.map((w) =>
        w.id === widgetId ? { ...w, state: "dismissed" as const } : w
      )
    );
  }, []);

  const getWidgetByMessageId = useCallback((messageId: string): ActiveWidget | undefined => {
    return activeWidgets.find((w) => w.messageId === messageId);
  }, [activeWidgets]);

  const getContextForLLM = useCallback((): string => {
    if (interactions.length === 0) {
      return "";
    }
    
    const recentInteractions = interactions.slice(-10);
    const lines = recentInteractions.map((i) => `- ${i.summary}`);
    
    return `[INTERACTIONS UTILISATEUR]\n${lines.join("\n")}`;
  }, [interactions]);

  /**
   * Get active widgets context for LLM - pending widgets with their options
   * This allows the LLM to understand what choices are available to help with "choose for me"
   */
  const getActiveWidgetsContext = useCallback((): string => {
    const pending = activeWidgets.filter(w => w.state === "pending");
    if (pending.length === 0) return "";
    
    const widgetTypeLabels: Record<string, string> = {
      citySelector: "sélection de ville/destination",
      destinationSuggestions: "suggestions de destinations",
      datePicker: "sélection de date",
      dateRangePicker: "sélection de dates",
      returnDatePicker: "sélection de date de retour",
      travelersSelector: "nombre de voyageurs",
      tripTypeConfirm: "type de voyage (aller-retour, aller simple, multi-destinations)",
      preferenceStyle: "style de voyage",
      preferenceInterests: "centres d'intérêt",
      mustHaves: "critères obligatoires",
      dietary: "restrictions alimentaires",
    };
    
    const lines = pending.map(w => {
      const label = widgetTypeLabels[w.widgetType] || w.widgetType;
      if (w.options && w.options.length > 0) {
        return `- Widget "${label}" affiché avec options : ${w.options.join(", ")}`;
      }
      return `- Widget "${label}" en attente de sélection`;
    });
    
    return `[WIDGETS ACTIFS - L'utilisateur voit ces widgets et peut demander "choisis pour moi"]\n${lines.join("\n")}`;
  }, [activeWidgets]);

  const getRecentInteractionsSummary = useCallback((count = 5): string => {
    const recent = interactions.slice(-count);
    if (recent.length === 0) return "";
    
    return recent.map((i) => i.summary).join(" → ");
  }, [interactions]);

  const clearHistory = useCallback(() => {
    setInteractions([]);
    setActiveWidgets([]);
  }, []);

  const value: WidgetHistoryContextValue = {
    interactions,
    activeWidgets,
    registerWidget,
    recordInteraction,
    completeWidget,
    dismissWidget,
    getWidgetByMessageId,
    getContextForLLM,
    getActiveWidgetsContext,
    getRecentInteractionsSummary,
    clearHistory,
  };

  return (
    <WidgetHistoryContext.Provider value={value}>
      {children}
    </WidgetHistoryContext.Provider>
  );
}

// ===== Hook =====

export function useWidgetHistory(): WidgetHistoryContextValue {
  const context = useContext(WidgetHistoryContext);
  if (!context) {
    throw new Error("useWidgetHistory must be used within a WidgetHistoryProvider");
  }
  return context;
}

// ===== Helper: Format interaction summaries in French =====

export function formatDateSelection(date: Date, type: "departure" | "return"): string {
  const label = type === "departure" ? "départ" : "retour";
  const dateStr = date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  return `Date de ${label} choisie : ${dateStr}`;
}

export function formatDateRangeSelection(departure: Date, returnDate: Date): string {
  const depStr = departure.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  const retStr = returnDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  return `Dates choisies : ${depStr} → ${retStr}`;
}

export function formatTravelersSelection(adults: number, children: number, infants: number): string {
  const parts: string[] = [`${adults} adulte${adults > 1 ? "s" : ""}`];
  if (children > 0) parts.push(`${children} enfant${children > 1 ? "s" : ""}`);
  if (infants > 0) parts.push(`${infants} bébé${infants > 1 ? "s" : ""}`);
  return `Voyageurs : ${parts.join(", ")}`;
}

export function formatTripTypeSelection(tripType: "roundtrip" | "oneway" | "multi"): string {
  const labels = { roundtrip: "Aller-retour", oneway: "Aller simple", multi: "Multi-destinations" };
  return `Type de voyage : ${labels[tripType]}`;
}

export function formatCitySelection(cityName: string, countryName: string): string {
  return `Destination choisie : ${cityName}, ${countryName}`;
}

export function formatAirportSelection(airportName: string, iata: string, type: "departure" | "arrival"): string {
  const label = type === "departure" ? "Départ" : "Arrivée";
  return `Aéroport ${label.toLowerCase()} : ${airportName} (${iata})`;
}

export function formatStyleConfiguration(axes: Record<string, number>): string {
  const labels: Record<string, [string, string]> = {
    chillVsIntense: ["Détente", "Intense"],
    cityVsNature: ["Ville", "Nature"],
    ecoVsLuxury: ["Économique", "Luxe"],
    touristVsLocal: ["Touristique", "Authentique"],
  };
  
  const summaries = Object.entries(axes).map(([key, value]) => {
    const [low, high] = labels[key] || [key, key];
    if (value < 30) return low;
    if (value > 70) return high;
    return `${low}/${high} équilibré`;
  });
  
  return `Style configuré : ${summaries.join(", ")}`;
}

export function formatInterestsSelection(interests: string[]): string {
  if (interests.length === 0) return "Aucun centre d'intérêt sélectionné";
  return `Centres d'intérêt : ${interests.slice(0, 5).join(", ")}${interests.length > 5 ? "..." : ""}`;
}
