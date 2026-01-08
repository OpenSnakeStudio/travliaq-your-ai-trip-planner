/**
 * ContextualSuggestions - Proactive tips and suggestions
 *
 * Provides contextual tips, seasonal advice, and smart suggestions
 * based on the current workflow state and user selections.
 */

import type { PlanningStep, WorkflowContext, StepSelections } from "../machines/workflowMachine";

/**
 * Suggestion types
 */
export type SuggestionType =
  | "tip"
  | "savings"
  | "timing"
  | "seasonal"
  | "location"
  | "warning"
  | "insight"
  | "recommendation";

/**
 * Suggestion priority
 */
export type SuggestionPriority = "high" | "medium" | "low";

/**
 * Contextual suggestion
 */
export interface ContextualSuggestion {
  id: string;
  type: SuggestionType;
  priority: SuggestionPriority;
  title: string;
  message: string;
  /** Action button if applicable */
  action?: {
    label: string;
    type: "navigate" | "apply" | "dismiss" | "learn_more";
    data?: any;
  };
  /** When to show this suggestion */
  trigger: {
    step?: PlanningStep;
    condition?: string;
  };
  /** Don't show again if dismissed */
  dismissible?: boolean;
  /** Expiration time */
  expiresAt?: Date;
}

/**
 * Seasonal data for destinations
 */
interface SeasonalInfo {
  month: number;
  season: "low" | "shoulder" | "high" | "peak";
  weather: string;
  avgTemp: number;
  priceMultiplier: number;
  events?: string[];
  crowdLevel: "low" | "moderate" | "high" | "very_high";
}

/**
 * Sample seasonal data (would come from API in production)
 */
