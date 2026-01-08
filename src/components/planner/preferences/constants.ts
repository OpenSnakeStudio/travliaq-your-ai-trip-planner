/**
 * Preferences UI Constants
 * Shared constants for all preference components
 */

import type { TravelStyle, TripContext, MustHaves, StyleAxes } from '@/contexts/preferences/types';
import { Leaf, Salad, Moon, Star, Wheat, Fish, Milk, Egg, Nut } from "lucide-react";

// ============================================================================
// INTERESTS
// ============================================================================

export interface Interest {
  id: string;
  label: string;
  emoji: string;
}

export const INTERESTS: Interest[] = [
  { id: "culture", label: "Culture", emoji: "🏛️" },
  { id: "food", label: "Gastronomie", emoji: "🍽️" },
  { id: "nature", label: "Nature", emoji: "🌲" },
  { id: "beach", label: "Plage", emoji: "🏖️" },
  { id: "wellness", label: "Bien-être", emoji: "🧘" },
  { id: "sport", label: "Sport", emoji: "⚽" },
  { id: "adventure", label: "Aventure", emoji: "🎢" },
  { id: "nightlife", label: "Sorties", emoji: "🍸" },
  { id: "shopping", label: "Shopping", emoji: "🛍️" },
  { id: "history", label: "Histoire", emoji: "📜" },
] as const;

// ============================================================================
// TRAVEL STYLES
// ============================================================================

export interface TravelStyleOption {
  id: TravelStyle;
  label: string;
  emoji: string;
}

export const TRAVEL_STYLES: TravelStyleOption[] = [
  { id: "solo", label: "Solo", emoji: "🧑" },
  { id: "couple", label: "Duo", emoji: "💑" },
  { id: "family", label: "Famille", emoji: "👨‍👩‍👧" },
  { id: "friends", label: "Amis", emoji: "👯" },
] as const;

// ============================================================================
// OCCASIONS
// ============================================================================

export interface OccasionOption {
  id: NonNullable<TripContext["occasion"]>;
  label: string;
  emoji: string;
}

export const OCCASIONS: OccasionOption[] = [
  { id: "vacation", label: "Vacances", emoji: "🌴" },
  { id: "honeymoon", label: "Lune de miel", emoji: "💒" },
  { id: "anniversary", label: "Anniversaire", emoji: "🎂" },
  { id: "birthday", label: "Fête", emoji: "🎉" },
  { id: "workation", label: "Télétravail", emoji: "💻" },
  { id: "other", label: "Découverte", emoji: "🗺️" },
] as const;

// ============================================================================
// MUST-HAVES
// ============================================================================

export interface MustHaveConfig {
  key: keyof MustHaves;
  label: string;
  emoji: string;
}

export const MUST_HAVES_CONFIG: MustHaveConfig[] = [
  { key: "accessibilityRequired", label: "Accessibilité PMR", emoji: "♿" },
  { key: "highSpeedWifi", label: "WiFi Haut Débit", emoji: "📶" },
  { key: "petFriendly", label: "Accepte animaux", emoji: "🐾" },
  { key: "familyFriendly", label: "Adapté enfants", emoji: "👶" },
] as const;

// ============================================================================
// STYLE AXES (EQUALIZER)
// ============================================================================

export interface AxisConfig {
  key: keyof StyleAxes;
  leftLabel: string;
  rightLabel: string;
  leftEmoji: string;
  rightEmoji: string;
}

export const AXES_CONFIG: AxisConfig[] = [
  { key: "chillVsIntense", leftLabel: "Détente", rightLabel: "Intense", leftEmoji: "🧘", rightEmoji: "🏃" },
  { key: "cityVsNature", leftLabel: "Urbain", rightLabel: "Nature", leftEmoji: "🏙️", rightEmoji: "🌲" },
  { key: "ecoVsLuxury", leftLabel: "Économique", rightLabel: "Luxe", leftEmoji: "💰", rightEmoji: "✨" },
  { key: "touristVsLocal", leftLabel: "Touristique", rightLabel: "Authentique", leftEmoji: "📸", rightEmoji: "🏠" },
] as const;

// ============================================================================
// DIETARY OPTIONS
// ============================================================================

export interface DietaryOption {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

export const DIETARY_OPTIONS: DietaryOption[] = [
  { id: "vegetarian", label: "Végétarien", icon: Salad, color: "hsl(140, 60%, 45%)" },
  { id: "vegan", label: "Végan", icon: Leaf, color: "hsl(120, 50%, 40%)" },
  { id: "halal", label: "Halal", icon: Moon, color: "hsl(200, 70%, 50%)" },
  { id: "kosher", label: "Casher", icon: Star, color: "hsl(45, 80%, 50%)" },
  { id: "gluten-free", label: "Sans gluten", icon: Wheat, color: "hsl(30, 70%, 50%)" },
  { id: "pescatarian", label: "Pescétarien", icon: Fish, color: "hsl(190, 70%, 50%)" },
  { id: "lactose-free", label: "Sans lactose", icon: Milk, color: "hsl(210, 50%, 60%)" },
  { id: "no-eggs", label: "Sans œufs", icon: Egg, color: "hsl(50, 60%, 55%)" },
  { id: "no-nuts", label: "Fruits à coque", icon: Nut, color: "hsl(25, 60%, 45%)" },
] as const;

// ============================================================================
// STEP INDICATOR
// ============================================================================

export type Step = "base" | "style" | "musts";

export interface StepConfig {
  id: Step;
  label: string;
}

export const STEPS: StepConfig[] = [
  { id: "base", label: "Base" },
  { id: "style", label: "Style" },
  { id: "musts", label: "Critères" },
] as const;
