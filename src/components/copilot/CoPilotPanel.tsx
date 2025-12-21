import { useTranslation } from "react-i18next";
import { X, Star, Clock, MapPin, Plane, ArrowRight, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { MapMarker } from "./CoPilotMap";

interface FlightOption {
  id: string;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: string;
  stops: number;
  from: string;
  to: string;
}

interface HotelOption {
  id: string;
  name: string;
  rating: number;
  price: string;
  image: string;
  location: string;
  amenities: string[];
}

interface ActivityOption {
  id: string;
  name: string;
  type: string;
  price: string;
  duration: string;
  image: string;
  rating: number;
}

interface TripDay {
  day: number;
  title: string;
  activities: string[];
  location: string;
}

interface CoPilotPanelProps {
  activeTab: "flights" | "hotels" | "activities" | "trip";
  flights?: FlightOption[];
  hotels?: HotelOption[];
  activities?: ActivityOption[];
  tripDays?: TripDay[];
  selectedMarker?: MapMarker | null;
  onClose?: () => void;
  onSelect?: (type: string, id: string) => void;
}

const CoPilotPanel = ({
  activeTab,
  flights = [],
  hotels = [],
  activities = [],
  tripDays = [],
  selectedMarker,
  onClose,
  onSelect,
}: CoPilotPanelProps) => {
  const { t } = useTranslation();

  const renderFlights = () => (
    <div className="space-y-3">
      {flights.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Plane className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{t("copilot.noFlights")}</p>
        </div>
      ) : (
        flights.map((flight) => (
          <div
            key={flight.id}
            className="bg-card rounded-lg border border-border/50 p-4 hover:border-primary/50 transition-all cursor-pointer"
            onClick={() => onSelect?.("flight", flight.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">{flight.airline}</span>
              <span className="text-lg font-bold text-primary">{flight.price}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="font-bold text-foreground">{flight.departureTime}</p>
                <p className="text-xs text-muted-foreground">{flight.from}</p>
              </div>
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 h-px bg-border" />
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {flight.duration}
                </div>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="text-center">
                <p className="font-bold text-foreground">{flight.arrivalTime}</p>
                <p className="text-xs text-muted-foreground">{flight.to}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {flight.stops === 0 ? t("copilot.direct") : `${flight.stops} ${t("copilot.stops")}`}
            </p>
          </div>
        ))
      )}
    </div>
  );

  const renderHotels = () => (
    <div className="space-y-3">
      {hotels.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{t("copilot.noHotels")}</p>
        </div>
      ) : (
        hotels.map((hotel) => (
          <div
            key={hotel.id}
            className="bg-card rounded-lg border border-border/50 overflow-hidden hover:border-primary/50 transition-all cursor-pointer"
            onClick={() => onSelect?.("hotel", hotel.id)}
          >
            <div className="aspect-video bg-muted relative">
              <img
                src={hotel.image}
                alt={hotel.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-accent text-accent-foreground px-2 py-1 rounded-full text-sm font-bold">
                {hotel.price}
              </div>
            </div>
            <div className="p-3">
              <h4 className="font-semibold text-foreground">{hotel.name}</h4>
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: Math.floor(hotel.rating) }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-accent text-accent" />
                ))}
                <span className="text-xs text-muted-foreground ml-1">{hotel.rating}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {hotel.location}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderActivities = () => (
    <div className="space-y-3">
      {activities.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{t("copilot.noActivities")}</p>
        </div>
      ) : (
        activities.map((activity) => (
          <div
            key={activity.id}
            className="bg-card rounded-lg border border-border/50 overflow-hidden hover:border-primary/50 transition-all cursor-pointer"
            onClick={() => onSelect?.("activity", activity.id)}
          >
            <div className="flex gap-3 p-3">
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={activity.image}
                  alt={activity.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground truncate">{activity.name}</h4>
                <p className="text-xs text-primary">{activity.type}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-bold text-accent">{activity.price}</span>
                  <span className="text-xs text-muted-foreground">• {activity.duration}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 fill-accent text-accent" />
                  <span className="text-xs text-muted-foreground">{activity.rating}</span>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderTrip = () => (
    <div className="space-y-4">
      {tripDays.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{t("copilot.noTrip")}</p>
        </div>
      ) : (
        tripDays.map((day) => (
          <div
            key={day.day}
            className="bg-card rounded-lg border border-border/50 p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="font-bold text-primary">{day.day}</span>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">{day.title}</h4>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {day.location}
                </p>
              </div>
            </div>
            <ul className="space-y-2">
              {day.activities.map((activity, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{activity}</span>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="absolute left-4 top-4 bottom-4 w-80 bg-background/95 backdrop-blur-md rounded-xl border border-border/50 shadow-deep flex flex-col overflow-hidden z-10">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <h3 className="font-montserrat font-semibold text-foreground">
          {t(`copilot.panel.${activeTab}`)}
        </h3>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4">
        {activeTab === "flights" && renderFlights()}
        {activeTab === "hotels" && renderHotels()}
        {activeTab === "activities" && renderActivities()}
        {activeTab === "trip" && renderTrip()}
      </ScrollArea>
    </div>
  );
};

export default CoPilotPanel;