const SEASONAL_DATA: Record<string, SeasonalInfo[]> = {
  ES: [
    // Spain
    { month: 1, season: "low", weather: "Frais", avgTemp: 12, priceMultiplier: 0.8, crowdLevel: "low" },
    { month: 2, season: "low", weather: "Frais", avgTemp: 13, priceMultiplier: 0.8, crowdLevel: "low" },
    { month: 3, season: "shoulder", weather: "Doux", avgTemp: 16, priceMultiplier: 0.9, crowdLevel: "moderate" },
    { month: 4, season: "shoulder", weather: "Agréable", avgTemp: 18, priceMultiplier: 0.95, crowdLevel: "moderate", events: ["Semana Santa"] },
    { month: 5, season: "shoulder", weather: "Chaud", avgTemp: 22, priceMultiplier: 1.0, crowdLevel: "moderate" },
    { month: 6, season: "high", weather: "Chaud", avgTemp: 26, priceMultiplier: 1.2, crowdLevel: "high" },
    { month: 7, season: "peak", weather: "Très chaud", avgTemp: 30, priceMultiplier: 1.4, crowdLevel: "very_high" },
    { month: 8, season: "peak", weather: "Très chaud", avgTemp: 30, priceMultiplier: 1.5, crowdLevel: "very_high" },
    { month: 9, season: "shoulder", weather: "Chaud", avgTemp: 26, priceMultiplier: 1.1, crowdLevel: "high" },
    { month: 10, season: "shoulder", weather: "Agréable", avgTemp: 22, priceMultiplier: 0.95, crowdLevel: "moderate" },
    { month: 11, season: "low", weather: "Doux", avgTemp: 16, priceMultiplier: 0.85, crowdLevel: "low" },
    { month: 12, season: "shoulder", weather: "Frais", avgTemp: 13, priceMultiplier: 0.9, crowdLevel: "moderate", events: ["Noël", "Nouvel An"] },
  ],
  IT: [
    // Italy
    { month: 1, season: "low", weather: "Froid", avgTemp: 8, priceMultiplier: 0.75, crowdLevel: "low" },
    { month: 2, season: "low", weather: "Froid", avgTemp: 10, priceMultiplier: 0.75, crowdLevel: "low", events: ["Carnaval de Venise"] },
    { month: 3, season: "shoulder", weather: "Doux", avgTemp: 14, priceMultiplier: 0.9, crowdLevel: "moderate" },
    { month: 4, season: "shoulder", weather: "Agréable", avgTemp: 17, priceMultiplier: 1.0, crowdLevel: "high", events: ["Pâques"] },
    { month: 5, season: "high", weather: "Chaud", avgTemp: 22, priceMultiplier: 1.1, crowdLevel: "high" },
    { month: 6, season: "high", weather: "Chaud", avgTemp: 26, priceMultiplier: 1.3, crowdLevel: "very_high" },
    { month: 7, season: "peak", weather: "Très chaud", avgTemp: 30, priceMultiplier: 1.4, crowdLevel: "very_high" },
    { month: 8, season: "peak", weather: "Très chaud", avgTemp: 30, priceMultiplier: 1.5, crowdLevel: "very_high", events: ["Ferragosto"] },
    { month: 9, season: "shoulder", weather: "Chaud", avgTemp: 25, priceMultiplier: 1.1, crowdLevel: "high" },
    { month: 10, season: "shoulder", weather: "Agréable", avgTemp: 20, priceMultiplier: 0.95, crowdLevel: "moderate" },
    { month: 11, season: "low", weather: "Frais", avgTemp: 14, priceMultiplier: 0.8, crowdLevel: "low" },
    { month: 12, season: "shoulder", weather: "Froid", avgTemp: 10, priceMultiplier: 0.85, crowdLevel: "moderate", events: ["Noël"] },
  ],
  PT: [
    // Portugal
    { month: 1, season: "low", weather: "Doux", avgTemp: 12, priceMultiplier: 0.75, crowdLevel: "low" },
    { month: 2, season: "low", weather: "Doux", avgTemp: 13, priceMultiplier: 0.75, crowdLevel: "low" },
    { month: 3, season: "shoulder", weather: "Agréable", avgTemp: 16, priceMultiplier: 0.85, crowdLevel: "moderate" },
    { month: 4, season: "shoulder", weather: "Agréable", avgTemp: 18, priceMultiplier: 0.95, crowdLevel: "moderate" },
    { month: 5, season: "shoulder", weather: "Chaud", avgTemp: 21, priceMultiplier: 1.0, crowdLevel: "moderate" },
    { month: 6, season: "high", weather: "Chaud", avgTemp: 25, priceMultiplier: 1.2, crowdLevel: "high", events: ["Fêtes de Lisbonne"] },
    { month: 7, season: "peak", weather: "Très chaud", avgTemp: 28, priceMultiplier: 1.4, crowdLevel: "very_high" },
    { month: 8, season: "peak", weather: "Très chaud", avgTemp: 28, priceMultiplier: 1.5, crowdLevel: "very_high" },
    { month: 9, season: "shoulder", weather: "Chaud", avgTemp: 25, priceMultiplier: 1.1, crowdLevel: "high" },
    { month: 10, season: "shoulder", weather: "Agréable", avgTemp: 21, priceMultiplier: 0.9, crowdLevel: "moderate" },
    { month: 11, season: "low", weather: "Doux", avgTemp: 16, priceMultiplier: 0.8, crowdLevel: "low" },
    { month: 12, season: "shoulder", weather: "Doux", avgTemp: 13, priceMultiplier: 0.85, crowdLevel: "moderate", events: ["Noël"] },
  ],
};

/**
 * Get seasonal info for destination and date
 */
export function getSeasonalInfo(
  countryCode: string,
  date: Date
): SeasonalInfo | null {
  const data = SEASONAL_DATA[countryCode.toUpperCase()];
  if (!data) return null;

  const month = date.getMonth() + 1;
  return data.find((s) => s.month === month) || null;
}

/**
 * Generate seasonal suggestion
 */
