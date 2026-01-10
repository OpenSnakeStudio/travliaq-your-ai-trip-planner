/**
 * DestinationSuggestionsGrid - Grid of destination suggestions
 */

import { memo } from "react";
import { Sparkles, Loader2 } from "lucide-react";
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
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 border border-border">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground">
            Recommandations basées sur votre profil ({basedOnProfile.completionScore}% complété)
          </span>
        </div>
      )}

      {/* Suggestions Grid */}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {suggestions.map((suggestion, index) => (
          <DestinationSuggestionCard
            key={`${suggestion.countryCode}-${index}`}
            suggestion={suggestion}
            onSelect={onSelect ? () => onSelect(suggestion) : undefined}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
});

export default DestinationSuggestionsGrid;
