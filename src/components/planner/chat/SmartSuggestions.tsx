/**
 * SmartSuggestions - Contextual message recommendations
 * 
 * Displays smart suggestion chips above the chat input based on:
 * - Current journey stage (destination, dates, travelers)
 * - Active tab and visible content
 * - User preferences
 */

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plane, 
  Calendar, 
  Users, 
  MapPin, 
  Hotel, 
  Compass,
  Sparkles,
  Sun,
  Utensils,
  Camera
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SuggestionContext {
  hasDestination: boolean;
  hasDates: boolean;
  hasTravelers: boolean;
  hasFlights: boolean;
  hasHotels: boolean;
  destinationName?: string;
  currentTab: string;
  visibleFlightsCount: number;
  visibleHotelsCount: number;
  visibleActivitiesCount: number;
  travelStyle?: string;
}

interface Suggestion {
  id: string;
  label: string;
  message: string;
  icon: React.ReactNode;
  priority: number;
}

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
  const suggestions = useMemo(() => {
    const result: Suggestion[] = [];
    const dest = context.destinationName || "cette destination";

    // Journey stage suggestions
    if (!context.hasDestination) {
      result.push({
        id: "suggest-destination",
        label: "Suggère une destination",
        message: "Suggère-moi une destination de voyage originale",
        icon: <Sparkles className="h-3.5 w-3.5" />,
        priority: 1,
      });
      result.push({
        id: "where-to-go",
        label: "Où partir ?",
        message: "Où puis-je partir avec un budget de 1000€ par personne ?",
        icon: <MapPin className="h-3.5 w-3.5" />,
        priority: 2,
      });
      result.push({
        id: "sunny-destination",
        label: "Destination soleil",
        message: "Je veux partir au soleil, quelles destinations me conseilles-tu ?",
        icon: <Sun className="h-3.5 w-3.5" />,
        priority: 3,
      });
    } else if (!context.hasDates) {
      result.push({
        id: "when-to-go",
        label: "Quand partir ?",
        message: `Quelle est la meilleure période pour visiter ${dest} ?`,
        icon: <Calendar className="h-3.5 w-3.5" />,
        priority: 1,
      });
      result.push({
        id: "flexible-dates",
        label: "Dates flexibles",
        message: "Je suis flexible sur les dates, montre-moi les moins chères",
        icon: <Calendar className="h-3.5 w-3.5" />,
        priority: 2,
      });
    } else if (!context.hasTravelers) {
      result.push({
        id: "solo",
        label: "Solo",
        message: "Je voyage seul",
        icon: <Users className="h-3.5 w-3.5" />,
        priority: 1,
      });
      result.push({
        id: "couple",
        label: "En couple",
        message: "Nous sommes 2 adultes",
        icon: <Users className="h-3.5 w-3.5" />,
        priority: 2,
      });
      result.push({
        id: "family",
        label: "En famille",
        message: "Nous sommes une famille avec des enfants",
        icon: <Users className="h-3.5 w-3.5" />,
        priority: 3,
      });
    }

    // Tab-specific suggestions
    if (context.currentTab === "flights" && context.hasDestination) {
      if (context.visibleFlightsCount > 0) {
        result.push({
          id: "compare-flights",
          label: "Comparer les vols",
          message: "Compare les meilleurs vols affichés sur la carte",
          icon: <Plane className="h-3.5 w-3.5" />,
          priority: 4,
        });
      }
      result.push({
        id: "cheapest-flight",
        label: "Vol le moins cher",
        message: `Quel est le vol le moins cher pour ${dest} ?`,
        icon: <Plane className="h-3.5 w-3.5" />,
        priority: 5,
      });
    }

    if (context.currentTab === "stays" && context.hasDestination) {
      if (context.visibleHotelsCount > 0) {
        result.push({
          id: "compare-hotels",
          label: "Comparer les hôtels",
          message: "Compare les hôtels affichés et recommande-moi le meilleur",
          icon: <Hotel className="h-3.5 w-3.5" />,
          priority: 4,
        });
      }
      result.push({
        id: "best-area",
        label: "Meilleur quartier",
        message: `Quel est le meilleur quartier pour loger à ${dest} ?`,
        icon: <MapPin className="h-3.5 w-3.5" />,
        priority: 5,
      });
    }

    if (context.currentTab === "activities" && context.hasDestination) {
      result.push({
        id: "must-see",
        label: "Incontournables",
        message: `Quels sont les incontournables à ${dest} ?`,
        icon: <Camera className="h-3.5 w-3.5" />,
        priority: 4,
      });
      result.push({
        id: "local-food",
        label: "Gastronomie locale",
        message: `Quels plats locaux dois-je absolument goûter à ${dest} ?`,
        icon: <Utensils className="h-3.5 w-3.5" />,
        priority: 5,
      });
      result.push({
        id: "hidden-gems",
        label: "Hors des sentiers",
        message: `Quels sont les endroits secrets ou moins touristiques à ${dest} ?`,
        icon: <Compass className="h-3.5 w-3.5" />,
        priority: 6,
      });
    }

    // Sort by priority and limit to 4
    return result.sort((a, b) => a.priority - b.priority).slice(0, 4);
  }, [context]);

  if (suggestions.length === 0 || isLoading) {
    return null;
  }

  return (
    <div className="px-4 pb-2">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
        <AnimatePresence mode="popLayout">
          {suggestions.map((suggestion, index) => (
            <motion.button
              key={suggestion.id}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
              onClick={() => onSuggestionClick(suggestion.message)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                "text-xs font-medium whitespace-nowrap",
                "bg-primary/10 text-primary hover:bg-primary/20",
                "border border-primary/20 hover:border-primary/40",
                "transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary/30"
              )}
            >
              {suggestion.icon}
              <span>{suggestion.label}</span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
