/**
 * Preference Memory Context v2
 * Hub central pour toutes les préférences utilisateur
 * Synchronisé avec le chat pour détection automatique
 * Propagé vers hotels, activités, vols
 */

import { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from "react";
import { eventBus } from "@/lib/eventBus";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface StyleAxes {
  chillVsIntense: number;      // 0-100 (0=Chill, 100=Intense)
  cityVsNature: number;        // 0-100 (0=Ville, 100=Nature)
  ecoVsLuxury: number;         // 0-100 (miroir de comfortLevel)
  touristVsLocal: number;      // 0-100 (0=Touristique, 100=Authentique)
}

export interface MustHaves {
  accessibilityRequired: boolean;
  petFriendly: boolean;
  familyFriendly: boolean;
  highSpeedWifi: boolean;
}

export interface WorkPreferences {
  needsWifi: boolean;
  workationMode: boolean;
}

export interface TripContext {
  occasion?: "honeymoon" | "anniversary" | "birthday" | "vacation" | "workation" | "other";
  flexibility: "fixed" | "flexible" | "very_flexible";
}

export type TravelStyle = "solo" | "couple" | "family" | "friends" | "pet";

export interface TripPreferences {
  id: string;

  // === BASE ===
  travelStyle: TravelStyle;
  
  // === STYLE AXES (Égaliseur) ===
  styleAxes: StyleAxes;

  // === INTERESTS ===
  interests: string[]; // Max 5: ["culture", "food", "nature", "beach", "wellness", "sport", "adventure", "nightlife", "shopping", "workation"]
  
  // === MUST-HAVES ===
  mustHaves: MustHaves;
  
  // === WORK PREFERENCES ===
  workPreferences: WorkPreferences;
  
  // === TRIP CONTEXT ===
  tripContext: TripContext;
  
  // === LEGACY (backward compatible) ===
  pace: "relaxed" | "moderate" | "intense";
  comfortLevel: number; // 0-100 - mirror of styleAxes.ecoVsLuxury
  dietaryRestrictions: string[];
  accessibilityNeeds: string[];

  // === METADATA ===
  confidenceScore: number; // 0-100 - profile completion
  lastUpdated: Date;
  detectedFromChat: boolean;
  manualOverrides: string[]; // Fields manually overridden by user
}

export interface PreferenceMemory {
  preferences: TripPreferences;
}

// Computed filters for other widgets
export interface HotelFiltersFromPreferences {
  priceMin: number;
  priceMax: number;
  minStars: number;
  amenities: string[];
  types: string[];
}

export interface ActivityFiltersFromPreferences {
  categories: string[];
  priceRange: [number, number];
  ratingMin: number;
  timeOfDay: string[];
}

export interface FlightPreferencesComputed {
  cabinClass: "economy" | "premium_economy" | "business" | "first";
  flexibility: "exact" | "flexible" | "very_flexible";
}

interface PreferenceMemoryContextValue {
  memory: PreferenceMemory;

  // Full preference update
  updatePreferences: (updates: Partial<TripPreferences>, fromChat?: boolean) => void;
  
  // Style Axes
  setStyleAxis: (axis: keyof StyleAxes, value: number) => void;
  
  // Base selections
  setTravelStyle: (style: TravelStyle) => void;
  
  // Interests (max 5)
  toggleInterest: (interest: string) => void;
  
  // Must-haves
  toggleMustHave: (key: keyof MustHaves) => void;
  
  // Work preferences
  setWorkPreference: (key: keyof WorkPreferences, value: boolean) => void;
  
  // Trip context
  setOccasion: (occasion: TripContext["occasion"]) => void;
  setFlexibility: (flexibility: TripContext["flexibility"]) => void;

  // Legacy methods (backward compatible)
  setPace: (pace: TripPreferences["pace"]) => void;
  toggleDietaryRestriction: (restriction: string) => void;
  toggleAccessibilityNeed: (need: string) => void;
  setComfortLevel: (level: number) => void;

  // Computed getters
  getPreferences: () => TripPreferences;
  getPreferenceSummary: () => string;
  getComfortLabel: () => "Économique" | "Confort" | "Premium" | "Luxe";
  getProfileCompletion: () => number;
  
  // Computed filters for other widgets
  getHotelFilters: () => HotelFiltersFromPreferences;
  getActivityFilters: () => ActivityFiltersFromPreferences;
  getFlightPreferences: () => FlightPreferencesComputed;

  // Reset
  resetToDefaults: () => void;

  // Serialization
  getSerializedState: () => Record<string, unknown>;
}

// ============================================================================
// STORAGE & DEFAULTS
// ============================================================================

const STORAGE_KEY = "travliaq_preference_memory_v2";

const defaultStyleAxes: StyleAxes = {
  chillVsIntense: 50,
  cityVsNature: 50,
  ecoVsLuxury: 50,
  touristVsLocal: 50,
};

const defaultMustHaves: MustHaves = {
  accessibilityRequired: false,
  petFriendly: false,
  familyFriendly: false,
  highSpeedWifi: false,
};

const defaultWorkPreferences: WorkPreferences = {
  needsWifi: false,
  workationMode: false,
};

const defaultTripContext: TripContext = {
  occasion: undefined,
  flexibility: "flexible",
};

const defaultPreferences: TripPreferences = {
  id: crypto.randomUUID(),
  travelStyle: "couple",
  styleAxes: defaultStyleAxes,
  interests: [],
  mustHaves: defaultMustHaves,
  workPreferences: defaultWorkPreferences,
  tripContext: defaultTripContext,
  // Legacy
  pace: "moderate",
  comfortLevel: 50,
  dietaryRestrictions: [],
  accessibilityNeeds: [],
  // Metadata
  confidenceScore: 0,
  lastUpdated: new Date(),
  detectedFromChat: false,
  manualOverrides: [],
};

const defaultMemory: PreferenceMemory = {
  preferences: defaultPreferences,
};

function serializeMemory(memory: PreferenceMemory): string {
  return JSON.stringify({
    preferences: {
      ...memory.preferences,
      lastUpdated: memory.preferences.lastUpdated.toISOString(),
    },
  });
}

function deserializeMemory(json: string): PreferenceMemory | null {
  try {
    const parsed = JSON.parse(json);
    // Migrate from v1 if needed
    const prefs = parsed.preferences;
    return {
      preferences: {
        ...defaultPreferences,
        ...prefs,
        styleAxes: prefs.styleAxes || defaultStyleAxes,
        mustHaves: prefs.mustHaves || defaultMustHaves,
        workPreferences: prefs.workPreferences || defaultWorkPreferences,
        tripContext: prefs.tripContext || defaultTripContext,
        manualOverrides: prefs.manualOverrides || [],
        lastUpdated: new Date(prefs.lastUpdated),
      },
    };
  } catch (error) {
    console.warn("[PreferenceMemory] Failed to deserialize:", error);
    return null;
  }
}

function loadFromStorage(): PreferenceMemory {
  try {
    // Try v2 first
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const deserialized = deserializeMemory(stored);
      if (deserialized) return deserialized;
    }
    // Try v1 migration
    const v1 = localStorage.getItem("travliaq_preference_memory");
    if (v1) {
      const deserialized = deserializeMemory(v1);
      if (deserialized) return deserialized;
    }
  } catch (error) {
    console.warn("[PreferenceMemory] Failed to load from storage:", error);
  }
  return defaultMemory;
}

