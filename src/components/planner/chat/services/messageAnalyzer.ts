/**
 * Message Analyzer - Intelligent conversation analysis for anticipating user intent
 * 
 * Analyzes the last assistant message to detect what was proposed,
 * and predicts the most likely user responses to generate smart suggestions.
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

// Patterns for detecting what the assistant proposed
const DESTINATION_PATTERNS = [
  /voici\s+(\d+)\s+destinations?/i,
  /je te propose\s+(\d+)\s+destinations?/i,
  /destinations?\s+(parfaites?|idéales?|recommandées?)/i,
  /pour toi\s*:\s*([\w\s,]+)/i,
  /que penses-tu de\s+([\w\s]+)\s*\?/i,
  /découvrir\s+([\w\s]+)\s*\?/i,
  /(thaïlande|bali|vietnam|japon|grèce|espagne|italie|portugal|maroc|mexique)/i,
];

const DATES_QUESTION_PATTERNS = [
  /quand\s+(souhaitez-vous|veux-tu|voulez-vous)\s+partir/i,
  /quelles?\s+dates?\s+(préférez-vous|te convien)/i,
  /à quelle période/i,
  /pour combien de (temps|jours|nuits)/i,
  /durée\s+(du voyage|souhaitée)/i,
  /dates?\s+de\s+départ/i,
];

const TRAVELERS_QUESTION_PATTERNS = [
  /combien\s+(serez-vous|êtes-vous|de personnes)/i,
  /(voyagez-vous|pars-tu)\s+(seul|en couple|en famille|entre amis)/i,
  /nombre\s+de\s+voyageurs?/i,
  /qui\s+(vous accompagne|t'accompagne)/i,
];

const BUDGET_QUESTION_PATTERNS = [
  /quel\s+(est ton|est votre)\s+budget/i,
  /budget\s+(prévu|souhaité|estimé)/i,
  /combien\s+(souhaitez-vous|veux-tu)\s+dépenser/i,
  /fourchette\s+de\s+prix/i,
];

const FLIGHTS_PATTERNS = [
  /voici\s+(les|des)\s+vols?/i,
  /j'ai trouvé\s+(\d+)\s+vols?/i,
  /options?\s+de\s+vol/i,
  /vols?\s+(disponibles?|pour)/i,
  /billets?\s+d'avion/i,
];

const HOTELS_PATTERNS = [
  /voici\s+(les|des)\s+hôtels?/i,
  /j'ai trouvé\s+(\d+)\s+hôtels?/i,
  /hébergements?\s+(disponibles?|recommandés?)/i,
  /options?\s+d'hébergement/i,
  /où\s+dormir/i,
];

const ACTIVITIES_PATTERNS = [
  /voici\s+(les|des)\s+activités?/i,
  /j'ai trouvé\s+(\d+)\s+activités?/i,
  /choses?\s+à\s+faire/i,
  /que\s+faire\s+à/i,
  /expériences?\s+(recommandées?|à\s+ne\s+pas\s+manquer)/i,
];

const DESTINATION_INFO_PATTERNS = [
  /est\s+(idéal|parfait|recommandé)\s+(en|pour)/i,
  /meilleure\s+période/i,
  /climat\s+(est|sera)/i,
  /température\s+moyenne/i,
  /à\s+savoir\s+sur/i,
  /voici\s+ce\s+que\s+tu\s+dois\s+savoir/i,
];

const CONFIRMATION_PATTERNS = [
  /c'est\s+noté/i,
  /parfait\s*!/i,
  /excellent\s+choix/i,
  /j'ai\s+bien\s+enregistré/i,
  /on\s+récapitule/i,
];

const GREETING_PATTERNS = [
  /bonjour/i,
  /bienvenue/i,
  /comment\s+puis-je\s+t'aider/i,
  /en quoi\s+puis-je/i,
  /prêt\s+à\s+planifier/i,
];

/**
 * Extract destination names from text
 */
