/**
 * SuggestionEngine - Intelligent context-aware suggestion generation
 * 
 * Generates smart suggestions based on:
 * - Conversation history (what assistant just said)
 * - User intent analysis
 * - Current workflow step
 * - Trip data completion status
 * - Active visual context (map, panels)
 */

import { 
  analyzeLastAssistantMessage, 
  analyzeUserIntent, 
  getAnticipatedSuggestions,
  type AnticipatedSuggestion
} from './messageAnalyzer';

export interface SuggestionContext {
  // Workflow state
  workflowStep: 'inspiration' | 'destination' | 'dates' | 'travelers' | 'search' | 'compare' | 'book';
  
  // Trip data
  hasDestination: boolean;
  hasDates: boolean;
  hasTravelers: boolean;
  hasFlights: boolean;
  hasHotels: boolean;
  destinationName?: string;
  departureCity?: string;
  tripDuration?: number;
  
  // Visual context
  currentTab: 'flights' | 'stays' | 'activities' | 'preferences';
  visibleFlightsCount: number;
  visibleHotelsCount: number;
  visibleActivitiesCount: number;
  cheapestFlightPrice?: number;
  cheapestHotelPrice?: number;
  
  // Temporal context
  isWeekend?: boolean;
  nextMonth?: string;
  
  // Inspire flow state
  inspireFlowStep?: 'idle' | 'style' | 'interests' | 'extra' | 'must_haves' | 'dietary' | 'loading' | 'results';
  
  // Destinations proposed (not yet selected)
  hasProposedDestinations?: boolean;
  proposedDestinationNames?: string[];
  
  // Conversation context (for intelligent anticipation)
  lastAssistantMessage?: string;
  lastUserMessage?: string;
  conversationTurn?: number;
}

export interface Suggestion {
  id: string;
  label: string;
  message: string;
  iconName: 'sparkles' | 'sun' | 'building' | 'calendar' | 'zap' | 'user' | 'users' | 'plane' | 'scale' | 'sunrise' | 'star' | 'map-pin' | 'camera' | 'compass' | 'utensils' | 'search' | 'clock';
  emoji?: string; // For anticipated suggestions
}

// Get current month name in French
function getNextMonthName(): string {
  const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  return months[nextMonth.getMonth()];
}

// INSPIRATION suggestions (no destination yet)
function getInspirationSuggestions(): Suggestion[] {
  const nextMonth = getNextMonthName();
  return [
    {
      id: 'inspire',
      label: 'Inspire-moi',
      message: 'Inspire-moi pour mon prochain voyage',
      iconName: 'sparkles',
    },
    {
      id: 'weekend-sun',
      label: 'Weekend au soleil',
      message: 'Trouve-moi un weekend pas cher au soleil',
      iconName: 'sun',
    },
    {
      id: 'city-break',
      label: 'City break',
      message: 'Je veux faire un city break de 3-4 jours en Europe',
      iconName: 'building',
    },
    {
      id: 'where-month',
      label: `Où en ${nextMonth} ?`,
      message: `Où partir en ${nextMonth} ?`,
      iconName: 'calendar',
    },
  ];
}

// DESTINATION suggestions (has destination, no dates)
function getDatesSuggestions(context: SuggestionContext): Suggestion[] {
  const dest = context.destinationName || 'cette destination';
  return [
    {
      id: 'best-period',
      label: 'Meilleure période',
      message: `Quelle est la meilleure période pour visiter ${dest} ?`,
      iconName: 'calendar',
    },
    {
      id: 'this-weekend',
      label: 'Ce weekend',
      message: `Je veux partir ce weekend à ${dest}`,
      iconName: 'zap',
    },
    {
      id: 'next-week',
      label: 'Semaine prochaine',
      message: 'Je peux partir la semaine prochaine',
      iconName: 'calendar',
    },
  ];
}

// TRAVELERS suggestions (has dates, no travelers)
function getTravelersSuggestions(): Suggestion[] {
  return [
    {
      id: 'solo',
      label: 'Voyage solo',
      message: 'Je voyage seul',
      iconName: 'user',
    },
    {
      id: 'couple',
      label: 'En couple',
      message: 'Nous sommes 2 adultes',
      iconName: 'users',
    },
    {
      id: 'family',
      label: 'En famille',
      message: 'Nous voyageons en famille avec enfants',
      iconName: 'users',
    },
  ];
}

