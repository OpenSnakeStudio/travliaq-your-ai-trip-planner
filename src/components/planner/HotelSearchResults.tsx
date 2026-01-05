import { memo, useRef, useEffect, useState } from "react";
import { ArrowLeft, Star, MapPin, Wifi, Car, Coffee, Waves, X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

// Hotel result interface
export interface HotelResult {
  id: string;
  name: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  totalPrice?: number;
  currency: string;
  address: string;
  lat: number;
  lng: number;
  amenities: string[];
  stars?: number;
  distanceFromCenter?: string;
  bookingUrl?: string;
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
  onMapMove?: (center: [number, number], zoom: number) => void;
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
  onSelect,
  onHover,
}: {
  hotel: HotelResult;
  isSelected: boolean;
  onSelect: () => void;
  onHover: (hovering: boolean) => void;
}) => {
  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-card overflow-hidden transition-all cursor-pointer",
        "hover:shadow-lg hover:border-primary/30",
        isSelected && "ring-2 ring-primary border-primary"
      )}
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {/* Image */}
      <div className="relative h-32 overflow-hidden">
        <img
          src={hotel.imageUrl}
          alt={hotel.name}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
        {/* Price badge */}
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-lg text-sm font-bold shadow-lg">
          {hotel.pricePerNight}€<span className="text-xs font-normal opacity-80">/nuit</span>
        </div>
        {/* Stars */}
        {hotel.stars && (
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
              {hotel.rating.toFixed(1)}
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

        {/* Total price */}
        {hotel.totalPrice && (
          <div className="pt-1 border-t border-border/50 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="font-bold text-primary">{hotel.totalPrice}€</span>
          </div>
        )}
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
  onMapMove,
}: HotelSearchResultsProps) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);

  // Handle scroll for sticky header effect
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = (e.target as HTMLDivElement).scrollTop;
    setIsHeaderSticky(scrollTop > 10);
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
                Aucun hébergement trouvé pour ces critères
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
                className="mt-4"
              >
                Modifier la recherche
              </Button>
            </div>
          ) : (
            // Hotel cards
            results.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                isSelected={selectedHotelId === hotel.id}
                onSelect={() => {
                  onHotelSelect(hotel);
                  // Center map on hotel
                  if (onMapMove) {
                    onMapMove([hotel.lng, hotel.lat], 15);
                  }
                }}
                onHover={(hovering) => onHotelHover(hovering ? hotel : null)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default memo(HotelSearchResults);
