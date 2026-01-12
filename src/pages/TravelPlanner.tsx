import { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import type { ImperativePanelHandle } from "react-resizable-panels";
import PlannerMap, { DestinationClickEvent } from "@/components/planner/PlannerMap";
import PlannerPanel, { FlightRoutePoint, CountrySelectionEvent } from "@/components/planner/PlannerPanel";
import PlannerCard from "@/components/planner/PlannerCard";
import PlannerChat, { FlightFormData, PlannerChatRef, AirportChoice, DualAirportChoice, AirportConfirmationData, ConfirmedAirports } from "@/components/planner/PlannerChat";
import PlannerTopBar from "@/components/planner/PlannerTopBar";
import DestinationPopup from "@/components/planner/DestinationPopup";
import YouTubeShortsPanel from "@/components/planner/YouTubeShortsPanel";
import OnboardingTour from "@/components/planner/OnboardingTour";
import { PlannerErrorBoundary } from "@/components/planner/PlannerErrorBoundary";
import { AutoDetectDeparture } from "@/components/planner/AutoDetectDeparture";
import type { Airport } from "@/hooks/useNearestAirports";
import { FlightMemoryProvider } from "@/contexts/FlightMemoryContext";
import { TravelMemoryProvider } from "@/contexts/TravelMemoryContext";
import { AccommodationMemoryProvider } from "@/contexts/AccommodationMemoryContext";
import { PreferenceMemoryProvider } from "@/contexts/PreferenceMemoryContext";
import { ActivityMemoryProvider } from "@/contexts/ActivityMemoryContext";
import { usePlannerState } from "@/hooks/usePlannerState";
import { useMapState } from "@/hooks/useMapState";
import { useFlightState } from "@/hooks/useFlightState";
import { useDestinationPopup } from "@/hooks/useDestinationPopup";
import { useChatIntegration } from "@/hooks/useChatIntegration";
import { usePreferencesToHotels } from "@/hooks/usePreferencesToHotels";
import eventBus from "@/lib/eventBus";

export type TabType = "flights" | "activities" | "stays" | "preferences";

export interface MapPin {
  id: string;
  type: TabType;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  price?: number;
  rating?: number;
  image?: string;
  duration?: string;
}

// Selected airport info to pass to FlightsPanel
export interface SelectedAirport {
  field: "from" | "to";
  airport: Airport;
}

// User detected location
export interface UserLocation {
  lat: number;
  lng: number;
  city: string;
}

const TravelPlanner = () => {
  const location = useLocation();
  const chatPanelRef = useRef<ImperativePanelHandle>(null);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [shouldConfirmLeave, setShouldConfirmLeave] = useState(false);

  // Debug/ops: allow disabling onboarding via a dedicated route (/planner-notour)
  // or a query param (?noTour=1) in normal browsing.
  const disableTour =
    location.pathname === "/planner-notour" || new URLSearchParams(location.search).has("noTour");

  // Track if onboarding is complete to allow animations
  // If already done before (localStorage), start with true so animation triggers immediately
  const [onboardingComplete, setOnboardingComplete] = useState(() => {
    return localStorage.getItem("travliaq_onboarding_completed") === "true";
  });

  // If onboarding was already completed before this session, ensure we trigger the fly-to animation
  // by resetting initialAnimationDone once (this acts like "returning user" behavior)
  const hasTriggeredReturningUserAnimRef = useRef(false);

  // Custom hooks for state management
  const {
    activeTab,
    setActiveTab,
    isPanelVisible,
    setIsPanelVisible,
    selectedPin,
    handleTabChange,
    handlePinClick,
    handleCloseCard,
    handleAddToTrip,
  } = usePlannerState();

  const {
    mapCenter,
    setMapCenter,
    mapZoom,
    setMapZoom,
    initialAnimationDone,
    setInitialAnimationDone,
    handleAnimationComplete,
  } = useMapState();

  const {
    flightFormData,
    setFlightFormData,
    selectedAirport,
    setSelectedAirport,
    triggerFlightSearch,
    setTriggerFlightSearch,
    confirmedMultiAirports,
    setConfirmedMultiAirports,
  } = useFlightState(setActiveTab, setIsPanelVisible);

  const {
    destinationPopup,
    setDestinationPopup,
    youtubePanel,
    setYoutubePanel,
    handleDestinationClick,
    handleOpenYouTube,
    handleClosePopup,
    handleCloseYouTube,
  } = useDestinationPopup(setIsPanelVisible);

  const { chatRef, userLocation, searchMessageSentRef, setUserLocation } = useChatIntegration();
  
  // For returning users (onboarding already done), trigger the fly-to animation on first mount
  useEffect(() => {
    if (onboardingComplete && !hasTriggeredReturningUserAnimRef.current && !initialAnimationDone) {
      // Already completed onboarding in a previous session - animation should trigger automatically
      // because onboardingComplete=true and initialAnimationDone starts false in useMapState
      hasTriggeredReturningUserAnimRef.current = true;
    }
  }, [onboardingComplete, initialAnimationDone]);
  
  // Callback when onboarding ends - trigger animation
  const handleOnboardingComplete = useCallback(() => {
    setOnboardingComplete(true);
  }, []);

  // Callback to start animation after onboarding
  const handleRequestAnimation = useCallback(() => {
    // Reset animation state to trigger the fly-to-user animation
    setInitialAnimationDone(false);
  }, [setInitialAnimationDone]);

  // Remaining local state
  const [flightRoutes, setFlightRoutes] = useState<FlightRoutePoint[]>([]);

  // Panel-related handlers (chat integration)
  const handleCountrySelected = useCallback((event: CountrySelectionEvent) => {
    chatRef.current?.injectSystemMessage(event);
  }, []);

  const handleAskAirportChoice = useCallback((choice: AirportChoice) => {
    chatRef.current?.askAirportChoice(choice);
  }, []);

  const handleAskDualAirportChoice = useCallback((choices: DualAirportChoice) => {
    chatRef.current?.askDualAirportChoice(choices);
  }, []);

  const handleAskAirportConfirmation = useCallback((data: AirportConfirmationData) => {
    chatRef.current?.askAirportConfirmation(data);
  }, []);

  const handleSearchReady = useCallback((from: string, to: string) => {
    if (!searchMessageSentRef.current) {
      searchMessageSentRef.current = true;
      chatRef.current?.offerFlightSearch(from, to);
    }
  }, []);

  // Leave confirmation if a conversation is in progress
  useEffect(() => {
    const handler = ({ dirty }: { dirty: boolean }) => setShouldConfirmLeave(dirty);
    eventBus.on("chat:dirty", handler as any);

    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (!shouldConfirmLeave) return;
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", beforeUnload);

    return () => {
      eventBus.off("chat:dirty", handler as any);
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [shouldConfirmLeave]);

  return (
    <TravelMemoryProvider>
      <PreferenceMemoryProvider>
        <FlightMemoryProvider>
          {/* Auto-detect departure airport from user's location */}
          <AutoDetectDeparture />
          <AccommodationMemoryProvider>
            <ActivityMemoryProvider>
              <Helmet>
                <title>Planificateur | Travliaq</title>
                <meta
                  name="description"
                  content="Planifiez votre voyage avec notre assistant intelligent. Comparez vols, activités et hébergements sur une carte interactive."
                />
                <link rel="canonical" href="/planner" />
              </Helmet>

              <div className="h-[100svh] w-full overflow-hidden bg-background">
                <ResizablePanelGroup direction="horizontal" className="h-full">
                  {/* Left: Chat - resizable with smooth animation */}
                  <ResizablePanel
                    ref={chatPanelRef}
                    defaultSize={35}
                    minSize={0}
                    maxSize={50}
                    collapsible
                    collapsedSize={0}
                    onCollapse={() => setIsChatCollapsed(true)}
                    onExpand={() => setIsChatCollapsed(false)}
                    onResize={(size) => {
                      // Auto-collapse when user drags below 12%
                      if (size > 0 && size < 12) {
                        chatPanelRef.current?.collapse();
                        setIsChatCollapsed(true);
                      }
                    }}
                    className="transition-all duration-300 ease-out"
                  >
                    <div data-tour="chat-panel" className="h-full relative">
                      <PlannerChat
                        ref={chatRef}
                        isCollapsed={isChatCollapsed}
                        onToggleCollapse={() => {
                          if (chatPanelRef.current?.isCollapsed()) {
                            chatPanelRef.current.expand();
                          } else {
                            chatPanelRef.current?.collapse();
                          }
                        }}
                      />
                    </div>
                  </ResizablePanel>

                  {/* Resize handle */}
                  <ResizableHandle
                    withHandle
                    className={
                      isChatCollapsed
                        ? "hidden"
                        : "bg-border/50 hover:bg-primary/30 transition-colors"
                    }
                  />

                  {/* Right: Map workspace - resizable */}
                  <ResizablePanel defaultSize={65} minSize={40}>
                    <main className="relative h-full overflow-hidden pt-12">
                      <PlannerErrorBoundary componentName="PlannerMap">
                        <PlannerMap
                          activeTab={activeTab}
                          center={mapCenter}
                          zoom={mapZoom}
                          onPinClick={handlePinClick}
                          selectedPinId={selectedPin?.id}
                          flightRoutes={flightRoutes}
                          animateToUserLocation={onboardingComplete && !initialAnimationDone}
                          onAnimationComplete={() => {
                            setInitialAnimationDone(true);
                            setIsPanelVisible(true);
                          }}
                          isPanelOpen={isPanelVisible}
                          userLocation={initialAnimationDone ? userLocation : null}
                          onDestinationClick={handleDestinationClick}
                        />
                      </PlannerErrorBoundary>

                       {/* Overlay tabs */}
                       <PlannerTopBar
                         activeTab={activeTab}
                         onTabChange={handleTabChange}
                         isChatCollapsed={isChatCollapsed}
                         onOpenChat={() => chatPanelRef.current?.expand()}
                         confirmLeave={shouldConfirmLeave}
                         confirmLeaveMessage="Vous avez une conversation en cours. Quitter le planner ?"
                       />
                      {youtubePanel ? (
                        <aside className="pointer-events-none absolute top-16 left-4 bottom-4 w-[320px] sm:w-[360px] md:w-[400px] lg:w-[420px] xl:w-[480px] 2xl:w-[540px] z-10">
                          <div className="pointer-events-auto h-full overflow-hidden rounded-2xl bg-card/95 backdrop-blur-xl border border-border/50 shadow-lg">
                            <YouTubeShortsPanel
                              city={youtubePanel.city}
                              countryName={youtubePanel.countryName}
                              isOpen={true}
                              onClose={() => setYoutubePanel(null)}
                            />
                          </div>
                        </aside>
                      ) : (
                        /* Regular Overlay panel */
                        <div>
                          <PlannerErrorBoundary componentName="PlannerPanel">
                            <PlannerPanel
                              activeTab={activeTab}
                              layout="overlay"
                              isVisible={isPanelVisible}
                              onClose={() => {
                                // First close panel to update padding
                                setIsPanelVisible(false);
                                // Then after padding animation completes, fit to prices
                                if (activeTab === "stays") {
                                  setTimeout(() => {
                                    eventBus.emit("hotels:fitToPrices", undefined);
                                  }, 350); // After padding animation (300ms) + buffer
                                }
                              }}
                              mapCenter={mapCenter}
                              onMapMove={(center, zoom) => {
                                setMapCenter(center);
                                setMapZoom(zoom);
                              }}
                              onFlightRoutesChange={setFlightRoutes}
                              flightFormData={flightFormData}
                              onFlightFormDataConsumed={() => setFlightFormData(null)}
                              onCountrySelected={handleCountrySelected}
                              onAskAirportChoice={handleAskAirportChoice}
                              onAskDualAirportChoice={handleAskDualAirportChoice}
                              onAskAirportConfirmation={handleAskAirportConfirmation}
                              selectedAirport={selectedAirport}
                              onSelectedAirportConsumed={() => setSelectedAirport(null)}
                              onUserLocationDetected={setUserLocation}
                              onSearchReady={handleSearchReady}
                              triggerSearch={triggerFlightSearch}
                              onSearchTriggered={() => setTriggerFlightSearch(false)}
                              confirmedMultiAirports={confirmedMultiAirports}
                              onConfirmedMultiAirportsConsumed={() => setConfirmedMultiAirports(null)}
                            />
                          </PlannerErrorBoundary>
                        </div>
                      )}

                      {/* Destination popup on map marker click */}
                      <DestinationPopup
                        cityName={destinationPopup?.cityName || ""}
                        countryName={destinationPopup?.countryName}
                        isOpen={!!destinationPopup}
                        onClose={() => {
                          window.dispatchEvent(new Event("destination-popup-close"));
                          setDestinationPopup(null);
                        }}
                        onDiscoverClick={handleOpenYouTube}
                        position={destinationPopup?.position}
                      />

                      {/* Floating card on map */}
                      {selectedPin && (
                        <PlannerCard pin={selectedPin} onClose={handleCloseCard} onAddToTrip={handleAddToTrip} />
                      )}
                    </main>
                  </ResizablePanel>
                </ResizablePanelGroup>

                {/* Onboarding Tour */}
                {!disableTour && (
                  <OnboardingTour
                    onPanelVisibilityChange={setIsPanelVisible}
                    onComplete={handleOnboardingComplete}
                    onRequestAnimation={handleRequestAnimation}
                  />
                )}
              </div>
            </ActivityMemoryProvider>
          </AccommodationMemoryProvider>
        </FlightMemoryProvider>
      </PreferenceMemoryProvider>
    </TravelMemoryProvider>
  );
};

export default TravelPlanner;
