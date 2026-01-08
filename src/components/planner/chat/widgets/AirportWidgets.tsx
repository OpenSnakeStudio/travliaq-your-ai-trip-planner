/**
 * Airport Selection Widgets with Smart Recommendations
 */

import { useState } from "react";
import { Plane, Check, Star, AlertTriangle, Clock, MapPin, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Airport } from "@/hooks/useNearestAirports";
import type { AirportChoice, DualAirportChoice, AirportConfirmationData, ConfirmedAirports } from "@/types/flight";

/**
 * Get pros/cons for an airport based on its characteristics
 */
function getAirportProsAndCons(airport: Airport, isRecommended: boolean, allAirports: Airport[]) {
  const pros: string[] = [];
  const cons: string[] = [];
  
  // Distance comparison
  const minDistance = Math.min(...allAirports.map(a => a.distance_km));
  const maxDistance = Math.max(...allAirports.map(a => a.distance_km));
  
  if (airport.distance_km === minDistance && allAirports.length > 1) {
    pros.push("Le plus proche");
  } else if (airport.distance_km === maxDistance && allAirports.length > 1) {
    cons.push("Plus éloigné");
  }
  
  // Check airport size by name patterns (major airports usually have specific keywords)
  const name = airport.name.toLowerCase();
  if (name.includes("international") || name.includes("charles de gaulle") || name.includes("heathrow") || name.includes("schiphol")) {
    pros.push("Aéroport international majeur");
  }
  
  if (isRecommended) {
    pros.push("Plus de vols disponibles");
    pros.push("Meilleure connexion");
  } else {
    // Potential advantages for smaller airports
    if (airport.distance_km < 30) {
      pros.push("Accès rapide depuis le centre");
    }
    cons.push("Moins de choix de vols");
  }
  
  return { pros, cons };
}

/**
 * AirportButton - Compact inline airport selection button
 */
export function AirportButton({
  airport,
  onClick,
  disabled,
}: {
  airport: Airport;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-left",
        "bg-card hover:bg-primary/10 hover:border-primary/50",
        "border-border/50 text-xs w-full",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span className="font-bold text-primary text-sm">{airport.iata}</span>
      <span className="flex-1 truncate text-foreground">{airport.city_name || airport.name.split(" ")[0]}</span>
      <span className="text-muted-foreground text-[10px] shrink-0">{airport.distance_km.toFixed(0)}km</span>
    </button>
  );
}

/**
 * DualAirportSelection - Side-by-side departure/arrival airport selection
 */
