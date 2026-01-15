/**
 * Message Analyzer - Intelligent conversation analysis for anticipating user intent
 * 
 * Analyzes the last assistant message to detect what was proposed,
 * and predicts the most likely user responses to generate smart suggestions.
 * 
 * BILINGUAL: Supports both French and English patterns.
 */

export type ProposedContentType = 
  | 'destinations'
  | 'dates_question'
  | 'travelers_question'
  | 'budget_question'
  | 'flights'
  | 'hotels'
  | 'activities'
  | 'destination_info'
  | 'confirmation'
  | 'open_question'
  | 'greeting'
  | 'unknown';

export interface LastProposedContent {
  type: ProposedContentType;
  items?: string[];           // Extracted options (destination names, etc.)
  questionTopic?: string;     // What the question is about
  isAskingForChoice?: boolean;
}

export interface UserIntent {
  wantsBudgetInfo?: boolean;
  wantsDateInfo?: boolean;
  wantsComparison?: boolean;
  wantsMoreOptions?: boolean;
  wantsToBook?: boolean;
  mentionedBudget?: string;
  mentionedDestination?: string;
  isPositive?: boolean;
  isNegative?: boolean;
  isUndecided?: boolean;
}

// ============================================================================
// BILINGUAL PATTERNS - French and English
// ============================================================================

// Patterns for detecting what the assistant proposed
const DESTINATION_PATTERNS = [
  // French
  /voici\s+(\d+)\s+destinations?/i,
  /je te propose\s+(\d+)\s+destinations?/i,
  /destinations?\s+(parfaites?|idéales?|recommandées?)/i,
  /pour toi\s*:\s*([\w\s,]+)/i,
  /que penses-tu de\s+([\w\s]+)\s*\?/i,
  /découvrir\s+([\w\s]+)\s*\?/i,
  // English
  /here\s+are\s+(\d+)\s+destinations?/i,
  /i\s+suggest\s+(\d+)\s+destinations?/i,
  /destinations?\s+(perfect|ideal|recommended)/i,
  /for\s+you\s*:\s*([\w\s,]+)/i,
  /what\s+do\s+you\s+think\s+(of|about)\s+([\w\s]+)\s*\?/i,
  /discover\s+([\w\s]+)\s*\?/i,
  /how\s+about\s+([\w\s]+)\s*\?/i,
  // Common destinations (work for both)
  /(thaïlande|thailand|bali|vietnam|japon|japan|grèce|greece|espagne|spain|italie|italy|portugal|maroc|morocco|mexique|mexico)/i,
];

const DATES_QUESTION_PATTERNS = [
  // French
  /quand\s+(souhaitez-vous|veux-tu|voulez-vous)\s+partir/i,
  /quelles?\s+dates?\s+(préférez-vous|te convien)/i,
  /à quelle période/i,
  /pour combien de (temps|jours|nuits)/i,
  /durée\s+(du voyage|souhaitée)/i,
  /dates?\s+de\s+départ/i,
  // English
  /when\s+(would you like|do you want)\s+to\s+(leave|travel|go|depart)/i,
  /what\s+dates?\s+(do you prefer|work for you)/i,
  /which\s+period/i,
  /for\s+how\s+(long|many days|many nights)/i,
  /(trip|travel)\s+duration/i,
  /departure\s+dates?/i,
  /when\s+are\s+you\s+(thinking|planning)/i,
];

