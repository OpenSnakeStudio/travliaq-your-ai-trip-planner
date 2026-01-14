import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plane, Check, Star, MapPin, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Airport } from "@/hooks/useNearestAirports";
import type { AirportConfirmationData, ConfirmedAirports } from "@/types/flight";

/**
 * Airport Confirmation Widget with Smart Recommendations
 *
 * Multi-destination airport selection widget that highlights the recommended
 * airport and shows pros/cons for alternatives.
 */

/**
 * Get pros/cons for an airport based on its characteristics
 */
function useAirportProsAndCons(t: (key: string) => string) {
  return (airport: Airport, isRecommended: boolean, allAirports: Airport[]) => {
    const pros: string[] = [];
    const cons: string[] = [];
    
    const minDistance = Math.min(...allAirports.map(a => a.distance_km));
    const maxDistance = Math.max(...allAirports.map(a => a.distance_km));
    
    if (airport.distance_km === minDistance && allAirports.length > 1) {
      pros.push(t("planner.airports.closerToCenter"));
    } else if (airport.distance_km === maxDistance && allAirports.length > 1) {
      cons.push(t("planner.airports.furtherAway"));
    }
    
    const name = airport.name.toLowerCase();
    if (name.includes("international") || name.includes("charles de gaulle") || name.includes("heathrow") || name.includes("schiphol")) {
      pros.push(t("planner.airports.majorInternational"));
    }
    
    if (isRecommended) {
      pros.push(t("planner.airports.moreFlights"));
      pros.push(t("planner.airports.betterConnection"));
    } else {
      if (airport.distance_km < 30) {
        pros.push(t("planner.airports.quickAccess"));
      }
      cons.push(t("planner.airports.fewerFlights"));
    }
    
    return { pros, cons };
  };
}

export interface AirportConfirmationWidgetProps {
  data: AirportConfirmationData;
  onConfirm: (confirmed: ConfirmedAirports) => void;
  isLoading?: boolean;
}

