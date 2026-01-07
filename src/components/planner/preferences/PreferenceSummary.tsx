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

export function PreferenceSummary({ className, compact = false }: PreferenceSummaryProps) {
  const { getPreferences, getProfileCompletion } = usePreferenceMemory();
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastHashRef = useRef<string>("");
  const prefs = getPreferences();
  const completion = getProfileCompletion();

  const generateSummary = useCallback(async () => {
    const currentHash = getPreferencesHash(prefs);
    
    // Skip if nothing changed
    if (currentHash === lastHashRef.current) return;
    
    // Skip if profile too sparse (less than 20% complete)
    if (completion < 20) {
      setSummary("");
      return;
    }

    lastHashRef.current = currentHash;
    setIsLoading(true);

    try {
      const prompt = `Tu es un rédacteur voyage ultra-créatif. Génère un profil voyageur UNIQUE et ENGAGEANT en 2-3 phrases maximum.

RÈGLES IMPÉRATIVES :
- Commence par une métaphore originale ou une comparaison inattendue
- Utilise des expressions vivantes, des verbes d'action puissants
- Évoque une émotion ou une ambiance
- Sois drôle, surprenant, mémorable
- Maximum 50 mots
- Tutoie le voyageur

PROFIL À DÉCRIRE :
- Voyageur ${prefs.travelStyle === "solo" ? "solo" : prefs.travelStyle === "couple" ? "en duo" : prefs.travelStyle === "family" ? "en tribu familiale" : "en bande d'amis"}
- Énergie ${getEnergyLabel(prefs.styleAxes.chillVsIntense)}
- Terrain de jeu : ${getTerrainLabel(prefs.styleAxes.cityVsNature)}
- Budget ${getBudgetLabel(prefs.styleAxes.ecoVsLuxury)}
- Approche : ${getAuthLabel(prefs.styleAxes.touristVsLocal)}
- Passions : ${prefs.interests.length > 0 ? prefs.interests.join(", ") : "à découvrir"}
${prefs.tripContext.occasion ? `- Occasion : ${prefs.tripContext.occasion}` : ""}

EXEMPLES DE STYLE SOUHAITÉ :
- "Tel un chef d'orchestre, tu composes des escapades où chaque note compte. Les musées sont tes salles de concert, les restaurants tes backstages."
- "Mi-explorateur urbain, mi-chasseur de couchers de soleil, tu jongle entre terrasses branchées et sentiers secrets."
- "Ta valise ? Un passeport vers la dolce vita. Spas, gastronomie et siestes sont tes armes secrètes."

Réponds UNIQUEMENT avec le résumé, sans guillemets ni préfixe.`;

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
    lastHashRef.current = ""; // Force regeneration
    generateSummary();
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
          <div className="flex items-center gap-2 text-primary/80">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span className="animate-pulse">Création de ton profil voyageur...</span>
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
