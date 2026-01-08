/**
 * FilterParser - Natural language filter parsing
 *
 * Parses user messages to extract filter criteria for flights,
 * hotels, and activities in natural language.
 */

/**
 * Filter target type
 */
export type FilterTarget = "flights" | "hotels" | "activities" | "all";

/**
 * Parsed price filter
 */
export interface PriceFilter {
  type: "exact" | "max" | "min" | "range";
  value?: number;
  min?: number;
  max?: number;
  currency: string;
  perPerson?: boolean;
  perNight?: boolean;
}

/**
 * Parsed time filter
 */
export interface TimeFilter {
  type: "morning" | "afternoon" | "evening" | "night" | "exact" | "range";
  start?: string;
  end?: string;
}

/**
 * Parsed duration filter
 */
export interface DurationFilter {
  type: "max" | "min" | "range" | "exact";
  value?: number;
  min?: number;
  max?: number;
  unit: "hours" | "minutes" | "days";
}

/**
 * Parsed rating filter
 */
export interface RatingFilter {
  type: "min" | "exact";
  value: number;
  scale: "stars" | "score";
}

/**
 * Parsed location filter
 */
export interface LocationFilter {
  type: "near" | "in" | "avoid";
  value: string;
  distance?: number;
  distanceUnit?: "km" | "m" | "min";
}

/**
 * Flight-specific filters
 */
export interface FlightFilters {
  price?: PriceFilter;
  departureTime?: TimeFilter;
  arrivalTime?: TimeFilter;
  duration?: DurationFilter;
  stops?: {
    type: "direct" | "max";
    value?: number;
  };
  airlines?: {
    include?: string[];
    exclude?: string[];
  };
  cabinClass?: "economy" | "premium_economy" | "business" | "first";
  baggage?: {
    checked?: boolean;
    cabin?: boolean;
  };
  flexibility?: {
    refundable?: boolean;
    changeable?: boolean;
  };
}

/**
 * Hotel-specific filters
 */
export interface HotelFilters {
  price?: PriceFilter;
  rating?: RatingFilter;
  stars?: RatingFilter;
  location?: LocationFilter;
  amenities?: {
    include?: string[];
    exclude?: string[];
  };
  roomType?: string;
  breakfast?: boolean;
  freeCancellation?: boolean;
  payAtProperty?: boolean;
}

/**
 * Activity-specific filters
 */
export interface ActivityFilters {
  price?: PriceFilter;
  duration?: DurationFilter;
  rating?: RatingFilter;
  time?: TimeFilter;
  categories?: string[];
  features?: {
    include?: string[];
    exclude?: string[];
  };
  accessibility?: boolean;
  familyFriendly?: boolean;
  outdoors?: boolean;
}

/**
 * Combined parsed filters
 */
export interface ParsedFilters {
  target: FilterTarget;
  flights?: FlightFilters;
  hotels?: HotelFilters;
  activities?: ActivityFilters;
  raw: string;
  confidence: number;
}

/**
 * Price patterns (French)
 */
const PRICE_PATTERNS = [
  // "moins de 100€", "< 100€"
  { pattern: /(?:moins de|inf[eé]rieur [àa]|max(?:imum)?|<)\s*(\d+)\s*(?:€|euros?|eur)/i, type: "max" as const },
  // "plus de 100€", "> 100€"
  { pattern: /(?:plus de|sup[eé]rieur [àa]|min(?:imum)?|>)\s*(\d+)\s*(?:€|euros?|eur)/i, type: "min" as const },
  // "entre 100 et 200€"
  { pattern: /entre\s*(\d+)\s*(?:et|-)?\s*(\d+)\s*(?:€|euros?|eur)/i, type: "range" as const },
  // "100-200€"
  { pattern: /(\d+)\s*[-–]\s*(\d+)\s*(?:€|euros?|eur)/i, type: "range" as const },
  // "environ 100€", "~100€"
  { pattern: /(?:environ|~|≈)\s*(\d+)\s*(?:€|euros?|eur)/i, type: "exact" as const },
  // Simple "100€"
  { pattern: /(\d+)\s*(?:€|euros?|eur)/i, type: "exact" as const },
];

/**
 * Time patterns
 */
const TIME_PATTERNS = [
  { pattern: /(?:le\s*)?matin|t[ôo]t/i, type: "morning" as const },
  { pattern: /apr[eè]s[- ]?midi/i, type: "afternoon" as const },
  { pattern: /soir|fin de journ[eé]e/i, type: "evening" as const },
  { pattern: /nuit|tard/i, type: "night" as const },
  { pattern: /(?:vers|[àa])\s*(\d{1,2})[h:](\d{2})?/i, type: "exact" as const },
];

