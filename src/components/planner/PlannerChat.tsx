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
import { Plane, History, User, Send } from "lucide-react";
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
interface PlannerChatProps {}

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

const PlannerChatComponent = forwardRef<PlannerChatRef, PlannerChatProps>((_props, ref) => {
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

  // Sync from storedMessages when switching sessions
  useEffect(() => {
    setMessages(
      storedMessages.map((m) => ({
        id: m.id,
        role: m.role,
        text: m.text,
        isHidden: m.isHidden,
        hasSearchButton: m.hasSearchButton,
      }))
    );
  }, [activeSessionId, storedMessages]);

  // Persist messages
  const persistMessages = useCallback(
    (msgs: ChatMessage[]) => {
      const toStore: StoredMessage[] = msgs
        .filter((m) => !m.isTyping)
        .map((m) => ({
          id: m.id,
          role: m.role,
          text: m.text,
          hasSearchButton: m.hasSearchButton,
          isHidden: m.isHidden,
        }))
        .slice(-200);
      updateStoredMessages(toStore);
    },
    [updateStoredMessages]
  );

  useEffect(() => {
    const nonTyping = messages.filter((m) => !m.isTyping);
    if (nonTyping.length > 0) {
      persistMessages(messages);
    }
  }, [messages, persistMessages]);

  // Reset state on session change
  useEffect(() => {
    widgetFlow.resetFlowState();
    setIsLoading(false);
    setInput("");
  }, [activeSessionId, widgetFlow]);

  // Auto-scroll only when not manually scrolling
  useEffect(() => {
    if (!isUserScrolling) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isUserScrolling]);

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
  const send = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
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
    setInput("");
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
    <aside className="h-full w-full bg-background flex flex-col relative overflow-hidden">
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

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <button
          onClick={() => setIsHistoryOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <History className="h-4 w-4" />
          <span className="text-sm font-medium">Historique</span>
        </button>
        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
          {sessions.find((s) => s.id === activeSessionId)?.title || "Nouvelle conversation"}
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
          {messages.filter((m) => !m.isHidden).map((m) => (
            <div key={m.id} className={cn("flex gap-4", m.role === "user" ? "flex-row-reverse" : "")}>
              {/* Avatar */}
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden",
                m.role === "user" ? "bg-primary text-primary-foreground" : "bg-white"
              )}>
                {m.role === "user" ? <User className="h-4 w-4" /> : <img src={logo} alt="Travliaq" className="h-6 w-6 object-contain" />}
              </div>

              {/* Content */}
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
      <div className="border-t border-border bg-background">
        {/* Smart Suggestions */}
        <SmartSuggestions
          context={{
            hasDestination: !!memory.arrival?.city,
            hasDates: !!memory.departureDate,
            hasTravelers: memory.passengers.adults > 0,
            hasFlights: false,
            hasHotels: mapContext.visibleHotels.length > 0,
            destinationName: memory.arrival?.city,
            currentTab: mapContext.activeTab,
            visibleFlightsCount: mapContext.visiblePrices.filter(p => p.type === "flight").length,
            visibleHotelsCount: mapContext.visibleHotels.length,
            visibleActivitiesCount: mapContext.visibleActivities.length,
          }}
          onSuggestionClick={(message) => {
            setInput(message);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
          isLoading={isLoading}
        />
        
        <div className="max-w-3xl mx-auto p-4 pt-0">
          <div className="relative flex items-end gap-2 rounded-2xl border border-border bg-muted/30 p-2 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              placeholder="Envoyer un message..."
              rows={1}
              disabled={isLoading}
              className="flex-1 resize-none bg-transparent px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
              style={{ minHeight: "40px", maxHeight: "120px" }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                  setTimeout(() => inputRef.current?.focus(), 0);
                }
              }}
            />
            <button
              type="button"
              onClick={send}
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
    </aside>
  );
});

PlannerChatComponent.displayName = "PlannerChat";

export default PlannerChatComponent;
