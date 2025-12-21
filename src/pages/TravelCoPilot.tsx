import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import Navigation from "@/components/Navigation";
import CoPilotChat, { type ChatMessage } from "@/components/copilot/CoPilotChat";
import CoPilotMap, { type MapMarker } from "@/components/copilot/CoPilotMap";
import CoPilotTabs, { type CoPilotTabType } from "@/components/copilot/CoPilotTabs";
import CoPilotPanel from "@/components/copilot/CoPilotPanel";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";

// Mock data for demonstration
const mockFlights = [
  {
    id: "1",
    airline: "Air France",
    departureTime: "08:45",
    arrivalTime: "14:30",
    duration: "5h 45m",
    price: "€450",
    stops: 0,
    from: "CDG",
    to: "JFK",
  },
  {
    id: "2",
    airline: "Delta",
    departureTime: "11:20",
    arrivalTime: "17:15",
    duration: "5h 55m",
    price: "€380",
    stops: 0,
    from: "CDG",
    to: "JFK",
  },
  {
    id: "3",
    airline: "United",
    departureTime: "15:00",
    arrivalTime: "22:30",
    duration: "7h 30m",
    price: "€320",
    stops: 1,
    from: "CDG",
    to: "JFK",
  },
];

const mockHotels = [
  {
    id: "1",
    name: "The Standard High Line",
    rating: 4.5,
    price: "€180/night",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
    location: "Meatpacking District",
    amenities: ["WiFi", "Spa", "Restaurant"],
  },
  {
    id: "2",
    name: "Pod 51",
    rating: 4.0,
    price: "€95/night",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400",
    location: "Midtown East",
    amenities: ["WiFi", "Rooftop"],
  },
  {
    id: "3",
    name: "The Ludlow",
    rating: 4.7,
    price: "€220/night",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400",
    location: "Lower East Side",
    amenities: ["WiFi", "Bar", "Restaurant"],
  },
];

const mockActivities = [
  {
    id: "1",
    name: "Broadway Show - Hamilton",
    type: "Entertainment",
    price: "€150",
    duration: "2h 45m",
    image: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=400",
    rating: 4.9,
  },
  {
    id: "2",
    name: "Statue of Liberty Tour",
    type: "Sightseeing",
    price: "€25",
    duration: "4h",
    image: "https://images.unsplash.com/photo-1503174971373-b1f69850bded?w=400",
    rating: 4.6,
  },
  {
    id: "3",
    name: "Central Park Bike Tour",
    type: "Outdoor",
    price: "€35",
    duration: "2h",
    image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=400",
    rating: 4.8,
  },
];

const mockTripDays = [
  {
    day: 1,
    title: "Arrival & Times Square",
    location: "Manhattan",
    activities: ["Arrive at JFK", "Check into hotel", "Walk through Times Square", "Dinner at Joe's Pizza"],
  },
  {
    day: 2,
    title: "Iconic NYC",
    location: "Downtown",
    activities: ["Statue of Liberty", "Ellis Island", "Wall Street", "Brooklyn Bridge walk"],
  },
  {
    day: 3,
    title: "Culture & Arts",
    location: "Midtown",
    activities: ["Metropolitan Museum", "Central Park stroll", "Broadway show - Hamilton"],
  },
];