// FLIGHTS TAB suggestions
function getFlightSuggestions(context: SuggestionContext): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const dest = context.destinationName || 'cette destination';
  
  // If cheapest price is visible
  if (context.cheapestFlightPrice) {
    suggestions.push({
      id: 'cheapest-flight',
      label: `Vol à ${context.cheapestFlightPrice}€`,
      message: `Parle-moi du vol le moins cher à ${context.cheapestFlightPrice}€`,
      iconName: 'plane',
    });
  }
  
  // If multiple flights visible
  if (context.visibleFlightsCount > 2) {
    suggestions.push({
      id: 'compare-flights',
      label: 'Compare les vols',
      message: 'Compare les vols affichés et recommande-moi le meilleur',
      iconName: 'scale',
    });
  }
  
  suggestions.push({
    id: 'morning-flight',
    label: 'Départ le matin',
    message: 'Je préfère partir le matin',
    iconName: 'sunrise',
  });
  
  // If no flights visible, show search prompt
  if (context.visibleFlightsCount === 0) {
    suggestions.unshift({
      id: 'find-flights',
      label: 'Chercher des vols',
      message: `Trouve-moi les meilleurs vols pour ${dest}`,
      iconName: 'search',
    });
  }
  
  return suggestions;
}

// STAYS TAB suggestions
function getStaysSuggestions(context: SuggestionContext): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const dest = context.destinationName || 'cette destination';
  
  // If cheapest hotel price visible
  if (context.cheapestHotelPrice) {
    suggestions.push({
      id: 'best-value',
      label: 'Meilleur rapport qualité/prix',
      message: 'Quel hôtel a le meilleur rapport qualité/prix parmi ceux affichés ?',
      iconName: 'star',
    });
  }
  
  suggestions.push({
    id: 'central-location',
    label: 'Proche du centre',
    message: `Je veux un hôtel bien situé, proche du centre de ${dest}`,
    iconName: 'map-pin',
  });
  
  // If hotels are visible
  if (context.visibleHotelsCount > 2) {
    suggestions.push({
      id: 'compare-hotels',
      label: 'Compare les hôtels',
      message: 'Compare les hôtels affichés et dis-moi lequel choisir',
      iconName: 'scale',
    });
  } else {
    suggestions.push({
      id: 'find-hotels',
      label: 'Chercher des hôtels',
      message: `Trouve-moi des hôtels à ${dest}`,
      iconName: 'search',
    });
  }
  
  return suggestions;
}

// ACTIVITIES TAB suggestions
function getActivitiesSuggestions(context: SuggestionContext): Suggestion[] {
  const dest = context.destinationName || 'cette destination';
  
  return [
    {
      id: 'must-see',
      label: 'Incontournables',
      message: `Quels sont les incontournables à ${dest} ?`,
      iconName: 'camera',
    },
    {
      id: 'hidden-gems',
      label: 'Hors des sentiers',
      message: `Quels sont les endroits moins touristiques à ${dest} ?`,
      iconName: 'compass',
    },
    {
      id: 'local-food',
      label: 'Gastronomie locale',
      message: `Où manger local à ${dest} ? Quels plats goûter ?`,
      iconName: 'utensils',
    },
  ];
}

// PREFERENCES TAB suggestions
function getPreferencesSuggestions(context: SuggestionContext): Suggestion[] {
  const dest = context.destinationName || 'mon voyage';
  
  return [
    {
      id: 'optimize-trip',
      label: 'Optimise mon voyage',
      message: `Comment optimiser mon séjour à ${dest} ?`,
      iconName: 'sparkles',
    },
    {
      id: 'itinerary',
      label: 'Créer un itinéraire',
      message: `Propose-moi un itinéraire jour par jour pour ${dest}`,
      iconName: 'calendar',
    },
    {
      id: 'budget-tips',
      label: 'Astuces budget',
      message: `Comment économiser sur ce voyage ?`,
      iconName: 'star',
    },
  ];
}

// SEARCH READY suggestions (all info but no search yet)
function getSearchReadySuggestions(context: SuggestionContext): Suggestion[] {
  const dest = context.destinationName || 'ma destination';
  
  return [
    {
      id: 'launch-search',
      label: 'Lancer la recherche',
      message: 'Recherche les meilleurs vols maintenant',
      iconName: 'search',
    },
    {
      id: 'direct-flights',
      label: 'Vols directs',
      message: 'Je préfère les vols directs uniquement',
      iconName: 'plane',
    },
    {
      id: 'best-time',
      label: 'Meilleur horaire',
      message: `À quelle heure partir pour ${dest} ?`,
      iconName: 'clock',
    },
  ];
}

// DESTINATION CHOICE suggestions (after inspire flow, destinations proposed)
function getDestinationChoiceSuggestions(context: SuggestionContext): Suggestion[] {
  const destinations = context.proposedDestinationNames || [];
  const suggestions: Suggestion[] = [
    {
      id: 'choose-for-me',
      label: 'Choisis pour moi',
      message: 'Choisis la meilleure destination pour moi',
      iconName: 'sparkles',
    },
  ];
  
  if (destinations.length > 0) {
    suggestions.push({
      id: 'more-about-first',
      label: `Plus sur ${destinations[0]}`,
      message: `Dis-moi en plus sur ${destinations[0]}`,
      iconName: 'compass',
    });
  }
  
  suggestions.push({
    id: 'other-destinations',
    label: 'Autres destinations',
    message: 'Propose-moi d\'autres destinations',
    iconName: 'search',
  });
  
  return suggestions;
}

