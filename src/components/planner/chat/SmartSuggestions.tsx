/**
 * SmartSuggestions - Ultra-contextual message recommendations
 * 
 * Displays smart suggestion chips above the chat input based on:
 * - Current workflow step (inspiration, destination, dates, travelers, search)
 * - Active tab and visible content on the map
 * - User preferences and trip data
 */

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Sun, 
  Building2, 
  Calendar, 
  Zap, 
  User, 
  Users, 
  Plane, 
  Scale, 
  Sunrise, 
  Star, 
  MapPin, 
  Camera, 
  Compass, 
  Utensils,
  Search,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getSuggestions, type SuggestionContext, type Suggestion } from "./services/suggestionEngine";

// Icon mapping
const iconMap: Record<Suggestion['iconName'], React.ReactNode> = {
  sparkles: <Sparkles className="h-3.5 w-3.5" />,
  sun: <Sun className="h-3.5 w-3.5" />,
  building: <Building2 className="h-3.5 w-3.5" />,
  calendar: <Calendar className="h-3.5 w-3.5" />,
  zap: <Zap className="h-3.5 w-3.5" />,
  user: <User className="h-3.5 w-3.5" />,
  users: <Users className="h-3.5 w-3.5" />,
  plane: <Plane className="h-3.5 w-3.5" />,
  scale: <Scale className="h-3.5 w-3.5" />,
  sunrise: <Sunrise className="h-3.5 w-3.5" />,
  star: <Star className="h-3.5 w-3.5" />,
  'map-pin': <MapPin className="h-3.5 w-3.5" />,
  camera: <Camera className="h-3.5 w-3.5" />,
  compass: <Compass className="h-3.5 w-3.5" />,
  utensils: <Utensils className="h-3.5 w-3.5" />,
  search: <Search className="h-3.5 w-3.5" />,
  clock: <Clock className="h-3.5 w-3.5" />,
};

interface SmartSuggestionsProps {
  context: SuggestionContext;
  onSuggestionClick: (message: string) => void;
  isLoading?: boolean;
}

export function SmartSuggestions({ 
  context, 
  onSuggestionClick,
  isLoading = false 
}: SmartSuggestionsProps) {
  const suggestions = useMemo(() => getSuggestions(context), [context]);

  if (suggestions.length === 0 || isLoading) {
    return null;
  }

  return (
    <div className="px-4 py-2">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {suggestions.map((suggestion, index) => (
            <motion.button
              key={suggestion.id}
              initial={{ opacity: 0, scale: 0.9, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.04, duration: 0.15 }}
              onClick={() => onSuggestionClick(suggestion.message)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                "text-xs font-medium whitespace-nowrap",
                "bg-primary/10 text-primary hover:bg-primary/20",
                "border border-primary/20 hover:border-primary/40",
                "transition-all duration-150 hover:scale-[1.02]",
                "focus:outline-none focus:ring-2 focus:ring-primary/30"
              )}
            >
              {iconMap[suggestion.iconName]}
              <span>{suggestion.label}</span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Re-export types for convenience
export type { SuggestionContext } from "./services/suggestionEngine";
