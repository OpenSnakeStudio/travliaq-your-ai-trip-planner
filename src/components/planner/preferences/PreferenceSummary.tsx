/**
 * Preference Summary Component
 * Displays an engaging AI-generated summary with fixed height placeholder
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePreferenceMemory, type TripPreferences } from "@/contexts/PreferenceMemoryContext";
import { supabase } from "@/integrations/supabase/client";

interface PreferenceSummaryProps {
  className?: string;
}

// Generate a hash of preferences to detect changes
function getPreferencesHash(prefs: TripPreferences): string {
  const key = JSON.stringify({
    style: prefs.travelStyle,
    axes: prefs.styleAxes,
    interests: prefs.interests.sort(),
    mustHaves: prefs.mustHaves,
    occasion: prefs.tripContext.occasion,
  });
  return btoa(key).slice(0, 20);
}

const PLACEHOLDER_TEXT = "✨ Complétez vos préférences et je vous décrirai votre profil de voyageur unique...";

export function PreferenceSummary({ className }: PreferenceSummaryProps) {
  const { memory: { preferences } } = usePreferenceMemory();
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const lastHashRef = useRef<string>("");
  const debounceRef = useRef<NodeJS.Timeout>();

  const generateSummary = useCallback(async (prefs: TripPreferences) => {
    const hash = getPreferencesHash(prefs);
    
    // Skip if nothing changed
    if (hash === lastHashRef.current) return;
    lastHashRef.current = hash;
    
    // Don't generate if profile is too empty
    const hasInterests = prefs.interests.length > 0;
    const hasOccasion = !!prefs.tripContext.occasion;
    const hasStyleChange = Object.values(prefs.styleAxes).some(v => v !== 50);
    
    if (!hasInterests && !hasOccasion && !hasStyleChange) {
      setSummary("");
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("planner-chat", {
        body: {
          messages: [{
            role: "user",
            content: `Tu es un copywriter créatif. Génère un résumé de profil voyageur FUN et ENGAGEANT en 2 phrases maximum (50 mots max).

STYLE : Utilise des expressions vivantes, des touches d'humour subtil, et donne envie de partir ! Sois enthousiaste mais pas excessif.

Profil à décrire :
- Type: ${prefs.travelStyle === "solo" ? "aventurier solo" : prefs.travelStyle === "couple" ? "duo romantique" : prefs.travelStyle === "family" ? "tribu familiale" : "bande d'amis"}
- Énergie: ${prefs.styleAxes.chillVsIntense < 35 ? "mode zen, tranquille" : prefs.styleAxes.chillVsIntense > 65 ? "hyperactif, veut tout voir" : "équilibré"}
- Terrain: ${prefs.styleAxes.cityVsNature < 35 ? "citadin dans l'âme" : prefs.styleAxes.cityVsNature > 65 ? "amoureux de grands espaces" : "polyvalent"}
- Budget: ${prefs.styleAxes.ecoVsLuxury < 35 ? "malin et économe" : prefs.styleAxes.ecoVsLuxury > 65 ? "amateur de belles choses" : "raisonnable"}
- Vibe: ${prefs.styleAxes.touristVsLocal < 35 ? "touriste assumé" : prefs.styleAxes.touristVsLocal > 65 ? "chasseur d'authenticité" : "curieux de tout"}
- Passions: ${prefs.interests.length > 0 ? prefs.interests.join(", ") : "à découvrir"}
- Occasion: ${prefs.tripContext.occasion || "évasion"}

IMPORTANT : Réponds UNIQUEMENT avec le résumé, sans guillemets, sans "Voici", sans préfixe. Commence directement par une phrase accrocheuse.`
          }],
          mode: "quick",
        },
      });

      if (!error && data?.content) {
        setSummary(data.content.trim());
      }
    } catch (err) {
      console.error("Failed to generate preference summary:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced effect to regenerate summary on preference changes
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      generateSummary(preferences);
    }, 2000); // Wait 2s after last change

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [preferences, generateSummary]);

  const displayText = summary || PLACEHOLDER_TEXT;
  const isEmpty = !summary;

  return (
    <div className={cn(
      "relative p-3 rounded-xl border min-h-[72px]",
      isEmpty 
        ? "bg-muted/20 border-dashed border-muted-foreground/30" 
        : "bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 border-primary/20",
      className
    )}>
      <div className="flex items-start gap-2.5">
        <div className={cn(
          "h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0",
          isEmpty ? "bg-muted/40" : "bg-primary/15"
        )}>
          {isLoading ? (
            <Wand2 className="h-4 w-4 text-primary animate-pulse" />
          ) : (
            <Sparkles className={cn("h-4 w-4", isEmpty ? "text-muted-foreground" : "text-primary")} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className={cn(
            "text-[10px] uppercase tracking-wider font-semibold mb-1",
            isEmpty ? "text-muted-foreground" : "text-primary"
          )}>
            {isEmpty ? "Votre profil" : "Votre profil voyageur"}
          </div>
          <p className={cn(
            "text-sm leading-relaxed transition-all duration-300",
            isEmpty ? "text-muted-foreground/70 italic" : "text-foreground",
            isLoading && "opacity-50"
          )}>
            {isLoading ? "Je prépare votre description..." : displayText}
          </p>
        </div>
      </div>
    </div>
  );
}

export default PreferenceSummary;
