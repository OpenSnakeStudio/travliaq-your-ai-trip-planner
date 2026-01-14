/**
 * DestinationSuggestionCard - Premium destination suggestion card with hero image
 */

import { memo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Calendar, Wallet, Plane, Loader2, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DestinationSuggestion } from "@/types/destinations";

interface DestinationSuggestionCardProps {
  suggestion: DestinationSuggestion;
  onSelect?: () => void;
  isLoading?: boolean;
  animationDelay?: number;
}

/**
 * Map emoji names to actual emoji characters
 */
const EMOJI_MAP: Record<string, string> = {
  pyramid: "🏛️",
  beach: "🏖️",
  taco: "🌮",
  city_sunset: "🌆",
  train: "🚂",
  shinto_shrine: "⛩️",
  elephant: "🐘",
  temple: "🛕",
  ramen: "🍜",
  spa: "💆",
  mountain: "⛰️",
  sushi: "🍣",
  wine_glass: "🍷",
  european_castle: "🏰",
  church: "⛪",
  dancer: "💃",
  mosque: "🕌",
  coral: "🪸",
  performing_arts: "🎭",
  desert: "🏜️",
  kangaroo: "🦘",
  surfing_man: "🏄",
  hot_springs: "♨️",
  classical_building: "🏛️",
  balloon: "🎈",
  palm_tree: "🌴",
  fish: "🐟",
  hut: "🛖",
  hotel: "🏨",
  canoe: "🛶",
  house: "🏠",
  water: "💧",
  cookie: "🍪",
  tram: "🚋",
  statue_of_liberty: "🗽",
  deciduous_tree: "🌳",
  art: "🎨",
  tokyo_tower: "🗼",
  hotsprings: "♨️",
  rice: "🌾",
  yoga: "🧘",
  plate_with_cutlery: "🍽️",
  tea: "🍵",
  night_with_stars: "🌃",
  star: "⭐",
  camera: "📷",
  hiking_boot: "🥾",
  diving_mask: "🤿",
  tent: "⛺",
  sailboat: "⛵",
  sunrise_over_mountains: "🌄",
  national_park: "🏞️",
  camping: "🏕️",
  compass: "🧭",
  world_map: "🗺️",
};

/**
 * Convert emoji name to actual emoji character
 */
function getActivityEmoji(emojiName: string): string {
  if (!emojiName) return "✨";
  if (emojiName.charCodeAt(0) > 255) return emojiName;
  return EMOJI_MAP[emojiName] || emojiName || "✨";
}

/**
 * Get match score color based on value
 */
function getScoreColor(score: number): string {
  if (score >= 80) return "bg-green-500 text-white";
  if (score >= 60) return "bg-amber-500 text-white";
  return "bg-muted text-muted-foreground";
}

export const DestinationSuggestionCard = memo(function DestinationSuggestionCard({
  suggestion,
  onSelect,
  isLoading = false,
  animationDelay = 0,
}: DestinationSuggestionCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const {
    countryName,
    flagEmoji,
    headline,
    description,
    matchScore,
    keyFactors,
    estimatedBudgetPerPerson,
    topActivities,
    bestSeasons,
    flightPriceEstimate,
    imageUrl,
    imageCredit,
  } = suggestion;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: animationDelay, ease: "easeOut" }}
      className="h-full"
    >
      <Card 
        className="overflow-hidden border-0 shadow-lg h-full flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* IMAGE HERO */}
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="w-full h-full" />
              <Loader2 className="absolute h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          <motion.img
            src={imageUrl}
            alt={`${countryName} - ${headline}`}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-300",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.4 }}
            onLoad={() => setImageLoaded(true)}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

          {/* Country + Score */}
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
            <div className="flex items-center gap-2">
              <span className="text-2xl drop-shadow-lg">{flagEmoji}</span>
              <span className="text-white font-semibold text-lg drop-shadow-md">
                {countryName}
              </span>
            </div>
            <div className={cn("px-2.5 py-1 rounded-full text-sm font-bold", getScoreColor(matchScore))}>
              {matchScore}%
            </div>
          </div>

          {imageCredit && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="absolute bottom-1 right-2 text-[10px] text-white/60"
            >
              {imageCredit}
            </motion.span>
          )}
        </div>

        <CardContent className="px-3 py-3 space-y-2.5 flex-1">
          {/* Headline */}
          <h3 className="font-semibold text-sm leading-snug text-foreground">
            {headline}
          </h3>

          {/* Description */}
          <p className="text-xs text-muted-foreground">
            {description}
          </p>

          {/* Key Factors - Inline compact */}
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            {keyFactors.slice(0, 3).map((factor, i) => (
              <div key={i} className="flex items-center gap-1 text-xs">
                <Check className="h-3 w-3 text-green-500 shrink-0" />
                <span className="text-muted-foreground">{factor}</span>
              </div>
            ))}
          </div>

          {/* Stats - One stable line with compact text */}
          <div className="flex items-center justify-center gap-2.5 text-xs text-muted-foreground bg-muted/60 rounded-lg py-2 px-3">
            <div className="flex items-center gap-1">
              <Wallet className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span>{estimatedBudgetPerPerson.min}-{estimatedBudgetPerPerson.max}€/j</span>
            </div>
            <span className="text-border/60">|</span>
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-purple-500 shrink-0" />
              <span>{bestSeasons.slice(0, 2).join(", ")}</span>
            </div>
            <span className="text-border/60">|</span>
            <div className="flex items-center gap-1">
              <Plane className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              <span>~{flightPriceEstimate || "—"}€</span>
            </div>
          </div>

          {/* Activities - Full names visible */}
          <div className="flex flex-wrap gap-1.5">
            {topActivities.slice(0, 4).map((activity, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground"
              >
                <span>{getActivityEmoji(activity.emoji)}</span>
                <span>{activity.name}</span>
              </span>
            ))}
          </div>
        </CardContent>

        {/* CTA */}
        {onSelect && (
          <CardFooter className="px-3 pb-3 pt-0">
            <button
              onClick={onSelect}
              disabled={isLoading}
              className={cn(
                "w-full py-2.5 rounded-lg text-sm font-medium",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "disabled:opacity-50"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                "Choisir cette destination"
              )}
            </button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
});

export default DestinationSuggestionCard;
