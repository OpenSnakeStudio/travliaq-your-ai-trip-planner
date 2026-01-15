/**
 * RealtimeSuggestionChips - Displays typing suggestions above the input
 */

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { RealtimeSuggestion } from "./hooks/useRealtimeSuggestions";

interface RealtimeSuggestionChipsProps {
  suggestions: RealtimeSuggestion[];
  onSelect: (suggestion: RealtimeSuggestion) => void;
  isVisible: boolean;
}

export function RealtimeSuggestionChips({
  suggestions,
  onSelect,
  isVisible,
}: RealtimeSuggestionChipsProps) {
  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="px-4 pb-2">
      <div className="flex gap-1.5 flex-wrap">
        <AnimatePresence mode="popLayout">
          {suggestions.map((suggestion, index) => (
            <motion.button
              key={suggestion.id}
              initial={{ opacity: 0, scale: 0.9, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.03, duration: 0.12 }}
              onClick={() => onSelect(suggestion)}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-full shrink-0",
                "text-xs font-medium whitespace-nowrap",
                "bg-accent/50 text-accent-foreground",
                "border border-accent/30 hover:border-accent/60",
                "hover:bg-accent/70 transition-all duration-100",
                "focus:outline-none focus:ring-1 focus:ring-primary/30"
              )}
            >
              {suggestion.emoji && (
                <span className="text-xs">{suggestion.emoji}</span>
              )}
              <span className="text-muted-foreground">+</span>
              <span>{suggestion.label}</span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
