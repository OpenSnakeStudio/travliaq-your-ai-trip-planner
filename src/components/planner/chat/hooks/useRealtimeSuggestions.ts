/**
 * useRealtimeSuggestions - Real-time typing suggestions
 * 
 * Provides smart suggestions as the user types, with debouncing
 * to avoid performance issues.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { analyzeUserIntent, detectLanguage } from '../services/messageAnalyzer';

export interface RealtimeSuggestion {
  id: string;
  label: string;
  completion: string; // Text to append/replace
  emoji?: string;
}

interface UseRealtimeSuggestionsOptions {
  inputValue: string;
  isEnabled?: boolean;
  debounceMs?: number;
  maxSuggestions?: number;
}

// Quick completions based on partial input patterns
const COMPLETION_PATTERNS = {
  fr: [
    { trigger: /^je\s+(veux|voudrais)\s+partir\s*$/i, suggestions: [
      { id: 'alone', label: 'seul', completion: ' seul', emoji: '🧳' },
      { id: 'couple', label: 'en couple', completion: ' en couple', emoji: '💑' },
      { id: 'family', label: 'en famille', completion: ' en famille', emoji: '👨‍👩‍👧' },
    ]},
    { trigger: /^(je\s+cherche|trouve[- ]moi)\s*$/i, suggestions: [
      { id: 'flights', label: 'des vols', completion: ' des vols pour', emoji: '✈️' },
      { id: 'hotels', label: 'un hôtel', completion: ' un hôtel à', emoji: '🏨' },
      { id: 'weekend', label: 'un weekend', completion: ' un weekend au soleil', emoji: '☀️' },
    ]},
    { trigger: /^budget\s*$/i, suggestions: [
      { id: 'eco', label: 'économique', completion: ' économique (moins de 500€)', emoji: '💰' },
      { id: 'mid', label: 'confort', completion: ' confort (500-1000€)', emoji: '💵' },
      { id: 'premium', label: 'premium', completion: ' premium (plus de 1000€)', emoji: '💎' },
    ]},
    { trigger: /^(en|pour)\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s*$/i, suggestions: [
      { id: 'weekend', label: 'un weekend', completion: ', un weekend', emoji: '📅' },
      { id: 'week', label: 'une semaine', completion: ', une semaine', emoji: '📆' },
      { id: 'twoweeks', label: '2 semaines', completion: ', 2 semaines', emoji: '🗓️' },
    ]},
    { trigger: /^(compare|montre)[- ]?(moi)?\s*$/i, suggestions: [
      { id: 'flights', label: 'les vols', completion: ' les vols', emoji: '✈️' },
      { id: 'hotels', label: 'les hôtels', completion: ' les hôtels', emoji: '🏨' },
      { id: 'options', label: 'les options', completion: ' les options', emoji: '⚖️' },
    ]},
  ],
  en: [
    { trigger: /^i\s+(want|would like)\s+to\s+(travel|go)\s*$/i, suggestions: [
      { id: 'alone', label: 'solo', completion: ' solo', emoji: '🧳' },
      { id: 'couple', label: 'as a couple', completion: ' as a couple', emoji: '💑' },
      { id: 'family', label: 'with family', completion: ' with my family', emoji: '👨‍👩‍👧' },
    ]},
    { trigger: /^(i'm looking|find me|search)\s*$/i, suggestions: [
      { id: 'flights', label: 'flights', completion: ' flights to', emoji: '✈️' },
      { id: 'hotels', label: 'hotels', completion: ' hotels in', emoji: '🏨' },
      { id: 'weekend', label: 'a weekend getaway', completion: ' a sunny weekend getaway', emoji: '☀️' },
    ]},
    { trigger: /^budget\s*$/i, suggestions: [
      { id: 'eco', label: 'budget-friendly', completion: '-friendly (under $500)', emoji: '💰' },
      { id: 'mid', label: 'comfortable', completion: ' comfortable ($500-1000)', emoji: '💵' },
      { id: 'premium', label: 'premium', completion: ' premium (over $1000)', emoji: '💎' },
    ]},
    { trigger: /^(in|for)\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s*$/i, suggestions: [
      { id: 'weekend', label: 'a weekend', completion: ', a weekend', emoji: '📅' },
      { id: 'week', label: 'a week', completion: ', a week', emoji: '📆' },
      { id: 'twoweeks', label: '2 weeks', completion: ', 2 weeks', emoji: '🗓️' },
    ]},
    { trigger: /^(compare|show me)\s*$/i, suggestions: [
      { id: 'flights', label: 'flights', completion: ' the flights', emoji: '✈️' },
      { id: 'hotels', label: 'hotels', completion: ' the hotels', emoji: '🏨' },
      { id: 'options', label: 'options', completion: ' the options', emoji: '⚖️' },
    ]},
  ],
};

// Intent-based suggestions when user has typed enough
const INTENT_SUGGESTIONS = {
  fr: {
    wantsBudgetInfo: [
      { id: 'set-budget', label: 'Définir budget', completion: 'Mon budget est de ', emoji: '💰' },
    ],
    wantsComparison: [
      { id: 'compare', label: 'Comparer', completion: 'Compare ces options pour moi', emoji: '⚖️' },
    ],
    wantsMoreOptions: [
      { id: 'more', label: 'Plus d\'options', completion: 'Montre-moi d\'autres options', emoji: '🔄' },
    ],
    isPositive: [
      { id: 'book', label: 'Réserver', completion: 'Je réserve !', emoji: '✅' },
    ],
  },
  en: {
    wantsBudgetInfo: [
      { id: 'set-budget', label: 'Set budget', completion: 'My budget is ', emoji: '💰' },
    ],
    wantsComparison: [
      { id: 'compare', label: 'Compare', completion: 'Compare these options for me', emoji: '⚖️' },
    ],
    wantsMoreOptions: [
      { id: 'more', label: 'More options', completion: 'Show me other options', emoji: '🔄' },
    ],
    isPositive: [
      { id: 'book', label: 'Book it', completion: 'I\'ll book it!', emoji: '✅' },
    ],
  },
};

export function useRealtimeSuggestions({
  inputValue,
  isEnabled = true,
  debounceMs = 150,
  maxSuggestions = 3,
}: UseRealtimeSuggestionsOptions) {
  const [debouncedValue, setDebouncedValue] = useState(inputValue);
  
  // Debounce input
  useEffect(() => {
    if (!isEnabled) return;
    const timer = setTimeout(() => setDebouncedValue(inputValue), debounceMs);
    return () => clearTimeout(timer);
  }, [inputValue, debounceMs, isEnabled]);
  
  // Generate suggestions
  const suggestions = useMemo((): RealtimeSuggestion[] => {
    if (!isEnabled || !debouncedValue || debouncedValue.length < 2) {
      return [];
    }
    
    const lang = detectLanguage(debouncedValue);
    const patterns = COMPLETION_PATTERNS[lang];
    const intentSuggestions = INTENT_SUGGESTIONS[lang];
    
    // Check pattern-based completions first
    for (const pattern of patterns) {
      if (pattern.trigger.test(debouncedValue)) {
        return pattern.suggestions.slice(0, maxSuggestions);
      }
    }
    
    // Fall back to intent-based suggestions for longer input
    if (debouncedValue.length >= 8) {
      const intent = analyzeUserIntent(debouncedValue);
      
      for (const [key, value] of Object.entries(intent)) {
        if (value && intentSuggestions[key as keyof typeof intentSuggestions]) {
          return intentSuggestions[key as keyof typeof intentSuggestions].slice(0, maxSuggestions);
        }
      }
    }
    
    return [];
  }, [debouncedValue, isEnabled, maxSuggestions]);
  
  // Apply suggestion to input
  const applySuggestion = useCallback((suggestion: RealtimeSuggestion): string => {
    // If completion starts with space, append to current input
    if (suggestion.completion.startsWith(' ')) {
      return debouncedValue + suggestion.completion;
    }
    // Otherwise replace input entirely
    return suggestion.completion;
  }, [debouncedValue]);
  
  return {
    suggestions,
    applySuggestion,
    detectedLanguage: detectLanguage(debouncedValue),
  };
}