/**
 * Convert anticipated suggestions to standard suggestions format
 */
function convertAnticipatedToSuggestion(anticipated: AnticipatedSuggestion): Suggestion {
  // Map emoji to appropriate icon
  const emojiToIcon: Record<string, Suggestion['iconName']> = {
    '✨': 'sparkles',
    '☀️': 'sun',
    '🏙️': 'building',
    '🌍': 'compass',
    '📍': 'map-pin',
    '🎯': 'sparkles',
    '🔄': 'search',
    '📅': 'calendar',
    '📆': 'calendar',
    '🗓️': 'calendar',
    '🤷': 'user',
    '🧳': 'user',
    '💑': 'users',
    '👥': 'users',
    '👨‍👩‍👧': 'users',
    '💰': 'star',
    '💵': 'star',
    '💎': 'star',
    '💶': 'star',
    '⚡': 'zap',
    '✈️': 'plane',
    '⚖️': 'scale',
    '⭐': 'star',
    '🏊': 'star',
    '✅': 'star',
    '📋': 'calendar',
    '🆓': 'star',
    '👍': 'sparkles',
    '👎': 'user',
    'ℹ️': 'star',
    '▶️': 'zap',
    '🏨': 'building',
    '✏️': 'star',
    '❓': 'sparkles',
  };
  
  return {
    id: anticipated.id,
    label: anticipated.label,
    message: anticipated.message,
    iconName: emojiToIcon[anticipated.emoji || ''] || 'sparkles',
    emoji: anticipated.emoji,
  };
}

/**
 * Main function to get contextual suggestions
 * Prioritizes intelligent anticipated suggestions based on conversation context
 */
export function getSuggestions(context: SuggestionContext): Suggestion[] {
  // 1. INTELLIGENT ANTICIPATION - Based on last assistant message
  // This takes highest priority when we have conversation context
  if (context.lastAssistantMessage) {
    const lastContent = analyzeLastAssistantMessage(context.lastAssistantMessage);
    const userIntent = analyzeUserIntent(context.lastUserMessage);
    const conversationTurn = context.conversationTurn ?? 0;
    
    const anticipated = getAnticipatedSuggestions(lastContent, userIntent, conversationTurn);
    
    if (anticipated.length > 0) {
      return anticipated.map(convertAnticipatedToSuggestion).slice(0, 4);
    }
  }
  
  // 2. DESTINATIONS PROPOSED - after inspire flow with results
  if (context.inspireFlowStep === 'results' || context.hasProposedDestinations) {
    return getDestinationChoiceSuggestions(context).slice(0, 3);
  }
  
  // 3. During inspire flow (widgets active) - no static suggestions
  if (context.inspireFlowStep && context.inspireFlowStep !== 'idle') {
    return []; // Let widgets take precedence
  }
  
  // 4. INSPIRATION - no destination yet, show inspiring suggestions
  if (!context.hasDestination) {
    return getInspirationSuggestions().slice(0, 3);
  }
  
  // 5. Has destination but no dates - help them pick dates
  if (!context.hasDates) {
    return getDatesSuggestions(context).slice(0, 3);
  }
  
  // 6. Has destination & dates but no travelers
  if (!context.hasTravelers) {
    return getTravelersSuggestions().slice(0, 3);
  }
  
  // 7. SEARCH READY (all info but on flights tab with no visible flights)
  if (context.currentTab === 'flights' && context.visibleFlightsCount === 0) {
    return getSearchReadySuggestions(context).slice(0, 3);
  }
  
  // 8. TAB-BASED suggestions
  switch (context.currentTab) {
    case 'flights':
      return getFlightSuggestions(context).slice(0, 3);
    case 'stays':
      return getStaysSuggestions(context).slice(0, 3);
    case 'activities':
      return getActivitiesSuggestions(context).slice(0, 3);
    case 'preferences':
      return getPreferencesSuggestions(context).slice(0, 3);
    default:
      // Fallback to inspiration if nothing else matches
      return getInspirationSuggestions().slice(0, 3);
  }
}

/**
 * Determine workflow step from context
 */
export function getWorkflowStep(context: Omit<SuggestionContext, 'workflowStep'>): SuggestionContext['workflowStep'] {
  if (!context.hasDestination) return 'inspiration';
  if (!context.hasDates) return 'destination';
  if (!context.hasTravelers) return 'dates';
  if (!context.hasFlights && context.currentTab === 'flights') return 'search';
  return 'compare';
}