const TravelCoPilot = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<CoPilotTabType>("flights");
  const [showChat, setShowChat] = useState(!isMobile);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  
  const [mapCenter, setMapCenter] = useState<[number, number]>([-74.006, 40.7128]); // NYC
  const [mapZoom, setMapZoom] = useState(11);
  const [flightPath, setFlightPath] = useState<{ from: [number, number]; to: [number, number] } | undefined>(
    { from: [2.55, 49.01], to: [-74.006, 40.7128] } // Paris to NYC
  );

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: t("copilot.welcome"),
      timestamp: new Date(),
    },
  ]);

  const [markers, setMarkers] = useState<MapMarker[]>([
    { id: "cdg", coordinates: [2.55, 49.01], type: "flight", label: "CDG", price: "Paris" },
    { id: "jfk", coordinates: [-74.006, 40.7128], type: "flight", label: "JFK", price: "New York" },
  ]);

  const handleSendMessage = useCallback((content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      let response: ChatMessage;
      const lowerContent = content.toLowerCase();

      if (lowerContent.includes("new york") || lowerContent.includes("ny") || lowerContent.includes("nyc")) {
        setMapCenter([-74.006, 40.7128]);
        setMapZoom(12);
        setActiveTab("flights");
        setFlightPath({ from: [2.55, 49.01], to: [-74.006, 40.7128] });
        
        response = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: t("copilot.response.destination"),
          widget: "airports",
          options: [
            { label: "Paris CDG", value: "CDG", icon: "🇫🇷" },
            { label: "Paris Orly", value: "ORY", icon: "🇫🇷" },
            { label: "Lyon", value: "LYS", icon: "🇫🇷" },
          ],
          timestamp: new Date(),
        };
      } else if (lowerContent.includes("hôtel") || lowerContent.includes("hotel") || lowerContent.includes("hébergement")) {
        setActiveTab("hotels");
        setMarkers([
          { id: "h1", coordinates: [-74.0048, 40.7411], type: "hotel", label: "The Standard", price: "€180" },
          { id: "h2", coordinates: [-73.9712, 40.7549], type: "hotel", label: "Pod 51", price: "€95" },
          { id: "h3", coordinates: [-73.9885, 40.7214], type: "hotel", label: "The Ludlow", price: "€220" },
        ]);
        
        response = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: t("copilot.response.hotels"),
          timestamp: new Date(),
        };
      } else if (lowerContent.includes("activité") || lowerContent.includes("activity") || lowerContent.includes("soir") || lowerContent.includes("evening")) {
        setActiveTab("activities");
        setMarkers([
          { id: "a1", coordinates: [-73.9857, 40.7589], type: "activity", label: "Broadway", price: "€150" },
          { id: "a2", coordinates: [-74.0445, 40.6892], type: "activity", label: "Statue of Liberty", price: "€25" },
          { id: "a3", coordinates: [-73.9654, 40.7829], type: "activity", label: "Central Park", price: "€35" },
        ]);
        
        response = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: t("copilot.response.activities"),
          timestamp: new Date(),
        };
      } else if (lowerContent.includes("date") || lowerContent.includes("quand")) {
        response = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: t("copilot.response.dates"),
          widget: "calendar",
          timestamp: new Date(),
        };
      } else {
        response = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: t("copilot.response.generic"),
          timestamp: new Date(),
        };
      }

      setMessages((prev) => [...prev, response]);
      setIsLoading(false);
    }, 1500);
  }, [t]);

  const handleWidgetSelect = useCallback((type: string, value: string) => {
    if (type === "airports") {
      const message: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: `${t("copilot.selectedAirport")}: ${value}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, message]);

      setTimeout(() => {
        const response: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: t("copilot.response.airportSelected", { airport: value }),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, response]);
      }, 500);
    } else if (type === "dates") {
      const [from, to] = value.split(",");
      const fromDate = new Date(from).toLocaleDateString();
      const toDate = new Date(to).toLocaleDateString();
      
      const message: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: `${t("copilot.selectedDates")}: ${fromDate} - ${toDate}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, message]);

      setTimeout(() => {
        const response: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: t("copilot.response.datesSelected"),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, response]);
      }, 500);
    }
  }, [t]);

  const handleMarkerClick = useCallback((marker: MapMarker) => {
    setSelectedMarker(marker);
  }, []);

  const handleTabChange = useCallback((tab: CoPilotTabType) => {
    setActiveTab(tab);
    
    // Update markers based on tab
    if (tab === "flights") {
      setMarkers([
        { id: "cdg", coordinates: [2.55, 49.01], type: "flight", label: "CDG", price: "Paris" },
        { id: "jfk", coordinates: [-74.006, 40.7128], type: "flight", label: "JFK", price: "New York" },
      ]);
      setFlightPath({ from: [2.55, 49.01], to: [-74.006, 40.7128] });
    } else if (tab === "hotels") {
      setMarkers([
        { id: "h1", coordinates: [-74.0048, 40.7411], type: "hotel", label: "The Standard", price: "€180" },
        { id: "h2", coordinates: [-73.9712, 40.7549], type: "hotel", label: "Pod 51", price: "€95" },
        { id: "h3", coordinates: [-73.9885, 40.7214], type: "hotel", label: "The Ludlow", price: "€220" },
      ]);
      setFlightPath(undefined);
    } else if (tab === "activities") {
      setMarkers([
        { id: "a1", coordinates: [-73.9857, 40.7589], type: "activity", label: "Broadway", price: "€150" },
        { id: "a2", coordinates: [-74.0445, 40.6892], type: "activity", label: "Statue of Liberty", price: "€25" },
        { id: "a3", coordinates: [-73.9654, 40.7829], type: "activity", label: "Central Park", price: "€35" },
      ]);
      setFlightPath(undefined);
    } else {
      setMarkers([
        { id: "t1", coordinates: [-73.9857, 40.7589], type: "trip", label: "Day 1" },
        { id: "t2", coordinates: [-74.0445, 40.6892], type: "trip", label: "Day 2" },
        { id: "t3", coordinates: [-73.9654, 40.7829], type: "trip", label: "Day 3" },
      ]);
      setFlightPath(undefined);
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>{t("copilot.pageTitle")} | Travliaq</title>
        <meta name="description" content={t("copilot.pageDescription")} />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        
        <div className="flex-1 flex relative overflow-hidden">
          {/* Chat Panel - Left Side */}
          <div
            className={cn(
              "flex-shrink-0 border-r border-border/50 transition-all duration-300 z-20",
              isMobile
                ? showChat
                  ? "fixed inset-0 bg-background"
                  : "hidden"
                : "w-[35%] min-w-[320px] max-w-[450px]"
            )}
          >
            {isMobile && showChat && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-30"
                onClick={() => setShowChat(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            )}
            <CoPilotChat
              messages={messages}
              onSendMessage={handleSendMessage}
              onWidgetSelect={handleWidgetSelect}
              isLoading={isLoading}
            />
          </div>

          {/* Visual Planning Panel - Right Side */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Tabs */}
            <CoPilotTabs activeTab={activeTab} onTabChange={handleTabChange} />

            {/* Map with overlay panel */}
            <div className="flex-1 relative">
              <CoPilotMap
                markers={markers}
                activeTab={activeTab}
                center={mapCenter}
                zoom={mapZoom}
                onMarkerClick={handleMarkerClick}
                flightPath={flightPath}
              />

              {/* Side Panel */}
              <CoPilotPanel
                activeTab={activeTab}
                flights={mockFlights}
                hotels={mockHotels}
                activities={mockActivities}
                tripDays={mockTripDays}
                selectedMarker={selectedMarker}
                onSelect={(type, id) => console.log("Selected:", type, id)}
              />
            </div>
          </div>

          {/* Mobile Chat Toggle */}
          {isMobile && !showChat && (
            <Button
              size="lg"
              className="fixed bottom-6 right-6 z-30 rounded-full w-14 h-14 shadow-adventure"
              onClick={() => setShowChat(true)}
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default TravelCoPilot;
