/**
 * Preference Summary Component
 * Displays an AI-generated summary of user preferences
 * Updates automatically when preferences change
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
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
    comfort: prefs.comfortLevel,
  });
  return btoa(key).slice(0, 20);
}

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
    if (prefs.interests.length === 0 && prefs.travelStyle === "couple") {
      setSummary("");
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("planner-chat", {
        body: {
          messages: [{
            role: "user",
            content: `Génère un résumé de profil voyageur en 1-2 phrases maximum (40 mots max). Sois concis et naturel.

Profil:
- Voyageurs: ${prefs.travelStyle}
- Rythme: ${prefs.styleAxes.chillVsIntense < 40 ? "détente" : prefs.styleAxes.chillVsIntense > 60 ? "intense" : "modéré"}
- Environnement: ${prefs.styleAxes.cityVsNature < 40 ? "urbain" : prefs.styleAxes.cityVsNature > 60 ? "nature" : "mixte"}
- Budget: ${prefs.styleAxes.ecoVsLuxury < 40 ? "économique" : prefs.styleAxes.ecoVsLuxury > 60 ? "luxe" : "confortable"}
- Style: ${prefs.styleAxes.touristVsLocal < 40 ? "touristique" : prefs.styleAxes.touristVsLocal > 60 ? "authentique" : "équilibré"}
- Intérêts: ${prefs.interests.join(", ") || "non définis"}
- Occasion: ${prefs.tripContext.occasion || "vacances"}
- Besoins: ${Object.entries(prefs.mustHaves).filter(([, v]) => v).map(([k]) => k).join(", ") || "aucun spécifique"}

Réponds UNIQUEMENT avec le résumé, sans guillemets ni préfixe.`
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
    }, 1500); // Wait 1.5s after last change

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [preferences, generateSummary]);

  // Don't show anything if no summary yet
  if (!summary && !isLoading) return null;

  return (
    <div className={cn(
      "relative p-3 rounded-xl bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5 border border-primary/20",
      className
    )}>
      <div className="flex items-start gap-2">
        <div className="h-6 w-6 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
          {isLoading ? (
            <RefreshCw className="h-3.5 w-3.5 text-primary animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-wide text-primary font-medium mb-1">
            Votre profil voyageur
          </div>
          {isLoading ? (
            <div className="h-10 flex items-center">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          ) : (
            <p className="text-sm text-foreground/80 leading-relaxed">
              {summary}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PreferenceSummary;