export function DualAirportSelection({
  choices,
  onSelect,
  disabled,
}: {
  choices: DualAirportChoice;
  onSelect: (field: "from" | "to", airport: Airport) => void;
  disabled?: boolean;
}) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-3">
      {choices.from && (
        <div className="space-y-1.5">
          <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <span className="text-primary">✈</span> Départ · {choices.from.cityName}
          </div>
          <div className="space-y-1">
            {choices.from.airports.map((airport) => (
              <AirportButton
                key={airport.iata}
                airport={airport}
                onClick={() => onSelect("from", airport)}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      )}
      {choices.to && (
        <div className="space-y-1.5">
          <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <span className="text-primary">🛬</span> Arrivée · {choices.to.cityName}
          </div>
          <div className="space-y-1">
            {choices.to.airports.map((airport) => (
              <AirportButton
                key={airport.iata}
                airport={airport}
                onClick={() => onSelect("to", airport)}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * RecommendedAirportCard - Displays the recommended airport with explanation
 */
function RecommendedAirportCard({
  airport,
  label,
  allAirports,
  onAccept,
  onReject,
  disabled,
}: {
  airport: Airport;
  label: string;
  allAirports: Airport[];
  onAccept: () => void;
  onReject: () => void;
  disabled?: boolean;
}) {
  const { pros } = getAirportProsAndCons(airport, true, allAirports);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
        <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
          {label} recommandé
        </span>
      </div>
      
      <div className={cn(
        "p-3 rounded-xl border-2 transition-all",
        "bg-gradient-to-br from-primary/5 to-primary/10",
        "border-primary/40"
      )}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
            <Plane className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-primary text-lg">{airport.iata}</span>
              <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-medium">
                Meilleur choix
              </span>
            </div>
            <div className="text-sm text-foreground font-medium mt-0.5">
              {airport.name}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{airport.distance_km.toFixed(0)} km du centre</span>
            </div>
            
            {/* Pros */}
            <div className="mt-2 space-y-1">
              {pros.slice(0, 3).map((pro, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs text-emerald-600">
                  <ThumbsUp className="w-3 h-3" />
                  <span>{pro}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={onAccept}
            disabled={disabled}
            className={cn(
              "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Check className="w-4 h-4 inline mr-1.5" />
            Accepter
          </button>
          <button
            onClick={onReject}
            disabled={disabled}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              "bg-muted text-muted-foreground hover:bg-muted/80",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            Voir les autres
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * AlternativeAirportCard - Displays an alternative airport with pros/cons
 */
function AlternativeAirportCard({
  airport,
  index,
  allAirports,
  onSelect,
  disabled,
}: {
  airport: Airport;
  index: number;
  allAirports: Airport[];
  onSelect: () => void;
  disabled?: boolean;
}) {
  const { pros, cons } = getAirportProsAndCons(airport, false, allAirports);
  
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "w-full text-left p-3 rounded-xl border transition-all",
        "bg-card hover:bg-muted/50 hover:border-border",
        "border-border/50 group",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">{airport.iata}</span>
            <span className="text-foreground font-medium group-hover:text-primary transition-colors">
              {airport.city_name || airport.name.split(" ")[0]}
            </span>
            <span className="text-xs text-muted-foreground ml-auto">
              {airport.distance_km.toFixed(0)} km
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {airport.name}
          </div>
          
          {/* Pros and Cons */}
          <div className="mt-2 flex flex-wrap gap-2">
            {pros.slice(0, 2).map((pro, idx) => (
              <span key={`pro-${idx}`} className="inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                <ThumbsUp className="w-2.5 h-2.5" />
                {pro}
              </span>
            ))}
            {cons.slice(0, 2).map((con, idx) => (
              <span key={`con-${idx}`} className="inline-flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                <ThumbsDown className="w-2.5 h-2.5" />
                {con}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}

/**
 * AirportConfirmationWidget - Multi-destination airport selection with recommendations
 */
export function AirportConfirmationWidget({
  data,
  onConfirm,
  isLoading = false,
}: {
  data: AirportConfirmationData;
  onConfirm: (confirmed: ConfirmedAirports) => void;
  isLoading?: boolean;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState<Record<number, { from: boolean; to: boolean }>>({});

  // Track selected airports for each leg (from and to)
  const [selectedAirports, setSelectedAirports] = useState<Record<number, { from: Airport; to: Airport }>>(() => {
    const initial: Record<number, { from: Airport; to: Airport }> = {};
    data.legs.forEach(leg => {
      initial[leg.legIndex] = {
        from: leg.from.suggestedAirport,
        to: leg.to.suggestedAirport,
      };
    });
    return initial;
  });

  const handleAirportChange = (legIndex: number, field: "from" | "to", airport: Airport) => {
    setSelectedAirports(prev => ({
      ...prev,
      [legIndex]: {
        ...prev[legIndex],
        [field]: airport,
      },
    }));
    // Hide alternatives after selection
    setShowAlternatives(prev => ({
      ...prev,
      [legIndex]: {
        ...prev[legIndex],
        [field]: false,
      },
    }));
  };

  const toggleAlternatives = (legIndex: number, field: "from" | "to") => {
    setShowAlternatives(prev => ({
      ...prev,
      [legIndex]: {
        from: prev[legIndex]?.from || false,
        to: prev[legIndex]?.to || false,
        [field]: !prev[legIndex]?.[field],
      },
    }));
  };

  const handleConfirm = () => {
    setConfirmed(true);
    const confirmedLegs = data.legs.map(leg => {
      const selected = selectedAirports[leg.legIndex];
      return {
        legIndex: leg.legIndex,
        fromIata: selected.from.iata,
        fromDisplay: `${selected.from.name} (${selected.from.iata})`,
        toIata: selected.to.iata,
        toDisplay: `${selected.to.name} (${selected.to.iata})`,
        date: leg.date,
      };
    });
    onConfirm({ legs: confirmedLegs });
  };

  if (confirmed) {
    return (
      <div className="mt-3 p-4 rounded-2xl bg-primary/10 border border-primary/30 max-w-md">
        <div className="flex items-center gap-2 text-primary font-medium text-sm mb-2">
          <Check className="w-4 h-4" />
          <span>Aéroports confirmés</span>
        </div>
        <div className="space-y-1.5">
          {data.legs.map(leg => {
            const selected = selectedAirports[leg.legIndex];
            return (
              <div key={leg.legIndex} className="flex items-center gap-2 text-sm text-foreground">
                <span className="font-mono font-bold text-primary">{selected.from.iata}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-mono font-bold text-primary">{selected.to.iata}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 p-4 rounded-2xl bg-muted/50 border border-border/50 max-w-xl space-y-4">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Sélection des aéroports
      </div>

      {/* Legs */}
      <div className="space-y-4">
        {data.legs.map((leg, idx) => {
          const selected = selectedAirports[leg.legIndex];
          const showFromAlts = showAlternatives[leg.legIndex]?.from;
          const showToAlts = showAlternatives[leg.legIndex]?.to;
          const allFromAirports = [leg.from.suggestedAirport, ...leg.from.alternativeAirports];
          const allToAirports = [leg.to.suggestedAirport, ...leg.to.alternativeAirports];

          return (
            <div key={leg.legIndex} className="p-4 rounded-xl bg-card border border-border/50 space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {idx + 1}
                </span>
                <span className="font-medium text-foreground">{leg.from.city} → {leg.to.city}</span>
                {leg.date && (
                  <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded-full">
                    {leg.date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </span>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* From Airport */}
                <div className="space-y-2">
                  {!showFromAlts ? (
                    <RecommendedAirportCard
                      airport={selected.from}
                      label="Départ"
                      allAirports={allFromAirports}
                      onAccept={() => {}}
                      onReject={() => toggleAlternatives(leg.legIndex, "from")}
                      disabled={isLoading}
                    />
                  ) : (
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">
                        Aéroports de départ disponibles
                      </div>
                      {allFromAirports.map((airport, airportIdx) => (
                        <AlternativeAirportCard
                          key={airport.iata}
                          airport={airport}
                          index={airportIdx}
                          allAirports={allFromAirports}
                          onSelect={() => handleAirportChange(leg.legIndex, "from", airport)}
                          disabled={isLoading}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* To Airport */}
                <div className="space-y-2">
                  {!showToAlts ? (
                    <RecommendedAirportCard
                      airport={selected.to}
                      label="Arrivée"
                      allAirports={allToAirports}
                      onAccept={() => {}}
                      onReject={() => toggleAlternatives(leg.legIndex, "to")}
                      disabled={isLoading}
                    />
                  ) : (
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">
                        Aéroports d'arrivée disponibles
                      </div>
                      {allToAirports.map((airport, airportIdx) => (
                        <AlternativeAirportCard
                          key={airport.iata}
                          airport={airport}
                          index={airportIdx}
                          allAirports={allToAirports}
                          onSelect={() => handleAirportChange(leg.legIndex, "to", airport)}
                          disabled={isLoading}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm button */}
      <button
        onClick={handleConfirm}
        disabled={isLoading}
        className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            Recherche en cours...
          </>
        ) : (
          <>
            <Plane className="h-4 w-4" />
            Rechercher {data.legs.length} vol{data.legs.length > 1 ? "s" : ""}
          </>
        )}
      </button>
    </div>
  );
}
