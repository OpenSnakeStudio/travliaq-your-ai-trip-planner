/**
 * PlannerChat - Main chat component for travel planning
 *
 * This component has been refactored to use modular hooks:
 * - useChatStream: Handles SSE streaming responses
 * - useChatWidgetFlow: Manages widget interactions
 * - useChatImperativeHandlers: Provides methods exposed via ref
 * - useChatScroll: Intelligent scroll management
 * - useChatMapContext: Map/widget context for LLM
 */

import { useState, useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from "react";
import { Plane, History, Send, PanelLeftClose, Copy, ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo-travliaq.png";
import { ChatHistorySidebar } from "./ChatHistorySidebar";
import { useChatSessions, type StoredMessage } from "@/hooks/useChatSessions";
import { useChatScroll } from "@/hooks/useChatScroll";
import { useChatMapContext } from "@/hooks/useChatMapContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Chat module imports
import {
  DatePickerWidget,
  DateRangePickerWidget,
  TravelersWidget,
  TravelersConfirmBeforeSearchWidget,
  TripTypeConfirmWidget,
  CitySelectionWidget,
  AirportButton,
  DualAirportSelection,
  AirportConfirmationWidget,
  MarkdownMessage,
} from "./chat/widgets";
import { QuickReplies } from "./chat/QuickReplies";
import { useChatStream, useChatWidgetFlow, useChatImperativeHandlers } from "./chat/hooks";
import { parseAction, flightDataToMemory } from "./chat/utils";
import type { ChatMessage } from "./chat/types";
import { getCityCoords } from "./chat/types";
import { SmartSuggestions } from "./chat/SmartSuggestions";
import { ScrollToBottomButton } from "./chat/ScrollToBottomButton";

// Context imports
import type { CountrySelectionEvent } from "@/types/flight";
import { findNearestAirports } from "@/hooks/useNearestAirports";
import { useFlightMemory } from "@/contexts/FlightMemoryContext";
import { useTravelMemory } from "@/contexts/TravelMemoryContext";
import { useAccommodationMemory, type AccommodationEntry } from "@/contexts/AccommodationMemoryContext";
import { useActivityMemory } from "@/contexts/ActivityMemoryContext";
import { usePreferenceMemory } from "@/contexts/PreferenceMemoryContext";
import { eventBus, emitTabChange, emitTabAndZoom } from "@/lib/eventBus";

// Re-export types for external consumers
export type {
  ChatQuickAction,
  FlightFormData,
  AirportChoice,
  DualAirportChoice,
  CityChoice,
  CitySelectionData,
  AirportLegSuggestion,
  AirportConfirmationData,
  ConfirmedAirports,
} from "@/types/flight";

// Props and ref interface
interface PlannerChatProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export interface PlannerChatRef {
  injectSystemMessage: (event: CountrySelectionEvent) => void;
  askAirportChoice: (choice: import("@/types/flight").AirportChoice) => void;
  askDualAirportChoice: (choices: import("@/types/flight").DualAirportChoice) => void;
  offerFlightSearch: (from: string, to: string) => void;
  handleAccommodationUpdate: (city: string, updates: Partial<AccommodationEntry>) => boolean;
  askAirportConfirmation: (data: import("@/types/flight").AirportConfirmationData) => void;
  handleActivityUpdate: (city: string, updates: Partial<import("@/contexts/ActivityMemoryContext").ActivityEntry>) => boolean;
  handleAddActivityForCity: (city: string, activity: Partial<import("@/contexts/ActivityMemoryContext").ActivityEntry>) => string | null;
  handlePreferencesDetection: (detectedPrefs: Partial<import("@/contexts/PreferenceMemoryContext").TripPreferences>) => void;
}

/**
 * MessageActions - Copy, Like, Dislike buttons for assistant messages
 */
function MessageActions({ messageId, text }: { messageId: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copié !");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier");
    }
  };

  const handleLike = () => {
    setFeedback(feedback === "like" ? null : "like");
  };

  const handleDislike = () => {
    setFeedback(feedback === "dislike" ? null : "dislike");
  };

  return (
    <div className="flex items-center gap-1 mt-1 max-w-[85%]">
      <button
        onClick={handleCopy}
        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        title="Copier"
        aria-label="Copier le message"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      <button
        onClick={handleLike}
        className={cn(
          "p-1.5 rounded-md transition-colors",
          feedback === "like" 
            ? "text-green-500 bg-green-500/10" 
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
        title="J'aime"
        aria-label="J'aime cette réponse"
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={handleDislike}
        className={cn(
          "p-1.5 rounded-md transition-colors",
          feedback === "dislike" 
            ? "text-red-500 bg-red-500/10" 
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
        title="Je n'aime pas"
        aria-label="Je n'aime pas cette réponse"
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

const PlannerChatComponent = forwardRef<PlannerChatRef, PlannerChatProps>(({ isCollapsed, onToggleCollapse }, ref) => {
  // Memory contexts
  const { getSerializedState: getFlightMemory, memory, updateMemory, resetMemory, hasCompleteInfo, needsAirportSelection, missingFields, getMemorySummary } = useFlightMemory();
  const { getSerializedState: getAccommodationMemory, memory: accomMemory, updateAccommodation } = useAccommodationMemory();
  const { getSerializedState: getTravelMemory, updateTravelers } = useTravelMemory();
  const { addManualActivity, updateActivity, getActivitiesByDestination, getSerializedState: getActivityMemory } = useActivityMemory();
  const { updatePreferences, getSerializedState: getPreferenceMemory } = usePreferenceMemory();

  // Chat sessions
  const {
    sessions,
    activeSessionId,
    messages: storedMessages,
    updateMessages: updateStoredMessages,
    selectSession,
    createNewSession,
    deleteSession,
  } = useChatSessions({ getFlightMemory, getAccommodationMemory, getTravelMemory });

  // Local state
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Refs
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const userMessageCountRef = useRef(0);

  // CRITICAL: Hard guard against any global CSS that blocks pointer events (e.g., driver.js leaving `driver-active` behind)
  useEffect(() => {
    const restoreInteractivity = () => {
      // Driver.js (and some tour libraries) can leave global locks behind.
      document.body.classList.remove("driver-active");
      document.documentElement.classList.remove("driver-active");

      // Remove any lingering driver layers.
      document.querySelectorAll(".driver-overlay, .driver-stage, .driver-popover").forEach((el) => el.remove());

      // Remove inert attributes that fully disable interaction + focus.
      document.querySelectorAll("[inert]").forEach((el) => {
        el.removeAttribute("inert");
      });

      // If pointer-events were disabled globally, restore them.
      if (document.body.style.pointerEvents === "none") document.body.style.pointerEvents = "";
      if (document.documentElement.style.pointerEvents === "none") document.documentElement.style.pointerEvents = "";
    };

    restoreInteractivity();

    const obs = new MutationObserver(() => {
      if (document.body.classList.contains("driver-active") || document.documentElement.classList.contains("driver-active")) {
        restoreInteractivity();
      }
    });

    obs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => obs.disconnect();
  }, []);

  // Custom hooks
  const { streamResponse, isStreaming } = useChatStream();
  const mapContext = useChatMapContext();
  
  // Intelligent scroll management
  const {
    isUserScrolling,
    showNewMessageIndicator,
    newMessageCount,
    scrollToBottom,
    handleScroll,
    markMessagesAsRead,
  } = useChatScroll({
    messagesCount: messages.length,
    containerRef: messagesContainerRef,
  });

  const widgetFlow = useChatWidgetFlow({
    memory,
    updateMemory,
    updateTravelers,
    setMessages,
  });

  // Helper to find accommodation by city
  const findAccommodationByCity = useCallback((cityName: string): AccommodationEntry | null => {
    const normalized = cityName.toLowerCase().trim();
    return accomMemory.accommodations.find((a) => a.city?.toLowerCase().trim() === normalized) || null;
  }, [accomMemory.accommodations]);

  const imperativeHandlers = useChatImperativeHandlers({
    messages,
    setMessages,
    setIsLoading,
    findAccommodationByCity,
    updateAccommodation,
    getActivitiesByDestination,
    updateActivity,
    addManualActivity,
    updatePreferences,
    accomMemory,
    citySelectionShownRef: widgetFlow.citySelectionShownRef,
  });

  // Utilities to avoid infinite sync loops between local state ↔ persisted state
  const areStoredMessagesEqual = useCallback((a: StoredMessage[], b: StoredMessage[]) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
      const am = a[i];
      const bm = b[i];
      if (
        am.id !== bm.id ||
        am.role !== bm.role ||
        am.text !== bm.text ||
        am.hasSearchButton !== bm.hasSearchButton ||
        am.isHidden !== bm.isHidden
      ) {
        return false;
      }
    }
    return true;
  }, []);

  const toStoredMessages = useCallback((msgs: ChatMessage[]): StoredMessage[] => {
    return msgs
      .filter((m) => !m.isTyping)
      .map((m) => ({
        id: m.id,
        role: m.role,
        text: m.text,
        hasSearchButton: m.hasSearchButton,
        isHidden: m.isHidden,
      }))
      .slice(-200);
  }, []);

  // Sync from storedMessages when switching sessions (only if different)
  useEffect(() => {
    const next = storedMessages.map((m) => ({
      id: m.id,
      role: m.role,
      text: m.text,
      isHidden: m.isHidden,
      hasSearchButton: m.hasSearchButton,
      // CRITICAL: Always reset streaming/typing states when loading from storage
      isStreaming: false,
      isTyping: false,
    }));

    const currentStored = toStoredMessages(messages);
    if (!areStoredMessagesEqual(currentStored, storedMessages)) {
      setMessages(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSessionId, storedMessages]);

  // Persist messages (only if changed) with guard against deleted sessions
  const isSwitchingSessionRef = useRef(false);
  const persistMessages = useCallback(
    (msgs: ChatMessage[]) => {
      // Guard: don't persist during session switching or if no active session
      if (isSwitchingSessionRef.current || !activeSessionId) return;
      
      const toStore = toStoredMessages(msgs);
      if (!areStoredMessagesEqual(toStore, storedMessages)) {
        updateStoredMessages(toStore);
      }
    },
    [updateStoredMessages, storedMessages, areStoredMessagesEqual, toStoredMessages, activeSessionId]
  );

  useEffect(() => {
    const nonTyping = messages.filter((m) => !m.isTyping);
    if (nonTyping.length > 0) {
      persistMessages(messages);
    }
  }, [messages, persistMessages]);

  // Reset transient UI state on session change
  // IMPORTANT: Do NOT wipe the input here; it causes "type then instantly cleared" if session ID churns.
  useEffect(() => {
    isSwitchingSessionRef.current = true;
    widgetFlow.resetFlowState();
    setIsLoading(false);

    const timer = setTimeout(() => {
      isSwitchingSessionRef.current = false;
    }, 100);
    return () => clearTimeout(timer);
  }, [activeSessionId, widgetFlow]);

  // Notify outside world whether the chat has user content (for leave confirmations)
  const lastDirtyRef = useRef<boolean | null>(null);
  useEffect(() => {
    const dirty = messages.some((m) => m.role === "user" && !m.isHidden);
    if (lastDirtyRef.current !== dirty) {
      lastDirtyRef.current = dirty;
      eventBus.emit("chat:dirty", { dirty });
    }
  }, [messages]);

  // Auto-scroll only when a new message is added (not on content updates)
  const prevMessageCountRef = useRef(messages.length);
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current && !isUserScrolling) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length, isUserScrolling]);

  // Show ready message when complete
  useEffect(() => {
    if (!hasCompleteInfo || widgetFlow.isSearchButtonShown()) return;

    const departure = memory.departure?.city || "départ";
    const arrival = memory.arrival?.city || "destination";
    const depCode = memory.departure?.iata ? ` (${memory.departure.iata})` : "";
    const arrCode = memory.arrival?.iata ? ` (${memory.arrival.iata})` : "";
    const depDate = memory.departureDate ? format(memory.departureDate, "d MMMM yyyy", { locale: fr }) : "-";
    const retDate = memory.returnDate ? format(memory.returnDate, "d MMMM yyyy", { locale: fr }) : null;
    const travelers = memory.passengers.adults + memory.passengers.children;

    const needsDepartureAirport = needsAirportSelection.departure;
    const needsArrivalAirport = needsAirportSelection.arrival;

    if (needsDepartureAirport || needsArrivalAirport) {
      widgetFlow.markSearchButtonShown();
      const messageId = `airport-selection-${Date.now()}`;

      setMessages((prev) => [
        ...prev,
        { id: messageId, role: "assistant", text: "", isTyping: true },
      ]);

      // Fetch airports
      const fetchAirports = async () => {
        try {
          const [fromAirports, toAirports] = await Promise.all([
            needsDepartureAirport && memory.departure?.city
              ? findNearestAirports(memory.departure.city, 3, memory.departure.countryCode)
              : null,
            needsArrivalAirport && memory.arrival?.city
              ? findNearestAirports(memory.arrival.city, 3, memory.arrival.countryCode)
              : null,
          ]);

          let dualChoices: import("@/types/flight").DualAirportChoice | undefined;
          if (fromAirports?.airports?.length || toAirports?.airports?.length) {
            dualChoices = {};
            if (fromAirports?.airports?.length) {
              dualChoices.from = {
                field: "from",
                cityName: memory.departure?.city || departure,
                airports: fromAirports.airports,
              };
            }
            if (toAirports?.airports?.length) {
              dualChoices.to = {
                field: "to",
                cityName: memory.arrival?.city || arrival,
                airports: toAirports.airports,
              };
            }
          }

          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId
                ? {
                    ...m,
                    text: `Super ! Votre voyage **${departure} → ${arrival}** est configuré :\n\n📅 Départ : ${depDate}${retDate ? `\n📅 Retour : ${retDate}` : ""}\n👥 ${travelers} voyageur${travelers > 1 ? "s" : ""}\n\nSélectionnez vos aéroports ci-dessous :`,
                    isTyping: false,
                    dualAirportChoices: dualChoices,
                  }
                : m
            )
          );
        } catch (error) {
          console.error("Error fetching airports:", error);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId
                ? {
                    ...m,
                    text: `Super ! Votre voyage **${departure} → ${arrival}** est configuré.\n\nVeuillez sélectionner vos aéroports dans le panneau de droite.`,
                    isTyping: false,
                  }
                : m
            )
          );
        }
      };

      fetchAirports();
    } else {
      widgetFlow.markSearchButtonShown();
      setMessages((prev) => [
        ...prev,
        {
          id: `search-ready-auto-${Date.now()}`,
          role: "assistant",
          text: `Parfait ! Votre itinéraire **${departure}${depCode} → ${arrival}${arrCode}** est prêt !\n\n📅 Départ : ${depDate}${retDate ? `\n📅 Retour : ${retDate}` : ""}\n👥 ${travelers} voyageur${travelers > 1 ? "s" : ""}\n\nCliquez ci-dessous pour lancer la recherche. 🚀`,
          hasSearchButton: true,
        },
      ]);
    }
  }, [hasCompleteInfo, memory, needsAirportSelection, widgetFlow]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    injectSystemMessage: imperativeHandlers.injectSystemMessage,
    askAirportChoice: imperativeHandlers.askAirportChoice,
    askDualAirportChoice: imperativeHandlers.askDualAirportChoice,
    offerFlightSearch: imperativeHandlers.offerFlightSearch,
    handleAccommodationUpdate: imperativeHandlers.handleAccommodationUpdate,
    askAirportConfirmation: imperativeHandlers.askAirportConfirmation,
    handleActivityUpdate: imperativeHandlers.handleActivityUpdate,
    handleAddActivityForCity: imperativeHandlers.handleAddActivityForCity,
    handlePreferencesDetection: imperativeHandlers.handlePreferencesDetection,
  }));

  // Send message
  const sendText = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userText = text.trim();
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: userText,
    };

    userMessageCountRef.current += 1;
    eventBus.emit("chat:userMessage", { text: userText, messageCount: userMessageCountRef.current });

    setMessages((prev) => [
      ...prev.map((m) => (m.widget ? { ...m, widget: undefined } : m)),
      userMessage,
    ]);
    setIsLoading(true);

    widgetFlow.citySelectionShownRef.current = null;

    const messageId = `bot-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: messageId, role: "assistant", text: "", isTyping: true },
    ]);

    try {
      const apiMessages = messages
        .filter((m) => !m.isTyping && m.id !== "welcome")
        .map((m) => ({ role: m.role === "system" ? "user" : m.role, content: m.text }));
      apiMessages.push({ role: "user", content: userText });

      // Build memory context
      const activityMemoryState = getActivityMemory();
      const preferenceMemoryState = getPreferenceMemory();
      const visualContext = mapContext.buildContextString();

      const activityContext =
        typeof activityMemoryState?.totalActivities === 'number' && activityMemoryState.totalActivities > 0
          ? `\n[ACTIVITÉS] ${activityMemoryState.totalActivities} activité(s) planifiée(s)`
          : "";

      const preferenceContext = preferenceMemoryState
        ? `\n[PRÉFÉRENCES] Rythme: ${preferenceMemoryState.pace}, Style: ${preferenceMemoryState.travelStyle}, Confort: ${preferenceMemoryState.comfortLabel}, Intérêts: ${(preferenceMemoryState.interests as string[])?.join(", ") || ""}`
        : "";

      const { content, flightData } = await streamResponse(
        apiMessages,
        messageId,
        {
          flightSummary: getMemorySummary(),
          activityContext: activityContext + (visualContext ? `\n${visualContext}` : ""),
          preferenceContext,
          missingFields,
        },
        (id, text, isComplete) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === id
                ? { ...m, text, isStreaming: !isComplete, isTyping: false }
                : m
            )
          );
        }
      );

      const { cleanContent, action } = parseAction(content || "Désolé, je n'ai pas pu répondre.");

      // Process flight data
      let nextMem = { ...memory, passengers: { ...memory.passengers } };
      let widget: import("@/types/flight").WidgetType | undefined;
      let showDateWidget = false;
      let showTravelersWidget = false;

      if (flightData && Object.keys(flightData).length > 0) {
        const needsDestinationCity = flightData.needsCitySelection && flightData.toCountryCode;
        const needsDepartureCity = flightData.fromCountryCode && !flightData.from;
        const skipDateWidget = needsDestinationCity || needsDepartureCity;

        showDateWidget = flightData.needsDateWidget === true && !skipDateWidget;
        showTravelersWidget = flightData.needsTravelersWidget === true;

        if (showDateWidget && showTravelersWidget) {
          widgetFlow.setPendingTravelersWidget(true);
        }

        if (flightData.tripDuration) {
          widgetFlow.setPendingTripDuration(flightData.tripDuration);
        }

        if (flightData.preferredMonth) {
          widgetFlow.setPendingPreferredMonth(flightData.preferredMonth);
        }

        const memoryUpdates = flightDataToMemory(flightData);
        updateMemory(memoryUpdates);
        nextMem = { ...nextMem, ...memoryUpdates };

        if (flightData.to) {
          const coords = getCityCoords(flightData.to.toLowerCase().split(",")[0].trim());
          if (coords) {
            emitTabAndZoom("flights", coords, 8);
          } else {
            emitTabChange("flights");
          }
        }

        eventBus.emit("flight:updateFormData", flightData);
      } else if (action) {
        if (action.type === "tab") {
          emitTabChange(action.tab);
        } else if (action.type === "zoom") {
          eventBus.emit("map:zoom", { center: action.center, zoom: action.zoom });
        } else if (action.type === "tabAndZoom") {
          emitTabAndZoom(action.tab, action.center, action.zoom);
        }
      }

      // Determine widget
      widget = widgetFlow.determineNextWidget(showDateWidget, showTravelersWidget, nextMem);
      const widgetData = widget ? widgetFlow.getWidgetData() : undefined;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, text: cleanContent, isTyping: false, isStreaming: false, widget, widgetData }
            : m
        )
      );
    } catch (err) {
      console.error("Failed to get chat response:", err);
      widgetFlow.resetFlowState();
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, text: "Désolé, une erreur s'est produite. Veuillez réessayer.", isTyping: false, isStreaming: false }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  return (
    <aside
      className={cn(
        "h-full w-full flex flex-col relative overflow-hidden transition-all duration-300 ease-out",
        isCollapsed ? "bg-transparent opacity-0" : "bg-background opacity-100"
      )}
    >
      {/* Chat History Sidebar */}
      <ChatHistorySidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectSession={selectSession}
        onNewSession={() => {
          createNewSession();
          resetMemory();
        }}
        onDeleteSession={deleteSession}
      />

      {/* Header - only show when not collapsed */}
      {!isCollapsed && (
        <div className="flex items-center justify-between h-12 px-3 border-b border-border shrink-0 bg-background animate-fade-in">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <img src={logo} alt="Travliaq" className="h-6 w-6 object-contain shrink-0" />
            <span className="font-medium text-foreground text-sm truncate max-w-[240px]">
              {(() => {
                const title = sessions.find((s) => s.id === activeSessionId)?.title || "Nouvelle conversation";
                return title.replace(/^\p{Extended_Pictographic}\s*/u, "");
              })()}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Historique"
            >
              <History className="h-4 w-4" />
            </button>

            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Fermer le chat"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Collapsible content */}
      <div
        className={cn(
          // `relative` + z-index: ensure chat content (especially input) stays above any stray overlays within the panel group
          "relative z-10 flex flex-col flex-1 overflow-hidden transition-all duration-300 ease-out",
          isCollapsed ? "opacity-0 pointer-events-none scale-95" : "opacity-100 scale-100"
        )}
      >
          {/* Messages */}
          <div 
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto"
          >
            <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
              {messages.filter((m) => !m.isHidden).map((m) => (
                <div key={m.id} className={cn("flex gap-2", m.role === "user" ? "flex-row-reverse" : "")}>
                  {/* Content - no avatars */}
                  <div className={cn("flex-1 min-w-0", m.role === "user" ? "text-right" : "")}>
                    <div className={cn(
                      "inline-block text-sm leading-relaxed px-4 py-3 rounded-2xl max-w-[85%]",
                      m.role === "user" ? "bg-primary text-primary-foreground text-left" : "bg-muted text-foreground text-left"
                    )}>
                      {m.isTyping ? (
                        <div className="flex gap-1 py-1">
                          <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      ) : (
                        <>
                          <MarkdownMessage content={m.text} />
                          {m.isStreaming && <span className="inline-block w-1.5 h-4 bg-current ml-0.5 animate-pulse" />}
                        </>
                      )}
                    </div>

                    {/* Copy / Like / Dislike actions for assistant messages */}
                    {m.role === "assistant" && !m.isTyping && !m.isStreaming && m.text && (
                      <MessageActions messageId={m.id} text={m.text} />
                    )}

                    {/* Airport choices */}
                    {m.airportChoices && (
                      <div className="mt-2 flex flex-wrap gap-2 max-w-[85%]">
                        {m.airportChoices.airports.map((airport) => (
                          <AirportButton
                            key={airport.iata}
                            airport={airport}
                            onClick={() => widgetFlow.handleAirportSelect(m.id, m.airportChoices!.field, airport, false)}
                            disabled={isLoading}
                          />
                        ))}
                      </div>
                    )}

                    {/* Dual airport selection */}
                    {m.dualAirportChoices && (
                      <DualAirportSelection
                        choices={m.dualAirportChoices}
                        onSelect={(field, airport) => widgetFlow.handleAirportSelect(m.id, field, airport, true)}
                        disabled={isLoading}
                      />
                    )}

                    {/* Widgets */}
                    {m.widget === "datePicker" && (
                      <DatePickerWidget
                        label="Choisir la date de départ"
                        value={memory.departureDate}
                        onChange={(date) => widgetFlow.handleDateSelect(m.id, "departure", date)}
                        preferredMonth={m.widgetData?.preferredMonth}
                      />
                    )}
                    {m.widget === "returnDatePicker" && (
                      <DatePickerWidget
                        label="Choisir la date de retour"
                        value={memory.returnDate}
                        onChange={(date) => widgetFlow.handleDateSelect(m.id, "return", date)}
                        minDate={memory.departureDate || undefined}
                        preferredMonth={m.widgetData?.preferredMonth}
                      />
                    )}
                    {m.widget === "dateRangePicker" && (
                      <DateRangePickerWidget
                        tripDuration={m.widgetData?.tripDuration}
                        preferredMonth={m.widgetData?.preferredMonth}
                        onConfirm={(dep, ret) => widgetFlow.handleDateRangeSelect(m.id, dep, ret)}
                      />
                    )}
                    {m.widget === "travelersSelector" && (
                      <TravelersWidget
                        initialValues={memory.passengers}
                        onConfirm={(travelers) => widgetFlow.handleTravelersSelect(m.id, travelers)}
                      />
                    )}
                    {m.widget === "tripTypeConfirm" && (
                      <TripTypeConfirmWidget
                        currentType={memory.tripType}
                        onConfirm={(tripType) => widgetFlow.handleTripTypeConfirm(m.id, tripType)}
                      />
                    )}
                    {m.widget === "citySelector" && m.widgetData?.citySelection && (
                      <CitySelectionWidget
                        citySelection={m.widgetData.citySelection}
                        onSelect={(cityName) => {
                          const { countryCode, countryName } = m.widgetData!.citySelection!;
                          if (m.widgetData?.isDeparture) {
                            widgetFlow.handleDepartureCitySelect(m.id, cityName, countryName, countryCode);
                          } else {
                            widgetFlow.handleCitySelect(m.id, cityName, countryName, countryCode);
                          }
                        }}
                      />
                    )}
                    {m.widget === "travelersConfirmBeforeSearch" && (
                      <TravelersConfirmBeforeSearchWidget
                        currentTravelers={memory.passengers}
                        onConfirm={() => widgetFlow.handleTravelersConfirmSolo(m.id)}
                        onEditConfirm={(travelers) => widgetFlow.handleTravelersEditBeforeSearch(m.id, travelers)}
                      />
                    )}
                    {m.widget === "airportConfirmation" && m.widgetData?.airportConfirmation && (
                      <AirportConfirmationWidget
                        data={m.widgetData.airportConfirmation}
                        onConfirm={(confirmed) => eventBus.emit("flight:confirmedAirports", confirmed)}
                      />
                    )}

                    {/* Search button */}
                    {m.hasSearchButton && (
                      <div className="mt-3">
                        <button
                          onClick={() => widgetFlow.handleSearchButtonClick(m.id)}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
                        >
                          <Plane className="h-4 w-4" />
                          Rechercher les vols maintenant
                        </button>
                      </div>
                    )}

                    {/* Quick Replies */}
                    {m.quickReplies && m.quickReplies.length > 0 && (
                      <QuickReplies
                        replies={m.quickReplies}
                        onSendMessage={(message) => sendText(message)}
                        onFillInput={(message) => {
                          setInput(message);
                          setTimeout(() => inputRef.current?.focus(), 0);
                        }}
                        disabled={isLoading}
                      />
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Scroll to bottom button */}
          <ScrollToBottomButton
            show={isUserScrolling || showNewMessageIndicator}
            newMessageCount={newMessageCount}
            onClick={() => {
              scrollToBottom();
              markMessagesAsRead();
            }}
          />

          {/* Smart Suggestions + Input */}
          <div className="relative z-20 border-t border-border bg-background" aria-hidden={isCollapsed}>
            {/* Smart Suggestions */}
            <SmartSuggestions
              context={{
                workflowStep: !memory.arrival?.city ? "inspiration"
                  : !memory.departureDate ? "destination"
                  : memory.passengers.adults === 0 ? "dates"
                  : "compare",
                hasDestination: !!memory.arrival?.city,
                hasDates: !!memory.departureDate,
                hasTravelers: memory.passengers.adults > 0,
                hasFlights: mapContext.visiblePrices.filter((p) => p.type === "flight").length > 0,
                hasHotels: mapContext.visibleHotels.length > 0,
                destinationName: memory.arrival?.city,
                departureCity: memory.departure?.city,
                currentTab: mapContext.activeTab,
                visibleFlightsCount: mapContext.visiblePrices.filter((p) => p.type === "flight").length,
                visibleHotelsCount: mapContext.visibleHotels.length,
                visibleActivitiesCount: mapContext.visibleActivities.length,
                cheapestFlightPrice: mapContext.getCheapestFlightPrice(),
                cheapestHotelPrice: mapContext.getCheapestHotelPrice(),
              }}
              onSuggestionClick={(message) => {
                // Only prefill input, don't send automatically
                setInput(message);
                // Focus the input so user can review and send
                setTimeout(() => {
                  inputRef.current?.focus();
                  // Adjust textarea height for the new content
                  if (inputRef.current) {
                    inputRef.current.style.height = "auto";
                    inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
                  }
                }, 0);
              }}
              isLoading={isLoading}
            />

            <div className="relative z-20 max-w-3xl mx-auto p-4 pt-0">
              <div className="relative z-20 flex items-end gap-2 rounded-2xl border border-border bg-muted/30 p-2 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                  }}
                  onPointerDown={(e) => {
                    const { clientX, clientY } = e;
                    requestAnimationFrame(() => {
                      // If a layer is capturing clicks, the textarea won't become the active element.
                      if (document.activeElement !== inputRef.current) {
                        const el = document.elementFromPoint(clientX, clientY);
                        const cs = el ? window.getComputedStyle(el) : null;
                        // eslint-disable-next-line no-console
                        console.warn("[ChatInputBlock] click not reaching textarea", {
                          x: clientX,
                          y: clientY,
                          topElement: el ? `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}${el.className ? `.${String(el.className).split(" ").slice(0, 3).join(".")}` : ""}` : null,
                          pointerEvents: cs?.pointerEvents,
                          zIndex: cs?.zIndex,
                          position: cs?.position,
                        });
                      }
                    });
                  }}
                  onFocus={() => {
                    // Safety net: if driver.js ever leaves pointer-events blocked, restore interactivity.
                    document.body.classList.remove("driver-active");
                    document.documentElement.classList.remove("driver-active");
                  }}
                  placeholder={isLoading ? "Réponse en cours..." : "Envoyer un message..."}
                  rows={1}
                  disabled={false}
                  className="pointer-events-auto flex-1 resize-none bg-transparent px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  style={{ minHeight: "40px", maxHeight: "120px" }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendText(input);
                      setTimeout(() => inputRef.current?.focus(), 0);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => sendText(input)}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "h-9 w-9 shrink-0 rounded-lg flex items-center justify-center transition-all",
                    input.trim() && !isLoading
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                  aria-label="Envoyer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Tapez une destination ou demandez des vols, activités, hébergements
              </p>
            </div>
          </div>
      </div>
    </aside>
  );
});

PlannerChatComponent.displayName = "PlannerChat";

export default PlannerChatComponent;
