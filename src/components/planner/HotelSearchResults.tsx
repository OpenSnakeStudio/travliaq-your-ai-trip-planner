import { memo, useRef, useEffect, useState } from "react";
import { ArrowLeft, Star, MapPin, Wifi, Car, Coffee, Waves, Eye, Search, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { eventBus } from "@/lib/eventBus";

// Hotel result interface (aligned with Hotels API)
export interface HotelResult {
  id: string;
  name: string;
  imageUrl: string | null;
  rating: number | null;
  reviewCount: number;
  pricePerNight: number;
  totalPrice?: number | null;
  currency: string;
  address: string;
  lat: number;
  lng: number;
  amenities: string[];
  stars?: number | null;
  distanceFromCenter?: string | null;
  bookingUrl?: string | null;
}

interface HotelSearchResultsProps {
  results: HotelResult[];
  isLoading: boolean;
  destination: string;
  nights: number;
  onBack: () => void;
  onHotelSelect: (hotel: HotelResult) => void;
  onHotelHover: (hotel: HotelResult | null) => void;
  selectedHotelId?: string | null;
  highlightedHotelId?: string | null;
  onMapMove?: (center: [number, number], zoom: number) => void;
  mapCenter?: [number, number];
  onSearchInArea?: (lat: number, lng: number) => void;
  isSearchingInArea?: boolean;
}

// Amenity icon mapping
const amenityIcons: Record<string, typeof Wifi> = {
  wifi: Wifi,
  parking: Car,
  breakfast: Coffee,
  pool: Waves,
};

// Single hotel card
const HotelCard = memo(({
  hotel,
  isSelected,
  isHighlighted,
  onSelect,
  onViewDetails,
  onHover,
  cardRef,
  t,
}: {
  hotel: HotelResult;
  isSelected: boolean;
  isHighlighted: boolean;
  onSelect: () => void;
  onViewDetails: () => void;
  onHover: (hovering: boolean) => void;
  cardRef?: React.RefObject<HTMLDivElement>;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) => {
  return (
    <div
      data-testid="hotel-card"
      ref={cardRef}
      className={cn(
        "group relative rounded-xl border bg-card overflow-hidden transition-all cursor-pointer",
        "hover:shadow-lg hover:border-primary/30",
        isSelected && "ring-2 ring-primary border-primary",
        isHighlighted && !isSelected && "ring-2 ring-primary/60 border-primary/60 bg-primary/5 shadow-lg"
      )}
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {/* Image */}
      <div className="relative h-32 w-full overflow-hidden bg-muted flex-shrink-0">
        <img
          src={
            hotel.imageUrl ??
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop"
          }
          alt={hotel.name}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop";
          }}
        />
        {/* Price badge */}
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-lg text-sm font-bold shadow-lg">
          {hotel.pricePerNight}€<span className="text-xs font-normal opacity-80">/{t("planner.hotels.perNight")}</span>
        </div>
        {/* Stars */}
        {!!hotel.stars && hotel.stars > 0 && (
          <div className="absolute top-2 left-2 flex gap-0.5">
            {Array.from({ length: hotel.stars }).map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Name and rating */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm line-clamp-2 flex-1">{hotel.name}</h3>
          <div className="flex items-center gap-1 shrink-0">
            <div className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs font-bold">
              {hotel.rating === null || hotel.rating === undefined ? "—" : hotel.rating.toFixed(1)}
            </div>
            <span className="text-xs text-muted-foreground">({hotel.reviewCount})</span>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{hotel.address}</span>
        </div>

        {/* Amenities */}
        {hotel.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {hotel.amenities.slice(0, 4).map((amenity) => {
              const Icon = amenityIcons[amenity.toLowerCase()] || Wifi;
              return (
                <Badge 
                  key={amenity} 
                  variant="secondary" 
                  className="text-[10px] px-1.5 py-0 h-5 gap-1"
                >
                  <Icon className="h-2.5 w-2.5" />
                  {amenity}
                </Badge>
              );
            })}
          </div>
        )}

        {/* Total price + View details button */}
        <div className="pt-1 border-t border-border/50 flex items-center justify-between">
          {hotel.totalPrice ? (
            <>
              <div>
                <span className="text-xs text-muted-foreground">{t("planner.hotels.total")} </span>
                <span className="font-bold text-primary">{hotel.totalPrice}€</span>
              </div>
            </>
          ) : (
            <div />
          )}
          <Button
            variant="default"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
          >
            <Eye className="h-3 w-3" />
            {t("planner.hotels.viewDetails")}
          </Button>
        </div>
      </div>
    </div>
  );
});

HotelCard.displayName = "HotelCard";

// Loading skeleton
const HotelCardSkeleton = () => (
  <div className="rounded-xl border bg-card overflow-hidden">
    <Skeleton className="h-32 w-full" />
    <div className="p-3 space-y-2">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-8" />
      </div>
      <Skeleton className="h-3 w-full" />
      <div className="flex gap-1">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-14" />
        <Skeleton className="h-5 w-12" />
      </div>
    </div>
  </div>
);

const HotelSearchResults = ({
  results,
  isLoading,
  destination,
  nights,
  onBack,
  onHotelSelect,
  onHotelHover,
  selectedHotelId,
  highlightedHotelId,
  onMapMove,
}: HotelSearchResultsProps) => {
  const { t } = useTranslation();
  const headerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const [mapHoveredHotelId, setMapHoveredHotelId] = useState<string | null>(null);
  
  // Refs for each hotel card to enable scrolling
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Listen for hover events from map markers ONLY (not from list)
  useEffect(() => {
    const handleMapHover = (data: { hotel: HotelResult | null; source?: string }) => {
      // Only react to hovers from the map, ignore hovers from the list
      if (data.source !== "map") return;
      
      const hotelId = data.hotel?.id || null;
      setMapHoveredHotelId(hotelId);
      
      // Scroll to the card when hovering on map
      if (hotelId && cardRefs.current.has(hotelId)) {
        const cardEl = cardRefs.current.get(hotelId);
        cardEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };

    eventBus.on("hotels:hover", handleMapHover);
    return () => {
      eventBus.off("hotels:hover", handleMapHover);
    };
  }, []);

  // Handle scroll for sticky header effect
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = (e.target as HTMLDivElement).scrollTop;
    setIsHeaderSticky(scrollTop > 10);
  };

  // Handle card click - just highlight, don't open details
  const handleCardClick = (hotel: HotelResult) => {
    // Emit select event to highlight the marker on map
    eventBus.emit("hotels:select", { hotel });
    // Center map on hotel with offset
    if (onMapMove) {
      onMapMove([hotel.lng, hotel.lat], 14);
    }
  };

  // Handle view details button click
  const handleViewDetails = (hotel: HotelResult) => {
    onHotelSelect(hotel);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sticky header with back button */}
      <div
        ref={headerRef}
        className={cn(
          "sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 py-3 border-b transition-shadow",
          isHeaderSticky && "shadow-md"
        )}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 w-8 p-0 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm truncate">
              {t("planner.hotels.inDestination", { destination })}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isLoading ? t("planner.hotels.searching") : t("planner.hotels.resultsCount", { count: results.length, nights })}
            </p>
          </div>
        </div>
      </div>

      {/* Results list */}
      <ScrollArea className="flex-1" onScrollCapture={handleScroll}>
        <div ref={scrollAreaRef} className="p-4 space-y-3">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <HotelCardSkeleton key={i} />
            ))
          ) : results.length === 0 ? (
            // No results
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🏨</div>
              <p className="text-muted-foreground text-sm">
                {t("planner.hotels.noResults")}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
                className="mt-4"
              >
                {t("planner.hotels.modifySearch")}
              </Button>
            </div>
          ) : (
            // Hotel cards
            results.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                isSelected={selectedHotelId === hotel.id}
                isHighlighted={mapHoveredHotelId === hotel.id || highlightedHotelId === hotel.id}
                onSelect={() => handleCardClick(hotel)}
                onViewDetails={() => handleViewDetails(hotel)}
                onHover={(hovering) => onHotelHover(hovering ? hotel : null)}
                t={t}
                cardRef={{
                  current: null,
                } as React.RefObject<HTMLDivElement>}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

// Wrapper to properly handle refs
const HotelSearchResultsWrapper = (props: HotelSearchResultsProps) => {
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [mapHoveredHotelId, setMapHoveredHotelId] = useState<string | null>(null);

  // Listen for hover events from map markers ONLY (not from list)
  useEffect(() => {
    const handleMapHover = (data: { hotel: HotelResult | null; source?: string }) => {
      // Only react to hovers from the map, ignore hovers from the list
      if (data.source !== "map") return;
      
      const hotelId = data.hotel?.id || null;
      setMapHoveredHotelId(hotelId);
      
      // Scroll to the card when hovering on map
      if (hotelId && cardRefs.current.has(hotelId)) {
        const cardEl = cardRefs.current.get(hotelId);
        cardEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };

    eventBus.on("hotels:hover", handleMapHover);
    return () => {
      eventBus.off("hotels:hover", handleMapHover);
    };
  }, []);

  return (
    <HotelSearchResultsInner
      results={props.results}
      isLoading={props.isLoading}
      destination={props.destination}
      nights={props.nights}
      onBack={props.onBack}
      onHotelSelect={props.onHotelSelect}
      onHotelHover={props.onHotelHover}
      selectedHotelId={props.selectedHotelId}
      highlightedHotelId={props.highlightedHotelId}
      onMapMove={props.onMapMove}
      mapCenter={props.mapCenter}
      onSearchInArea={props.onSearchInArea}
      isSearchingInArea={props.isSearchingInArea}
      cardRefs={cardRefs}
      mapHoveredHotelId={mapHoveredHotelId}
    />
  );
};

// Inner component with proper ref handling
const HotelSearchResultsInner = memo(({
  results,
  isLoading,
  destination,
  nights,
  onBack,
  onHotelSelect,
  onHotelHover,
  selectedHotelId,
  highlightedHotelId,
  onMapMove,
  cardRefs,
  mapHoveredHotelId,
  mapCenter,
  onSearchInArea,
  isSearchingInArea,
}: HotelSearchResultsProps & {
  cardRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
  mapHoveredHotelId: string | null;
}) => {
  const { t } = useTranslation();
  const headerRef = useRef<HTMLDivElement>(null);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);

  // Handle scroll for sticky header effect
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = (e.target as HTMLDivElement).scrollTop;
    setIsHeaderSticky(scrollTop > 10);
  };

  // Handle card click - just highlight on map, don't zoom or open details
  const handleCardClick = (hotel: HotelResult) => {
    // Emit select event to highlight the marker on map (no zoom change)
    eventBus.emit("hotels:select", { hotel });
  };

  // Handle view details button click - just open details, no map impact
  const handleViewDetails = (hotel: HotelResult) => {
    onHotelSelect(hotel);
  };

  // Set ref for a card
  const setCardRef = (hotelId: string) => (el: HTMLDivElement | null) => {
    if (el) {
      cardRefs.current.set(hotelId, el);
    } else {
      cardRefs.current.delete(hotelId);
    }
  };

  return (
    <div className="flex flex-col h-full animate-enter">
      {/* Sticky header with back button and search in area */}
      <div
        ref={headerRef}
        className={cn(
          "sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 py-3 border-b transition-shadow",
          isHeaderSticky && "shadow-md"
        )}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 w-8 p-0 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm truncate">
              Hébergements à {destination}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Recherche en cours..." : `${results.length} résultats · ${nights} nuit${nights > 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
      </div>

      {/* Results list */}
      <ScrollArea className="flex-1" onScrollCapture={handleScroll}>
        <div className="p-4 space-y-3">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <HotelCardSkeleton key={i} />
            ))
          ) : results.length === 0 ? (
            // No results
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🏨</div>
              <p className="text-muted-foreground text-sm">
                {t("planner.hotels.noResults")}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
                className="mt-4"
              >
                {t("planner.hotels.modifySearch")}
              </Button>
            </div>
          ) : (
            // Hotel cards with proper refs
            results.map((hotel) => (
              <div 
                key={hotel.id} 
                ref={setCardRef(hotel.id)}
              >
                <HotelCard
                  hotel={hotel}
                  isSelected={selectedHotelId === hotel.id}
                  isHighlighted={mapHoveredHotelId === hotel.id || highlightedHotelId === hotel.id}
                  onSelect={() => handleCardClick(hotel)}
                  onViewDetails={() => handleViewDetails(hotel)}
                  onHover={(hovering) => onHotelHover(hovering ? hotel : null)}
                  t={t}
                />
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
});

HotelSearchResultsInner.displayName = "HotelSearchResultsInner";

export default memo(HotelSearchResultsWrapper);
