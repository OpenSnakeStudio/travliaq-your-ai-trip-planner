/**
 * Activities Panel - V4
 * - Compact "+" button to add cities with dates
 * - Always visible filters with budget in euros
 * - Two views: filters/search -> results with cards
 * - Separate AI recommendation button
 * - Only real GPS coordinates on map
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  MapPin, Heart, Sparkles, Plus, X, Hotel, Calendar, ExternalLink, 
  Star, Clock, Search, ArrowLeft, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useActivityMemory, ActivityEntry, TravliaqActivity } from "@/contexts/ActivityMemoryContext";
import { useAccommodationMemory } from "@/contexts/AccommodationMemoryContext";
import { useActivitiesSearch } from "@/hooks/useActivitiesSearch";
import { useLocationAutocomplete, LocationResult } from "@/hooks/useLocationAutocomplete";
import { eventBus } from "@/lib/eventBus";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toastSuccess, toastInfo } from "@/lib/toast";
import RangeCalendar from "@/components/RangeCalendar";
import type { DateRange } from "react-day-picker";

// ============================================================================
// TYPES
// ============================================================================

interface ActivityCity {
  id: string;
  city: string;
  country: string;
  countryCode: string;
  lat?: number;
  lng?: number;
  checkIn: Date | null;
  checkOut: Date | null;
  source: "accommodation" | "manual";
}

type ViewState = "filters" | "results";

// ============================================================================
// COMPACT ADD CITY BUTTON WITH POPOVER
// ============================================================================

function AddCityButton({
  onAdd,
}: {
  onAdd: (location: LocationResult, checkIn: Date | null, checkOut: Date | null) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const { data: locations = [], isLoading } = useLocationAutocomplete(
    search,
    isOpen && search.length >= 2 && !selectedLocation,
    ["city"]
  );

  const handleLocationSelect = (location: LocationResult) => {
    setSelectedLocation(location);
    setSearch(location.name);
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onAdd(selectedLocation, dateRange?.from || null, dateRange?.to || null);
      setIsOpen(false);
      setSearch("");
      setSelectedLocation(null);
      setDateRange(undefined);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setSearch("");
    setSelectedLocation(null);
    setDateRange(undefined);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="h-8 w-8 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-colors"
          title="Ajouter une ville"
        >
          <Plus className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        {!selectedLocation ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Ajouter une ville</p>
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une ville..."
              className="h-9 text-sm"
              autoFocus
            />
            {isLoading ? (
              <div className="py-2 text-xs text-muted-foreground text-center">Recherche...</div>
            ) : locations.length > 0 ? (
              <div className="max-h-40 overflow-y-auto space-y-1">
                {locations.slice(0, 6).map((location) => (
                  <button
                    key={`${location.type}-${location.id}`}
                    onClick={() => handleLocationSelect(location)}
                    className="w-full px-2 py-1.5 text-left hover:bg-muted/50 rounded-md flex items-center gap-2"
                  >
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium truncate">{location.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {location.country_name}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : search.length >= 2 ? (
              <div className="py-2 text-xs text-muted-foreground text-center">Aucun résultat</div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{selectedLocation.name}</span>
              </div>
              <button
                onClick={() => {
                  setSelectedLocation(null);
                  setSearch("");
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Changer
              </button>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Dates (optionnel)</p>
              <RangeCalendar
                value={dateRange}
                onChange={setDateRange}
                numberOfMonths={1}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleCancel} className="flex-1">
                Annuler
              </Button>
              <Button size="sm" onClick={handleConfirm} className="flex-1">
                Ajouter
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ============================================================================
// STAR RATING FILTER (Compact)
// ============================================================================

function StarRatingFilter({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const options = [
    { value: 0, label: "Tous" },
    { value: 3, label: "3+" },
    { value: 3.5, label: "3.5+" },
    { value: 4, label: "4+" },
    { value: 4.5, label: "4.5+" },
  ];

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        <span>Note</span>
      </div>
      <div className="flex gap-1 flex-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 py-1.5 rounded-md text-xs font-medium transition-all",
              value === opt.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// BUDGET FILTER (Compact with euros)
// ============================================================================

function BudgetFilter({
  value,
  onChange,
}: {
  value: [number, number];
  onChange: (range: [number, number]) => void;
}) {
  const presets = [
    { label: "€", range: [0, 30] as [number, number], text: "0-30€" },
    { label: "€€", range: [30, 80] as [number, number], text: "30-80€" },
    { label: "€€€", range: [80, 200] as [number, number], text: "80-200€" },
    { label: "€€€€", range: [200, 1000] as [number, number], text: "200€+" },
  ];

  const currentPreset = presets.find(
    (p) => p.range[0] === value[0] && p.range[1] === value[1]
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Budget</span>
        <span className="text-xs font-medium text-primary">
          {value[0]}€ - {value[1] >= 1000 ? "1000€+" : `${value[1]}€`}
        </span>
      </div>
      <div className="flex gap-1">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => onChange(preset.range)}
            className={cn(
              "flex-1 py-2 rounded-md text-xs font-medium transition-all flex flex-col items-center gap-0.5",
              currentPreset?.label === preset.label
                ? "bg-primary text-primary-foreground"
                : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
            )}
          >
            <span>{preset.label}</span>
            <span className="text-[10px] opacity-70">{preset.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// ACTIVITY RESULT CARD (for results view)
// ============================================================================

interface ActivityResultCardProps {
  activity: TravliaqActivity;
  isSaved: boolean;
  onSave: () => void;
  onShowOnMap: () => void;
}

const ActivityResultCard = ({ activity, isSaved, onSave, onShowOnMap }: ActivityResultCardProps) => {
  // TravliaqActivity doesn't have lat/lng - API doesn't provide coordinates
  const hasCoordinates = false;
  
  const fromPrice = activity.pricing?.from_price || 0;
  const originalPrice = activity.pricing?.original_price;
  const isRealDiscount = 
    originalPrice && 
    fromPrice && 
    originalPrice > fromPrice &&
    (originalPrice - fromPrice) >= 5;

  const coverImage = activity.images?.find(img => img.is_cover)?.url || activity.images?.[0]?.url;
  const ratingAvg = activity.rating?.average || 0;
  const ratingCount = activity.rating?.count || 0;
  const durationFormatted = activity.duration?.formatted || "";

  return (
    <div className="p-3 rounded-xl bg-card border border-border/40 hover:border-primary/30 transition-all group">
      <div className="flex gap-3">
        {coverImage && (
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
            <img
              src={coverImage}
              alt={activity.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium line-clamp-2 leading-tight">{activity.title}</p>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            {ratingAvg > 0 && (
              <span className="flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {ratingAvg.toFixed(1)}
                {ratingCount > 0 && (
                  <span className="text-muted-foreground/60">({ratingCount})</span>
                )}
              </span>
            )}
            {durationFormatted && (
              <span className="flex items-center gap-0.5">
                <Clock className="h-3 w-3" />
                {durationFormatted}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-primary">
                {fromPrice}€
              </span>
              {isRealDiscount && originalPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  {originalPrice}€
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onSave}
          className={cn(
            "p-2 rounded-full transition-all shrink-0",
            isSaved
              ? "bg-primary/10 text-primary"
              : "bg-muted/40 text-muted-foreground hover:bg-primary/10 hover:text-primary"
          )}
        >
          <Heart className={cn("h-4 w-4", isSaved && "fill-current")} />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// SAVED ACTIVITY CARD (compact)
// ============================================================================

interface SavedActivityCardProps {
  activity: ActivityEntry;
  onRemove: () => void;
}

const SavedActivityCard = ({ activity, onRemove }: SavedActivityCardProps) => {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/30 group">
      {activity.imageUrl && (
        <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
          <img
            src={activity.imageUrl}
            alt={activity.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium line-clamp-1">{activity.title}</p>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          {activity.rating && (
            <span className="flex items-center gap-0.5">
              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
              {activity.rating.toFixed(1)}
            </span>
          )}
          <span className="font-medium text-primary">{activity.fromPrice}€</span>
        </div>
      </div>

      <button
        onClick={onRemove}
        className="p-1 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

// ============================================================================
// MAIN PANEL COMPONENT
// ============================================================================

const ActivitiesPanel = () => {
  const {
    memory: activityMemory,
    saveActivity,
    unsaveActivity,
    getSavedActivitiesByDestination,
    setActiveDestination,
    totalSavedCount,
  } = useActivityMemory();

  const { memory: accommodationMemory } = useAccommodationMemory();
  const { loading, search } = useActivitiesSearch();

  // View state
  const [viewState, setViewState] = useState<ViewState>("filters");
  const [apiResults, setApiResults] = useState<TravliaqActivity[]>([]);

  // Local state
  const [manualCities, setManualCities] = useState<ActivityCity[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Filters (always visible)
  const [ratingFilter, setRatingFilter] = useState(0);
  const [budgetFilter, setBudgetFilter] = useState<[number, number]>([0, 500]);

  // Combine accommodation cities + manual cities
  const allCities = useMemo((): ActivityCity[] => {
    const fromAccommodation: ActivityCity[] = accommodationMemory.accommodations
      .filter((a) => a.city)
      .map((a) => ({
        id: a.id,
        city: a.city,
        country: a.country || "",
        countryCode: a.countryCode || "",
        lat: a.lat,
        lng: a.lng,
        checkIn: a.checkIn,
        checkOut: a.checkOut,
        source: "accommodation" as const,
      }));

    return [...fromAccommodation, ...manualCities];
  }, [accommodationMemory.accommodations, manualCities]);

  // Current city
  const currentCity = useMemo(() => {
    if (!selectedCityId) return null;
    return allCities.find((c) => c.id === selectedCityId) || null;
  }, [selectedCityId, allCities]);

  // Saved activities for current city
  const savedActivities = useMemo(() => {
    if (!selectedCityId) return [];
    return getSavedActivitiesByDestination(selectedCityId);
  }, [selectedCityId, getSavedActivitiesByDestination]);

  // Filter results by rating and budget
  const filteredResults = useMemo(() => {
    return apiResults.filter((a) => {
      const ratingAvg = a.rating?.average || 0;
      const fromPrice = a.pricing?.from_price || 0;
      if (ratingFilter > 0 && ratingAvg < ratingFilter) return false;
      if (fromPrice && (fromPrice < budgetFilter[0] || fromPrice > budgetFilter[1])) return false;
      return true;
    });
  }, [apiResults, ratingFilter, budgetFilter]);

  // Auto-select first city
  useEffect(() => {
    if (!selectedCityId && allCities.length > 0) {
      setSelectedCityId(allCities[0].id);
      setActiveDestination(allCities[0].id);
    }
  }, [selectedCityId, allCities, setActiveDestination]);

  // Handle city selection - zoom on map
  const handleCitySelect = useCallback(
    (cityId: string) => {
      setSelectedCityId(cityId);
      setActiveDestination(cityId);
      setViewState("filters"); // Reset to filters view
      setApiResults([]); // Clear previous results

      const city = allCities.find((c) => c.id === cityId);
      if (city) {
        eventBus.emit("activities:cityFocus", {
          city: city.city,
          countryCode: city.countryCode,
          lat: city.lat,
          lng: city.lng,
        });
      }
    },
    [allCities, setActiveDestination]
  );

  // Add manual city
  const handleAddCity = useCallback((location: LocationResult, checkIn: Date | null, checkOut: Date | null) => {
    const newCity: ActivityCity = {
      id: crypto.randomUUID(),
      city: location.name,
      country: location.country_name || "",
      countryCode: location.country_code || "",
      lat: location.lat,
      lng: location.lng,
      checkIn,
      checkOut,
      source: "manual",
    };

    setManualCities((prev) => [...prev, newCity]);
    setSelectedCityId(newCity.id);
    setActiveDestination(newCity.id);

    eventBus.emit("activities:cityFocus", {
      city: newCity.city,
      countryCode: newCity.countryCode,
      lat: newCity.lat,
      lng: newCity.lng,
    });

    toastSuccess(`${newCity.city} ajoutée`);
  }, [setActiveDestination]);

  // Remove manual city
  const handleRemoveCity = useCallback(
    (cityId: string) => {
      setManualCities((prev) => prev.filter((c) => c.id !== cityId));
      if (selectedCityId === cityId) {
        const remaining = allCities.filter((c) => c.id !== cityId);
        setSelectedCityId(remaining[0]?.id || null);
      }
    },
    [selectedCityId, allCities]
  );

  // Search activities
  const handleSearch = useCallback(async () => {
    if (!currentCity) {
      toastInfo("Sélectionnez d'abord une ville");
      return;
    }

    setIsSearching(true);

    try {
      const results = await search({
        city: currentCity.city,
        countryCode: currentCity.countryCode,
        startDate: currentCity.checkIn
          ? format(currentCity.checkIn, "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
        endDate: currentCity.checkOut
          ? format(currentCity.checkOut, "yyyy-MM-dd")
          : undefined,
        page: 1,
        limit: 50,
      });

      if (results && results.activities) {
        setApiResults(results.activities);
        setViewState("results");

        // API doesn't provide coordinates, so we don't emit for map markers
        toastSuccess(`${results.activities.length} activités trouvées`);
      }
    } catch (error) {
      console.error("Activity search error:", error);
    } finally {
      setIsSearching(false);
    }
  }, [currentCity, search]);

  // Save activity
  const handleSaveActivity = useCallback((activity: TravliaqActivity) => {
    if (!currentCity) return;
    
    const coverImage = activity.images?.find(img => img.is_cover)?.url || activity.images?.[0]?.url;
    
    saveActivity(activity, currentCity.id, {
      city: currentCity.city,
      country: currentCity.country,
      countryCode: currentCity.countryCode,
      checkIn: currentCity.checkIn,
      checkOut: currentCity.checkOut,
    });
    toastSuccess("Activité sauvegardée");
  }, [currentCity, saveActivity]);

  // Check if activity is saved
  const isActivitySaved = useCallback((activityId: string) => {
    return savedActivities.some((a) => a.id === activityId);
  }, [savedActivities]);

  // Show activity on map - not available since API doesn't provide coordinates
  const handleShowOnMap = useCallback((activity: TravliaqActivity) => {
    // API doesn't provide coordinates
    toastInfo("Coordonnées non disponibles");
  }, []);

  // ============================================================================
  // RENDER - No cities
  // ============================================================================

  if (allCities.length === 0) {
    return (
      <div className="space-y-4 p-1" data-tour="activities-panel">
        <div className="py-8 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <MapPin className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Où cherchez-vous des activités ?</p>
            <p className="text-xs text-muted-foreground mt-1">
              Ajoutez d'abord un hébergement ou une ville
            </p>
          </div>
        </div>

        <AddCityButton onAdd={handleAddCity} />
      </div>
    );
  }

  // ============================================================================
  // RENDER - Results view
  // ============================================================================

  if (viewState === "results") {
    return (
      <div className="space-y-3" data-tour="activities-panel">
        {/* Header with back button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewState("filters")}
            className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1">
            <p className="text-sm font-medium">Activités à {currentCity?.city}</p>
            <p className="text-xs text-muted-foreground">
              {filteredResults.length} résultat{filteredResults.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Compact filters */}
        <div className="space-y-2 p-2 rounded-xl bg-muted/20 border border-border/30">
          <StarRatingFilter value={ratingFilter} onChange={setRatingFilter} />
          <BudgetFilter value={budgetFilter} onChange={setBudgetFilter} />
        </div>

        {/* Results list */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {filteredResults.map((activity) => (
            <ActivityResultCard
              key={activity.id}
              activity={activity}
              isSaved={isActivitySaved(activity.id)}
              onSave={() => {
                if (isActivitySaved(activity.id)) {
                  unsaveActivity(activity.id);
                } else {
                  handleSaveActivity(activity);
                }
              }}
              onShowOnMap={() => handleShowOnMap(activity)}
            />
          ))}

          {filteredResults.length === 0 && (
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground">
                Aucune activité ne correspond aux filtres
              </p>
            </div>
          )}
        </div>

        {/* Saved activities summary */}
        {savedActivities.length > 0 && (
          <div className="pt-2 border-t border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-primary fill-primary" />
              <span className="text-xs font-medium">
                {savedActivities.length} sauvegardée{savedActivities.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="space-y-1">
              {savedActivities.slice(0, 3).map((activity) => (
                <SavedActivityCard
                  key={activity.id}
                  activity={activity}
                  onRemove={() => unsaveActivity(activity.id)}
                />
              ))}
              {savedActivities.length > 3 && (
                <p className="text-xs text-muted-foreground text-center py-1">
                  +{savedActivities.length - 3} autres
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // RENDER - Filters view (default)
  // ============================================================================

  return (
    <div className="space-y-4" data-tour="activities-panel">
      {/* City tabs with compact add button */}
      <div className="flex items-center gap-2 flex-wrap">
        {allCities.map((city) => (
          <div key={city.id} className="relative group">
            <button
              onClick={() => handleCitySelect(city.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5",
                selectedCityId === city.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
              )}
            >
              {city.source === "accommodation" ? (
                <Hotel className="h-3 w-3" />
              ) : (
                <MapPin className="h-3 w-3" />
              )}
              <span>{city.city}</span>
              {getSavedActivitiesByDestination(city.id).length > 0 && (
                <span
                  className={cn(
                    "px-1 py-0.5 rounded-full text-[9px] font-bold",
                    selectedCityId === city.id
                      ? "bg-primary-foreground/20"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  {getSavedActivitiesByDestination(city.id).length}
                </span>
              )}
            </button>

            {city.source === "manual" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveCity(city.id);
                }}
                className="absolute -top-1 -right-1 p-0.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            )}
          </div>
        ))}

        <AddCityButton onAdd={handleAddCity} />
      </div>

      {/* Current city info */}
      {currentCity && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{currentCity.country}</span>
          {currentCity.checkIn && currentCity.checkOut && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(currentCity.checkIn, "d MMM", { locale: fr })} - {format(currentCity.checkOut, "d MMM", { locale: fr })}
            </span>
          )}
        </div>
      )}

      {/* Filters (always visible) */}
      <div className="space-y-3 p-3 rounded-xl bg-muted/20 border border-border/30">
        <StarRatingFilter value={ratingFilter} onChange={setRatingFilter} />
        <BudgetFilter value={budgetFilter} onChange={setBudgetFilter} />
      </div>

      {/* Search button */}
      <Button
        onClick={handleSearch}
        disabled={isSearching || loading || !currentCity}
        className="w-full h-11 text-sm font-medium gap-2"
        variant="default"
      >
        {isSearching || loading ? (
          <>
            <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Recherche...
          </>
        ) : (
          <>
            <Search className="h-4 w-4" />
            Rechercher des activités
          </>
        )}
      </Button>

      {/* Saved activities */}
      {savedActivities.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary fill-primary" />
            <span className="text-xs font-medium">Mes activités ({savedActivities.length})</span>
          </div>
          <div className="space-y-1.5">
            {savedActivities.map((activity) => (
              <SavedActivityCard
                key={activity.id}
                activity={activity}
                onRemove={() => unsaveActivity(activity.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* AI Recommendation button (secondary) */}
      <Button
        onClick={handleSearch}
        disabled={isSearching || loading || !currentCity}
        variant="outline"
        className="w-full h-10 text-xs gap-2"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Suggestions IA
      </Button>
    </div>
  );
};

export default ActivitiesPanel;