/**
 * Duration patterns
 */
const DURATION_PATTERNS = [
  // "moins de 2h", "< 2 heures"
  { pattern: /(?:moins de|<|max)\s*(\d+)\s*(?:h(?:eures?)?|hours?)/i, type: "max" as const, unit: "hours" as const },
  // "1-2h"
  { pattern: /(\d+)\s*[-–]\s*(\d+)\s*(?:h(?:eures?)?|hours?)/i, type: "range" as const, unit: "hours" as const },
  // "journée entière"
  { pattern: /journ[eé]e\s*(?:enti[èe]re|compl[èe]te)/i, type: "exact" as const, value: 8, unit: "hours" as const },
  // "demi-journée"
  { pattern: /demi[- ]?journ[eé]e/i, type: "exact" as const, value: 4, unit: "hours" as const },
];

/**
 * Star rating patterns
 */
const STAR_PATTERNS = [
  // "4 étoiles", "4*", "4 stars"
  { pattern: /(\d)\s*(?:[*★]|[eé]toiles?|stars?)/i },
  // "4+ étoiles"
  { pattern: /(\d)\+?\s*(?:[*★]|[eé]toiles?|stars?)\s*(?:et\s*plus|minimum|\+)/i, min: true },
];

/**
 * Amenity keywords (French)
 */
const AMENITY_KEYWORDS: Record<string, string[]> = {
  wifi: ["wifi", "internet", "connexion"],
  pool: ["piscine", "pool", "bassin"],
  gym: ["gym", "sport", "fitness", "salle de sport", "musculation"],
  spa: ["spa", "bien-être", "wellness", "massage", "sauna", "hammam"],
  parking: ["parking", "stationnement", "garage"],
  restaurant: ["restaurant", "restauration", "dîner"],
  breakfast: ["petit-déjeuner", "petit déj", "breakfast", "pdj"],
  aircon: ["climatisation", "clim", "ac", "air conditionné"],
  beach: ["plage", "beach", "bord de mer"],
  view: ["vue", "view", "panorama", "panoramique"],
};

/**
 * Negation patterns
 */
const NEGATION_PATTERNS = [
  /pas de/i,
  /sans/i,
  /(?:pas|non|ni)\s+/i,
  /exclu(?:re|ant)?/i,
  /[eé]viter/i,
];

/**
 * Parse price from text
 */
function parsePrice(text: string): PriceFilter | null {
  for (const { pattern, type } of PRICE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      if (type === "range" && match[2]) {
        return {
          type: "range",
          min: parseInt(match[1]),
          max: parseInt(match[2]),
          currency: "€",
          perPerson: /par\s*(?:personne|pers)/i.test(text),
          perNight: /par\s*nuit/i.test(text),
        };
      }
      return {
        type,
        value: parseInt(match[1]),
        currency: "€",
        perPerson: /par\s*(?:personne|pers)/i.test(text),
        perNight: /par\s*nuit/i.test(text),
      };
    }
  }
  return null;
}

/**
 * Parse time from text
 */
function parseTime(text: string): TimeFilter | null {
  for (const { pattern, type } of TIME_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      if (type === "exact" && match[1]) {
        const hours = match[1].padStart(2, "0");
        const minutes = (match[2] || "00").padStart(2, "0");
        return { type: "exact", start: `${hours}:${minutes}` };
      }
      return { type };
    }
  }
  return null;
}

/**
 * Parse duration from text
 */
function parseDuration(text: string): DurationFilter | null {
  for (const { pattern, type, unit, value } of DURATION_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      if (value !== undefined) {
        return { type, value, unit };
      }
      if (type === "range" && match[2]) {
        return {
          type: "range",
          min: parseInt(match[1]),
          max: parseInt(match[2]),
          unit,
        };
      }
      return {
        type,
        value: parseInt(match[1]),
        unit,
      };
    }
  }
  return null;
}

/**
 * Parse star rating from text
 */
function parseStars(text: string): RatingFilter | null {
  for (const { pattern, min } of STAR_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      return {
        type: min ? "min" : "exact",
        value: parseInt(match[1]),
        scale: "stars",
      };
    }
  }
  return null;
}

/**
 * Parse amenities from text
 */
function parseAmenities(text: string): { include: string[]; exclude: string[] } {
  const include: string[] = [];
  const exclude: string[] = [];
  const lowerText = text.toLowerCase();

  // Check for negation
  const isNegated = NEGATION_PATTERNS.some((p) => p.test(text));

  for (const [amenity, keywords] of Object.entries(AMENITY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        // Check if this specific mention is negated
        const keywordIndex = lowerText.indexOf(keyword.toLowerCase());
        const beforeKeyword = lowerText.substring(Math.max(0, keywordIndex - 15), keywordIndex);
        const isThisNegated = NEGATION_PATTERNS.some((p) => p.test(beforeKeyword));

        if (isThisNegated) {
          exclude.push(amenity);
        } else {
          include.push(amenity);
        }
        break;
      }
    }
  }

  return { include: [...new Set(include)], exclude: [...new Set(exclude)] };
}

