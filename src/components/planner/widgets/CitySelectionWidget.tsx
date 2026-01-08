import { useState } from "react";
import { Star, MapPin, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CitySelectionData } from "@/types/flight";

/**
 * City Selection Widget
 *
 * Displays a list of cities from a selected country for user to choose from.
 * Highlights the recommended city with clear distinction and descriptions.
 */

export interface CitySelectionWidgetProps {
  citySelection: CitySelectionData;
  onSelect: (cityName: string) => void;
  isLoading?: boolean;
}

export function CitySelectionWidget({
  citySelection,
  onSelect,
  isLoading = false,
}: CitySelectionWidgetProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const handleSelect = (cityName: string) => {
    setSelectedCity(cityName);
    setConfirmed(true);
    onSelect(cityName);
  };

  // First city is always the recommended one
  const recommendedCity = citySelection.cities[0];
  const otherCities = citySelection.cities.slice(1);

  if (confirmed && selectedCity) {
    return (
      <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium">
        <Check className="w-4 h-4" />
        <span>
          {selectedCity}, {citySelection.countryName}
        </span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-3 p-4 rounded-2xl bg-muted/50 border border-border/50 max-w-md">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Chargement des villes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 p-4 rounded-2xl bg-muted/50 border border-border/50 max-w-lg">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
        Choisir une ville en {citySelection.countryName}
      </div>

      {/* Recommended City - Highlighted */}
      {recommendedCity && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
              Recommandée
            </span>
          </div>
          <button
            onClick={() => handleSelect(recommendedCity.name)}
            className={cn(
              "w-full text-left p-4 rounded-xl border-2 transition-all",
              "bg-gradient-to-br from-primary/5 to-primary/10",
              "border-primary/40 hover:border-primary hover:shadow-lg hover:shadow-primary/10",
              "group relative overflow-hidden"
            )}
          >
            {/* Highlight badge */}
            <div className="absolute top-2 right-2">
              <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-medium">
                Meilleur choix
              </span>
            </div>
            
            <div className="flex items-start gap-3 pr-20">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors">
                  {recommendedCity.name}
                </div>
                <div className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {recommendedCity.description}
                </div>
                {/* Why recommended */}
                <div className="mt-2 text-xs text-primary/80 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Destination la plus populaire et mieux desservie
                </div>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Other Cities */}
      {otherCities.length > 0 && (
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">
            Autres destinations
          </div>
          <div className="space-y-2">
            {otherCities.map((city, idx) => (
              <button
                key={city.name}
                onClick={() => handleSelect(city.name)}
                className={cn(
                  "w-full text-left p-3 rounded-xl border transition-all",
                  "bg-card hover:bg-muted/50 hover:border-border",
                  "border-border/50 group"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium">
                    {idx + 2}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {city.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {city.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