const TRAVELERS_QUESTION_PATTERNS = [
  // French
  /combien\s+(serez-vous|êtes-vous|de personnes)/i,
  /(voyagez-vous|pars-tu)\s+(seul|en couple|en famille|entre amis)/i,
  /nombre\s+de\s+voyageurs?/i,
  /qui\s+(vous accompagne|t'accompagne)/i,
  // English
  /how\s+many\s+(people|travelers|travellers|guests|passengers)/i,
  /(are you|will you be)\s+travel(l)?ing\s+(alone|solo|as a couple|with family|with friends)/i,
  /number\s+of\s+(travelers|travellers|guests|passengers)/i,
  /who\s+(is|will be)\s+(joining|coming|accompanying)/i,
  /traveling\s+with\s+anyone/i,
];

const BUDGET_QUESTION_PATTERNS = [
  // French
  /quel\s+(est ton|est votre)\s+budget/i,
  /budget\s+(prévu|souhaité|estimé)/i,
  /combien\s+(souhaitez-vous|veux-tu)\s+dépenser/i,
  /fourchette\s+de\s+prix/i,
  // English
  /what('s| is)\s+(your)?\s*budget/i,
  /budget\s+(expected|planned|estimated)/i,
  /how\s+much\s+(would you like|do you want)\s+to\s+spend/i,
  /price\s+range/i,
  /what\s+can\s+you\s+afford/i,
];

const FLIGHTS_PATTERNS = [
  // French
  /voici\s+(les|des)\s+vols?/i,
  /j'ai trouvé\s+(\d+)\s+vols?/i,
  /options?\s+de\s+vol/i,
  /vols?\s+(disponibles?|pour)/i,
  /billets?\s+d'avion/i,
  // English
  /here\s+are\s+(the|some)\s+flights?/i,
  /i('ve)?\s+found\s+(\d+)\s+flights?/i,
  /flight\s+options?/i,
  /flights?\s+(available|for)/i,
  /plane\s+tickets?/i,
  /available\s+flights/i,
];

const HOTELS_PATTERNS = [
  // French
  /voici\s+(les|des)\s+hôtels?/i,
  /j'ai trouvé\s+(\d+)\s+hôtels?/i,
  /hébergements?\s+(disponibles?|recommandés?)/i,
  /options?\s+d'hébergement/i,
  /où\s+dormir/i,
  // English
  /here\s+are\s+(the|some)\s+hotels?/i,
  /i('ve)?\s+found\s+(\d+)\s+hotels?/i,
  /accommodations?\s+(available|recommended)/i,
  /accommodation\s+options?/i,
  /where\s+to\s+stay/i,
  /lodging\s+options?/i,
];

const ACTIVITIES_PATTERNS = [
  // French
  /voici\s+(les|des)\s+activités?/i,
  /j'ai trouvé\s+(\d+)\s+activités?/i,
  /choses?\s+à\s+faire/i,
  /que\s+faire\s+à/i,
  /expériences?\s+(recommandées?|à\s+ne\s+pas\s+manquer)/i,
  // English
  /here\s+are\s+(the|some)\s+activities/i,
  /i('ve)?\s+found\s+(\d+)\s+activities/i,
  /things\s+to\s+do/i,
  /what\s+to\s+do\s+(in|at)/i,
  /experiences?\s+(recommended|not to miss|must-do)/i,
];

const DESTINATION_INFO_PATTERNS = [
  // French
  /est\s+(idéal|parfait|recommandé)\s+(en|pour)/i,
  /meilleure\s+période/i,
  /climat\s+(est|sera)/i,
  /température\s+moyenne/i,
  /à\s+savoir\s+sur/i,
  /voici\s+ce\s+que\s+tu\s+dois\s+savoir/i,
  // English
  /is\s+(ideal|perfect|recommended)\s+(in|for)/i,
  /best\s+(time|period|season)/i,
  /climate\s+(is|will be)/i,
  /average\s+temperature/i,
  /to\s+know\s+about/i,
  /here('s| is)\s+what\s+you\s+(should|need to)\s+know/i,
];

const CONFIRMATION_PATTERNS = [
  // French
  /c'est\s+noté/i,
  /parfait\s*!/i,
  /excellent\s+choix/i,
  /j'ai\s+bien\s+enregistré/i,
  /on\s+récapitule/i,
  // English
  /noted/i,
  /perfect\s*!/i,
  /excellent\s+choice/i,
  /i('ve)?\s+(saved|recorded|noted)/i,
  /let('s)?\s+recap/i,
  /got\s+it/i,
];

const GREETING_PATTERNS = [
  // French
  /bonjour/i,
  /bienvenue/i,
  /comment\s+puis-je\s+t'aider/i,
  /en quoi\s+puis-je/i,
  /prêt\s+à\s+planifier/i,
  // English
  /hello/i,
  /welcome/i,
  /how\s+can\s+i\s+help/i,
  /what\s+can\s+i\s+do\s+for\s+you/i,
  /ready\s+to\s+plan/i,
  /hi\s+there/i,
  /hey\s+there/i,
];

/**
 * Extract destination names from text (bilingual)
 */
function extractDestinationNames(text: string): string[] {
  const destinations: string[] = [];
  
  // Common destination names (work for both FR and EN)
  const knownDestinations = [
    'Thaïlande', 'Thailand', 'Bali', 'Vietnam', 'Japon', 'Japan',
    'Grèce', 'Greece', 'Espagne', 'Spain', 'Italie', 'Italy',
    'Portugal', 'Maroc', 'Morocco', 'Mexique', 'Mexico',
    'Croatie', 'Croatia', 'Turquie', 'Turkey', 'Égypte', 'Egypt',
    'Maldives', 'Seychelles', 'Maurice', 'Mauritius',
    'Dubaï', 'Dubai', 'Singapour', 'Singapore',
    'Costa Rica', 'Colombie', 'Colombia', 'Pérou', 'Peru',
    'Argentine', 'Argentina', 'Brésil', 'Brazil',
    'Islande', 'Iceland', 'Norvège', 'Norway', 'Suède', 'Sweden',
    'Paris', 'Rome', 'Barcelona', 'Barcelone', 'Lisbonne', 'Lisbon',
    'Tokyo', 'Kyoto', 'Bangkok', 'Phuket', 'Bora Bora',
    'New York', 'Los Angeles', 'Miami', 'San Francisco',
    'Londres', 'London', 'Amsterdam', 'Berlin', 'Prague', 'Vienne', 'Vienna',
  ];
  
  for (const dest of knownDestinations) {
    if (text.toLowerCase().includes(dest.toLowerCase())) {
      destinations.push(dest);
    }
  }
  
  return destinations.slice(0, 4); // Max 4 destinations
}

/**
 * Analyze what the assistant just proposed in their last message
 */
export function analyzeLastAssistantMessage(text: string | undefined): LastProposedContent {
  if (!text) {
    return { type: 'unknown' };
  }
  
  // Check for greetings first (takes priority at conversation start)
  for (const pattern of GREETING_PATTERNS) {
    if (pattern.test(text)) {
      return { type: 'greeting' };
    }
  }
  
  // Check for destination proposals
  for (const pattern of DESTINATION_PATTERNS) {
    if (pattern.test(text)) {
      const items = extractDestinationNames(text);
      return { 
        type: 'destinations', 
        items,
        isAskingForChoice: items.length > 1 || /que penses-tu|choisi|what do you think|choose/i.test(text)
      };
    }
  }
  
  // Check for date questions
  for (const pattern of DATES_QUESTION_PATTERNS) {
    if (pattern.test(text)) {
      return { type: 'dates_question', questionTopic: 'dates' };
    }
  }
  
  // Check for travelers questions
  for (const pattern of TRAVELERS_QUESTION_PATTERNS) {
    if (pattern.test(text)) {
      return { type: 'travelers_question', questionTopic: 'travelers' };
    }
  }
  
  // Check for budget questions
  for (const pattern of BUDGET_QUESTION_PATTERNS) {
    if (pattern.test(text)) {
      return { type: 'budget_question', questionTopic: 'budget' };
    }
  }
  
  // Check for flights proposals
  for (const pattern of FLIGHTS_PATTERNS) {
    if (pattern.test(text)) {
      return { type: 'flights', isAskingForChoice: true };
    }
  }
  
  // Check for hotels proposals
  for (const pattern of HOTELS_PATTERNS) {
    if (pattern.test(text)) {
      return { type: 'hotels', isAskingForChoice: true };
    }
  }
  
  // Check for activities proposals
  for (const pattern of ACTIVITIES_PATTERNS) {
    if (pattern.test(text)) {
      return { type: 'activities', isAskingForChoice: true };
    }
  }
  
  // Check for destination info
  for (const pattern of DESTINATION_INFO_PATTERNS) {
    if (pattern.test(text)) {
      const items = extractDestinationNames(text);
      return { type: 'destination_info', items };
    }
  }
  
  // Check for confirmations
  for (const pattern of CONFIRMATION_PATTERNS) {
    if (pattern.test(text)) {
      return { type: 'confirmation' };
    }
  }
  
  // Check for open questions (ends with ?)
  if (text.trim().endsWith('?')) {
    return { type: 'open_question' };
  }
  
  return { type: 'unknown' };
}

// ============================================================================
// USER INTENT PATTERNS - Bilingual
// ============================================================================

const BUDGET_INTENT_PATTERNS = [
  // French
  /budget|€|\d+\s*(euros?|€)|pas\s+cher|économique|luxe/i,
  // English
  /budget|\$|\£|\d+\s*(dollars?|pounds?|\$|\£)|cheap|affordable|luxury|expensive/i,
];

const DATE_INTENT_PATTERNS = [
  // French
  /quand|date|période|mois|semaine|weekend/i,
  // English
  /when|date|period|month|week|weekend/i,
];

const COMPARISON_INTENT_PATTERNS = [
  // French
  /compare|versus|vs|ou\s+plutôt|différence|lequel/i,
  // English
  /compare|versus|vs|or\s+rather|difference|which\s+one/i,
];

const MORE_OPTIONS_INTENT_PATTERNS = [
  // French
  /autre|plus\s+d'options?|alternatives?|sinon|différent/i,
  // English
  /other|more\s+options?|alternatives?|else|different/i,
];

const BOOKING_INTENT_PATTERNS = [
  // French
  /réserve|book|je\s+prends|c'est\s+bon|valide|confirme/i,
  // English
  /book|reserve|i('ll)?\s+take|sounds\s+good|confirm|validate/i,
];

const POSITIVE_INTENT_PATTERNS = [
  // French
  /super|parfait|génial|j'adore|excellent|oui|ok|d'accord/i,
  // English
  /great|perfect|awesome|love\s+it|excellent|yes|ok|okay|sounds\s+good|let's\s+do\s+it/i,
];

const NEGATIVE_INTENT_PATTERNS = [
  // French
  /non|pas\s+vraiment|je\s+préfère\s+pas|autre\s+chose|bof/i,
  // English
  /no|not\s+really|i('d)?\s+prefer\s+not|something\s+else|meh|nah/i,
];

const UNDECIDED_INTENT_PATTERNS = [
  // French
  /je\s+sais\s+pas|hésit|peut-être|je\s+ne\s+suis\s+pas\s+sûr/i,
  // English
  /i\s+don't\s+know|not\s+sure|maybe|perhaps|hesitat|undecided/i,
];

/**
 * Analyze user intent from their last message (bilingual)
 */
export function analyzeUserIntent(text: string | undefined): UserIntent {
  if (!text) {
    return {};
  }
  
  const intent: UserIntent = {};
  
  // Detect budget mentions
  for (const pattern of BUDGET_INTENT_PATTERNS) {
    if (pattern.test(text)) {
      intent.wantsBudgetInfo = true;
      // Try to extract amount (works for €, $, £)
      const budgetMatch = text.match(/(\d+)\s*(euros?|€|\$|dollars?|£|pounds?)/i);
      if (budgetMatch) {
        intent.mentionedBudget = budgetMatch[1];
      }
      break;
    }
  }
  
  // Detect date interests
  for (const pattern of DATE_INTENT_PATTERNS) {
    if (pattern.test(text)) {
      intent.wantsDateInfo = true;
      break;
    }
  }
  
  // Detect comparison requests
  for (const pattern of COMPARISON_INTENT_PATTERNS) {
    if (pattern.test(text)) {
      intent.wantsComparison = true;
      break;
    }
  }
  
  // Detect more options requests
  for (const pattern of MORE_OPTIONS_INTENT_PATTERNS) {
    if (pattern.test(text)) {
      intent.wantsMoreOptions = true;
      break;
    }
  }
  
  // Detect booking intent
  for (const pattern of BOOKING_INTENT_PATTERNS) {
    if (pattern.test(text)) {
      intent.wantsToBook = true;
      break;
    }
  }
  
  // Detect positive sentiment
  for (const pattern of POSITIVE_INTENT_PATTERNS) {
    if (pattern.test(text)) {
      intent.isPositive = true;
      break;
    }
  }
  
  // Detect negative sentiment
  for (const pattern of NEGATIVE_INTENT_PATTERNS) {
    if (pattern.test(text)) {
      intent.isNegative = true;
      break;
    }
  }
  
  // Detect undecided
  for (const pattern of UNDECIDED_INTENT_PATTERNS) {
    if (pattern.test(text)) {
      intent.isUndecided = true;
      break;
    }
  }
  
  return intent;
}

// ============================================================================
// ANTICIPATED SUGGESTIONS - Bilingual with language detection
// ============================================================================

/**
 * Detect language from text
 */
export function detectLanguage(text: string | undefined): 'fr' | 'en' {
  if (!text) return 'fr';
  
  // French markers
  const frMarkers = /\b(je|tu|nous|vous|est|sont|le|la|les|un|une|des|pour|avec|dans|sur|qui|que|quoi|comment|pourquoi|où|quand|bonjour|merci|oui|non)\b/i;
  
  // English markers
  const enMarkers = /\b(i|you|we|they|is|are|the|a|an|some|for|with|in|on|who|what|why|where|when|how|hello|thanks|yes|no|please)\b/i;
  
  const frCount = (text.match(frMarkers) || []).length;
  const enCount = (text.match(enMarkers) || []).length;
  
  return frCount >= enCount ? 'fr' : 'en';
}

/**
 * Get localized month name
 */
function getNextMonth(lang: 'fr' | 'en'): string {
  const monthsFr = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  const monthsEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const months = lang === 'fr' ? monthsFr : monthsEn;
  return months[(new Date().getMonth() + 1) % 12];
}

export interface AnticipatedSuggestion {
  id: string;
  label: string;
  message: string;
  emoji?: string;
  priority: number; // Lower = higher priority
}

// Bilingual suggestion templates
const SUGGESTION_TEMPLATES = {
  greeting: {
    fr: [
      { id: 'inspire', label: 'Inspire-moi', message: 'Inspire-moi !', emoji: '✨', priority: 1 },
      { id: 'weekend', label: 'Weekend au soleil', message: 'Je cherche un weekend au soleil', emoji: '☀️', priority: 2 },
      { id: 'citybreak', label: 'City break', message: 'Je veux faire un city break', emoji: '🏙️', priority: 3 },
      { id: 'adventure', label: 'Aventure', message: 'Je veux partir à l\'aventure', emoji: '🌍', priority: 4 },
    ],
    en: [
      { id: 'inspire', label: 'Inspire me', message: 'Inspire me!', emoji: '✨', priority: 1 },
      { id: 'weekend', label: 'Sunny weekend', message: 'I\'m looking for a sunny weekend getaway', emoji: '☀️', priority: 2 },
      { id: 'citybreak', label: 'City break', message: 'I want to do a city break', emoji: '🏙️', priority: 3 },
      { id: 'adventure', label: 'Adventure', message: 'I want an adventure trip', emoji: '🌍', priority: 4 },
    ],
  },
  dates_question: {
    fr: [
      { id: 'this-weekend', label: 'Ce weekend', message: 'Ce weekend', emoji: '📅', priority: 1 },
      { id: 'next-week', label: 'Semaine prochaine', message: 'La semaine prochaine', emoji: '📆', priority: 2 },
      { id: 'flexible', label: 'Flexible', message: 'Je suis flexible sur les dates', emoji: '🤷', priority: 4 },
    ],
    en: [
      { id: 'this-weekend', label: 'This weekend', message: 'This weekend', emoji: '📅', priority: 1 },
      { id: 'next-week', label: 'Next week', message: 'Next week', emoji: '📆', priority: 2 },
      { id: 'flexible', label: 'Flexible', message: 'I\'m flexible with dates', emoji: '🤷', priority: 4 },
    ],
  },
  travelers_question: {
    fr: [
      { id: 'solo', label: 'Seul', message: 'Je pars seul', emoji: '🧳', priority: 1 },
      { id: 'couple', label: 'En couple', message: 'En couple, nous sommes 2', emoji: '💑', priority: 2 },
      { id: 'friends', label: 'Entre amis', message: 'Entre amis', emoji: '👥', priority: 3 },
      { id: 'family', label: 'En famille', message: 'En famille avec enfants', emoji: '👨‍👩‍👧', priority: 4 },
    ],
    en: [
      { id: 'solo', label: 'Solo', message: 'I\'m traveling solo', emoji: '🧳', priority: 1 },
      { id: 'couple', label: 'Couple', message: 'As a couple, 2 adults', emoji: '💑', priority: 2 },
      { id: 'friends', label: 'With friends', message: 'With friends', emoji: '👥', priority: 3 },
      { id: 'family', label: 'Family', message: 'Family with kids', emoji: '👨‍👩‍👧', priority: 4 },
    ],
  },
  budget_question: {
    fr: [
      { id: 'budget-eco', label: 'Économique', message: 'Budget économique, moins de 500€', emoji: '💰', priority: 1 },
      { id: 'budget-mid', label: 'Confort', message: 'Budget confort, entre 500€ et 1000€', emoji: '💵', priority: 2 },
      { id: 'budget-high', label: 'Premium', message: 'Budget premium, plus de 1000€', emoji: '💎', priority: 3 },
      { id: 'budget-flex', label: 'Pas de limite', message: 'Pas de budget défini', emoji: '🤷', priority: 4 },
    ],
    en: [
      { id: 'budget-eco', label: 'Budget', message: 'Budget-friendly, under $500', emoji: '💰', priority: 1 },
      { id: 'budget-mid', label: 'Comfort', message: 'Comfortable budget, $500-$1000', emoji: '💵', priority: 2 },
      { id: 'budget-high', label: 'Premium', message: 'Premium budget, over $1000', emoji: '💎', priority: 3 },
      { id: 'budget-flex', label: 'No limit', message: 'No set budget', emoji: '🤷', priority: 4 },
    ],
  },
  flights: {
    fr: [
      { id: 'cheapest', label: 'Le moins cher', message: 'Je prends le vol le moins cher', emoji: '💰', priority: 1 },
      { id: 'fastest', label: 'Le plus rapide', message: 'Je préfère le vol le plus rapide', emoji: '⚡', priority: 2 },
      { id: 'direct', label: 'Vol direct', message: 'Je veux un vol direct uniquement', emoji: '✈️', priority: 3 },
      { id: 'compare', label: 'Compare-les', message: 'Compare ces vols pour moi', emoji: '⚖️', priority: 4 },
    ],
    en: [
      { id: 'cheapest', label: 'Cheapest', message: 'I\'ll take the cheapest flight', emoji: '💰', priority: 1 },
      { id: 'fastest', label: 'Fastest', message: 'I prefer the fastest flight', emoji: '⚡', priority: 2 },
      { id: 'direct', label: 'Direct only', message: 'I want a direct flight only', emoji: '✈️', priority: 3 },
      { id: 'compare', label: 'Compare them', message: 'Compare these flights for me', emoji: '⚖️', priority: 4 },
    ],
  },
  hotels: {
    fr: [
      { id: 'best-rated', label: 'Mieux noté', message: 'Je prends le mieux noté', emoji: '⭐', priority: 1 },
      { id: 'central', label: 'Le plus central', message: 'Je veux l\'hôtel le plus central', emoji: '📍', priority: 2 },
      { id: 'cheapest-hotel', label: 'Le moins cher', message: 'Je prends le moins cher', emoji: '💰', priority: 3 },
      { id: 'with-pool', label: 'Avec piscine', message: 'Je veux un hôtel avec piscine', emoji: '🏊', priority: 4 },
    ],
    en: [
      { id: 'best-rated', label: 'Best rated', message: 'I\'ll take the best rated', emoji: '⭐', priority: 1 },
      { id: 'central', label: 'Most central', message: 'I want the most central hotel', emoji: '📍', priority: 2 },
      { id: 'cheapest-hotel', label: 'Cheapest', message: 'I\'ll take the cheapest', emoji: '💰', priority: 3 },
      { id: 'with-pool', label: 'With pool', message: 'I want a hotel with a pool', emoji: '🏊', priority: 4 },
    ],
  },
  activities: {
    fr: [
      { id: 'add-all', label: 'Tout ajouter', message: 'Ajoute toutes ces activités', emoji: '✅', priority: 1 },
      { id: 'more-info', label: 'Plus de détails', message: 'Donne-moi plus de détails sur ces activités', emoji: '📋', priority: 2 },
      { id: 'other-activities', label: 'Autres activités', message: 'Propose-moi d\'autres activités', emoji: '🔄', priority: 3 },
      { id: 'free-activities', label: 'Activités gratuites', message: 'Quelles activités gratuites sont disponibles ?', emoji: '🆓', priority: 4 },
    ],
    en: [
      { id: 'add-all', label: 'Add all', message: 'Add all these activities', emoji: '✅', priority: 1 },
      { id: 'more-info', label: 'More details', message: 'Give me more details about these activities', emoji: '📋', priority: 2 },
      { id: 'other-activities', label: 'Other activities', message: 'Suggest other activities', emoji: '🔄', priority: 3 },
      { id: 'free-activities', label: 'Free activities', message: 'What free activities are available?', emoji: '🆓', priority: 4 },
    ],
  },
  confirmation: {
    fr: [
      { id: 'continue', label: 'Continuer', message: 'On continue !', emoji: '▶️', priority: 1 },
      { id: 'search-flights', label: 'Chercher des vols', message: 'Cherche-moi des vols', emoji: '✈️', priority: 2 },
      { id: 'search-hotels', label: 'Chercher des hôtels', message: 'Cherche-moi des hôtels', emoji: '🏨', priority: 3 },
      { id: 'modify', label: 'Modifier', message: 'Je veux modifier quelque chose', emoji: '✏️', priority: 4 },
    ],
    en: [
      { id: 'continue', label: 'Continue', message: 'Let\'s continue!', emoji: '▶️', priority: 1 },
      { id: 'search-flights', label: 'Search flights', message: 'Search for flights', emoji: '✈️', priority: 2 },
      { id: 'search-hotels', label: 'Search hotels', message: 'Search for hotels', emoji: '🏨', priority: 3 },
      { id: 'modify', label: 'Modify', message: 'I want to change something', emoji: '✏️', priority: 4 },
    ],
  },
  open_question: {
    fr: [
      { id: 'yes', label: 'Oui', message: 'Oui', emoji: '👍', priority: 1 },
      { id: 'no', label: 'Non', message: 'Non', emoji: '👎', priority: 2 },
      { id: 'more-info', label: 'Plus d\'infos', message: 'J\'ai besoin de plus d\'informations', emoji: 'ℹ️', priority: 3 },
    ],
    en: [
      { id: 'yes', label: 'Yes', message: 'Yes', emoji: '👍', priority: 1 },
      { id: 'no', label: 'No', message: 'No', emoji: '👎', priority: 2 },
      { id: 'more-info', label: 'More info', message: 'I need more information', emoji: 'ℹ️', priority: 3 },
    ],
  },
  default_start: {
    fr: [
      { id: 'inspire', label: 'Inspire-moi', message: 'Inspire-moi !', emoji: '✨', priority: 1 },
      { id: 'destination', label: 'J\'ai une destination', message: 'J\'ai déjà une destination en tête', emoji: '📍', priority: 2 },
      { id: 'weekend', label: 'Weekend', message: 'Je cherche une idée de weekend', emoji: '☀️', priority: 3 },
    ],
    en: [
      { id: 'inspire', label: 'Inspire me', message: 'Inspire me!', emoji: '✨', priority: 1 },
      { id: 'destination', label: 'I have a destination', message: 'I already have a destination in mind', emoji: '📍', priority: 2 },
      { id: 'weekend', label: 'Weekend', message: 'I\'m looking for a weekend idea', emoji: '☀️', priority: 3 },
    ],
  },
  default_mid: {
    fr: [
      { id: 'recap', label: 'Récapitule', message: 'Récapitule mon voyage', emoji: '📋', priority: 1 },
      { id: 'help', label: 'Aide', message: 'De quoi as-tu besoin pour continuer ?', emoji: '❓', priority: 2 },
    ],
    en: [
      { id: 'recap', label: 'Recap', message: 'Recap my trip', emoji: '📋', priority: 1 },
      { id: 'help', label: 'Help', message: 'What do you need to continue?', emoji: '❓', priority: 2 },
    ],
  },
};

/**
 * Generate anticipated suggestions based on conversation analysis (bilingual)
 */
export function getAnticipatedSuggestions(
  lastAssistantContent: LastProposedContent,
  userIntent: UserIntent,
  conversationTurn: number,
  detectedLang?: 'fr' | 'en'
): AnticipatedSuggestion[] {
  // Use provided lang or default to 'fr'
  const lang = detectedLang || 'fr';
  const suggestions: AnticipatedSuggestion[] = [];
  
  switch (lastAssistantContent.type) {
    case 'greeting':
      return SUGGESTION_TEMPLATES.greeting[lang];
      
    case 'destinations':
      // Destinations proposed - offer quick choices
      if (lastAssistantContent.items && lastAssistantContent.items.length > 0) {
        lastAssistantContent.items.slice(0, 2).forEach((dest, i) => {
          suggestions.push({
            id: `dest-${i}`,
            label: dest,
            message: lang === 'fr' ? `Je choisis ${dest}` : `I choose ${dest}`,
            emoji: '📍',
            priority: i + 1,
          });
        });
      }
      suggestions.push(
        { 
          id: 'choose-for-me', 
          label: lang === 'fr' ? 'Choisis pour moi' : 'Choose for me', 
          message: lang === 'fr' ? 'Choisis la meilleure destination pour moi' : 'Choose the best destination for me', 
          emoji: '🎯', 
          priority: 3 
        },
        { 
          id: 'more-dest', 
          label: lang === 'fr' ? 'Autres destinations' : 'Other destinations', 
          message: lang === 'fr' ? 'Propose-moi d\'autres destinations' : 'Suggest other destinations', 
          emoji: '🔄', 
          priority: 4 
        },
      );
      return suggestions.slice(0, 4);
      
    case 'dates_question':
      // Add dynamic month suggestion
      const monthSuggestions = [...SUGGESTION_TEMPLATES.dates_question[lang]];
      monthSuggestions.splice(2, 0, {
        id: 'next-month',
        label: lang === 'fr' ? `En ${getNextMonth('fr')}` : `In ${getNextMonth('en')}`,
        message: lang === 'fr' ? `En ${getNextMonth('fr')}` : `In ${getNextMonth('en')}`,
        emoji: '🗓️',
        priority: 3,
      });
      return monthSuggestions;
      
    case 'travelers_question':
      return SUGGESTION_TEMPLATES.travelers_question[lang];
      
    case 'budget_question':
      return SUGGESTION_TEMPLATES.budget_question[lang];
      
    case 'flights':
      return SUGGESTION_TEMPLATES.flights[lang];
      
    case 'hotels':
      return SUGGESTION_TEMPLATES.hotels[lang];
      
    case 'activities':
      return SUGGESTION_TEMPLATES.activities[lang];
      
    case 'destination_info':
      // Info about a destination
      if (lastAssistantContent.items && lastAssistantContent.items.length > 0) {
        const dest = lastAssistantContent.items[0];
        suggestions.push({ 
          id: 'interested', 
          label: lang === 'fr' ? 'Ça m\'intéresse' : 'I\'m interested', 
          message: lang === 'fr' ? `Je suis intéressé par ${dest}` : `I'm interested in ${dest}`, 
          emoji: '👍', 
          priority: 1 
        });
      }
      suggestions.push(
        { 
          id: 'when-go', 
          label: lang === 'fr' ? 'Meilleure période' : 'Best time', 
          message: lang === 'fr' ? 'Quelle est la meilleure période pour y aller ?' : 'What\'s the best time to go?', 
          emoji: '📅', 
          priority: 2 
        },
        { 
          id: 'budget-estimate', 
          label: lang === 'fr' ? 'Budget estimé' : 'Budget estimate', 
          message: lang === 'fr' ? 'Quel budget prévoir ?' : 'What budget should I plan for?', 
          emoji: '💶', 
          priority: 3 
        },
        { 
          id: 'other-dest', 
          label: lang === 'fr' ? 'Autre destination' : 'Another destination', 
          message: lang === 'fr' ? 'Montre-moi une autre destination' : 'Show me another destination', 
          emoji: '🔄', 
          priority: 4 
        },
      );
      return suggestions.slice(0, 4);
      
    case 'confirmation':
      return SUGGESTION_TEMPLATES.confirmation[lang];
      
    case 'open_question':
      return SUGGESTION_TEMPLATES.open_question[lang];
      
    default:
      // Unknown or first message - general suggestions
      if (conversationTurn === 0) {
        return SUGGESTION_TEMPLATES.default_start[lang];
      } else {
        return SUGGESTION_TEMPLATES.default_mid[lang];
      }
  }
}