/**
 * Detect filter target
 */
function detectTarget(text: string): FilterTarget {
  const lowerText = text.toLowerCase();

  if (/vol(?:s)?|flight|a[eé]rien|avion/i.test(lowerText)) {
    return "flights";
  }
  if (/h[oô]tel|h[eé]bergement|logement|chambre|nuit[eé]e/i.test(lowerText)) {
    return "hotels";
  }
  if (/activit[eé]|excursion|visite|tour|exp[eé]rience|attraction/i.test(lowerText)) {
    return "activities";
  }

  return "all";
}

/**
 * Parse flight-specific filters
 */
function parseFlightFilters(text: string): FlightFilters {
  const filters: FlightFilters = {};
  const lowerText = text.toLowerCase();

  // Price
  const price = parsePrice(text);
  if (price) filters.price = price;

  // Time
  if (/d[eé]part/i.test(text)) {
    const time = parseTime(text);
    if (time) filters.departureTime = time;
  }

  // Duration
  const duration = parseDuration(text);
  if (duration) filters.duration = duration;

  // Stops
  if (/direct|sans\s*escale|non[- ]?stop/i.test(lowerText)) {
    filters.stops = { type: "direct" };
  } else {
    const stopsMatch = text.match(/(?:max(?:imum)?|moins de)\s*(\d)\s*escale/i);
    if (stopsMatch) {
      filters.stops = { type: "max", value: parseInt(stopsMatch[1]) };
    }
  }

  // Cabin class
  if (/business|affaires/i.test(lowerText)) {
    filters.cabinClass = "business";
  } else if (/first|premi[èe]re/i.test(lowerText)) {
    filters.cabinClass = "first";
  } else if (/premium\s*economy|[eé]co\s*premium/i.test(lowerText)) {
    filters.cabinClass = "premium_economy";
  }

  // Baggage
  if (/bagage|valise|soute/i.test(lowerText)) {
    filters.baggage = {
      checked: /soute|enregistr[eé]/i.test(lowerText),
      cabin: /cabine|main/i.test(lowerText),
    };
  }

  // Flexibility
  if (/remboursable|flexible|annul/i.test(lowerText)) {
    filters.flexibility = {
      refundable: /remboursable/i.test(lowerText),
      changeable: /modifiable|flexible/i.test(lowerText),
    };
  }

  return filters;
}

/**
 * Parse hotel-specific filters
 */
function parseHotelFilters(text: string): HotelFilters {
  const filters: HotelFilters = {};
  const lowerText = text.toLowerCase();

  // Price
  const price = parsePrice(text);
  if (price) {
    price.perNight = true;
    filters.price = price;
  }

  // Stars
  const stars = parseStars(text);
  if (stars) filters.stars = stars;

  // Amenities
  const amenities = parseAmenities(text);
  if (amenities.include.length > 0 || amenities.exclude.length > 0) {
    filters.amenities = amenities;
  }

  // Location
  if (/centre[- ]?ville|downtown|central/i.test(lowerText)) {
    filters.location = { type: "in", value: "centre-ville" };
  } else if (/proche|pr[èe]s de|[àa] c[oô]t[eé] de/i.test(lowerText)) {
    const nearMatch = text.match(/(?:proche|pr[èe]s) (?:de |du |de la )?(.+?)(?:\.|,|$)/i);
    if (nearMatch) {
      filters.location = { type: "near", value: nearMatch[1].trim() };
    }
  }

  // Breakfast
  if (/petit[- ]?d[eé]j|breakfast|pdj/i.test(lowerText)) {
    filters.breakfast = !NEGATION_PATTERNS.some((p) => {
      const match = lowerText.match(p);
      return match && lowerText.indexOf("petit") > (match.index || 0);
    });
  }

  // Cancellation
  if (/annulation\s*gratuite|free\s*cancellation/i.test(lowerText)) {
    filters.freeCancellation = true;
  }

  // Payment
  if (/payer?\s*(?:sur\s*place|[àa]\s*l['']h[oô]tel)/i.test(lowerText)) {
    filters.payAtProperty = true;
  }

  return filters;
}

/**
 * Parse activity-specific filters
 */
