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
  if (score >= 85) return "bg-gradient-to-r from-emerald-500 to-green-400";
  if (score >= 70) return "bg-gradient-to-r from-green-500 to-emerald-400";
  if (score >= 50) return "bg-gradient-to-r from-amber-500 to-yellow-400";
  return "bg-gradient-to-r from-gray-400 to-gray-300";
}

/**
 * Get match label based on score
 */
function getMatchLabel(score: number): string {
  if (score >= 90) return "Match parfait";
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Très bon";
  if (score >= 60) return "Bon match";
  return "Compatible";
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
    countryCode,
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
    flightDurationFromOrigin,
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
        className="overflow-hidden border-0 shadow-xl h-full flex flex-col bg-card"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* IMAGE HERO */}
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
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

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

          {/* Score badge - top right */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: animationDelay + 0.2 }}
            className="absolute top-3 right-3"
          >
            <div
              className={cn(
                "px-3 py-1.5 rounded-full text-white font-bold shadow-lg flex items-center gap-1.5",
                getScoreColor(matchScore)
              )}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="text-sm">{matchScore}%</span>
            </div>
            <span className="block text-center text-[10px] text-white/80 mt-0.5 font-medium">
              {getMatchLabel(matchScore)}
            </span>
          </motion.div>

          {/* Country info - bottom left */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl drop-shadow-lg">{flagEmoji}</span>
              <div>
                <span className="text-white font-bold text-lg drop-shadow-md block leading-tight">
                  {countryName}
                </span>
              </div>
            </div>
          </div>

          {imageCredit && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-1 right-2 text-[10px] text-white/60"
            >
              {imageCredit}
            </motion.span>
          )}
        </div>

        <CardContent className="p-4 space-y-4 flex-1">
          {/* Headline */}
          <h3 className="font-bold text-lg leading-tight text-foreground">
            {headline}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>

          {/* Key Factors - Enhanced */}
          <div className="space-y-2 py-2">
            {keyFactors.slice(0, 3).map((factor, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: animationDelay + 0.1 * i }}
                className="flex items-start gap-2.5"
              >
                <div className="shrink-0 mt-0.5 h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Check className="h-3 w-3 text-green-500" />
                </div>
                <span className="text-sm text-foreground/80">{factor}</span>
              </motion.div>
            ))}
          </div>

          {/* Flight & Budget Info - NEW PROMINENT SECTION */}
          <div className="bg-muted/50 rounded-xl p-3 space-y-2.5">
            {/* Flight Info Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Plane className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Vol A/R estimé</span>
                  <span className="text-base font-bold text-foreground">
                    {flightPriceEstimate ? `${flightPriceEstimate}€` : "Non dispo"}
                  </span>
                </div>
              </div>
              {flightDurationFromOrigin && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-sm">{flightDurationFromOrigin}</span>
                </div>
              )}
            </div>

            {/* Budget Row */}
            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-amber-500" />
              </div>
              <div className="flex-1">
                <span className="text-xs text-muted-foreground block">Budget quotidien</span>
                <span className="text-base font-bold text-foreground">
                  {estimatedBudgetPerPerson.min}-{estimatedBudgetPerPerson.max}€
                  <span className="text-sm font-normal text-muted-foreground">/jour</span>
                </span>
              </div>
            </div>
          </div>

          {/* Best Seasons */}
          <div className="flex items-center gap-2 text-sm">
            <div className="h-7 w-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Calendar className="h-3.5 w-3.5 text-purple-500" />
            </div>
            <span className="text-muted-foreground">
              Meilleure période : <span className="font-medium text-foreground">{bestSeasons.slice(0, 2).join(", ")}</span>
            </span>
          </div>

          {/* Activities badges */}
          <div className="flex flex-wrap gap-2 pt-1">
            {topActivities.slice(0, 4).map((activity, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted text-xs font-medium text-foreground/80 border border-border/50"
              >
                <span className="text-base">{getActivityEmoji(activity.emoji)}</span>
                <span className="truncate max-w-[90px]">{activity.name}</span>
              </span>
            ))}
          </div>
        </CardContent>

        {/* CTA Button */}
        {onSelect && (
          <CardFooter className="p-4 pt-0">
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSelect}
              disabled={isLoading}
              className={cn(
                "w-full py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "hover:shadow-xl hover:shadow-primary/20",
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
            </motion.button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
});

export default DestinationSuggestionCard;
