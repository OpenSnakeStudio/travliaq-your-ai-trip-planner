/**
 * DestinationSuggestionsGrid - Responsive carousel of destination suggestions
 */

import { memo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { DestinationSuggestionCard } from "./DestinationSuggestionCard";
import type { DestinationSuggestion, ProfileCompleteness } from "@/types/destinations";

interface DestinationSuggestionsGridProps {
  suggestions: DestinationSuggestion[];
  basedOnProfile?: ProfileCompleteness;
  onSelect?: (suggestion: DestinationSuggestion) => void;
  isLoading?: boolean;
}

export const DestinationSuggestionsGrid = memo(function DestinationSuggestionsGrid({
  suggestions,
  basedOnProfile,
  onSelect,
  isLoading = false,
}: DestinationSuggestionsGridProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  // Track current slide for pagination dots
  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", handleSelect);
    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);

  if (isLoading) {
    return (
      <div className="mt-3 p-6 rounded-2xl bg-card border border-border shadow-md">
        <div className="flex flex-col items-center justify-center gap-3 py-8">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Analyse de vos préférences...</p>
        </div>
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="mt-3 p-6 rounded-2xl bg-card border border-border shadow-md">
        <div className="flex flex-col items-center justify-center gap-3 py-8">
          <Sparkles className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Aucune suggestion disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-4">
      {/* Profile Completeness Badge */}
      {basedOnProfile && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 border border-border"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground">
            Recommandations basées sur votre profil ({basedOnProfile.completionScore}% complété)
          </span>
        </motion.div>
      )}

      {/* Responsive Carousel */}
      <div className="relative px-2 sm:px-12">
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {suggestions.map((suggestion, index) => (
              <CarouselItem
                key={`${suggestion.countryCode}-${index}`}
                className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
              >
                <DestinationSuggestionCard
                  suggestion={suggestion}
                  onSelect={onSelect ? () => onSelect(suggestion) : undefined}
                  isLoading={isLoading}
                  animationDelay={index * 0.1}
                />
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation arrows (tablet/desktop) */}
          <CarouselPrevious className="hidden sm:flex -left-2 lg:-left-4 h-10 w-10 bg-background/80 backdrop-blur-sm border-border hover:bg-background" />
          <CarouselNext className="hidden sm:flex -right-2 lg:-right-4 h-10 w-10 bg-background/80 backdrop-blur-sm border-border hover:bg-background" />
        </Carousel>

        {/* Pagination dots (mobile only) */}
        {count > 1 && (
          <div className="flex justify-center gap-2 mt-4 sm:hidden">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                aria-label={`Aller à la destination ${index + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  current === index
                    ? "bg-primary w-6"
                    : "bg-muted-foreground/30 w-2 hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default DestinationSuggestionsGrid;