function parseActivityFilters(text: string): ActivityFilters {
  const filters: ActivityFilters = {};
  const lowerText = text.toLowerCase();

  // Price
  const price = parsePrice(text);
  if (price) filters.price = price;

  // Duration
  const duration = parseDuration(text);
  if (duration) filters.duration = duration;

  // Time
  const time = parseTime(text);
  if (time) filters.time = time;

  // Categories
  const categories: string[] = [];
  if (/culture|mus[eé]e|histoire|monument/i.test(lowerText)) categories.push("culture");
  if (/nature|randonn[eé]e|parc|montagne/i.test(lowerText)) categories.push("nature");
  if (/gastro|cuisine|food|restaurant|d[eé]gustation/i.test(lowerText)) categories.push("gastronomie");
  if (/aventure|sport|adrénaline|extr[eê]me/i.test(lowerText)) categories.push("aventure");
  if (/d[eé]tente|relaxation|spa|bien[- ]?[eê]tre/i.test(lowerText)) categories.push("detente");
  if (/famille|enfant|kid/i.test(lowerText)) categories.push("famille");
  if (categories.length > 0) filters.categories = categories;

  // Family friendly
  if (/famille|enfant|kid/i.test(lowerText)) {
    filters.familyFriendly = true;
  }

  // Outdoor
  if (/ext[eé]rieur|plein\s*air|outdoor|dehors/i.test(lowerText)) {
    filters.outdoors = true;
  }

  // Free activities
  if (/gratuit|free|sans\s*frais/i.test(lowerText)) {
    filters.price = { type: "exact", value: 0, currency: "€" };
  }

  return filters;
}

/**
 * Main filter parser function
 */
export function parseFilters(text: string): ParsedFilters {
  const target = detectTarget(text);
  let confidence = 0.5;

  const result: ParsedFilters = {
    target,
    raw: text,
    confidence,
  };

  // Parse based on target
  if (target === "flights" || target === "all") {
    const flightFilters = parseFlightFilters(text);
    if (Object.keys(flightFilters).length > 0) {
      result.flights = flightFilters;
      confidence += 0.1 * Object.keys(flightFilters).length;
    }
  }

  if (target === "hotels" || target === "all") {
    const hotelFilters = parseHotelFilters(text);
    if (Object.keys(hotelFilters).length > 0) {
      result.hotels = hotelFilters;
      confidence += 0.1 * Object.keys(hotelFilters).length;
    }
  }

  if (target === "activities" || target === "all") {
    const activityFilters = parseActivityFilters(text);
    if (Object.keys(activityFilters).length > 0) {
      result.activities = activityFilters;
      confidence += 0.1 * Object.keys(activityFilters).length;
    }
  }

  result.confidence = Math.min(confidence, 1);

  return result;
}

/**
 * Format filters for display
 */
export function formatFiltersForDisplay(filters: ParsedFilters): string[] {
  const parts: string[] = [];

  if (filters.flights) {
    if (filters.flights.price) {
      parts.push(`Prix ${filters.flights.price.type === "max" ? "max" : ""}: ${filters.flights.price.value || `${filters.flights.price.min}-${filters.flights.price.max}`}€`);
    }
    if (filters.flights.stops?.type === "direct") {
      parts.push("Vols directs");
    }
    if (filters.flights.cabinClass) {
      parts.push(`Classe: ${filters.flights.cabinClass}`);
    }
  }

  if (filters.hotels) {
    if (filters.hotels.price) {
      parts.push(`Prix/nuit ${filters.hotels.price.type === "max" ? "max" : ""}: ${filters.hotels.price.value || `${filters.hotels.price.min}-${filters.hotels.price.max}`}€`);
    }
    if (filters.hotels.stars) {
      parts.push(`${filters.hotels.stars.value}+ étoiles`);
    }
    if (filters.hotels.amenities?.include?.length) {
      parts.push(`Avec: ${filters.hotels.amenities.include.join(", ")}`);
    }
  }

  if (filters.activities) {
    if (filters.activities.duration) {
      parts.push(`Durée: ${filters.activities.duration.value}h`);
    }
    if (filters.activities.categories?.length) {
      parts.push(`Type: ${filters.activities.categories.join(", ")}`);
    }
  }

  return parts;
}

/**
 * Example filter phrases for suggestions
 */
export const FILTER_EXAMPLES = {
  flights: [
    "Vols directs moins de 200€",
    "Départ le matin, business class",
    "Vol avec bagages inclus",
  ],
  hotels: [
    "Hôtel 4 étoiles avec piscine",
    "Moins de 100€/nuit, centre-ville",
    "Petit-déjeuner inclus, annulation gratuite",
  ],
  activities: [
    "Activités culturelles moins de 50€",
    "Demi-journée, adapté aux enfants",
    "Expériences gastronomiques",
  ],
};