function extractDestinationNames(text: string): string[] {
  const destinations: string[] = [];
  
  // Common destination names (extend as needed)
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
        isAskingForChoice: items.length > 1 || /que penses-tu|choisi/i.test(text)
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

/**
 * Analyze user intent from their last message
 */
export function analyzeUserIntent(text: string | undefined): UserIntent {
  if (!text) {
    return {};
  }
  
  const intent: UserIntent = {};
  
  // Detect budget mentions
  if (/budget|€|\d+\s*(euros?|€)|pas\s+cher|économique|luxe/i.test(text)) {
    intent.wantsBudgetInfo = true;
    const budgetMatch = text.match(/(\d+)\s*(euros?|€)/i);
    if (budgetMatch) {
      intent.mentionedBudget = budgetMatch[1];
    }
  }
  
  // Detect date interests
  if (/quand|date|période|mois|semaine|weekend/i.test(text)) {
    intent.wantsDateInfo = true;
  }
  
  // Detect comparison requests
  if (/compare|versus|vs|ou\s+plutôt|différence|lequel/i.test(text)) {
    intent.wantsComparison = true;
  }
  
  // Detect more options requests
  if (/autre|plus\s+d'options?|alternatives?|sinon|différent/i.test(text)) {
    intent.wantsMoreOptions = true;
  }
  
  // Detect booking intent
  if (/réserve|book|je\s+prends|c'est\s+bon|valide|confirme/i.test(text)) {
    intent.wantsToBook = true;
  }
  
  // Detect positive sentiment
  if (/super|parfait|génial|j'adore|excellent|oui|ok|d'accord/i.test(text)) {
    intent.isPositive = true;
  }
  
  // Detect negative sentiment
  if (/non|pas\s+vraiment|je\s+préfère\s+pas|autre\s+chose|bof/i.test(text)) {
    intent.isNegative = true;
  }
  
  // Detect undecided
  if (/je\s+sais\s+pas|hésit|peut-être|je\s+ne\s+suis\s+pas\s+sûr/i.test(text)) {
    intent.isUndecided = true;
  }
  
  return intent;
}

/**
 * Get the next month name in French
 */
function getNextMonthFr(): string {
  const months = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  return months[(new Date().getMonth() + 1) % 12];
}

export interface AnticipatedSuggestion {
  id: string;
  label: string;
  message: string;
  emoji?: string;
  priority: number; // Lower = higher priority
}

/**
 * Generate anticipated suggestions based on conversation analysis
 */
export function getAnticipatedSuggestions(
  lastAssistantContent: LastProposedContent,
  userIntent: UserIntent,
  conversationTurn: number
): AnticipatedSuggestion[] {
  const suggestions: AnticipatedSuggestion[] = [];
  
  switch (lastAssistantContent.type) {
    case 'greeting':
      // First interaction - inspire or direct destination
      suggestions.push(
        { id: 'inspire', label: 'Inspire-moi', message: 'Inspire-moi !', emoji: '✨', priority: 1 },
        { id: 'weekend', label: 'Weekend au soleil', message: 'Je cherche un weekend au soleil', emoji: '☀️', priority: 2 },
        { id: 'citybreak', label: 'City break', message: 'Je veux faire un city break', emoji: '🏙️', priority: 3 },
        { id: 'adventure', label: 'Aventure', message: 'Je veux partir à l\'aventure', emoji: '🌍', priority: 4 },
      );
      break;
      
    case 'destinations':
      // Destinations proposed - offer quick choices
      if (lastAssistantContent.items && lastAssistantContent.items.length > 0) {
        lastAssistantContent.items.slice(0, 2).forEach((dest, i) => {
          suggestions.push({
            id: `dest-${i}`,
            label: dest,
            message: `Je choisis ${dest}`,
            emoji: '📍',
            priority: i + 1,
          });
        });
      }
      suggestions.push(
        { id: 'choose-for-me', label: 'Choisis pour moi', message: 'Choisis la meilleure destination pour moi', emoji: '🎯', priority: 3 },
        { id: 'more-dest', label: 'Autres destinations', message: 'Propose-moi d\'autres destinations', emoji: '🔄', priority: 4 },
      );
      break;
      
    case 'dates_question':
      // Asked for dates
      suggestions.push(
        { id: 'this-weekend', label: 'Ce weekend', message: 'Ce weekend', emoji: '📅', priority: 1 },
        { id: 'next-week', label: 'Semaine prochaine', message: 'La semaine prochaine', emoji: '📆', priority: 2 },
        { id: 'next-month', label: `En ${getNextMonthFr()}`, message: `En ${getNextMonthFr()}`, emoji: '🗓️', priority: 3 },
        { id: 'flexible', label: 'Flexible', message: 'Je suis flexible sur les dates', emoji: '🤷', priority: 4 },
      );
      break;
      
    case 'travelers_question':
      // Asked for number of travelers
      suggestions.push(
        { id: 'solo', label: 'Seul', message: 'Je pars seul', emoji: '🧳', priority: 1 },
        { id: 'couple', label: 'En couple', message: 'En couple, nous sommes 2', emoji: '💑', priority: 2 },
        { id: 'friends', label: 'Entre amis', message: 'Entre amis', emoji: '👥', priority: 3 },
        { id: 'family', label: 'En famille', message: 'En famille avec enfants', emoji: '👨‍👩‍👧', priority: 4 },
      );
      break;
      
    case 'budget_question':
      // Asked for budget
      suggestions.push(
        { id: 'budget-eco', label: 'Économique', message: 'Budget économique, moins de 500€', emoji: '💰', priority: 1 },
        { id: 'budget-mid', label: 'Confort', message: 'Budget confort, entre 500€ et 1000€', emoji: '💵', priority: 2 },
        { id: 'budget-high', label: 'Premium', message: 'Budget premium, plus de 1000€', emoji: '💎', priority: 3 },
        { id: 'budget-flex', label: 'Pas de limite', message: 'Pas de budget défini', emoji: '🤷', priority: 4 },
      );
      break;
      
    case 'flights':
      // Flights proposed
      suggestions.push(
        { id: 'cheapest', label: 'Le moins cher', message: 'Je prends le vol le moins cher', emoji: '💰', priority: 1 },
        { id: 'fastest', label: 'Le plus rapide', message: 'Je préfère le vol le plus rapide', emoji: '⚡', priority: 2 },
        { id: 'direct', label: 'Vol direct', message: 'Je veux un vol direct uniquement', emoji: '✈️', priority: 3 },
        { id: 'compare', label: 'Compare-les', message: 'Compare ces vols pour moi', emoji: '⚖️', priority: 4 },
      );
      break;
      
    case 'hotels':
      // Hotels proposed
      suggestions.push(
        { id: 'best-rated', label: 'Mieux noté', message: 'Je prends le mieux noté', emoji: '⭐', priority: 1 },
        { id: 'central', label: 'Le plus central', message: 'Je veux l\'hôtel le plus central', emoji: '📍', priority: 2 },
        { id: 'cheapest-hotel', label: 'Le moins cher', message: 'Je prends le moins cher', emoji: '💰', priority: 3 },
        { id: 'with-pool', label: 'Avec piscine', message: 'Je veux un hôtel avec piscine', emoji: '🏊', priority: 4 },
      );
      break;
      
    case 'activities':
      // Activities proposed
      suggestions.push(
        { id: 'add-all', label: 'Tout ajouter', message: 'Ajoute toutes ces activités', emoji: '✅', priority: 1 },
        { id: 'more-info', label: 'Plus de détails', message: 'Donne-moi plus de détails sur ces activités', emoji: '📋', priority: 2 },
        { id: 'other-activities', label: 'Autres activités', message: 'Propose-moi d\'autres activités', emoji: '🔄', priority: 3 },
        { id: 'free-activities', label: 'Activités gratuites', message: 'Quelles activités gratuites sont disponibles ?', emoji: '🆓', priority: 4 },
      );
      break;
      
    case 'destination_info':
      // Info about a destination
      if (lastAssistantContent.items && lastAssistantContent.items.length > 0) {
        const dest = lastAssistantContent.items[0];
        suggestions.push(
          { id: 'interested', label: 'Ça m\'intéresse', message: `Je suis intéressé par ${dest}`, emoji: '👍', priority: 1 },
        );
      }
      suggestions.push(
        { id: 'when-go', label: 'Meilleure période', message: 'Quelle est la meilleure période pour y aller ?', emoji: '📅', priority: 2 },
        { id: 'budget-estimate', label: 'Budget estimé', message: 'Quel budget prévoir ?', emoji: '💶', priority: 3 },
        { id: 'other-dest', label: 'Autre destination', message: 'Montre-moi une autre destination', emoji: '🔄', priority: 4 },
      );
      break;
      
    case 'confirmation':
      // Assistant confirmed something - suggest next steps
      suggestions.push(
        { id: 'continue', label: 'Continuer', message: 'On continue !', emoji: '▶️', priority: 1 },
        { id: 'search-flights', label: 'Chercher des vols', message: 'Cherche-moi des vols', emoji: '✈️', priority: 2 },
        { id: 'search-hotels', label: 'Chercher des hôtels', message: 'Cherche-moi des hôtels', emoji: '🏨', priority: 3 },
        { id: 'modify', label: 'Modifier', message: 'Je veux modifier quelque chose', emoji: '✏️', priority: 4 },
      );
      break;
      
    case 'open_question':
      // Open question - offer common responses
      suggestions.push(
        { id: 'yes', label: 'Oui', message: 'Oui', emoji: '👍', priority: 1 },
        { id: 'no', label: 'Non', message: 'Non', emoji: '👎', priority: 2 },
        { id: 'more-info', label: 'Plus d\'infos', message: 'J\'ai besoin de plus d\'informations', emoji: 'ℹ️', priority: 3 },
      );
      break;
      
    default:
      // Unknown or first message - general suggestions
      if (conversationTurn === 0) {
        suggestions.push(
          { id: 'inspire', label: 'Inspire-moi', message: 'Inspire-moi !', emoji: '✨', priority: 1 },
          { id: 'destination', label: 'J\'ai une destination', message: 'J\'ai déjà une destination en tête', emoji: '📍', priority: 2 },
          { id: 'weekend', label: 'Weekend', message: 'Je cherche une idée de weekend', emoji: '☀️', priority: 3 },
        );
      } else {
        // Mid-conversation fallback
        suggestions.push(
          { id: 'recap', label: 'Récapitule', message: 'Récapitule mon voyage', emoji: '📋', priority: 1 },
          { id: 'help', label: 'Aide', message: 'De quoi as-tu besoin pour continuer ?', emoji: '❓', priority: 2 },
        );
      }
      break;
  }
  
  // Sort by priority and return
  return suggestions.sort((a, b) => a.priority - b.priority).slice(0, 4);
}
