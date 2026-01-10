/**
 * DestinationSuggestionCard - Single destination suggestion display
 */

import { memo } from "react";
import { MapPin, Check, Calendar, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DestinationSuggestion } from "@/types/destinations";

interface DestinationSuggestionCardProps {
  suggestion: DestinationSuggestion;
  onSelect?: () => void;
  isLoading?: boolean;
}

/**
 * Convert country code to flag emoji
 */
function getFlagEmoji(code: string): string {
  if (!code || code.length !== 2) return "🌍";
  const codePoints = code
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
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
  // If it's already an emoji (starts with a Unicode character), return as-is
  if (emojiName.charCodeAt(0) > 255) return emojiName;
  return EMOJI_MAP[emojiName] || emojiName || "✨";
}

/**
 * Get match score color based on value
 */
function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400";
  if (score >= 60) return "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400";
  return "text-muted-foreground bg-muted";
}

export const DestinationSuggestionCard = memo(function DestinationSuggestionCard({
  suggestion,
  onSelect,
  isLoading = false,
}: DestinationSuggestionCardProps) {
  const {
    countryCode,
    countryName,
    headline,
    description,
    matchScore,
    keyFactors,
    estimatedBudgetPerPerson,
    topActivities,
    bestSeasons,
  } = suggestion;

  return (
    <div className="group p-4 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-200">
      {/* Header: Flag + Country + Score */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{getFlagEmoji(countryCode)}</span>
          <div>
            <h3 className="font-semibold text-foreground leading-tight">{countryName}</h3>
            <span className="text-xs text-muted-foreground">{countryCode}</span>
          </div>
        </div>
        <div className={cn("px-2 py-1 rounded-full text-xs font-bold", getScoreColor(matchScore))}>
          {matchScore}% match
        </div>
      </div>

      {/* Headline */}
      <p className="font-medium text-sm text-foreground mb-1">{headline}</p>

      {/* Description */}
      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{description}</p>

      {/* Key Factors */}
      <div className="space-y-1 mb-3">
        {keyFactors.slice(0, 3).map((factor, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            <Check className="h-3 w-3 text-green-500 shrink-0" />
            <span className="text-muted-foreground">{factor}</span>
          </div>
        ))}
      </div>

      {/* Budget & Seasons */}
      <div className="flex items-center gap-4 mb-3 text-xs">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Coins className="h-3.5 w-3.5" />
          <span>
            {estimatedBudgetPerPerson.min}-{estimatedBudgetPerPerson.max}€
            <span className="text-muted-foreground/60">
              {estimatedBudgetPerPerson.duration === "per_day" ? "/jour" : "/pers (7j)"}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{bestSeasons.slice(0, 2).join(", ")}</span>
        </div>
      </div>

      {/* Top Activities */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {topActivities.slice(0, 4).map((activity, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50 text-xs text-muted-foreground"
          >
            <span>{getActivityEmoji(activity.emoji)}</span>
            <span>{activity.name}</span>
          </span>
        ))}
      </div>

      {/* Select Button */}
      {onSelect && (
        <button
          onClick={onSelect}
          disabled={isLoading}
          className={cn(
            "w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2",
            "bg-primary text-primary-foreground hover:bg-primary/90",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <MapPin className="h-4 w-4" />
          Choisir cette destination
        </button>
      )}
    </div>
  );
});

export default DestinationSuggestionCard;