// ============================================================================
// CONTEXT
// ============================================================================

const PreferenceMemoryContext = createContext<PreferenceMemoryContextValue | undefined>(undefined);

export function PreferenceMemoryProvider({ children }: { children: ReactNode }) {
  const [memory, setMemory] = useState<PreferenceMemory>(() => loadFromStorage());
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      const serialized = serializeMemory(memory);
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (error) {
      console.warn("[PreferenceMemory] Failed to save:", error);
    }
  }, [memory, isHydrated]);

  // ============================================================================
  // UPDATE OPERATIONS
  // ============================================================================

  const updatePreferences = useCallback((updates: Partial<TripPreferences>, fromChat = false) => {
    setMemory(prev => {
      const newManualOverrides = fromChat 
        ? prev.preferences.manualOverrides 
        : [...new Set([...prev.preferences.manualOverrides, ...Object.keys(updates)])];
      
      // Sync comfortLevel ↔ styleAxes.ecoVsLuxury
      let syncedUpdates = { ...updates };
      if ('comfortLevel' in updates && updates.comfortLevel !== undefined) {
        syncedUpdates = {
          ...syncedUpdates,
          styleAxes: {
            ...prev.preferences.styleAxes,
            ...updates.styleAxes,
            ecoVsLuxury: updates.comfortLevel,
          },
        };
      }
      if (updates.styleAxes?.ecoVsLuxury !== undefined) {
        syncedUpdates.comfortLevel = updates.styleAxes.ecoVsLuxury;
      }

      return {
        preferences: {
          ...prev.preferences,
          ...syncedUpdates,
          lastUpdated: new Date(),
          detectedFromChat: fromChat,
          manualOverrides: newManualOverrides,
        },
      };
    });
    eventBus.emit("tab:flash", { tab: "preferences" });
  }, []);

  const setStyleAxis = useCallback((axis: keyof StyleAxes, value: number) => {
    setMemory(prev => {
      const clampedValue = Math.max(0, Math.min(100, value));
      const newStyleAxes = { ...prev.preferences.styleAxes, [axis]: clampedValue };
      
      // Sync ecoVsLuxury with comfortLevel
      const updates: Partial<TripPreferences> = {
        styleAxes: newStyleAxes,
        lastUpdated: new Date(),
        detectedFromChat: false,
        manualOverrides: [...new Set([...prev.preferences.manualOverrides, "styleAxes"])],
      };
      
      if (axis === "ecoVsLuxury") {
        updates.comfortLevel = clampedValue;
      }
      
      // Sync chillVsIntense with pace
      if (axis === "chillVsIntense") {
        if (clampedValue < 35) updates.pace = "relaxed";
        else if (clampedValue < 70) updates.pace = "moderate";
        else updates.pace = "intense";
      }

      return { preferences: { ...prev.preferences, ...updates } };
    });
  }, []);

  const setTravelStyle = useCallback((travelStyle: TravelStyle) => {
    setMemory(prev => {
      const newMustHaves = { ...prev.preferences.mustHaves };
      // Auto-set family-friendly if family
      if (travelStyle === "family") newMustHaves.familyFriendly = true;
      // Auto-set pet-friendly if pet
      if (travelStyle === "pet") newMustHaves.petFriendly = true;
      
      return {
        preferences: {
          ...prev.preferences,
          travelStyle,
          mustHaves: newMustHaves,
          lastUpdated: new Date(),
          detectedFromChat: false,
          manualOverrides: [...new Set([...prev.preferences.manualOverrides, "travelStyle"])],
        },
      };
    });
  }, []);

  const toggleInterest = useCallback((interest: string) => {
    setMemory(prev => {
      let interests = [...prev.preferences.interests];
      if (interests.includes(interest)) {
        interests = interests.filter(i => i !== interest);
      } else if (interests.length < 5) {
        interests.push(interest);
      }
      
      // Auto-set workation mode if workation interest
      const workPreferences = { ...prev.preferences.workPreferences };
      if (interest === "workation" && interests.includes("workation")) {
        workPreferences.workationMode = true;
        workPreferences.needsWifi = true;
      }

      return {
        preferences: {
          ...prev.preferences,
          interests,
          workPreferences,
          lastUpdated: new Date(),
          detectedFromChat: false,
          manualOverrides: [...new Set([...prev.preferences.manualOverrides, "interests"])],
        },
      };
    });
  }, []);

  const toggleMustHave = useCallback((key: keyof MustHaves) => {
    setMemory(prev => ({
      preferences: {
        ...prev.preferences,
        mustHaves: {
          ...prev.preferences.mustHaves,
          [key]: !prev.preferences.mustHaves[key],
        },
        lastUpdated: new Date(),
        detectedFromChat: false,
        manualOverrides: [...new Set([...prev.preferences.manualOverrides, "mustHaves"])],
      },
    }));
  }, []);

  const setWorkPreference = useCallback((key: keyof WorkPreferences, value: boolean) => {
    setMemory(prev => ({
      preferences: {
        ...prev.preferences,
        workPreferences: {
          ...prev.preferences.workPreferences,
          [key]: value,
        },
        lastUpdated: new Date(),
        detectedFromChat: false,
      },
    }));
  }, []);

  const setOccasion = useCallback((occasion: TripContext["occasion"]) => {
    setMemory(prev => ({
      preferences: {
        ...prev.preferences,
        tripContext: { ...prev.preferences.tripContext, occasion },
        lastUpdated: new Date(),
        detectedFromChat: false,
      },
    }));
  }, []);

  const setFlexibility = useCallback((flexibility: TripContext["flexibility"]) => {
    setMemory(prev => ({
      preferences: {
        ...prev.preferences,
        tripContext: { ...prev.preferences.tripContext, flexibility },
        lastUpdated: new Date(),
        detectedFromChat: false,
      },
    }));
  }, []);

  // Legacy methods
  const setPace = useCallback((pace: TripPreferences["pace"]) => {
    setMemory(prev => {
      // Sync with styleAxes.chillVsIntense
      const chillVsIntense = pace === "relaxed" ? 20 : pace === "moderate" ? 50 : 80;
      return {
        preferences: {
          ...prev.preferences,
          pace,
          styleAxes: { ...prev.preferences.styleAxes, chillVsIntense },
          lastUpdated: new Date(),
          detectedFromChat: false,
        },
      };
    });
  }, []);

  const setComfortLevel = useCallback((comfortLevel: number) => {
    const clamped = Math.max(0, Math.min(100, comfortLevel));
    setMemory(prev => ({
      preferences: {
        ...prev.preferences,
        comfortLevel: clamped,
        styleAxes: { ...prev.preferences.styleAxes, ecoVsLuxury: clamped },
        lastUpdated: new Date(),
        detectedFromChat: false,
      },
    }));
  }, []);

  const toggleDietaryRestriction = useCallback((restriction: string) => {
    setMemory(prev => {
      const dietaryRestrictions = prev.preferences.dietaryRestrictions.includes(restriction)
        ? prev.preferences.dietaryRestrictions.filter(r => r !== restriction)
        : [...prev.preferences.dietaryRestrictions, restriction];
      return {
        preferences: { ...prev.preferences, dietaryRestrictions, lastUpdated: new Date(), detectedFromChat: false },
      };
    });
  }, []);

  const toggleAccessibilityNeed = useCallback((need: string) => {
    setMemory(prev => {
      const accessibilityNeeds = prev.preferences.accessibilityNeeds.includes(need)
        ? prev.preferences.accessibilityNeeds.filter(n => n !== need)
        : [...prev.preferences.accessibilityNeeds, need];
      
      // Sync with mustHaves
      const hasWheelchair = accessibilityNeeds.includes("wheelchair");
      return {
        preferences: {
          ...prev.preferences,
          accessibilityNeeds,
          mustHaves: { ...prev.preferences.mustHaves, accessibilityRequired: hasWheelchair },
          lastUpdated: new Date(),
          detectedFromChat: false,
        },
      };
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    setMemory({ preferences: { ...defaultPreferences, id: crypto.randomUUID() } });
  }, []);

  // ============================================================================
  // GETTERS
  // ============================================================================

  const getPreferences = useCallback((): TripPreferences => memory.preferences, [memory.preferences]);

  const getComfortLabel = useCallback((): "Économique" | "Confort" | "Premium" | "Luxe" => {
    const level = memory.preferences.styleAxes.ecoVsLuxury;
    if (level < 25) return "Économique";
    if (level < 50) return "Confort";
    if (level < 75) return "Premium";
    return "Luxe";
  }, [memory.preferences.styleAxes.ecoVsLuxury]);

  const getProfileCompletion = useCallback((): number => {
    const p = memory.preferences;
    let score = 0;
    const weights = { travelStyle: 15, interests: 25, styleAxes: 30, mustHaves: 15, occasion: 15 };
    
    // Travel style selected (not default)
    if (p.travelStyle !== "couple") score += weights.travelStyle;
    else score += weights.travelStyle * 0.5; // Default still counts partially
    
    // Interests (at least 2)
    score += Math.min(1, p.interests.length / 2) * weights.interests;
    
    // Style axes modified (any deviation from 50)
    const axesModified = Object.values(p.styleAxes).filter(v => Math.abs(v - 50) > 10).length;
    score += (axesModified / 4) * weights.styleAxes;
    
    // Must-haves (any set)
    const mustHavesSet = Object.values(p.mustHaves).filter(Boolean).length;
    score += Math.min(1, mustHavesSet / 1) * weights.mustHaves;
    
    // Occasion set
    if (p.tripContext.occasion) score += weights.occasion;
    
    return Math.round(score);
  }, [memory.preferences]);

  const getPreferenceSummary = useCallback((): string => {
    const p = memory.preferences;
    const comfortLabel = getComfortLabel().toLowerCase();
    
    const styleLabels = {
      travelStyle: { solo: "solo", couple: "en couple", family: "en famille", friends: "entre amis", pet: "avec animal" },
    };
    
    let summary = `Voyage ${styleLabels.travelStyle[p.travelStyle]}`;
    summary += `, niveau ${comfortLabel}.`;
    
    if (p.interests.length > 0) {
      summary += ` Intérêts: ${p.interests.slice(0, 3).join(", ")}.`;
    }
    
    if (p.tripContext.occasion) {
      const occasionLabels: Record<string, string> = {
        honeymoon: "lune de miel",
        anniversary: "anniversaire",
        birthday: "anniversaire",
        vacation: "vacances",
        workation: "workation",
      };
      summary += ` Occasion: ${occasionLabels[p.tripContext.occasion] || p.tripContext.occasion}.`;
    }

    return summary;
  }, [memory.preferences, getComfortLabel]);

  // ============================================================================
  // COMPUTED FILTERS FOR OTHER WIDGETS
  // ============================================================================

  const getHotelFilters = useCallback((): HotelFiltersFromPreferences => {
    const p = memory.preferences;
    const comfort = p.styleAxes.ecoVsLuxury;
    
    // Price ranges based on comfort
    let priceMin = 0, priceMax = 500, minStars = 2;
    if (comfort < 25) {
      priceMax = 80; minStars = 2;
    } else if (comfort < 50) {
      priceMax = 150; minStars = 3;
    } else if (comfort < 75) {
      priceMin = 50; priceMax = 300; minStars = 4;
    } else {
      priceMin = 100; priceMax = 500; minStars = 4;
    }
    
    // Amenities based on must-haves
    const amenities: string[] = [];
    if (p.mustHaves.highSpeedWifi || p.workPreferences.needsWifi) amenities.push("wifi");
    if (p.mustHaves.accessibilityRequired) amenities.push("wheelchair");
    if (p.mustHaves.petFriendly) amenities.push("pet-friendly");
    if (p.mustHaves.familyFriendly) amenities.push("family-rooms");
    
    // Types based on travel style
    let types: string[] = ["hotel"];
    if (p.travelStyle === "family") types = ["hotel", "apartment"];
    else if (p.travelStyle === "couple" && comfort > 70) types = ["hotel", "villa"];
    else if (p.travelStyle === "friends") types = ["apartment", "hotel"];
    
    return { priceMin, priceMax, minStars, amenities, types };
  }, [memory.preferences]);

  const getActivityFilters = useCallback((): ActivityFiltersFromPreferences => {
    const p = memory.preferences;
    const comfort = p.styleAxes.ecoVsLuxury;
    
    // Price range based on comfort
    let priceRange: [number, number] = [0, 500];
    if (comfort < 25) priceRange = [0, 30];
    else if (comfort < 50) priceRange = [0, 80];
    else if (comfort < 75) priceRange = [0, 150];
    
    // Rating based on comfort
    let ratingMin = 3.5;
    if (comfort >= 75) ratingMin = 4.5;
    else if (comfort >= 50) ratingMin = 4.0;
    
    // Categories from interests
    const categories = [...p.interests];
    
    // Time of day from chillVsIntense
    const timeOfDay: string[] = [];
    if (p.styleAxes.chillVsIntense < 40) {
      timeOfDay.push("morning", "afternoon"); // Relaxed = daytime
    } else if (p.styleAxes.chillVsIntense > 60) {
      timeOfDay.push("afternoon", "evening", "night"); // Intense = all day + night
    }
    
    return { categories, priceRange, ratingMin, timeOfDay };
  }, [memory.preferences]);

  const getFlightPreferences = useCallback((): FlightPreferencesComputed => {
    const p = memory.preferences;
    const comfort = p.styleAxes.ecoVsLuxury;
    
    let cabinClass: FlightPreferencesComputed["cabinClass"] = "economy";
    if (comfort >= 85) cabinClass = "business";
    else if (comfort >= 70) cabinClass = "premium_economy";
    
    const flexibility = p.tripContext.flexibility === "very_flexible" 
      ? "very_flexible" 
      : p.tripContext.flexibility === "flexible" 
        ? "flexible" 
        : "exact";
    
    return { cabinClass, flexibility };
  }, [memory.preferences]);

  const getSerializedState = useCallback((): Record<string, unknown> => ({
    ...memory.preferences,
    comfortLabel: getComfortLabel(),
    profileCompletion: getProfileCompletion(),
  }), [memory.preferences, getComfortLabel, getProfileCompletion]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value = useMemo<PreferenceMemoryContextValue>(() => ({
    memory,
    updatePreferences,
    setStyleAxis,
    setTravelStyle,
    toggleInterest,
    toggleMustHave,
    setWorkPreference,
    setOccasion,
    setFlexibility,
    setPace,
    setComfortLevel,
    toggleDietaryRestriction,
    toggleAccessibilityNeed,
    getPreferences,
    getPreferenceSummary,
    getComfortLabel,
    getProfileCompletion,
    getHotelFilters,
    getActivityFilters,
    getFlightPreferences,
    resetToDefaults,
    getSerializedState,
  }), [
    memory,
    updatePreferences,
    setStyleAxis,
    setTravelStyle,
    toggleInterest,
    toggleMustHave,
    setWorkPreference,
    setOccasion,
    setFlexibility,
    setPace,
    setComfortLevel,
    toggleDietaryRestriction,
    toggleAccessibilityNeed,
    getPreferences,
    getPreferenceSummary,
    getComfortLabel,
    getProfileCompletion,
    getHotelFilters,
    getActivityFilters,
    getFlightPreferences,
    resetToDefaults,
    getSerializedState,
  ]);

  return (
    <PreferenceMemoryContext.Provider value={value}>
      {children}
    </PreferenceMemoryContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function usePreferenceMemory(): PreferenceMemoryContextValue {
  const context = useContext(PreferenceMemoryContext);
  if (!context) {
    throw new Error("usePreferenceMemory must be used within PreferenceMemoryProvider");
  }
  return context;
}