function generateSeasonalSuggestion(
  countryCode: string,
  date: Date,
  destination: string
): ContextualSuggestion | null {
  const seasonal = getSeasonalInfo(countryCode, date);
  if (!seasonal) return null;

  const messages: Record<SeasonalInfo["season"], string> = {
    low: `Bonne nouvelle ! Vous voyagez en basse saison à ${destination}. Les prix sont environ ${Math.round((1 - seasonal.priceMultiplier) * 100)}% moins chers et les sites moins fréquentés.`,
    shoulder: `Vous voyagez en intersaison à ${destination}. C'est un bon compromis entre prix et affluence.`,
    high: `Attention, vous voyagez en haute saison à ${destination}. Attendez-vous à des prix ${Math.round((seasonal.priceMultiplier - 1) * 100)}% plus élevés.`,
    peak: `C'est la très haute saison à ${destination} ! Les prix sont ${Math.round((seasonal.priceMultiplier - 1) * 100)}% plus élevés et les sites très fréquentés. Réservez tôt !`,
  };

  const titles: Record<SeasonalInfo["season"], string> = {
    low: "Basse saison 👍",
    shoulder: "Intersaison",
    high: "Haute saison ⚠️",
    peak: "Très haute saison 🔥",
  };

  const id = `seasonal-${countryCode}-${date.getMonth()}`;

  return {
    id,
    type: "seasonal",
    priority: seasonal.season === "peak" ? "high" : "medium",
    title: titles[seasonal.season],
    message: messages[seasonal.season],
    trigger: { step: "dates" },
    dismissible: true,
    action:
      seasonal.season === "peak"
        ? {
            label: "Voir d'autres dates",
            type: "navigate",
            data: { step: "dates" },
          }
        : undefined,
  };
}

/**
 * Generate savings suggestions
 */
function generateSavingsSuggestions(
  context: WorkflowContext
): ContextualSuggestion[] {
  const suggestions: ContextualSuggestion[] = [];
  const { selections } = context;

  // Suggest midweek travel
  if (selections.dates?.departure) {
    const day = selections.dates.departure.getDay();
    if (day === 0 || day === 6 || day === 5) {
      // Weekend
      suggestions.push({
        id: "savings-midweek",
        type: "savings",
        priority: "medium",
        title: "Économisez sur les vols",
        message:
          "Les vols sont généralement 20-30% moins chers en milieu de semaine (mardi-mercredi).",
        trigger: { step: "dates" },
        dismissible: true,
        action: {
          label: "Modifier les dates",
          type: "navigate",
          data: { step: "dates" },
        },
      });
    }
  }

  // Suggest budget hotels if luxury selected
  if (selections.hotels?.price && selections.hotels.price > 200) {
    suggestions.push({
      id: "savings-hotels",
      type: "savings",
      priority: "low",
      title: "Alternatives d'hébergement",
      message:
        "Des options plus économiques existent. Appartements et auberges offrent souvent un meilleur rapport qualité-prix.",
      trigger: { step: "hotels" },
      dismissible: true,
    });
  }

  return suggestions;
}

/**
 * Generate timing suggestions
 */
