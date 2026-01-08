/**
 * SmartTagsWidget
 * Displays top 3 hashtags based on user chat interactions.
 * Calculates hashtags every X messages and allows user to edit them.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Hash, X, Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { eventBus } from "@/lib/eventBus";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePreferenceMemory } from "@/contexts/PreferenceMemoryContext";

interface SmartTagsWidgetProps {
  className?: string;
}

// Hashtags prédéfinis par catégorie
const HASHTAG_CATEGORIES = {
  style: ["#Aventurier", "#Explorateur", "#Détente", "#Luxe", "#Budget", "#Nature", "#Urbain", "#Culture"],
  mood: ["#Romantique", "#Famille", "#Solo", "#EntreAmis", "#Fête", "#Zen", "#Sport", "#Foodie"],
  interest: ["#Plage", "#Montagne", "#Histoire", "#Gastronomie", "#Shopping", "#Wellness", "#Photo", "#Nightlife"],
};

const ALL_HASHTAGS = [...HASHTAG_CATEGORIES.style, ...HASHTAG_CATEGORIES.mood, ...HASHTAG_CATEGORIES.interest];

const STORAGE_KEY = "travliaq_smart_tags";
const MESSAGES_THRESHOLD = 5; // Recalculate every N messages

interface StoredTags {
  tags: string[];
  messageCount: number;
  lastCalculated: string;
  isManuallySet: boolean;
}

function loadStoredTags(): StoredTags {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn("[SmartTags] Failed to load:", e);
  }
  return { tags: [], messageCount: 0, lastCalculated: "", isManuallySet: false };
}

function saveStoredTags(data: StoredTags) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("[SmartTags] Failed to save:", e);
  }
}

// Helper function to calculate tags from preferences object
function calculateTagsFromPrefs(prefs: unknown): string[] {
  const calculatedTags: string[] = [];
  const p = prefs as Record<string, unknown>;
  const travelStyle = p.travelStyle as string;
  if (travelStyle === "solo") calculatedTags.push("#Solo");
  else if (travelStyle === "couple") calculatedTags.push("#Romantique");
  else if (travelStyle === "family") calculatedTags.push("#Famille");
  else if (travelStyle === "friends") calculatedTags.push("#EntreAmis");
  
  const styleAxes = p.styleAxes as { chillVsIntense?: number; cityVsNature?: number; ecoVsLuxury?: number; touristVsLocal?: number } | undefined;
  if (styleAxes) {
    if (styleAxes.chillVsIntense && styleAxes.chillVsIntense > 70) calculatedTags.push("#Aventurier");
    else if (styleAxes.chillVsIntense && styleAxes.chillVsIntense < 30) calculatedTags.push("#Détente");
    if (styleAxes.cityVsNature && styleAxes.cityVsNature > 70) calculatedTags.push("#Nature");
    else if (styleAxes.cityVsNature && styleAxes.cityVsNature < 30) calculatedTags.push("#Urbain");
    if (styleAxes.ecoVsLuxury && styleAxes.ecoVsLuxury > 75) calculatedTags.push("#Luxe");
    else if (styleAxes.ecoVsLuxury && styleAxes.ecoVsLuxury < 25) calculatedTags.push("#Budget");
  }
  
  const interests = p.interests as string[] | undefined;
  if (interests) {
    const map: Record<string, string> = { food: "#Foodie", culture: "#Culture", beach: "#Plage", nature: "#Nature", wellness: "#Wellness", sport: "#Sport", adventure: "#Aventurier", nightlife: "#Nightlife" };
    interests.forEach((i) => { if (map[i] && !calculatedTags.includes(map[i])) calculatedTags.push(map[i]); });
  }
  
  return [...new Set(calculatedTags)].slice(0, 3);
}

export function SmartTagsWidget({ className }: SmartTagsWidgetProps) {
  const { getPreferences, getProfileCompletion } = usePreferenceMemory();
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newTag, setNewTag] = useState("");
  const messageCountRef = useRef(0);
  const isManuallySetRef = useRef(false);
  const conversationBufferRef = useRef<string[]>([]);
  const hasInitializedRef = useRef(false);

  // Load stored tags on mount
  useEffect(() => {
    const stored = loadStoredTags();
    if (stored.tags.length > 0) {
      setTags(stored.tags);
      messageCountRef.current = stored.messageCount;
      isManuallySetRef.current = stored.isManuallySet;
      hasInitializedRef.current = true;
    }
  }, []);

  // Initialize from current preferences if no stored tags and profile has some data
  useEffect(() => {
    if (hasInitializedRef.current) return;
    
    const completion = getProfileCompletion();
    if (completion >= 25) {
      const prefs = getPreferences();
      // Calculate initial tags from current preferences
      const calculatedTags = calculateTagsFromPrefs(prefs);
      if (calculatedTags.length > 0) {
        setTags(calculatedTags);
        hasInitializedRef.current = true;
      }
    }
  }, [getPreferences, getProfileCompletion]);

  // Save when tags change
  useEffect(() => {
    if (tags.length > 0) {
      saveStoredTags({
        tags,
        messageCount: messageCountRef.current,
        lastCalculated: new Date().toISOString(),
        isManuallySet: isManuallySetRef.current,
      });
    }
  }, [tags]);

  // Calculate hashtags from preferences (local, no LLM call)
  const calculateHashtagsFromPreferences = useCallback((prefs: Record<string, unknown>) => {
    if (isManuallySetRef.current) return;
    
    const calculatedTags: string[] = [];
    
    // Travel style mapping
    const travelStyle = prefs.travelStyle as string;
    if (travelStyle === "solo") calculatedTags.push("#Solo");
    else if (travelStyle === "couple") calculatedTags.push("#Romantique");
    else if (travelStyle === "family") calculatedTags.push("#Famille");
    else if (travelStyle === "friends") calculatedTags.push("#EntreAmis");
    
    // Style axes
    const styleAxes = prefs.styleAxes as { chillVsIntense?: number; cityVsNature?: number; ecoVsLuxury?: number; touristVsLocal?: number } | undefined;
    if (styleAxes) {
      if (styleAxes.chillVsIntense && styleAxes.chillVsIntense > 70) calculatedTags.push("#Aventurier");
      else if (styleAxes.chillVsIntense && styleAxes.chillVsIntense < 30) calculatedTags.push("#Détente");
      
      if (styleAxes.cityVsNature && styleAxes.cityVsNature > 70) calculatedTags.push("#Nature");
      else if (styleAxes.cityVsNature && styleAxes.cityVsNature < 30) calculatedTags.push("#Urbain");
      
      if (styleAxes.ecoVsLuxury && styleAxes.ecoVsLuxury > 75) calculatedTags.push("#Luxe");
      else if (styleAxes.ecoVsLuxury && styleAxes.ecoVsLuxury < 25) calculatedTags.push("#Budget");
      
      if (styleAxes.touristVsLocal && styleAxes.touristVsLocal > 70) calculatedTags.push("#Explorateur");
    }
    
    // Interests mapping
    const interests = prefs.interests as string[] | undefined;
    if (interests && interests.length > 0) {
      const interestMap: Record<string, string> = {
        food: "#Foodie",
        culture: "#Culture",
        beach: "#Plage",
        nature: "#Nature",
        wellness: "#Wellness",
        sport: "#Sport",
        adventure: "#Aventurier",
        nightlife: "#Nightlife",
        shopping: "#Shopping",
        workation: "#Zen",
      };
      interests.forEach((i) => {
        if (interestMap[i] && !calculatedTags.includes(interestMap[i])) {
          calculatedTags.push(interestMap[i]);
        }
      });
    }
    
    // Get unique and take top 3
    const uniqueTags = [...new Set(calculatedTags)].slice(0, 3);
    if (uniqueTags.length > 0) {
      setTags(uniqueTags);
    }
  }, []);

  // Listen for preference updates instead of chat messages
  useEffect(() => {
    const handlePreferencesUpdated = (payload: { 
      preferences: Record<string, unknown>; 
      source: "chat" | "manual";
      fields: string[];
    }) => {
      // Only count chat-based updates
      if (payload.source !== "chat") return;
      
      messageCountRef.current += 1;
      conversationBufferRef.current.push(JSON.stringify(payload.preferences));

      // Recalculate every N updates
      if (messageCountRef.current % MESSAGES_THRESHOLD === 0 && !isManuallySetRef.current) {
        calculateHashtagsFromPreferences(payload.preferences);
      }
    };

    eventBus.on("preferences:updated", handlePreferencesUpdated);
    return () => {
      eventBus.off("preferences:updated", handlePreferencesUpdated);
    };
  }, [calculateHashtagsFromPreferences]);

  // Remove a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
    isManuallySetRef.current = true;
  };

  // Add a new tag
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    let tagToAdd = newTag.trim();
    if (!tagToAdd.startsWith("#")) {
      tagToAdd = "#" + tagToAdd;
    }
    
    // Capitalize first letter after #
    tagToAdd = "#" + tagToAdd.slice(1).charAt(0).toUpperCase() + tagToAdd.slice(2);
    
    if (tags.length < 3 && !tags.includes(tagToAdd)) {
      setTags((prev) => [...prev, tagToAdd]);
      isManuallySetRef.current = true;
    }
    setNewTag("");
    setIsEditing(false);
  };

  // Select from predefined
  const handleSelectPredefined = (tag: string) => {
    if (tags.length < 3 && !tags.includes(tag)) {
      setTags((prev) => [...prev, tag]);
      isManuallySetRef.current = true;
    }
  };

  // No tags yet
  if (tags.length === 0 && !isLoading) {
    return (
      <div className={cn(
        "flex items-center gap-2 text-xs text-muted-foreground/60 py-2",
        className
      )}>
        <Hash className="w-3 h-3" />
        <span className="italic">Tes hashtags apparaîtront après quelques échanges...</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
          <Sparkles className="h-3 w-3" />
          <span>Ton style</span>
        </div>
        {isLoading && (
          <span className="text-[10px] text-muted-foreground animate-pulse">
            Analyse...
          </span>
        )}
      </div>

      {/* Tags display */}
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 group cursor-pointer text-xs py-0.5 px-2"
          >
            {tag}
            <button
              onClick={() => handleRemoveTag(tag)}
              className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </Badge>
        ))}

        {/* Add button */}
        {tags.length < 3 && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-0.5 rounded-full border border-dashed border-muted-foreground/30 hover:border-primary/50"
          >
            <Plus className="w-3 h-3" />
            <span>Ajouter</span>
          </button>
        )}
      </div>

      {/* Edit mode */}
      {isEditing && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="#MonHashtag"
              className="h-7 text-xs"
              onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              autoFocus
            />
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              onClick={handleAddTag}
            >
              OK
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs text-muted-foreground"
              onClick={() => {
                setIsEditing(false);
                setNewTag("");
              }}
            >
              ✕
            </Button>
          </div>

          {/* Suggestions */}
          <div className="flex flex-wrap gap-1">
            {ALL_HASHTAGS
              .filter((h) => !tags.includes(h))
              .slice(0, 8)
              .map((hashtag) => (
                <button
                  key={hashtag}
                  onClick={() => handleSelectPredefined(hashtag)}
                  className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {hashtag}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SmartTagsWidget;
