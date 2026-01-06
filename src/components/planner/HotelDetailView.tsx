import { memo, useState, useCallback, useRef, useLayoutEffect } from "react";
import { ArrowLeft, Star, MapPin, Wifi, Car, Coffee, Waves, ExternalLink, ChevronLeft, ChevronRight, Bed, Users, Clock, Check, Sparkles, Shield, Heart, Utensils, Dumbbell, Bath, Tv, Phone, Snowflake, Loader2, Award, Flame, ThumbsUp, Building2, MapPinned } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { HotelResult } from "./HotelSearchResults";
import type { HotelDetails, RoomOption, PropertyBadge } from "@/services/hotels/hotelService";

interface HotelDetailViewProps {
  hotel: HotelResult;
  hotelDetails?: HotelDetails | null;
  isLoading?: boolean;
  nights: number;
  onBack: () => void;
  onBook?: () => void;
}

// Get hotel images - use real images from hotel data if available, fallback to main image only
const getHotelImages = (hotel: HotelResult): string[] => {
  // If hotel has additional images property (from API details), use them
  const hotelWithImages = hotel as HotelResult & { images?: string[] };
  if (hotelWithImages.images && hotelWithImages.images.length > 0) {
    return hotelWithImages.images;
  }
  // Otherwise just return the main image
  return hotel.imageUrl ? [hotel.imageUrl] : [];
};

// Amenity icons mapping with better coverage
const amenityIcons: Record<string, typeof Wifi> = {
  wifi: Wifi,
  parking: Car,
  breakfast: Utensils,
  pool: Waves,
  gym: Dumbbell,
  spa: Bath,
  restaurant: Utensils,
  bar: Coffee,
  roomservice: Phone,
  "air conditioning": Snowflake,
  tv: Tv,
};

// Badge icon mapping based on icon hint from API
const getBadgeIcon = (iconHint?: string) => {
  const iconClass = "h-3 w-3";
  switch (iconHint) {
    case "coffee": return <Coffee className={iconClass} />;
    case "wifi": return <Wifi className={iconClass} />;
    case "waves": return <Waves className={iconClass} />;
    case "shield": return <Shield className={iconClass} />;
    case "car": return <Car className={iconClass} />;
    case "sparkles": return <Sparkles className={iconClass} />;
    case "dumbbell": return <Dumbbell className={iconClass} />;
    case "utensils": return <Utensils className={iconClass} />;
    case "snowflake": return <Snowflake className={iconClass} />;
    default: return <Check className={iconClass} />;
  }
};

// Get hotel description - use real description if available
const getHotelDescription = (hotel: HotelResult): string => {
  // Use real description from API if available
  const hotelWithDesc = hotel as HotelResult & { description?: string };
  if (hotelWithDesc.description) {
    return hotelWithDesc.description;
  }
  // No fallback description - return empty if no real data
  return "";
};

