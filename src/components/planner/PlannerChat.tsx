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

import { useState, useRef, useEffect, useImperativeHandle, forwardRef, useCallback, memo } from "react";
import { Plane, History, Send, PanelLeftClose } from "lucide-react";
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
  PreferenceStyleWidget,
  PreferenceInterestsWidget,
  MustHavesWidget,
  DietaryWidget,
  DestinationSuggestionsGrid,
} from "./chat/widgets";
import { QuickReplies } from "./chat/QuickReplies";
import { useChatStream, useChatWidgetFlow, useChatImperativeHandlers, useWidgetTracking, useWidgetActionExecutor, usePreferenceWidgetCallbacks } from "./chat/hooks";
import { parseAction, flightDataToMemory } from "./chat/utils";
import type { ChatMessage } from "./chat/types";
import { getCityCoords } from "./chat/types";
import { MemoizedSmartSuggestions, type InspireFlowStep } from "./chat/MemoizedSmartSuggestions";
import { MessageBubble } from "./chat/MessageBubble";
import { MessageActions } from "./chat/MessageActions";
import { getDestinationSuggestions } from "@/services/destinations";
import type { DestinationSuggestRequest, DestinationSuggestion } from "@/types/destinations";
import { ScrollToBottomButton } from "./chat/ScrollToBottomButton";
import { FLIGHTS_ZOOM } from "@/constants/mapSettings";

// Context imports
import type { CountrySelectionEvent } from "@/types/flight";
import { findNearestAirports } from "@/hooks/useNearestAirports";
import { useFlightMemoryStore, useTravelMemoryStore, useAccommodationMemoryStore, useActivityMemoryStore, usePreferenceMemoryStore, type AccommodationEntry } from "@/stores/hooks";
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
  handleActivityUpdate: (city: string, updates: Partial<import("@/stores/hooks").ActivityEntry>) => boolean;
  handleAddActivityForCity: (city: string, activity: Partial<import("@/stores/hooks").ActivityEntry>) => string | null;
  handlePreferencesDetection: (detectedPrefs: Partial<import("@/contexts/PreferenceMemoryContext").TripPreferences>) => void;
}

