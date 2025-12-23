import { useState } from "react";
import { Plane, Clock, ArrowRight, ChevronDown, ChevronUp, Luggage, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FlightSegment {
  departureTime: string;
  arrivalTime: string;
  departureAirport: string;
  arrivalAirport: string;
  duration: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  aircraft?: string;
}

export interface FlightOffer {
  id: string;
  price: number;
  currency: string;
  outbound: FlightSegment[];
  inbound?: FlightSegment[];
  stops: number;
  totalDuration: string;
  cabinClass: string;
  seatsLeft?: number;
  isBestPrice?: boolean;
  isFastest?: boolean;
}

interface FlightResultsProps {
  flights: FlightOffer[];
  isLoading?: boolean;
  onSelect?: (flight: FlightOffer) => void;
}

// Airline logos mapping (using placeholder with airline code)
const getAirlineLogo = (code: string) => {
  const logos: Record<string, string> = {
    AF: "https://images.kiwi.com/airlines/64/AF.png",
    LH: "https://images.kiwi.com/airlines/64/LH.png",
    BA: "https://images.kiwi.com/airlines/64/BA.png",
    EK: "https://images.kiwi.com/airlines/64/EK.png",
    QR: "https://images.kiwi.com/airlines/64/QR.png",
    KL: "https://images.kiwi.com/airlines/64/KL.png",
    IB: "https://images.kiwi.com/airlines/64/IB.png",
    VY: "https://images.kiwi.com/airlines/64/VY.png",
    FR: "https://images.kiwi.com/airlines/64/FR.png",
    U2: "https://images.kiwi.com/airlines/64/U2.png",
  };
  return logos[code] || `https://images.kiwi.com/airlines/64/${code}.png`;
};

// Single flight segment display
const FlightSegmentCard = ({ segment, isLast }: { segment: FlightSegment; isLast: boolean }) => (
  <div className="flex items-center gap-4 py-2">
    {/* Airline logo */}
    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm border border-border/20">
      <img 
        src={getAirlineLogo(segment.airlineCode)} 
        alt={segment.airline}
        className="w-7 h-7 object-contain"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling?.classList.remove('hidden');
        }}
      />
      <span className="hidden text-xs font-bold text-muted-foreground">{segment.airlineCode}</span>
    </div>
    
    {/* Times and airports */}
    <div className="flex-1 flex items-center gap-3">
      {/* Departure */}
      <div className="text-center min-w-[60px]">
        <div className="text-lg font-bold text-foreground">{segment.departureTime}</div>
        <div className="text-xs text-muted-foreground font-medium">{segment.departureAirport}</div>
      </div>
      
      {/* Flight line */}
      <div className="flex-1 flex items-center gap-1 px-2">
        <div className="h-[2px] flex-1 bg-gradient-to-r from-primary/50 to-primary rounded-full" />
        <Plane className="h-4 w-4 text-primary shrink-0 -rotate-0" />
        <div className="h-[2px] flex-1 bg-gradient-to-r from-primary to-primary/50 rounded-full" />
      </div>
      
      {/* Arrival */}
      <div className="text-center min-w-[60px]">
        <div className="text-lg font-bold text-foreground">{segment.arrivalTime}</div>
        <div className="text-xs text-muted-foreground font-medium">{segment.arrivalAirport}</div>
      </div>
    </div>
    
    {/* Duration */}
    <div className="text-right min-w-[70px]">
      <div className="text-sm font-medium text-foreground">{segment.duration}</div>
      <div className="text-[10px] text-muted-foreground">{segment.flightNumber}</div>
    </div>
  </div>
);