function generateTimingSuggestions(
  context: WorkflowContext
): ContextualSuggestion[] {
  const suggestions: ContextualSuggestion[] = [];
  const { selections } = context;

  // Early booking suggestion
  if (selections.dates?.departure) {
    const daysUntil = Math.ceil(
      (selections.dates.departure.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntil > 60) {
      suggestions.push({
        id: "timing-early",
        type: "timing",
        priority: "low",
        title: "Réservation anticipée",
        message:
          "Vous partez dans plus de 2 mois. Les meilleurs prix sont souvent disponibles 6-8 semaines avant le départ.",
        trigger: { step: "flights" },
        dismissible: true,
      });
    } else if (daysUntil < 14) {
      suggestions.push({
        id: "timing-late",
        type: "timing",
        priority: "high",
        title: "Réservation tardive",
        message:
          "Votre départ approche ! Les prix peuvent augmenter rapidement. Réservez dès que possible.",
        trigger: { step: "flights" },
        dismissible: true,
      });
    }
  }

  return suggestions;
}

/**
 * Generate step-specific tips
 */
function generateStepTips(step: PlanningStep): ContextualSuggestion[] {
  const tips: Record<PlanningStep, ContextualSuggestion[]> = {
    welcome: [],
    destination: [
      {
        id: "tip-destination-1",
        type: "tip",
        priority: "low",
        title: "Astuce",
        message:
          "Vous pouvez indiquer un pays ou une région, et je vous proposerai les meilleures villes à visiter.",
        trigger: { step: "destination" },
        dismissible: true,
      },
    ],
    dates: [
      {
        id: "tip-dates-1",
        type: "tip",
        priority: "low",
        title: "Dates flexibles ?",
        message:
          "Si vos dates sont flexibles, indiquez-le moi. Je peux trouver les jours les moins chers.",
        trigger: { step: "dates" },
        dismissible: true,
      },
    ],
    travelers: [
      {
        id: "tip-travelers-1",
        type: "tip",
        priority: "low",
        title: "Voyage en famille ?",
        message:
          "Si vous voyagez avec des enfants, je privilégierai les hébergements et activités adaptés.",
        trigger: { step: "travelers" },
        dismissible: true,
      },
    ],
    flights: [
      {
        id: "tip-flights-1",
        type: "insight",
        priority: "medium",
        title: "Comparer les options",
        message:
          "Les vols avec escale sont souvent moins chers. Je peux vous montrer les deux options.",
        trigger: { step: "flights" },
        dismissible: true,
      },
    ],
    hotels: [
      {
        id: "tip-hotels-1",
        type: "insight",
        priority: "medium",
        title: "Emplacement clé",
        message:
          "Un hôtel bien situé peut vous faire économiser sur les transports. Je prends en compte la proximité des sites.",
        trigger: { step: "hotels" },
        dismissible: true,
      },
    ],
    activities: [
      {
        id: "tip-activities-1",
        type: "recommendation",
        priority: "medium",
        title: "Expériences locales",
        message:
          "Je peux vous suggérer des activités basées sur vos intérêts : culture, gastronomie, aventure...",
        trigger: { step: "activities" },
        dismissible: true,
      },
    ],
    transfers: [
      {
        id: "tip-transfers-1",
        type: "tip",
        priority: "low",
        title: "Transferts aéroport",
        message:
          "Réserver un transfert privé peut être plus économique qu'un taxi, surtout à plusieurs.",
        trigger: { step: "transfers" },
        dismissible: true,
      },
    ],
    recap: [],
    booking: [],
    complete: [],
  };

  return tips[step] || [];
}

/**
 * Get all suggestions for current context
 */
export function getSuggestionsForContext(
  context: WorkflowContext
): ContextualSuggestion[] {
  const suggestions: ContextualSuggestion[] = [];
  const { currentStep, selections } = context;

  // Step-specific tips
  suggestions.push(...generateStepTips(currentStep));

  // Seasonal suggestions
  if (
    selections.destination?.countryCode &&
    selections.dates?.departure
  ) {
    const seasonal = generateSeasonalSuggestion(
      selections.destination.countryCode,
      selections.dates.departure,
      selections.destination.city || selections.destination.country || ""
    );
    if (seasonal) {
      suggestions.push(seasonal);
    }
  }

  // Savings suggestions
  suggestions.push(...generateSavingsSuggestions(context));

  // Timing suggestions
  suggestions.push(...generateTimingSuggestions(context));

  // Sort by priority
  const priorityOrder: Record<SuggestionPriority, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  return suggestions.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );
}

/**
 * Get quick replies for current step
 */
export interface QuickReply {
  id: string;
  label: string;
  action: string;
  data?: any;
}