const PlannerChatComponent = forwardRef<PlannerChatRef, PlannerChatProps>(({ isCollapsed, onToggleCollapse }, ref) => {
  // Memory contexts
  const { getSerializedState: getFlightMemory, memory, updateMemory, resetMemory: resetFlightMemory, hasCompleteInfo, needsAirportSelection, missingFields, getMemorySummary } = useFlightMemoryStore();
  const { getSerializedState: getAccommodationMemory, memory: accomMemory, updateAccommodation, resetMemory: resetAccommodationMemory } = useAccommodationMemoryStore();
  const { getSerializedState: getTravelMemory, updateTravelers, resetMemory: resetTravelMemory } = useTravelMemoryStore();
  const { addManualActivity, updateActivity, getActivitiesByDestination, getSerializedState: getActivityMemory, resetMemory: resetActivityMemory } = useActivityMemoryStore();
  const { updatePreferences, resetToDefaults: resetPreferenceMemory, getSerializedState: getPreferenceMemory, getPreferences, memory: prefMemory } = usePreferenceMemoryStore();

  // Chat sessions
  const {
    sessions,
    activeSessionId,
    messages: storedMessages,
    updateMessages: updateStoredMessages,
    selectSession,
    createNewSession,
    deleteSession,
    deleteAllSessions,
  } = useChatSessions({ getFlightMemory, getAccommodationMemory, getTravelMemory });

  // Local state
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<Array<{id: string; label: string; emoji: string; message: string}>>([]);
  
  // Track completed message IDs to prevent late streaming updates from resetting isStreaming
  const completedMessageIdsRef = useRef<Set<string>>(new Set());
  // Track "inspire" intent to trigger preference widgets flow
  const lastIntentRef = useRef<string | null>(null);
  // Hard reset guard (new conversation / delete all): suppress auto-effects that can spam messages
  const isHardResetRef = useRef(false);
  
  // Inspire flow state: idle → style → interests → extra → loading → results
  // Uses InspireFlowStep type from MemoizedSmartSuggestions
  const [inspireFlowStep, setInspireFlowStep] = useState<InspireFlowStep>("idle");
  const [destinationSuggestions, setDestinationSuggestions] = useState<DestinationSuggestion[]>([]);
  const [destinationProfileScore, setDestinationProfileScore] = useState<number>(0);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(false);

  // Prevent repeated airport fetch loops (same inputs => only fetch once)
  const airportFetchKeyRef = useRef<string | null>(null);

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
  
  // Widget tracking for LLM context
  const widgetTracking = useWidgetTracking();
  
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

  // Widget action executor for LLM "choose for me" functionality
  // We need a ref for onDestinationSelect since it's defined later
  const onDestinationSelectRef = useRef<((destination: import("@/types/destinations").DestinationSuggestion) => void) | null>(null);
  
  const widgetActionExecutor = useWidgetActionExecutor({
    messages,
    setMessages,
    handleCitySelect: widgetFlow.handleCitySelect,
    handleTripTypeConfirm: widgetFlow.handleTripTypeConfirm,
    handleTravelersSelect: widgetFlow.handleTravelersSelect,
    handleDateSelect: widgetFlow.handleDateSelect,
    handleDateRangeSelect: widgetFlow.handleDateRangeSelect,
    onDestinationSelect: (destination) => {
      if (onDestinationSelectRef.current) {
        onDestinationSelectRef.current(destination);
      }
    },
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

  // Handler to fetch destination suggestions from API
  // Use primitive dependencies to avoid infinite loops
  const departureCity = memory.departure?.city;
  const departureCountry = memory.departure?.country;
  const departureDateValue = memory.departureDate?.getTime();
  
  const handleFetchDestinations = useCallback(async (loadingMessageId: string) => {
    setIsLoadingDestinations(true);
    setInspireFlowStep("loading");
    
    try {
      // Build preferences payload from memory - use getPreferences() for typed access
      const prefs = getPreferences();
      
      const payload: DestinationSuggestRequest = {
        // User location from departure if available
        userLocation: departureCity ? { city: departureCity, country: departureCountry } : undefined,
        
        // Style axes
        styleAxes: {
          chillVsIntense: prefs.styleAxes.chillVsIntense ?? 50,
          cityVsNature: prefs.styleAxes.cityVsNature ?? 50,
          ecoVsLuxury: prefs.styleAxes.ecoVsLuxury ?? 50,
          touristVsLocal: prefs.styleAxes.touristVsLocal ?? 50,
        },
        
        // Interests (max 5)
        interests: prefs.interests.slice(0, 5) as DestinationSuggestRequest["interests"],
        
        // Must-haves
        mustHaves: {
          accessibilityRequired: prefs.mustHaves.accessibilityRequired || false,
          petFriendly: prefs.mustHaves.petFriendly || false,
          familyFriendly: prefs.mustHaves.familyFriendly || false,
          highSpeedWifi: prefs.mustHaves.highSpeedWifi || false,
        },
        
        // Dietary restrictions
        dietaryRestrictions: prefs.dietaryRestrictions.length > 0 ? prefs.dietaryRestrictions : undefined,
        
        // Travel style mapping
        travelStyle: prefs.travelStyle as DestinationSuggestRequest["travelStyle"],
        
        // Occasion
        occasion: prefs.tripContext.occasion as DestinationSuggestRequest["occasion"],
        
        // Budget level from comfort (ecoVsLuxury 0-100 to budget levels)
        budgetLevel: prefs.styleAxes.ecoVsLuxury < 25 ? "budget" 
          : prefs.styleAxes.ecoVsLuxury < 50 ? "comfort" 
          : prefs.styleAxes.ecoVsLuxury < 75 ? "premium" 
          : "luxury",
        
        // Travel month from departure date if set
        travelMonth: departureDateValue ? new Date(departureDateValue).getMonth() + 1 : new Date().getMonth() + 1,
      };
      
      const response = await getDestinationSuggestions(payload, { limit: 3 });
      
      if (response.success && response.suggestions.length > 0) {
        setDestinationSuggestions(response.suggestions);
        setDestinationProfileScore(response.basedOnProfile?.completionScore || 0);
        
        // Update loading message with results widget
        setMessages((prev) =>
          prev.map((m) =>
            m.id === loadingMessageId
              ? {
                  ...m,
                  text: `Voici ${response.suggestions.length} destinations parfaites pour vous, basées sur votre profil (${response.basedOnProfile?.completionScore || 0}% de complétion) :`,
                  isTyping: false,
                  widget: "destinationSuggestions" as import("@/types/flight").WidgetType,
                  widgetData: {
                    suggestions: response.suggestions,
                    basedOnProfile: response.basedOnProfile,
                  },
                }
              : m
          )
        );
        setInspireFlowStep("results");
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === loadingMessageId
              ? {
                  ...m,
                  text: "Désolé, je n'ai pas pu trouver de destinations correspondant à vos critères. Essayez d'ajuster vos préférences.",
                  isTyping: false,
                }
              : m
          )
        );
        setInspireFlowStep("idle");
      }
    } catch (error) {
      console.error("Error fetching destination suggestions:", error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMessageId
            ? {
                ...m,
                text: "Une erreur est survenue lors de la recherche de destinations. Veuillez réessayer.",
                isTyping: false,
              }
            : m
        )
      );
      setInspireFlowStep("idle");
    } finally {
      setIsLoadingDestinations(false);
    }
  }, [departureCity, departureCountry, departureDateValue, getPreferences]);

  // Preference widget callbacks (encapsulated for maintainability)
  const preferenceCallbacks = usePreferenceWidgetCallbacks({
    prefMemory,
    widgetTracking,
    setInspireFlowStep,
    setMessages,
    setDynamicSuggestions,
    handleFetchDestinations,
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
        am.isHidden !== bm.isHidden ||
        am.widget !== bm.widget ||
        am.widgetConfirmed !== bm.widgetConfirmed ||
        am.widgetDisplayLabel !== bm.widgetDisplayLabel
      ) {
        return false;
      }
    }
    return true;
  }, []);

  const toStoredMessages = useCallback((msgs: ChatMessage[]): StoredMessage[] => {
    return msgs
      // Never persist transient UI messages
      .filter((m) => !m.isTyping && !m.isStreaming)
      .map((m) => ({
        id: m.id,
        role: m.role,
        text: m.text,
        hasSearchButton: m.hasSearchButton,
        isHidden: m.isHidden,
        // Persist widget state for history stability
        widget: m.widget,
        widgetData: m.widgetData,
        widgetConfirmed: m.widgetConfirmed,
        widgetSelectedValue: m.widgetSelectedValue,
        widgetDisplayLabel: m.widgetDisplayLabel,
        isAutoGenerated: m.isAutoGenerated,
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
      // Restore widget state from storage
      widget: m.widget as import("@/types/flight").WidgetType | undefined,
      widgetData: m.widgetData,
      widgetConfirmed: m.widgetConfirmed,
      widgetSelectedValue: m.widgetSelectedValue,
      widgetDisplayLabel: m.widgetDisplayLabel,
      isAutoGenerated: m.isAutoGenerated,
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

      // CRITICAL: never write while streaming/typing to avoid saving partial content like "P"/"B"
      if (msgs.some((m) => m.isStreaming || m.isTyping)) return;

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
    airportFetchKeyRef.current = null;

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

  // Show ready message when complete - use primitive deps to avoid loops
  const arrivalCity = memory.arrival?.city;
  const arrivalIata = memory.arrival?.iata;
  const arrivalCountryCode = memory.arrival?.countryCode;
  const departureIata = memory.departure?.iata;
  const departureCountryCodeForReady = memory.departure?.countryCode;
  const departureDateForReady = memory.departureDate;
  const returnDateForReady = memory.returnDate;
  const passengersTotal = memory.passengers.adults + memory.passengers.children;
  const tripTypeForReady = memory.tripType;
  const needsDepartureAirport = needsAirportSelection.departure;
  const needsArrivalAirport = needsAirportSelection.arrival;
  
  useEffect(() => {
    // During hard resets/session switching, suppress auto-messages (prevents "typing" spam + crashes)
    if (isSwitchingSessionRef.current || isHardResetRef.current) return;
    if (!hasCompleteInfo || widgetFlow.isSearchButtonShown()) return;

    const departure = departureCity || "départ";
    const arrival = arrivalCity || "destination";
    const depCode = departureIata ? ` (${departureIata})` : "";
    const arrCode = arrivalIata ? ` (${arrivalIata})` : "";
    const depDate = departureDateForReady ? format(departureDateForReady, "d MMMM yyyy", { locale: fr }) : "-";
    const retDate = returnDateForReady ? format(returnDateForReady, "d MMMM yyyy", { locale: fr }) : null;
    const travelers = passengersTotal;

    if (needsDepartureAirport || needsArrivalAirport) {
      // Guard: avoid re-triggering the same airport fetch in a loop
      const fetchKey = `${departureCity || ""}|${arrivalCity || ""}|${needsDepartureAirport ? 1 : 0}|${needsArrivalAirport ? 1 : 0}`;
      if (airportFetchKeyRef.current === fetchKey) return;
      airportFetchKeyRef.current = fetchKey;

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
            needsDepartureAirport && departureCity
              ? findNearestAirports(departureCity, 3, departureCountryCodeForReady)
              : null,
            needsArrivalAirport && arrivalCity
              ? findNearestAirports(arrivalCity, 3, arrivalCountryCode)
              : null,
          ]);

          let dualChoices: import("@/types/flight").DualAirportChoice | undefined;
          if (fromAirports?.airports?.length || toAirports?.airports?.length) {
            dualChoices = {};
            if (fromAirports?.airports?.length) {
              dualChoices.from = {
                field: "from",
                cityName: departureCity || departure,
                airports: fromAirports.airports,
              };
            }
            if (toAirports?.airports?.length) {
              dualChoices.to = {
                field: "to",
                cityName: arrivalCity || arrival,
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
  }, [
    hasCompleteInfo,
    departureCity,
    arrivalCity,
    departureIata,
    arrivalIata,
    arrivalCountryCode,
    departureCountryCodeForReady,
    departureDateForReady,
    returnDateForReady,
    passengersTotal,
    needsDepartureAirport,
    needsArrivalAirport,
    widgetFlow,
  ]);

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
    
    // CRITICAL: Clear input immediately after capturing text
    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
    
    // Detect "inspire" intent for preference widgets flow
    const isInspireIntent = /inspire|inspiration|idée|voyage|destination.*propos/i.test(userText);
    
    // If it's an "inspire" intent, show a beautiful message with the travel style widget directly
    if (isInspireIntent) {
      const inspireMessages = [
        "✨ **Parfait, laissez-moi vous inspirer !**\n\nPour créer un voyage qui vous ressemble, commençons par découvrir votre style de voyage. Choisissez ce qui vous correspond le mieux :",
        "🌍 **L'aventure commence ici !**\n\nPour vous proposer des destinations uniques, j'ai besoin de mieux vous connaître. Quel type de voyageur êtes-vous ?",
        "🎯 **Trouvons votre voyage idéal !**\n\nVotre prochain voyage sera à votre image. Indiquez-moi votre style pour des suggestions personnalisées :",
        "💫 **Créons ensemble votre prochaine escapade !**\n\nChaque voyageur est unique. Partagez vos préférences pour que je puisse vous proposer des expériences sur mesure :",
        "🗺️ **Prêt pour l'inspiration ?**\n\nPour vous guider vers la destination parfaite, dites-moi d'abord quel type d'expérience vous recherchez :",
      ];
      const randomMessage = inspireMessages[Math.floor(Math.random() * inspireMessages.length)];
      
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        text: userText,
      };
      
      userMessageCountRef.current += 1;
      eventBus.emit("chat:userMessage", { text: userText, messageCount: userMessageCountRef.current });
      
      const inspireMessageId = `inspire-${Date.now()}`;
      setMessages((prev) => [
        // CRITICAL: Do NOT clear widgets - they must remain visible in chat history
        ...prev,
        userMessage,
        {
          id: inspireMessageId,
          role: "assistant",
          text: randomMessage,
          widget: "preferenceStyle" as import("@/types/flight").WidgetType,
        },
      ]);
      
      // Clear input and exit - no need to call the API
      setInput("");
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }
      return;
    }
    
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: userText,
    };

    userMessageCountRef.current += 1;
    eventBus.emit("chat:userMessage", { text: userText, messageCount: userMessageCountRef.current });

    // CRITICAL: Do NOT clear widgets - they must remain visible in chat history
    setMessages((prev) => [...prev, userMessage]);
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

      // Build active widgets context for "choose for me" functionality
      const activeWidgetsContext = widgetTracking.getActiveWidgetsContext();
      // Also get pending widgets from messages for more accurate options
      const pendingWidgets = widgetActionExecutor.getPendingWidgets();
      
      // Build detailed destination context for "choose for me"
      let destinationDetailsContext = "";
      const destinationWidgetMessage = messages.find(
        (m) => m.widget === "destinationSuggestions" && !m.widgetConfirmed && m.widgetData?.suggestions
      );
      if (destinationWidgetMessage?.widgetData?.suggestions) {
        const suggestions = destinationWidgetMessage.widgetData.suggestions as Array<{
          countryName: string;
          countryCode: string;
          headline?: string;
          description?: string;
          matchScore?: number;
          highlights?: string[];
          budgetRange?: string;
        }>;
        destinationDetailsContext = `[DESTINATIONS PROPOSÉES - CHOISIS PARMI CELLES-CI]\n${suggestions.map((d, i) => 
          `${i + 1}. **${d.countryName}** (${d.countryCode})${d.matchScore ? ` - ${d.matchScore}% match` : ""}\n` +
          `   Titre: ${d.headline || "Non spécifié"}\n` +
          `   Description: ${d.description || "Non spécifié"}\n` +
          `   Points forts: ${d.highlights?.join(", ") || "Non spécifié"}\n` +
          `   Budget: ${d.budgetRange || "Non spécifié"}`
        ).join("\n\n")}`;
      }
      
      const pendingWidgetsContext = pendingWidgets.length > 0
        ? pendingWidgets.map((w) => 
            w.options 
              ? `- Widget "${w.type}" avec options: ${w.options.join(", ")}`
              : `- Widget "${w.type}" en attente`
          ).join("\n")
        : "";
      
      // Prioritize destination details, then add user preferences context
      const userPrefsForChoice = preferenceMemoryState
        ? `\n[PRÉFÉRENCES UTILISATEUR POUR LE CHOIX]\n` +
          `- Style: ${preferenceMemoryState.travelStyle || "non défini"}\n` +
          `- Rythme: ${preferenceMemoryState.pace || "non défini"}\n` +
          `- Intérêts: ${(preferenceMemoryState.interests as string[])?.join(", ") || "non définis"}\n` +
          `- Niveau confort: ${preferenceMemoryState.comfortLabel || "non défini"}`
        : "";
      
      const combinedWidgetContext = [
        destinationDetailsContext,
        userPrefsForChoice,
        activeWidgetsContext,
        pendingWidgetsContext ? `[OPTIONS WIDGETS ACTIFS]\n${pendingWidgetsContext}` : ""
      ].filter(Boolean).join("\n\n").trim();

      const { content, flightData, quickReplies, destinationSuggestionRequest } = await streamResponse(
        apiMessages,
        messageId,
        {
          flightSummary: getMemorySummary(),
          activityContext: activityContext + (visualContext ? `\n${visualContext}` : ""),
          preferenceContext,
          missingFields,
          widgetHistory: widgetTracking.getContextForLLM(),
          activeWidgetsContext: combinedWidgetContext, // NEW: Include active widgets for "choose for me"
        },
        (id, text, isComplete) => {
          // CRITICAL: Prevent late updates from resetting isStreaming after message is complete
          if (completedMessageIdsRef.current.has(id) && !isComplete) {
            return; // Ignore stale updates for already-completed messages
          }
          if (isComplete) {
            completedMessageIdsRef.current.add(id);
          }
          
          setMessages((prev) =>
            prev.map((m) =>
              m.id === id
                ? { ...m, text, isStreaming: !isComplete, isTyping: false }
                : m
            )
          );
        }
      );

      // Handle destination suggestion request from LLM
      if (destinationSuggestionRequest) {
        console.log("[PlannerChat] LLM requested destination suggestions:", destinationSuggestionRequest);
        
        // Update the message with loading state for destinations
        const loadingText = destinationSuggestionRequest.exceededLimit
          ? `Je ne peux afficher que 5 destinations maximum, mais voici mes ${Math.min(destinationSuggestionRequest.requestedCount, 5)} meilleures recommandations pour vous...`
          : content || `Je recherche ${destinationSuggestionRequest.requestedCount} destinations parfaites pour vous...`;
        
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, text: loadingText, isStreaming: false, isTyping: true }
              : m
          )
        );
        
        // Fetch destinations from API
        try {
          const prefs = getPreferences();
          const payload: DestinationSuggestRequest = {
            userLocation: departureCity ? { city: departureCity, country: departureCountry } : undefined,
            styleAxes: {
              chillVsIntense: prefs.styleAxes.chillVsIntense ?? 50,
              cityVsNature: prefs.styleAxes.cityVsNature ?? 50,
              ecoVsLuxury: prefs.styleAxes.ecoVsLuxury ?? 50,
              touristVsLocal: prefs.styleAxes.touristVsLocal ?? 50,
            },
            interests: prefs.interests.slice(0, 5) as DestinationSuggestRequest["interests"],
            mustHaves: {
              accessibilityRequired: prefs.mustHaves.accessibilityRequired || false,
              petFriendly: prefs.mustHaves.petFriendly || false,
              familyFriendly: prefs.mustHaves.familyFriendly || false,
              highSpeedWifi: prefs.mustHaves.highSpeedWifi || false,
            },
            dietaryRestrictions: prefs.dietaryRestrictions.length > 0 ? prefs.dietaryRestrictions : undefined,
            travelStyle: prefs.travelStyle as DestinationSuggestRequest["travelStyle"],
            occasion: prefs.tripContext.occasion as DestinationSuggestRequest["occasion"],
            budgetLevel: prefs.styleAxes.ecoVsLuxury < 25 ? "budget" 
              : prefs.styleAxes.ecoVsLuxury < 50 ? "comfort" 
              : prefs.styleAxes.ecoVsLuxury < 75 ? "premium" 
              : "luxury",
            travelMonth: departureDateValue ? new Date(departureDateValue).getMonth() + 1 : new Date().getMonth() + 1,
          };
          
          const limit = Math.min(destinationSuggestionRequest.requestedCount, 5);
          const response = await getDestinationSuggestions(payload, { limit });
          
          if (response.success && response.suggestions.length > 0) {
            // Store suggestions in memory for context
            setDestinationSuggestions(response.suggestions);
            setDestinationProfileScore(response.basedOnProfile?.completionScore || 0);
            
            // Update message with destination widget
            setMessages((prev) =>
              prev.map((m) =>
                m.id === messageId
                  ? {
                      ...m,
                      text: `Voici ${response.suggestions.length} destination${response.suggestions.length > 1 ? 's' : ''} parfaite${response.suggestions.length > 1 ? 's' : ''} pour vous, basées sur votre profil (${response.basedOnProfile?.completionScore || 0}% de complétion) :`,
                      isTyping: false,
                      isStreaming: false,
                      widget: "destinationSuggestions" as import("@/types/flight").WidgetType,
                      widgetData: {
                        suggestions: response.suggestions,
                        basedOnProfile: response.basedOnProfile,
                      },
                    }
                  : m
              )
            );
            setInspireFlowStep("results");
          } else {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === messageId
                  ? {
                      ...m,
                      text: "Désolé, je n'ai pas pu trouver de destinations correspondant à vos critères. Essayez d'abord de me donner vos préférences de voyage avec 'Inspire-moi !' 🌍",
                      isTyping: false,
                      isStreaming: false,
                    }
                  : m
              )
            );
          }
        } catch (apiError) {
          console.error("Error fetching destination suggestions:", apiError);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId
                ? {
                    ...m,
                    text: "Une erreur est survenue lors de la recherche de destinations. Veuillez réessayer.",
                    isTyping: false,
                    isStreaming: false,
                  }
                : m
            )
          );
        }
        
        setIsLoading(false);
        return; // Early return - we handled the message
      }

      // Update dynamic suggestions from AI response
      if (quickReplies?.replies && quickReplies.replies.length > 0) {
        setDynamicSuggestions(quickReplies.replies.map((r, i) => ({
          id: `dyn-${Date.now()}-${i}`,
          label: r.label,
          emoji: r.emoji || "✈️",
          message: r.message,
        })));
      } else {
        setDynamicSuggestions([]);
      }

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
            emitTabAndZoom("flights", coords, FLIGHTS_ZOOM);
          } else {
            emitTabChange("flights");
          }
        }

        eventBus.emit("flight:updateFormData", flightData);
      } else if (action) {
        if (action.type === "chooseWidget") {
          // LLM chose for the user - execute the widget action
          console.log("[PlannerChat] LLM chooseWidget action:", action);
          const executed = widgetActionExecutor.executeChooseWidgetAction(action);
          if (executed) {
            console.log("[PlannerChat] Widget action executed successfully");
          }
        } else if (action.type === "tab") {
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
          // Hard guard: stop persistence/auto-effects while we reset everything
          isHardResetRef.current = true;
          isSwitchingSessionRef.current = true;

          // Full reset: behave like a new user (but without onboarding)
          setIsLoading(false);
          setDynamicSuggestions([]);
          setInput("");
          lastIntentRef.current = null;
          completedMessageIdsRef.current.clear();
          userMessageCountRef.current = 0;
          airportFetchKeyRef.current = null;
          widgetFlow.resetFlowState();

          // Reset all persisted memories (localStorage-backed)
          resetFlightMemory();
          resetTravelMemory();
          resetAccommodationMemory();
          resetActivityMemory();
          resetPreferenceMemory();

          createNewSession();

          // Re-enable effects after the reset has settled
          setTimeout(() => {
            isSwitchingSessionRef.current = false;
            isHardResetRef.current = false;
          }, 400);
        }}
        onDeleteSession={deleteSession}
        onDeleteAllSessions={() => {
          // Hard guard: stop persistence/auto-effects while we wipe everything
          isHardResetRef.current = true;
          isSwitchingSessionRef.current = true;

          // Full reset: clear all state
          setIsLoading(false);
          setDynamicSuggestions([]);
          setInput("");
          lastIntentRef.current = null;
          completedMessageIdsRef.current.clear();
          userMessageCountRef.current = 0;
          airportFetchKeyRef.current = null;
          widgetFlow.resetFlowState();

          // Reset all persisted memories (localStorage-backed)
          resetFlightMemory();
          resetTravelMemory();
          resetAccommodationMemory();
          resetActivityMemory();
          resetPreferenceMemory();

          // Delete all sessions (this also clears localStorage)
          deleteAllSessions();

          // Re-enable effects after the wipe has settled
          setTimeout(() => {
            isSwitchingSessionRef.current = false;
            isHardResetRef.current = false;
          }, 500);
        }}
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
              {/* Optimized: filter once, render visible messages */}
              {messages.filter((m) => !m.isHidden).slice(-100).map((m) => (
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
                    
                    {/* Preference Style Widget */}
                    {m.widget === "preferenceStyle" && (
                      <PreferenceStyleWidget onContinue={preferenceCallbacks.onStyleContinue} />
                    )}
                    
                    {/* Preference Interests Widget */}
                    {m.widget === "preferenceInterests" && (
                      <PreferenceInterestsWidget onContinue={preferenceCallbacks.onInterestsContinue} />
                    )}
                    
                    {/* Must-Haves Widget */}
                    {m.widget === "mustHaves" && (
                      <MustHavesWidget onContinue={preferenceCallbacks.onMustHavesContinue} />
                    )}
                    
                    {/* Dietary Widget */}
                    {m.widget === "dietary" && (
                      <DietaryWidget onContinue={preferenceCallbacks.onDietaryContinue} />
                    )}
                    
                    {/* Destination Suggestions Grid */}
                    {m.widget === "destinationSuggestions" && m.widgetData?.suggestions && (
                      <DestinationSuggestionsGrid
                        suggestions={m.widgetData.suggestions as DestinationSuggestion[]}
                        basedOnProfile={m.widgetData.basedOnProfile as { completionScore: number; keyFactors: string[] } | undefined}
                        onSelect={async (destination) => {
                          // Track destination selection
                          widgetTracking.trackDestinationSelect(destination.countryName, destination.countryCode);
                          
                          // Store only country info - explicitly clear city to avoid airport search with country name
                          updateMemory({
                            arrival: {
                              city: undefined, // CRITICAL: Clear city to prevent old country name from being used
                              iata: undefined, // Also clear any old airport selection
                              airport: undefined,
                              countryCode: destination.countryCode,
                              country: destination.countryName,
                            },
                          });
                          
                          // Reset inspire flow
                          setInspireFlowStep("idle");
                          setDestinationSuggestions([]);
                          
                          // Add loading message
                          const loadingId = `city-loading-${Date.now()}`;
                          setMessages((prev) => [
                            ...prev,
                            {
                              id: loadingId,
                              role: "assistant",
                              text: `Excellent choix ! **${destination.countryName}** est une destination parfaite pour vous.\n\nJe recherche les villes principales...`,
                              isTyping: true,
                            },
                          ]);
                          
                          // Fetch cities for the selected country
                          try {
                            const response = await fetch(
                              `https://cinbnmlfpffmyjmkwbco.supabase.co/functions/v1/top-cities-by-country?country_code=${destination.countryCode}&limit=5`,
                              {
                                method: "GET",
                                headers: {
                                  "Content-Type": "application/json",
                                  apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpbmJubWxmcGZmbXlqbWt3YmNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NDQ2MTQsImV4cCI6MjA3MzUyMDYxNH0.yrju-Pv4OlfU9Et-mRWg0GRHTusL7ZpJevqKemJFbuA",
                                },
                              }
                            );
                            
                            const data = await response.json();
                            
                            if (data.cities && data.cities.length > 0) {
                              const cities = data.cities.map((c: { name: string; description?: string; population?: number }) => ({
                                name: c.name,
                                description: c.description || "Ville importante",
                                population: c.population,
                              }));
                              
                              // Update message with city selection widget
                              setMessages((prev) =>
                                prev.map((m) =>
                                  m.id === loadingId
                                    ? {
                                        ...m,
                                        text: `Excellent choix ! **${destination.countryName}** est une destination parfaite pour vous.\n\n${destination.description}\n\nQuelle ville souhaitez-vous visiter ?`,
                                        isTyping: false,
                                        widget: "citySelector" as import("@/types/flight").WidgetType,
                                        widgetData: {
                                          citySelection: {
                                            countryCode: destination.countryCode,
                                            countryName: destination.countryName,
                                            cities,
                                          },
                                          isDeparture: false,
                                        },
                                      }
                                    : m
                                )
                              );
                            } else {
                              // No cities found - ask user to type city name
                              setMessages((prev) =>
                                prev.map((m) =>
                                  m.id === loadingId
                                    ? {
                                        ...m,
                                        text: `Excellent choix ! **${destination.countryName}** est une destination parfaite pour vous.\n\n${destination.description}\n\nQuelle ville souhaitez-vous visiter ? Tapez le nom dans le chat.`,
                                        isTyping: false,
                                      }
                                    : m
                                )
                              );
                            }
                          } catch (error) {
                            console.error("Error fetching cities:", error);
                            setMessages((prev) =>
                              prev.map((m) =>
                                m.id === loadingId
                                  ? {
                                      ...m,
                                      text: `Excellent choix ! **${destination.countryName}** est une destination parfaite pour vous.\n\nQuelle ville souhaitez-vous visiter ? Tapez le nom dans le chat.`,
                                      isTyping: false,
                                    }
                                  : m
                              )
                            );
                          }
                        }}
                        isLoading={isLoadingDestinations}
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
                        onTriggerWidget={(widget) => {
                          // Trigger preference widgets on demand
                          if (widget === "preferenceInterests") {
                            const widgetId = `interests-widget-${Date.now()}`;
                            setMessages((prev) => [
                              ...prev,
                              {
                                id: widgetId,
                                role: "assistant",
                                text: "Sélectionnez vos centres d'intérêt :",
                                widget: "preferenceInterests" as import("@/types/flight").WidgetType,
                              },
                            ]);
                          } else if (widget === "preferenceStyle") {
                            const widgetId = `style-widget-${Date.now()}`;
                            setMessages((prev) => [
                              ...prev,
                              {
                                id: widgetId,
                                role: "assistant",
                                text: "Ajustez votre style de voyage :",
                                widget: "preferenceStyle" as import("@/types/flight").WidgetType,
                              },
                            ]);
                          }
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
            {/* Smart Suggestions - context is memoized to prevent re-renders */}
            <MemoizedSmartSuggestions
              memory={memory}
              mapContext={mapContext}
              inspireFlowStep={inspireFlowStep}
              destinationSuggestions={destinationSuggestions}
              messages={messages}
              dynamicSuggestions={dynamicSuggestions}
              onSuggestionClick={(message) => {
                // CRITICAL: Suggestions should ONLY fill the input, never trigger actions
                // Normalize special tokens to user-friendly messages
                let normalizedMessage = message;
                
                if (message === "__FETCH_DESTINATIONS__") {
                  normalizedMessage = "Rien d'autre à ajouter. Fais-moi 3 recommandations de destinations selon mon profil.";
                } else if (message.startsWith("__WIDGET__")) {
                  const widgetType = message.replace("__WIDGET__", "");
                  if (widgetType === "preferenceInterests") {
                    normalizedMessage = "J'aimerais préciser mes centres d'intérêt.";
                  } else if (widgetType === "preferenceStyle") {
                    normalizedMessage = "J'aimerais ajuster mon style de voyage.";
                  } else if (widgetType === "mustHaves") {
                    normalizedMessage = "J'ai des critères obligatoires à préciser.";
                  } else if (widgetType === "dietary") {
                    normalizedMessage = "J'ai des restrictions alimentaires à préciser.";
                  }
                } else if (message === "__CHOOSE_FOR_ME__") {
                  normalizedMessage = "Choisis la meilleure destination pour moi parmi celles affichées et explique pourquoi.";
                }
                
                // Fill input and focus - user must click Send
                setInput(normalizedMessage);
                setDynamicSuggestions([]); // Clear after selection
                setTimeout(() => {
                  inputRef.current?.focus();
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

// Memoized export to prevent unnecessary re-renders from parent components
export default memo(PlannerChatComponent);
