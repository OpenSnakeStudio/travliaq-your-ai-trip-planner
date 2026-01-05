import { memo, useState, useCallback, useEffect, useRef } from "react";
import { ArrowLeft, Star, MapPin, Wifi, Car, Coffee, Waves, ExternalLink, ChevronLeft, ChevronRight, Bed, Users, Clock, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { HotelResult } from "./HotelSearchResults";

interface HotelDetailViewProps {
  hotel: HotelResult;
  nights: number;
  onBack: () => void;
  onBook?: () => void;
}

// Mock extra images for demo (in real app, these would come from hotel data)
const getMockImages = (hotel: HotelResult): string[] => {
  const baseImages = [
    hotel.imageUrl,
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&h=600&fit=crop",
  ];
  return baseImages;
};

// Amenity icons mapping with better coverage
const amenityIcons: Record<string, typeof Wifi> = {
  wifi: Wifi,
  parking: Car,
  breakfast: Coffee,
  pool: Waves,
  gym: Users,
  spa: Coffee,
  restaurant: Coffee,
  bar: Coffee,
  roomservice: Clock,
};

const HotelDetailView = ({
  hotel,
  nights,
  onBack,
  onBook,
}: HotelDetailViewProps) => {
  const images = getMockImages(hotel);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollRootRef = useRef<HTMLDivElement>(null);

  // Always open details at the top (carousel) and reset carousel position
  useEffect(() => {
    setCurrentImageIndex(0);
    requestAnimationFrame(() => {
      const viewport = scrollRootRef.current?.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLElement | null;
      viewport?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  }, [hotel.id]);

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const totalPrice = hotel.totalPrice ?? hotel.pricePerNight * nights;

  return (
    <div className="flex flex-col h-full bg-background">
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

      <div ref={scrollRootRef} className="flex-1">
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
          <div className="p-4 space-y-4">
            {/* Price summary */}
            <div className="rounded-xl border bg-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Prix par nuit</span>
                <span className="font-semibold">{hotel.pricePerNight}€</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {nights} nuit{nights > 1 ? "s" : ""}
                </span>
                <span className="text-xs text-muted-foreground">×{nights}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-primary">{totalPrice}€</span>
              </div>
            </div>

            {/* Location */}
            <section className="space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Emplacement
              </h3>
              <p className="text-sm text-muted-foreground">{hotel.address}</p>
              {hotel.distanceFromCenter && (
                <p className="text-xs text-muted-foreground">
                  {hotel.distanceFromCenter} du centre-ville
                </p>
              )}
            </section>

            {/* Amenities */}
            {hotel.amenities.length > 0 && (
              <section className="space-y-2">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  Équipements
                </h3>
                <div className="flex flex-wrap gap-2">
                  {hotel.amenities.map((amenity) => {
                    const Icon = amenityIcons[amenity.toLowerCase()] || Check;
                    return (
                      <Badge
                        key={amenity}
                        variant="secondary"
                        className="text-xs px-2.5 py-1 gap-1.5"
                      >
                        <Icon className="h-3 w-3" />
                        {amenity}
                      </Badge>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Quick info (simplified) */}
            <section className="space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Infos clés
              </h3>
              <div className="rounded-xl border bg-card p-3 text-sm text-muted-foreground space-y-1">
                <p>• Check-in : à partir de 15h00</p>
                <p>• Check-out : jusqu'à 11h00</p>
                <p>• Annulation : gratuite jusqu’à 24h avant</p>
              </div>
            </section>

            {/* Room snapshot (optional) */}
            <section className="space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Bed className="h-4 w-4 text-primary" />
                Chambre (aperçu)
              </h3>
              <div className="rounded-xl border bg-card p-3">
                <p className="text-sm font-medium">Chambre Double Standard</p>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    2 adultes max
                  </span>
                  <span className="flex items-center gap-1">
                    <Bed className="h-3 w-3" />
                    1 lit double
                  </span>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>
      </div>

      {/* Sticky booking button */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t p-4">
        <Button 
          className="w-full h-11" 
          onClick={onBook}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Réserver pour {totalPrice}€
        </Button>
      </div>
    </div>
  );
};

export default memo(HotelDetailView);
