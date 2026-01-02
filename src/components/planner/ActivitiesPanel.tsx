/**
 * Activities Panel - Complete Refactor with improved UX
 *
 * Features:
 * - City management with add/remove/sync
 * - Two-view system: filters + results
 * - Activity cards with 2 columns
 * - Detail modal on click
 * - Map integration with coordinates
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Search, Sparkles, Calendar, Plane, Loader2, Plus, X, MapPin, 
  ChevronLeft, Trash2, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useActivityMemory } from "@/contexts/ActivityMemoryContext";
import { useAccommodationMemory } from "@/contexts/AccommodationMemoryContext";
import { ActivityCard } from "./ActivityCard";
import { ActivityFilters } from "./ActivityFilters";
import { ActivityDetailModal } from "./ActivityDetailModal";
import { toast } from "sonner";
import { eventBus } from "@/lib/eventBus";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { ActivitySearchParams, ViatorActivity, ActivityFilters as ActivityFiltersType } from "@/types/activity";

// ============================================================================
// TYPES
// ============================================================================

type ViewType = "filters" | "results";

interface CityEntry {
  id: string;
  city: string;
  countryCode: string;
  startDate: string;
  endDate?: string;
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}) => (
  <div className="py-12 text-center space-y-4">
    <div className="flex justify-center">
      <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center">
        <Icon className="h-8 w-8 text-muted-foreground/50" />
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground max-w-xs mx-auto">{description}</p>
    </div>
    {action && <div className="pt-2">{action}</div>}
  </div>
);

// City chip component
const CityChip = ({
  city,
  countryCode,
  startDate,
  endDate,
  selected,
  onClick,
  onRemove,
}: {
  city: string;
  countryCode: string;
  startDate: string;
  endDate?: string;
  selected: boolean;
  onClick: () => void;
  onRemove: () => void;
}) => {
  const formatDateRange = () => {
    try {
      const start = new Date(startDate);
      const formattedStart = format(start, "d MMM", { locale: fr });
      if (endDate) {
        const end = new Date(endDate);
        const formattedEnd = format(end, "d MMM", { locale: fr });
        return `${formattedStart} - ${formattedEnd}`;
      }
      return formattedStart;
    } catch {
      return "";
    }
  };

  return (
    <div
      className={cn(
        "group relative flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-pointer",
        selected
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-muted/30 text-muted-foreground border-border/30 hover:bg-muted/50"
      )}
      onClick={onClick}
    >
      <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-medium truncate">
          {city}{countryCode ? `, ${countryCode}` : ""}
        </span>
        <span className={cn("text-[10px]", selected ? "text-primary-foreground/70" : "text-muted-foreground/70")}>
          {formatDateRange()}
        </span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className={cn(
          "ml-1 p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
          selected ? "hover:bg-primary-foreground/20" : "hover:bg-muted"
        )}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
};

// Add city popover
const AddCityPopover = ({
  onAdd,
}: {
  onAdd: (city: string, countryCode: string, date: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [city, setCity] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = () => {
    if (!city || !date) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    onAdd(city, countryCode, date);
    setCity("");
    setCountryCode("");
    setDate("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="h-10 w-10 rounded-lg border border-dashed border-border/50 flex items-center justify-center hover:bg-muted/50 transition-colors">
          <Plus className="h-4 w-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 space-y-3" align="start">
        <p className="text-xs font-medium text-foreground">Ajouter une ville</p>
        <Input
          placeholder="Ville (ex: Paris)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="h-8 text-sm"
        />
        <Input
          placeholder="Code pays (ex: FR)"
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
          className="h-8 text-sm"
          maxLength={2}
        />
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-8 text-sm"
        />
        <Button size="sm" className="w-full" onClick={handleSubmit}>
          Ajouter
        </Button>
      </PopoverContent>
    </Popover>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ActivitiesPanel = () => {
  const {
    state: activityState,
    searchActivities,
    loadMoreResults,
    clearSearch,
    loadRecommendations,
    addActivityFromSearch,
    removeActivity,
    selectActivity,
    getActivitiesByDestination,
    updateFilters,
    getTotalBudget,
  } = useActivityMemory();

  const { memory: accommodationMemory } = useAccommodationMemory();

  // UI State
  const [currentView, setCurrentView] = useState<ViewType>("filters");
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [detailModalActivity, setDetailModalActivity] = useState<ViatorActivity | null>(null);
  
  // Local cities state (derived from accommodations)
  const cities = useMemo<CityEntry[]>(() => {
    return accommodationMemory.accommodations.map((acc) => ({
      id: acc.id,
      city: acc.city || "",
      countryCode: acc.countryCode || "",
      startDate: typeof acc.checkIn === "string" ? acc.checkIn : acc.checkIn?.toISOString().split("T")[0] || "",
      endDate: typeof acc.checkOut === "string" ? acc.checkOut : acc.checkOut?.toISOString().split("T")[0] || undefined,
    }));
  }, [accommodationMemory.accommodations]);

  // Auto-select first city
  useEffect(() => {
    if (!selectedCityId && cities.length > 0) {
      setSelectedCityId(cities[0].id);
    }
  }, [selectedCityId, cities]);

  // Current city
  const currentCity = cities.find((c) => c.id === selectedCityId);

  // Get planned activities for current city
  const plannedActivities = selectedCityId ? getActivitiesByDestination(selectedCityId) : [];

  // Handle city selection change - emit map event
  useEffect(() => {
    if (currentCity) {
      eventBus.emit("activities:cityFocus", {
        city: currentCity.city,
        countryCode: currentCity.countryCode,
      });
    }
  }, [currentCity]);

  // Handle search
  const handleSearch = useCallback(async () => {
    if (!currentCity) {
      toast.error("Veuillez sélectionner une ville");
      return;
    }

    const params: ActivitySearchParams = {
      city: currentCity.city,
      countryCode: currentCity.countryCode,
      startDate: currentCity.startDate || new Date().toISOString().split("T")[0],
      endDate: currentCity.endDate,
      categories: activityState.activeFilters.categories,
      priceRange: {
        min: activityState.activeFilters.priceRange[0],
        max: activityState.activeFilters.priceRange[1],
      },
      ratingMin: activityState.activeFilters.ratingMin,
      page: 1,
      limit: 20,
    };

    try {
      await searchActivities(params);
      setCurrentView("results");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la recherche");
    }
  }, [currentCity, activityState.activeFilters, searchActivities]);

  // Handle load more
  const handleLoadMore = useCallback(async () => {
    try {
      await loadMoreResults();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du chargement");
    }
  }, [loadMoreResults]);

  // Handle add activity
  const handleAddActivity = useCallback(
    (viatorActivity: ViatorActivity) => {
      if (!selectedCityId) {
        toast.error("Veuillez sélectionner une destination");
        return;
      }
      addActivityFromSearch(viatorActivity, selectedCityId);
    },
    [selectedCityId, addActivityFromSearch]
  );

  // Handle remove activity
  const handleRemoveActivity = useCallback(
    (activityId: string) => {
      removeActivity(activityId);
    },
    [removeActivity]
  );

  // Handle activity click - open detail modal
  const handleActivityClick = useCallback(
    (activity: ViatorActivity) => {
      setDetailModalActivity(activity);
      selectActivity(activity.id);
      
      // If activity has coordinates, emit map event
      if (activity.coordinates) {
        eventBus.emit("map:moveToLocation", {
          lat: activity.coordinates.lat,
          lng: activity.coordinates.lng,
          zoom: 15,
        });
      }
    },
    [selectActivity]
  );

  // Handle add city - just show toast for now, proper sync would need chat integration
  const handleAddCity = useCallback((city: string, countryCode: string, date: string) => {
    // TODO: Integrate with chat to ask about sync
    toast.success(`${city} ajoutée - synchronisez via le chat pour ajouter aux hébergements`);
  }, []);

  // Handle remove city
  const handleRemoveCity = useCallback((cityId: string) => {
    const city = cities.find((c) => c.id === cityId);
    if (city) {
      toast.info(`Pour supprimer ${city.city}, utilisez l'onglet hébergements`);
    }
  }, [cities]);

  // Back to filters
  const handleBackToFilters = useCallback(() => {
    setCurrentView("filters");
  }, []);

  // Load recommendations
  const handleLoadRecommendations = useCallback(() => {
    if (selectedCityId) {
      loadRecommendations(selectedCityId);
      setCurrentView("results");
    }
  }, [selectedCityId, loadRecommendations]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="h-full flex flex-col" data-tour="activities-panel">
      {/* No Destination Message */}
      {cities.length === 0 && (
        <EmptyState
          icon={Plane}
          title="Aucune destination configurée"
          description="Ajoutez d'abord une destination dans l'onglet vols pour découvrir des activités"
          action={
            <Button
              onClick={() => eventBus.emit("tab:change", { tab: "flights" })}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Plane className="h-3.5 w-3.5" />
              Aller aux vols
            </Button>
          }
        />
      )}

      {/* Main Content */}
      {cities.length > 0 && (
        <>
          {/* City Selector */}
          <div className="pb-3 border-b border-border/30">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {cities.map((city) => (
                <CityChip
                  key={city.id}
                  city={city.city}
                  countryCode={city.countryCode}
                  startDate={city.startDate}
                  endDate={city.endDate}
                  selected={selectedCityId === city.id}
                  onClick={() => setSelectedCityId(city.id)}
                  onRemove={() => handleRemoveCity(city.id)}
                />
              ))}
              <AddCityPopover onAdd={handleAddCity} />
            </div>
          </div>

          {/* View Content */}
          <div className="flex-1 overflow-y-auto py-3">
            {/* FILTERS VIEW */}
            {currentView === "filters" && (
              <div className="space-y-4">
                {/* Filters */}
                <ActivityFilters
                  filters={activityState.activeFilters}
                  onFiltersChange={updateFilters}
                  compact={false}
                />

                {/* Search Button */}
                <Button
                  onClick={handleSearch}
                  disabled={!currentCity || activityState.search.isSearching}
                  className="w-full gap-2"
                  size="lg"
                >
                  {activityState.search.isSearching ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Recherche en cours...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Rechercher des activités
                    </>
                  )}
                </Button>

                {/* Recommendations Button */}
                <Button
                  onClick={handleLoadRecommendations}
                  variant="outline"
                  disabled={!currentCity || activityState.isLoadingRecommendations}
                  className="w-full gap-2"
                >
                  {activityState.isLoadingRecommendations ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Suggestions IA
                    </>
                  )}
                </Button>

                {/* Planned Activities Preview */}
                {plannedActivities.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-border/30">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-foreground">
                        Activités sélectionnées ({plannedActivities.length})
                      </p>
                      <p className="text-xs text-primary font-semibold">{getTotalBudget()}€</p>
                    </div>
                    <div className="space-y-2">
                      {plannedActivities.slice(0, 3).map((activity) => (
                        <ActivityCard
                          key={activity.id}
                          activity={activity}
                          mode="planned"
                          compact
                          onRemove={() => handleRemoveActivity(activity.id)}
                        />
                      ))}
                      {plannedActivities.length > 3 && (
                        <p className="text-xs text-muted-foreground text-center">
                          +{plannedActivities.length - 3} autres
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* RESULTS VIEW */}
            {currentView === "results" && (
              <div className="space-y-4">
                {/* Back Button */}
                <button
                  onClick={handleBackToFilters}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Retour aux filtres
                </button>

                {/* Error State */}
                {activityState.search.error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-destructive">Erreur de recherche</p>
                      <p className="text-xs text-destructive/80 mt-1">{activityState.search.error}</p>
                    </div>
                  </div>
                )}

                {/* Results Header */}
                {activityState.search.searchResults.length > 0 && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {activityState.search.totalResults} résultat{activityState.search.totalResults > 1 ? "s" : ""}
                    </p>
                    <button
                      onClick={clearSearch}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Effacer
                    </button>
                  </div>
                )}

                {/* Results Grid - 2 columns */}
                {activityState.search.searchResults.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {activityState.search.searchResults.map((activity) => (
                      <ActivityCard
                        key={activity.id}
                        activity={activity}
                        mode="search"
                        onAdd={() => handleAddActivity(activity)}
                        onClick={() => handleActivityClick(activity)}
                      />
                    ))}
                  </div>
                )}

                {/* Recommendations */}
                {activityState.recommendations.length > 0 && activityState.search.searchResults.length === 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium text-foreground">Recommandations pour vous</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {activityState.recommendations.map((activity) => (
                        <ActivityCard
                          key={activity.id}
                          activity={activity}
                          mode="search"
                          onAdd={() => handleAddActivity(activity)}
                          onClick={() => handleActivityClick(activity)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Load More */}
                {activityState.search.hasMore && (
                  <Button
                    onClick={handleLoadMore}
                    disabled={activityState.search.isSearching}
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                  >
                    {activityState.search.isSearching ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Chargement...
                      </>
                    ) : (
                      <>Voir plus</>
                    )}
                  </Button>
                )}

                {/* Empty State */}
                {!activityState.search.isSearching &&
                  activityState.search.searchResults.length === 0 &&
                  activityState.recommendations.length === 0 &&
                  !activityState.search.error && (
                    <EmptyState
                      icon={Search}
                      title="Aucun résultat"
                      description="Essayez de modifier vos filtres ou d'élargir votre recherche"
                      action={
                        <Button onClick={handleBackToFilters} variant="outline" size="sm">
                          Modifier les filtres
                        </Button>
                      }
                    />
                  )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Detail Modal */}
      <ActivityDetailModal
        activity={detailModalActivity}
        open={!!detailModalActivity}
        onClose={() => setDetailModalActivity(null)}
        onAdd={handleAddActivity}
        isInTrip={detailModalActivity ? activityState.activities.some((a) => a.viatorId === detailModalActivity.id) : false}
      />
    </div>
  );
};

export default ActivitiesPanel;