export function getQuickRepliesForStep(
  step: PlanningStep,
  context: WorkflowContext
): QuickReply[] {
  const replies: Record<PlanningStep, QuickReply[]> = {
    welcome: [
      { id: "qr-start", label: "Planifier un voyage", action: "start_planning" },
      { id: "qr-inspire", label: "M'inspirer", action: "get_inspiration" },
      { id: "qr-resume", label: "Reprendre mon voyage", action: "resume_trip" },
    ],
    destination: [
      { id: "qr-beach", label: "Plage & soleil ☀️", action: "suggest_destination", data: { type: "beach" } },
      { id: "qr-city", label: "City break 🏙️", action: "suggest_destination", data: { type: "city" } },
      { id: "qr-nature", label: "Nature & aventure 🏔️", action: "suggest_destination", data: { type: "nature" } },
      { id: "qr-culture", label: "Culture & histoire 🏛️", action: "suggest_destination", data: { type: "culture" } },
    ],
    dates: [
      { id: "qr-flexible", label: "Dates flexibles", action: "set_flexible_dates" },
      { id: "qr-weekend", label: "Prochain week-end", action: "set_next_weekend" },
      { id: "qr-week", label: "Une semaine", action: "set_one_week" },
    ],
    travelers: [
      { id: "qr-solo", label: "Solo", action: "set_travelers", data: { adults: 1 } },
      { id: "qr-couple", label: "En couple", action: "set_travelers", data: { adults: 2 } },
      { id: "qr-family", label: "En famille", action: "show_travelers_widget" },
      { id: "qr-group", label: "En groupe", action: "show_travelers_widget" },
    ],
    flights: [
      { id: "qr-cheapest", label: "Le moins cher", action: "filter_flights", data: { sort: "price" } },
      { id: "qr-direct", label: "Vols directs", action: "filter_flights", data: { direct: true } },
      { id: "qr-morning", label: "Départ le matin", action: "filter_flights", data: { time: "morning" } },
    ],
    hotels: [
      { id: "qr-budget", label: "Petit budget", action: "filter_hotels", data: { priceRange: "budget" } },
      { id: "qr-center", label: "Centre-ville", action: "filter_hotels", data: { location: "center" } },
      { id: "qr-4star", label: "4 étoiles +", action: "filter_hotels", data: { minStars: 4 } },
    ],
    activities: [
      { id: "qr-popular", label: "Les plus populaires", action: "filter_activities", data: { sort: "popularity" } },
      { id: "qr-free", label: "Activités gratuites", action: "filter_activities", data: { free: true } },
      { id: "qr-skip", label: "Passer cette étape", action: "skip_step" },
    ],
    transfers: [
      { id: "qr-private", label: "Transfert privé", action: "search_transfers", data: { type: "private" } },
      { id: "qr-shared", label: "Navette partagée", action: "search_transfers", data: { type: "shared" } },
      { id: "qr-skip-transfer", label: "Pas besoin", action: "skip_step" },
    ],
    recap: [
      { id: "qr-modify", label: "Modifier quelque chose", action: "edit_trip" },
      { id: "qr-confirm", label: "C'est parfait ! ✓", action: "confirm_trip" },
    ],
    booking: [
      { id: "qr-book-all", label: "Tout réserver", action: "book_all" },
      { id: "qr-book-flights", label: "Réserver les vols", action: "book_flights" },
    ],
    complete: [
      { id: "qr-new-trip", label: "Planifier un autre voyage", action: "new_trip" },
      { id: "qr-share", label: "Partager mon voyage", action: "share_trip" },
    ],
  };

  return replies[step] || [];
}

/**
 * Export suggestion presets
 */
export const SUGGESTION_PRESETS = {
  MIDWEEK_SAVINGS: {
    id: "preset-midweek",
    type: "savings" as SuggestionType,
    priority: "medium" as SuggestionPriority,
    title: "Économisez sur les vols",
    message: "Les vols en milieu de semaine sont 20-30% moins chers.",
  },
  BOOK_EARLY: {
    id: "preset-early",
    type: "timing" as SuggestionType,
    priority: "medium" as SuggestionPriority,
    title: "Réservez tôt",
    message: "Les meilleurs prix sont 6-8 semaines avant le départ.",
  },
  FLEXIBLE_DATES: {
    id: "preset-flexible",
    type: "tip" as SuggestionType,
    priority: "low" as SuggestionPriority,
    title: "Dates flexibles",
    message: "Des dates flexibles peuvent vous faire économiser jusqu'à 40%.",
  },
};
