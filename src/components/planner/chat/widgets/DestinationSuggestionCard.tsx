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

        <CardContent className="p-4 space-y-3 flex-1">
          {/* Headline */}
          <h3 className="font-semibold text-base leading-tight text-foreground">
            {headline}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>

          {/* Key Factors - Simple */}
          <div className="space-y-1.5">
            {keyFactors.slice(0, 3).map((factor, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <Check className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                <span className="text-muted-foreground leading-tight">{factor}</span>
              </div>
            ))}
          </div>

          {/* Stats Grid - Well aligned */}
          <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-amber-500 shrink-0" />
              <span className="text-xs text-muted-foreground">
                {estimatedBudgetPerPerson.min}-{estimatedBudgetPerPerson.max}€/j
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Plane className="h-4 w-4 text-blue-500 shrink-0" />
              <span className="text-xs text-muted-foreground">
                {flightPriceEstimate ? `~${flightPriceEstimate}€` : "N/A"}{" "}
                <span className="text-[10px] opacity-70">(est.)</span>
              </span>
            </div>

            <div className="flex items-center gap-2 col-span-2">
              <Calendar className="h-4 w-4 text-purple-500 shrink-0" />
              <span className="text-xs text-muted-foreground">
                {bestSeasons.slice(0, 2).join(", ")}
              </span>
            </div>
          </div>

          {/* Activities - Clean grid */}
          <div className="grid grid-cols-2 gap-1.5">
            {topActivities.slice(0, 4).map((activity, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/60 text-xs text-muted-foreground"
              >
                <span className="text-sm">{getActivityEmoji(activity.emoji)}</span>
                <span className="truncate">{activity.name}</span>
              </span>
            ))}
          </div>
        </CardContent>

        {/* CTA */}
        {onSelect && (
          <CardFooter className="p-4 pt-0">
            <button
              onClick={onSelect}
              disabled={isLoading}
              className={cn(
                "w-full py-3 rounded-xl text-sm font-semibold transition-colors",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Chargement...
                </span>
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