// Get rating label based on score
const getRatingLabel = (rating: number): { label: string; color: string } => {
  if (rating >= 9) return { label: "Exceptionnel", color: "text-green-600 bg-green-500/10 border-green-500/30" };
  if (rating >= 8) return { label: "Très bien", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30" };
  if (rating >= 7) return { label: "Bien", color: "text-blue-600 bg-blue-500/10 border-blue-500/30" };
  if (rating >= 6) return { label: "Correct", color: "text-amber-600 bg-amber-500/10 border-amber-500/30" };
  return { label: "Passable", color: "text-muted-foreground bg-muted border-border" };
};

// Get key selling points based on hotel features
const getKeyBadges = (hotel: HotelResult, hotelDetails?: HotelDetails | null): { icon: typeof Wifi; label: string; variant: "highlight" | "feature" | "location" }[] => {
  const badges: { icon: typeof Wifi; label: string; variant: "highlight" | "feature" | "location" }[] = [];
  
  // Rating based badge
  if (hotel.rating && hotel.rating >= 9) {
    badges.push({ icon: Award, label: "Excellent choix", variant: "highlight" });
  } else if (hotel.rating && hotel.rating >= 8.5) {
    badges.push({ icon: ThumbsUp, label: "Très apprécié", variant: "highlight" });
  }
  
  // Location badge
  if (hotel.distanceFromCenter) {
    const distance = typeof hotel.distanceFromCenter === 'string' 
      ? parseFloat(hotel.distanceFromCenter) 
      : hotel.distanceFromCenter;
    if (distance < 0.5) {
      badges.push({ icon: MapPinned, label: "Centre-ville", variant: "location" });
    } else if (distance < 1.5) {
      badges.push({ icon: MapPin, label: "Proche centre", variant: "location" });
    }
  }
  
  // Breakfast included
  const hasBreakfast = hotel.amenities.some(a => a.toLowerCase().includes("breakfast")) ||
    hotelDetails?.amenities?.some(a => a.code?.toLowerCase().includes("breakfast"));
  if (hasBreakfast) {
    badges.push({ icon: Coffee, label: "Petit-déj inclus", variant: "feature" });
  }
  
  // Pool
  const hasPool = hotel.amenities.some(a => a.toLowerCase().includes("pool")) ||
    hotelDetails?.amenities?.some(a => a.code?.toLowerCase().includes("pool"));
  if (hasPool) {
    badges.push({ icon: Waves, label: "Piscine", variant: "feature" });
  }
  
  // Spa
  const hasSpa = hotel.amenities.some(a => a.toLowerCase().includes("spa")) ||
    hotelDetails?.amenities?.some(a => a.code?.toLowerCase().includes("spa"));
  if (hasSpa) {
    badges.push({ icon: Bath, label: "Spa", variant: "feature" });
  }
  
  // Free cancellation from rooms
  const hasFreeCancellation = hotelDetails?.rooms?.some(r => r.cancellationFree);
  if (hasFreeCancellation) {
    badges.push({ icon: Shield, label: "Annulation gratuite", variant: "highlight" });
  }
  
  // Popular/trending
  if (hotel.reviewCount && hotel.reviewCount > 500) {
    badges.push({ icon: Flame, label: "Populaire", variant: "highlight" });
  }
  
  return badges.slice(0, 5);
};

const HotelDetailView = ({
  hotel,
  hotelDetails,
  isLoading = false,
  nights,
  onBack,
  onBook,
}: HotelDetailViewProps) => {
  // Use hotelDetails when available, fallback to hotel (search result)
  const images = hotelDetails?.images?.length
    ? hotelDetails.images
    : getHotelImages(hotel);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Use hotelDetails description if available
  const description = hotelDetails?.description || getHotelDescription(hotel);
  
  // Get smart badges based on real data
  const keyBadges = getKeyBadges(hotel, hotelDetails);
  const ratingInfo = hotel.rating ? getRatingLabel(hotel.rating) : null;

  // Get rooms from details API
  const rooms = hotelDetails?.rooms || [];

  // Get policies from details API
  const policies = hotelDetails?.policies;
  const checkInTime = policies?.checkIn || "15:00";
  const checkOutTime = policies?.checkOut || "11:00";

  // Get amenities - prefer detailed amenities with labels
  const amenitiesForDisplay = hotelDetails?.amenities?.length
    ? hotelDetails.amenities
    : hotel.amenities.map(a => ({ code: a.toLowerCase(), label: a }));

  // Force scroll to top immediately when hotel changes
  useLayoutEffect(() => {
    setCurrentImageIndex(0);

    // 1) Ensure the surrounding panel scrolls back to the top
    rootRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
    
    // 2) Reset Radix ScrollArea viewport scroll
    const resetInnerScroll = () => {
      if (!scrollAreaRef.current) return;
      const viewport = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLElement | null;
      if (viewport) viewport.scrollTop = 0;
    };

    // 3) Also scroll the panel container directly
    const scrollPanel = () => {
      // Find parent scrollable container
      let parent = rootRef.current?.parentElement;
      while (parent) {
        if (parent.scrollTop > 0 || parent.scrollHeight > parent.clientHeight) {
          parent.scrollTop = 0;
        }
        // Also check for data-radix-scroll-area-viewport in parent chain
        const viewport = parent.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement | null;
        if (viewport) viewport.scrollTop = 0;
        parent = parent.parentElement;
      }
    };

    resetInnerScroll();
    scrollPanel();
    
    // Multiple attempts to ensure scroll reset (handles async rendering)
    requestAnimationFrame(() => {
      resetInnerScroll();
      scrollPanel();
    });
    setTimeout(() => {
      resetInnerScroll();
      scrollPanel();
    }, 0);
    setTimeout(() => {
      resetInnerScroll();
      scrollPanel();
    }, 50);
  }, [hotel.id]);

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const totalPrice = hotel.totalPrice ?? hotel.pricePerNight * nights;
  const pricePerNightPerPerson = Math.round(hotel.pricePerNight / 2);

  // Show loading skeleton while fetching details
  if (isLoading) {
    return (
      <div ref={rootRef} className="flex flex-col h-full bg-background animate-enter">
        {/* Header with back button */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 py-3 border-b flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 w-8 p-0 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <Skeleton className="h-5 w-48 mb-1" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        {/* Image skeleton */}
        <Skeleton className="aspect-[16/10] w-full" />
        {/* Content skeletons */}
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
        {/* Loading indicator */}
        <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Chargement des détails...</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="flex flex-col h-full bg-background animate-enter">
      {/* Header with back button */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 py-3 border-b flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-8 w-8 p-0 shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm truncate">{hotel.name}</h2>
          <div className="flex items-center gap-1.5">
            {hotel.stars && (
              <div className="flex gap-0.5">
                {Array.from({ length: hotel.stars }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            )}
            <span className="text-xs text-muted-foreground">·</span>
            <div className="flex items-center gap-0.5">
              <div className="bg-primary/10 text-primary px-1 py-0.5 rounded text-[10px] font-bold">
                {hotel.rating.toFixed(1)}
              </div>
              <span className="text-xs text-muted-foreground">({hotel.reviewCount} avis)</span>
            </div>
          </div>
        </div>
      </div>

      <div ref={scrollAreaRef} className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {/* Image Carousel */}
          <div className="relative aspect-[16/10] bg-muted">
            <img
              src={images[currentImageIndex]}
              alt={`${hotel.name} - Photo ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop";
              }}
            />

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                  aria-label="Photo précédente"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                  aria-label="Photo suivante"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Image counter */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium">
              {currentImageIndex + 1} / {images.length}
            </div>

            {/* Thumbnail dots */}
            <div className="absolute bottom-3 right-3 flex gap-1.5">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    idx === currentImageIndex
                      ? "bg-white scale-110"
                      : "bg-white/50 hover:bg-white/75"
                  )}
                  aria-label={`Aller à la photo ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-5">
            {/* Rating & Reviews - Hero section */}
            {ratingInfo && (
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold",
                  ratingInfo.color
                )}>
                  <span className="text-lg">{hotel.rating.toFixed(1)}</span>
                  <span className="text-sm">{ratingInfo.label}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {hotel.reviewCount.toLocaleString()} avis
                </span>
              </div>
            )}

            {/* Key badges - Quick scan info */}
            {keyBadges.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {keyBadges.map((badge, idx) => {
                  const Icon = badge.icon;
                  const variantStyles = {
                    highlight: "bg-primary/10 border-primary/30 text-primary",
                    feature: "bg-blue-500/10 border-blue-500/30 text-blue-600",
                    location: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600",
                  };
                  return (
                    <Badge 
                      key={idx} 
                      variant="outline" 
                      className={cn("text-xs gap-1.5", variantStyles[badge.variant])}
                    >
                      <Icon className="h-3 w-3" />
                      {badge.label}
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Location summary - Simple, scannable */}
            <div className="flex items-center gap-4 text-sm">
              {hotel.distanceFromCenter && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>À {hotel.distanceFromCenter} du centre</span>
                </div>
              )}
              {hotel.stars && hotel.stars > 0 && (
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div className="flex gap-0.5">
                    {Array.from({ length: hotel.stars }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Property badges from API */}
            {hotelDetails?.badges && hotelDetails.badges.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {hotelDetails.badges.map((badge, idx) => (
                  <Badge
                    key={idx}
                    className="text-xs bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 gap-1.5"
                  >
                    {getBadgeIcon(badge.icon)}
                    {badge.label}
                  </Badge>
                ))}
              </div>
            )}

            {/* Description */}
            <section className="space-y-2">
              <h3 className="font-semibold text-sm">À propos de cet établissement</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </section>

            {/* Price summary card */}
            <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-primary">{hotel.pricePerNight}€</span>
                  <span className="text-sm text-muted-foreground"> / nuit</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  ~{pricePerNightPerPerson}€/pers/nuit
                </Badge>
              </div>
              <Separator />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{hotel.pricePerNight}€ × {nights} nuit{nights > 1 ? "s" : ""}</span>
                  <span>{totalPrice}€</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Taxes et frais inclus</span>
                  <span>✓</span>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total du séjour</span>
                <span className="text-xl font-bold text-primary">{totalPrice}€</span>
              </div>
            </div>

            {/* Rating breakdown */}
            {hotelDetails?.ratingBreakdown && (
              <section className="space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary fill-primary" />
                  Notes détaillées
                </h3>
                <div className="grid gap-2">
                  {[
                    { key: 'cleanliness', label: 'Propreté', value: hotelDetails.ratingBreakdown.cleanliness },
                    { key: 'staff', label: 'Personnel', value: hotelDetails.ratingBreakdown.staff },
                    { key: 'location', label: 'Emplacement', value: hotelDetails.ratingBreakdown.location },
                    { key: 'facilities', label: 'Équipements', value: hotelDetails.ratingBreakdown.facilities },
                    { key: 'comfort', label: 'Confort', value: hotelDetails.ratingBreakdown.comfort },
                    { key: 'valueForMoney', label: 'Rapport qualité/prix', value: hotelDetails.ratingBreakdown.valueForMoney },
                  ].filter(item => item.value != null).map((item) => (
                    <div key={item.key} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-32 shrink-0">{item.label}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(item.value! / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{item.value!.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Amenities */}
            {amenitiesForDisplay.length > 0 && (
              <section className="space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  Ce que propose cet établissement
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {amenitiesForDisplay.map((amenity) => {
                    const Icon = amenityIcons[amenity.code] || Check;
                    return (
                      <div
                        key={amenity.code}
                        className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 text-sm"
                      >
                        <Icon className="h-4 w-4 text-primary shrink-0" />
                        <span>{amenity.label}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Room options from API */}
            {rooms.length > 0 ? (
              <section className="space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Bed className="h-4 w-4 text-primary" />
                  Chambres disponibles ({rooms.length})
                </h3>
                {rooms.slice(0, 3).map((room, index) => (
                  <div key={room.id || index} className="rounded-xl border bg-card p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{room.name}</p>
                        {room.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{room.description}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-primary font-bold">{room.pricePerNight}€</span>
                        <span className="text-xs text-muted-foreground">/nuit</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {room.maxOccupancy} pers. max
                      </span>
                      {room.bedType && (
                        <span className="flex items-center gap-1">
                          <Bed className="h-3 w-3" />
                          {room.bedType}
                        </span>
                      )}
                      {room.amenities?.includes('wifi') && (
                        <span className="flex items-center gap-1">
                          <Wifi className="h-3 w-3" />
                          WiFi inclus
                        </span>
                      )}
                    </div>
                    {room.cancellationFree && (
                      <div className="flex items-center gap-2 pt-2 border-t text-xs">
                        <Shield className="h-3.5 w-3.5 text-green-600" />
                        <span className="text-green-600 font-medium">Annulation gratuite</span>
                      </div>
                    )}
                  </div>
                ))}
                {rooms.length > 3 && (
                  <p className="text-xs text-center text-muted-foreground">
                    +{rooms.length - 3} autres chambres disponibles
                  </p>
                )}
              </section>
            ) : (
              /* Fallback - default room info when no API details */
              <section className="space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Bed className="h-4 w-4 text-primary" />
                  Chambre disponible
                </h3>
                <div className="rounded-xl border bg-card p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">Chambre Double Standard</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Vue sur la ville</p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">Meilleur prix</Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      2 adultes max
                    </span>
                    <span className="flex items-center gap-1">
                      <Bed className="h-3 w-3" />
                      1 lit double
                    </span>
                    <span className="flex items-center gap-1">
                      <Wifi className="h-3 w-3" />
                      WiFi inclus
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t text-xs">
                    <Shield className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-green-600 font-medium">Annulation gratuite jusqu'à 24h avant</span>
                  </div>
                </div>
              </section>
            )}

            {/* Check-in info */}
            <section className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Informations pratiques
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Check-in</p>
                  <p className="font-semibold text-sm">À partir de {checkInTime}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Check-out</p>
                  <p className="font-semibold text-sm">Jusqu'à {checkOutTime}</p>
                </div>
              </div>
              {policies?.cancellation && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground mb-1">Politique d'annulation</p>
                  <p className="text-sm">{policies.cancellation}</p>
                </div>
              )}
            </section>

            {/* Why book here */}
            <section className="rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 p-4 space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2 text-green-700 dark:text-green-400">
                <Heart className="h-4 w-4" />
                Pourquoi réserver ici ?
              </h3>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  <span>Meilleur prix garanti - on vous rembourse la différence</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  <span>Confirmation immédiate par email</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  <span>Service client disponible 24h/24</span>
                </li>
              </ul>
            </section>

            {/* Extra spacing for scroll comfort */}
            <div className="h-4" />
          </div>
        </ScrollArea>
      </div>

      {/* Sticky booking button */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t p-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{nights} nuit{nights > 1 ? "s" : ""} • Total</span>
          <span className="text-lg font-bold text-primary">{totalPrice}€</span>
        </div>
        <Button 
          className="w-full h-12 text-base font-semibold" 
          onClick={onBook}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Réserver maintenant
        </Button>
      </div>
    </div>
  );
};

export default memo(HotelDetailView);