export function AirportConfirmationWidget({
  data,
  onConfirm,
  isLoading = false,
}: AirportConfirmationWidgetProps) {
  const { t } = useTranslation();
  const getAirportProsAndCons = useAirportProsAndCons(t);
  const [confirmed, setConfirmed] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState<Record<number, { from: boolean; to: boolean }>>({});

  const [selectedAirports, setSelectedAirports] = useState<
    Record<number, { from: Airport; to: Airport }>
  >(() => {
    const initial: Record<number, { from: Airport; to: Airport }> = {};
    data.legs.forEach((leg) => {
      initial[leg.legIndex] = {
        from: leg.from.suggestedAirport,
        to: leg.to.suggestedAirport,
      };
    });
    return initial;
  });

  const handleAirportChange = (
    legIndex: number,
    field: "from" | "to",
    airport: Airport
  ) => {
    setSelectedAirports((prev) => ({
      ...prev,
      [legIndex]: {
        ...prev[legIndex],
        [field]: airport,
      },
    }));
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
    const confirmedLegs = data.legs.map((leg) => {
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
          <span>{t("planner.airports.confirmed")}</span>
        </div>
        <div className="space-y-1.5">
          {data.legs.map((leg) => {
            const selected = selectedAirports[leg.legIndex];
            return (
              <div
                key={leg.legIndex}
                className="flex items-center gap-2 text-sm text-foreground"
              >
                <span className="font-mono font-bold text-primary">
                  {selected.from.iata}
                </span>
                <span className="text-muted-foreground">→</span>
                <span className="font-mono font-bold text-primary">
                  {selected.to.iata}
                </span>
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
        {t("planner.airports.selection")}
      </div>

      <div className="space-y-4">
        {data.legs.map((leg, idx) => {
          const selected = selectedAirports[leg.legIndex];
          const showFromAlts = showAlternatives[leg.legIndex]?.from;
          const showToAlts = showAlternatives[leg.legIndex]?.to;
          const allFromAirports = [leg.from.suggestedAirport, ...leg.from.alternativeAirports];
          const allToAirports = [leg.to.suggestedAirport, ...leg.to.alternativeAirports];

          return (
            <div
              key={leg.legIndex}
              className="p-4 rounded-xl bg-card border border-border/50 space-y-4"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {idx + 1}
                </span>
                <span className="font-medium text-foreground">
                  {leg.from.city} → {leg.to.city}
                </span>
                {leg.date && (
                  <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded-full">
                    {leg.date.toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* From Airport */}
                <div className="space-y-2">
                  {!showFromAlts ? (
                    <RecommendedAirportCard
                      airport={selected.from}
                      label={t("planner.airports.departure")}
                      allAirports={allFromAirports}
                      onAccept={() => {}}
                      onReject={() => toggleAlternatives(leg.legIndex, "from")}
                      disabled={isLoading}
                      t={t}
                      getAirportProsAndCons={getAirportProsAndCons}
                    />
                  ) : (
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">
                        {t("planner.airports.departureAirports")}
                      </div>
                      {allFromAirports.map((airport, airportIdx) => (
                        <AlternativeAirportCard
                          key={airport.iata}
                          airport={airport}
                          index={airportIdx}
                          allAirports={allFromAirports}
                          onSelect={() => handleAirportChange(leg.legIndex, "from", airport)}
                          disabled={isLoading}
                          t={t}
                          getAirportProsAndCons={getAirportProsAndCons}
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
                      label={t("planner.airports.arrival")}
                      allAirports={allToAirports}
                      onAccept={() => {}}
                      onReject={() => toggleAlternatives(leg.legIndex, "to")}
                      disabled={isLoading}
                      t={t}
                      getAirportProsAndCons={getAirportProsAndCons}
                    />
                  ) : (
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">
                        {t("planner.airports.arrivalAirports")}
                      </div>
                      {allToAirports.map((airport, airportIdx) => (
                        <AlternativeAirportCard
                          key={airport.iata}
                          airport={airport}
                          index={airportIdx}
                          allAirports={allToAirports}
                          onSelect={() => handleAirportChange(leg.legIndex, "to", airport)}
                          disabled={isLoading}
                          t={t}
                          getAirportProsAndCons={getAirportProsAndCons}
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

      <button
        onClick={handleConfirm}
        disabled={isLoading}
        className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            {t("planner.airports.searching")}
          </>
        ) : (
          <>
            <Plane className="h-4 w-4" />
            {data.legs.length > 1 
              ? t("planner.airports.searchPlural", { count: data.legs.length })
              : t("planner.airports.search", { count: data.legs.length })}
          </>
        )}
      </button>
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
  t,
  getAirportProsAndCons,
}: {
  airport: Airport;
  label: string;
  allAirports: Airport[];
  onAccept: () => void;
  onReject: () => void;
  disabled?: boolean;
  t: (key: string, options?: Record<string, unknown>) => string;
  getAirportProsAndCons: (airport: Airport, isRecommended: boolean, allAirports: Airport[]) => { pros: string[]; cons: string[] };
}) {
  const { pros } = getAirportProsAndCons(airport, true, allAirports);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
        <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
          {label} {t("planner.airports.recommended")}
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
                {t("planner.airports.bestChoice")}
              </span>
            </div>
            <div className="text-sm text-foreground font-medium mt-0.5">
              {airport.name}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{airport.distance_km.toFixed(0)} {t("planner.airports.kmFromCenter")}</span>
            </div>
            
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
            {t("planner.airports.accept")}
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
            {t("planner.airports.seeOthers")}
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
  t,
  getAirportProsAndCons,
}: {
  airport: Airport;
  index: number;
  allAirports: Airport[];
  onSelect: () => void;
  disabled?: boolean;
  t: (key: string, options?: Record<string, unknown>) => string;
  getAirportProsAndCons: (airport: Airport, isRecommended: boolean, allAirports: Airport[]) => { pros: string[]; cons: string[] };
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
