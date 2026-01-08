/**
 * PreferenceSummary
 * Displays an AI-generated engaging summary of user preferences.
 * Calls LLM with creative prompt for fun, factual summaries.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { usePreferenceMemory, type TripPreferences } from "@/contexts/PreferenceMemoryContext";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface PreferenceSummaryProps {
  className?: string;
  compact?: boolean;
}

function getPreferencesHash(prefs: TripPreferences): string {
  return JSON.stringify({
    style: prefs.travelStyle,
    axes: prefs.styleAxes,
    interests: prefs.interests.slice(0, 5),
    occasion: prefs.tripContext.occasion,
    mustHaves: prefs.mustHaves,
  });
}

function getEnergyLabel(chillVsIntense: number): string {
  if (chillVsIntense < 30) return "zen et détente";
  if (chillVsIntense < 50) return "équilibrée";
  if (chillVsIntense < 70) return "dynamique";
  return "intense et sportive";
}

function getTerrainLabel(cityVsNature: number): string {
  if (cityVsNature < 30) return "urbain et culturel";
  if (cityVsNature < 50) return "mixte ville/nature";
  if (cityVsNature < 70) return "grands espaces";
  return "nature sauvage";
}

function getBudgetLabel(ecoVsLuxury: number): string {
  if (ecoVsLuxury < 25) return "économique";
  if (ecoVsLuxury < 50) return "malin";
  if (ecoVsLuxury < 75) return "confortable";
  return "luxueux";
}

function getAuthLabel(touristVsLocal: number): string {
  if (touristVsLocal < 30) return "incontournables";
  if (touristVsLocal < 50) return "équilibré";
  if (touristVsLocal < 70) return "expériences locales";
  return "aventure authentique";
}

const PLACEHOLDER = "Affinez vos préférences pour découvrir votre profil voyageur unique...";
const CHANGES_THRESHOLD = 3; // Regenerate every N changes to optimize LLM costs

export function PreferenceSummary({ className, compact = false }: PreferenceSummaryProps) {
  const { getPreferences, getProfileCompletion } = usePreferenceMemory();
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastHashRef = useRef<string>("");
  const changeCountRef = useRef<number>(0);
  const prefs = getPreferences();
  const completion = getProfileCompletion();

  const generateSummary = useCallback(async (force = false) => {
    const currentHash = getPreferencesHash(prefs);
    
    // Track changes
    if (currentHash !== lastHashRef.current) {
      changeCountRef.current += 1;
    }
    
    // Skip if nothing changed
    if (currentHash === lastHashRef.current && !force) return;
    
    // Skip if profile too sparse (less than 20% complete)
    if (completion < 20) {
      setSummary("");
      return;
    }
    
    // Only regenerate every N changes (or on force/first time)
    const isFirstGeneration = !lastHashRef.current || !summary;
    if (!force && !isFirstGeneration && changeCountRef.current < CHANGES_THRESHOLD) {
      return;
    }
    
    // Reset counter and update hash
    changeCountRef.current = 0;
    lastHashRef.current = currentHash;
    setIsLoading(true);

    try {
      // Build human-readable profile description
      const styleLabel = prefs.travelStyle === "solo" ? "solo" : prefs.travelStyle === "couple" ? "en duo" : prefs.travelStyle === "family" ? "en famille" : "entre amis";
      const interestsList = prefs.interests.length > 0 ? prefs.interests.slice(0, 4).join(", ") : "polyvalent";
      const occasionLabel = prefs.tripContext.occasion ? {
        honeymoon: "lune de miel",
        anniversary: "anniversaire de couple",
        birthday: "célébration d'anniversaire",
        vacation: "vacances",
        workation: "télétravail + voyage"
      }[prefs.tripContext.occasion] || "" : "";

      const prompt = `Tu es un assistant voyage bienveillant. Décris ce voyageur de manière chaleureuse et personnalisée en 2-3 phrases courtes.

TON STYLE :
- Parle comme un ami qui le connaît bien
- Utilise "tu" et sois chaleureux
- Mets en avant ce qui le rend unique
- Maximum 40 mots, phrases courtes
- Pas de métaphores compliquées, reste simple et authentique
- Un emoji maximum en fin de phrase

PROFIL :
- Type : voyage ${styleLabel}
- Énergie : ${getEnergyLabel(prefs.styleAxes.chillVsIntense)}
- Environnement préféré : ${getTerrainLabel(prefs.styleAxes.cityVsNature)}
- Budget : ${getBudgetLabel(prefs.styleAxes.ecoVsLuxury)}
- Style : ${getAuthLabel(prefs.styleAxes.touristVsLocal)}
- Ce qui t'attire : ${interestsList}${occasionLabel ? `\n- Occasion : ${occasionLabel}` : ""}

EXEMPLES :
- "Tu aimes voyager en duo, entre découvertes culturelles et bons restos. Un rythme tranquille avec une touche de confort. 🌿"
- "Aventurier solo, tu préfères sortir des sentiers battus. Nature et authenticité sont tes mots-clés. ⛰️"
- "En famille, tu cherches des expériences accessibles à tous. Plage et activités fun sont au programme ! 🏖️"

Réponds uniquement avec la description, sans guillemets.`;

      const { data, error } = await supabase.functions.invoke("planner-chat", {
        body: {
          messages: [{ role: "user", content: prompt }],
          stream: false,
        },
      });

      if (error) throw error;
      
      const content = data?.content || "";
      if (content && content.length > 20) {
        setSummary(content);
      }
    } catch (err) {
      console.warn("[PreferenceSummary] Generation failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, [prefs, completion]);

  // Debounced generation on preference change
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      generateSummary();
    }, 2000);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [generateSummary]);

  const handleRefresh = () => {
    generateSummary(true); // Force regeneration
  };

  if (compact) {
    return (
      <div className={cn("text-xs text-muted-foreground italic", className)}>
        {isLoading ? (
          <span className="text-primary/70">✨ Génération du profil...</span>
        ) : summary ? (
          <span className="line-clamp-2">{summary}</span>
        ) : (
          <span className="opacity-60">{PLACEHOLDER}</span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-xl border border-border/50 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 min-h-[100px]",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Ton profil voyageur</span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading || completion < 20}
          className="p-1 rounded-md hover:bg-muted/50 disabled:opacity-40 transition-colors"
          title="Régénérer le profil"
        >
          <RefreshCw className={cn("h-3 w-3 text-muted-foreground", isLoading && "animate-spin")} />
        </button>
      </div>

      {/* Content */}
      <div className="text-sm leading-relaxed min-h-[40px]">
        {isLoading ? (
          <div className="flex items-center gap-2 text-primary/70">
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </span>
            <span className="text-xs">Analyse de ton style...</span>
          </div>
        ) : summary ? (
          <p className="text-foreground/90">{summary}</p>
        ) : (
          <p className="text-muted-foreground/70 italic">{PLACEHOLDER}</p>
        )}
      </div>

      {/* Subtle decoration */}
      <div className="absolute -bottom-1 -right-1 w-16 h-16 bg-gradient-to-tl from-primary/10 to-transparent rounded-full blur-xl pointer-events-none" />
    </div>
  );
}

export default PreferenceSummary;