// Flight card component
const FlightCard = ({ 
  flight, 
  onSelect,
  isExpanded,
  onToggleExpand 
}: { 
  flight: FlightOffer; 
  onSelect?: (flight: FlightOffer) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) => {
  const mainSegment = flight.outbound[0];
  const lastOutbound = flight.outbound[flight.outbound.length - 1];
  
  return (
    <div 
      className={cn(
        "relative bg-card border border-border/50 rounded-2xl overflow-hidden transition-all duration-300",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        isExpanded && "border-primary/50 shadow-lg shadow-primary/10"
      )}
    >
      {/* Badges */}
      <div className="absolute top-3 right-3 flex gap-1.5">
        {flight.isBestPrice && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-[10px] font-semibold">
            <Star className="h-3 w-3" /> Meilleur prix
          </span>
        )}
        {flight.isFastest && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-semibold">
            <Zap className="h-3 w-3" /> Plus rapide
          </span>
        )}
      </div>
      
      {/* Main content */}
      <div className="p-4">
        <div className="flex items-center gap-4">
          {/* Airline info */}
          <div className="flex items-center gap-3 min-w-[120px]">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm border border-border/20">
              <img 
                src={getAirlineLogo(mainSegment.airlineCode)} 
                alt={mainSegment.airline}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <span className="hidden text-sm font-bold text-muted-foreground">{mainSegment.airlineCode}</span>
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">{mainSegment.airline}</div>
              <div className="text-xs text-muted-foreground">{flight.cabinClass}</div>
            </div>
          </div>
          
          {/* Flight times */}
          <div className="flex-1 flex items-center justify-center gap-4">
            {/* Departure */}
            <div className="text-center">
              <div className="text-xl font-bold text-foreground">{mainSegment.departureTime}</div>
              <div className="text-xs text-muted-foreground font-medium">{mainSegment.departureAirport}</div>
            </div>
            
            {/* Flight visualization */}
            <div className="flex-1 max-w-[200px] flex flex-col items-center gap-1">
              <div className="text-xs text-muted-foreground">{flight.totalDuration}</div>
              <div className="w-full flex items-center gap-1">
                <div className="h-0.5 flex-1 bg-gradient-to-r from-muted-foreground/30 via-primary to-muted-foreground/30 rounded-full" />
              </div>
              <div className="text-xs font-medium text-primary">
                {flight.stops === 0 ? "Direct" : `${flight.stops} escale${flight.stops > 1 ? "s" : ""}`}
              </div>
            </div>
            
            {/* Arrival */}
            <div className="text-center">
              <div className="text-xl font-bold text-foreground">{lastOutbound.arrivalTime}</div>
              <div className="text-xs text-muted-foreground font-medium">{lastOutbound.arrivalAirport}</div>
            </div>
          </div>
          
          {/* Price and action */}
          <div className="flex flex-col items-end gap-2 min-w-[120px]">
            <div>
              <span className="text-2xl font-bold text-foreground">{flight.price}</span>
              <span className="text-sm text-muted-foreground ml-1">{flight.currency}</span>
            </div>
            {flight.seatsLeft && flight.seatsLeft <= 5 && (
              <span className="text-[10px] text-destructive font-medium">
                Plus que {flight.seatsLeft} place{flight.seatsLeft > 1 ? "s" : ""}
              </span>
            )}
            <button
              onClick={() => onSelect?.(flight)}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Sélectionner
            </button>
          </div>
        </div>
        
        {/* Expand button */}
        <button
          onClick={onToggleExpand}
          className="mt-3 flex items-center justify-center gap-1 w-full py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" /> Masquer les détails
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" /> Voir les détails
            </>
          )}
        </button>
      </div>
      
      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t border-border/50 bg-muted/20 px-4 py-3 space-y-4">
          {/* Outbound */}
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
              <Plane className="h-3.5 w-3.5" /> Vol aller
            </div>
            <div className="space-y-1 divide-y divide-border/30">
              {flight.outbound.map((segment, idx) => (
                <FlightSegmentCard 
                  key={idx} 
                  segment={segment} 
                  isLast={idx === flight.outbound.length - 1} 
                />
              ))}
            </div>
          </div>
          
          {/* Inbound */}
          {flight.inbound && flight.inbound.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <Plane className="h-3.5 w-3.5 rotate-180" /> Vol retour
              </div>
              <div className="space-y-1 divide-y divide-border/30">
                {flight.inbound.map((segment, idx) => (
                  <FlightSegmentCard 
                    key={idx} 
                    segment={segment} 
                    isLast={idx === flight.inbound!.length - 1} 
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Baggage info */}
          <div className="flex items-center gap-4 pt-2 border-t border-border/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Luggage className="h-4 w-4" />
              <span>Bagage cabine inclus</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Loading skeleton
const FlightSkeleton = () => (
  <div className="bg-card border border-border/50 rounded-2xl p-4 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded w-24" />
        <div className="h-3 bg-muted rounded w-16" />
      </div>
      <div className="flex-1 flex justify-center">
        <div className="h-8 bg-muted rounded w-32" />
      </div>
      <div className="space-y-2 text-right">
        <div className="h-6 bg-muted rounded w-20 ml-auto" />
        <div className="h-8 bg-muted rounded w-24 ml-auto" />
      </div>
    </div>
  </div>
);

// Main component
const FlightResults = ({ flights, isLoading, onSelect }: FlightResultsProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  if (isLoading) {
    return (
      <div className="space-y-3">
        <FlightSkeleton />
        <FlightSkeleton />
        <FlightSkeleton />
      </div>
    );
  }
  
  if (flights.length === 0) {
    return (
      <div className="text-center py-12">
        <Plane className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
        <p className="text-muted-foreground">Aucun vol trouvé pour ces critères</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {/* Results header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{flights.length}</span> vol{flights.length > 1 ? "s" : ""} trouvé{flights.length > 1 ? "s" : ""}
        </p>
      </div>
      
      {/* Flight cards */}
      {flights.map((flight) => (
        <FlightCard
          key={flight.id}
          flight={flight}
          onSelect={onSelect}
          isExpanded={expandedId === flight.id}
          onToggleExpand={() => setExpandedId(expandedId === flight.id ? null : flight.id)}
        />
      ))}
    </div>
  );
};

export default FlightResults;

// Mock flight data generator for testing
export const generateMockFlights = (from: string, to: string): FlightOffer[] => {
  const airlines = [
    { name: "Air France", code: "AF" },
    { name: "Lufthansa", code: "LH" },
    { name: "British Airways", code: "BA" },
    { name: "KLM", code: "KL" },
    { name: "Vueling", code: "VY" },
    { name: "Ryanair", code: "FR" },
  ];
  
  const fromCode = from.match(/\(([A-Z]{3})\)/)?.[1] || from.substring(0, 3).toUpperCase();
  const toCode = to.match(/\(([A-Z]{3})\)/)?.[1] || to.substring(0, 3).toUpperCase();
  
  const flights: FlightOffer[] = [];
  
  // Generate 5 mock flights
  for (let i = 0; i < 5; i++) {
    const airline = airlines[i % airlines.length];
    const price = Math.floor(Math.random() * 300) + 80;
    const departHour = 6 + Math.floor(Math.random() * 14);
    const duration = 1 + Math.floor(Math.random() * 4);
    const hasReturn = Math.random() > 0.3;
    const stops = Math.random() > 0.6 ? 1 : 0;
    
    flights.push({
      id: `flight-${i}`,
      price,
      currency: "€",
      stops,
      totalDuration: `${duration}h ${Math.floor(Math.random() * 50)}min`,
      cabinClass: "Économique",
      seatsLeft: Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : undefined,
      isBestPrice: i === 0,
      isFastest: i === 1,
      outbound: [
        {
          departureTime: `${departHour.toString().padStart(2, '0')}:${(Math.floor(Math.random() * 6) * 10).toString().padStart(2, '0')}`,
          arrivalTime: `${(departHour + duration).toString().padStart(2, '0')}:${(Math.floor(Math.random() * 6) * 10).toString().padStart(2, '0')}`,
          departureAirport: fromCode,
          arrivalAirport: toCode,
          duration: `${duration}h ${Math.floor(Math.random() * 50)}min`,
          airline: airline.name,
          airlineCode: airline.code,
          flightNumber: `${airline.code}${Math.floor(Math.random() * 9000) + 1000}`,
        },
      ],
      inbound: hasReturn ? [
        {
          departureTime: `${(departHour + 6).toString().padStart(2, '0')}:${(Math.floor(Math.random() * 6) * 10).toString().padStart(2, '0')}`,
          arrivalTime: `${(departHour + 6 + duration).toString().padStart(2, '0')}:${(Math.floor(Math.random() * 6) * 10).toString().padStart(2, '0')}`,
          departureAirport: toCode,
          arrivalAirport: fromCode,
          duration: `${duration}h ${Math.floor(Math.random() * 50)}min`,
          airline: airline.name,
          airlineCode: airline.code,
          flightNumber: `${airline.code}${Math.floor(Math.random() * 9000) + 1000}`,
        },
      ] : undefined,
    });
  }
  
  // Sort by price
  return flights.sort((a, b) => a.price - b.price);
};
