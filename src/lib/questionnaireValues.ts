// Valeurs internes du questionnaire (indépendantes de la langue)
// Ces valeurs sont stockées dans la base de données et ne changent pas avec la langue

export const TRAVEL_GROUPS = {
  SOLO: 'solo',
  DUO: 'duo',
  GROUP35: 'group35',
  FAMILY: 'family'
} as const;

export const YES_NO = {
  YES: 'yes',
  NO: 'no'
} as const;

export const HELP_WITH = {
  FLIGHTS: 'flights',
  ACCOMMODATION: 'accommodation',
  ACTIVITIES: 'activities'
} as const;

export const DATES_TYPE = {
  FIXED: 'fixed',
  FLEXIBLE: 'flexible'
} as const;

// ============= CLIMATE PREFERENCES =============
export const CLIMATE = {
  DONT_MIND: 'dont_mind',
  HOT: 'hot',
  TEMPERATE: 'temperate',
  COLD: 'cold',
  TROPICAL: 'tropical',
  DRY: 'dry'
} as const;

// ============= TRAVEL AFFINITIES =============
export const AFFINITIES = {
  DONT_MIND: 'dont_mind',
  BEACH: 'beach',
  MOUNTAIN: 'mountain',
  CITY: 'city',
  COUNTRYSIDE: 'countryside',
  DESERT: 'desert',
  ISLAND: 'island',
  SAFARI: 'safari',
  ROAD_TRIP: 'road_trip'
} as const;

// ============= TRAVEL AMBIANCE =============
export const AMBIANCE = {
  RELAXATION: 'relaxation',
  ADVENTURE: 'adventure',
  CULTURE: 'culture',
  PARTY: 'party',
  SPORT: 'sport',
  WELLNESS: 'wellness',
  ROMANTIC: 'romantic',
  FAMILY: 'family',
  DISCOVERY: 'discovery'
} as const;

// ============= ACCOMMODATION TYPES =============
export const ACCOMMODATION_TYPE = {
  DONT_MIND: 'dont_mind',
  HOTEL: 'hotel',
  APARTMENT: 'apartment',
  VILLA: 'villa',
  HOSTEL: 'hostel',
  GUESTHOUSE: 'guesthouse',
  LODGE: 'lodge',
  CAMPING: 'camping',
  BED_BREAKFAST: 'bed_breakfast',
  RESORT: 'resort'
} as const;

// ============= HOTEL PREFERENCES =============
export const HOTEL_PREFERENCES = {
  DONT_MIND: 'dont_mind',
  BREAKFAST: 'breakfast',
  HALF_BOARD: 'half_board',
  FULL_BOARD: 'full_board',
  ALL_INCLUSIVE: 'all_inclusive',
  ROOM_SERVICE: 'room_service',
  MINIBAR: 'minibar',
  VIEW: 'view',
  BALCONY: 'balcony',
  CONCIERGE: 'concierge'
} as const;

// Hotel preferences avec repas (pour détection des contraintes alimentaires)
export const HOTEL_MEAL_PREFERENCES = [
  HOTEL_PREFERENCES.BREAKFAST,
  HOTEL_PREFERENCES.HALF_BOARD,
  HOTEL_PREFERENCES.FULL_BOARD,
  HOTEL_PREFERENCES.ALL_INCLUSIVE
] as const;

// ============= COMFORT LEVELS =============
export const COMFORT = {
  BASIC: 'basic',
  STANDARD: 'standard',
  COMFORT: 'comfort',
  PREMIUM: 'premium',
  LUXURY: 'luxury'
} as const;

// ============= DIETARY CONSTRAINTS =============
export const CONSTRAINTS = {
  DONT_MIND: 'dont_mind',
  HALAL: 'halal',
  KOSHER: 'kosher',
  VEGETARIAN: 'vegetarian',
  VEGAN: 'vegan',
  GLUTEN_FREE: 'gluten_free',
  NO_PORK: 'no_pork',
  NO_ALCOHOL: 'no_alcohol',
  PRAYER_PLACES: 'prayer_places',
  BUDDHIST: 'buddhist',
  ACCESSIBILITY: 'accessibility'
} as const;

// ============= MOBILITY =============
export const MOBILITY = {
  VERY_MOBILE: 'very_mobile',
  MOBILE: 'mobile',
  LIMITED: 'limited',
  WHEELCHAIR: 'wheelchair'
} as const;

// ============= RHYTHM =============
export const RHYTHM = {
  RELAXED: 'relaxed',
  BALANCED: 'balanced',
  INTENSE: 'intense'
} as const;

// ============= SCHEDULE PREFERENCES =============
export const SCHEDULE = {
  EARLY_BIRD: 'early_bird',
  NIGHT_OWL: 'night_owl',
  NEEDS_SIESTA: 'needs_siesta',
  NEEDS_BREAKS: 'needs_breaks',
  NEEDS_FREE_TIME: 'needs_free_time',
  FLEXIBLE: 'flexible_schedule'
} as const;

// ============= FLIGHT PREFERENCES =============
export const FLIGHT_PREF = {
  DIRECT: 'direct',
  ONE_STOP: 'one_stop',
  CHEAPEST: 'cheapest',
  FASTEST: 'fastest',
  COMFORT: 'comfort'
} as const;

// ============= LUGGAGE =============
export const LUGGAGE = {
  PERSONAL_ITEM: 'personal_item',
  CABIN: 'cabin',
  HOLD: 'hold',
  CABIN_HOLD: 'cabin_hold'
} as const;

// ============= NORMALISATION FUNCTIONS =============

export const normalizeTravelGroup = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const lowerValue = value.toLowerCase().trim();
  
  if (['solo', 'duo', 'group35', 'family'].includes(lowerValue)) return lowerValue;
  if (lowerValue === 'groupe 3-5' || lowerValue === 'group 3-5') return 'group35';
  if (lowerValue.includes('famille') || lowerValue.includes('family')) return 'family';
  
  return lowerValue;
};

export const normalizeYesNo = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const lowerValue = value.toLowerCase().trim();
  
  if (['yes', 'no', 'oui', 'non'].includes(lowerValue)) {
    return lowerValue === 'oui' ? 'yes' : lowerValue === 'non' ? 'no' : lowerValue;
  }
  
  return lowerValue;
};

export const normalizeDatesType = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const lowerValue = value.toLowerCase().trim();
  
  if (['fixed', 'flexible'].includes(lowerValue)) return lowerValue;
  if (lowerValue.includes('fixe') || lowerValue.includes('précise')) return 'fixed';
  if (lowerValue.includes('flexible')) return 'flexible';
  
  return lowerValue;
};

export const normalizeHelpWith = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const lowerValue = value.toLowerCase().trim();
  
  if (['flights', 'accommodation', 'activities'].includes(lowerValue)) return lowerValue;
  if (lowerValue.includes('vol') || lowerValue.includes('flight')) return 'flights';
  if (lowerValue.includes('hébergement') || lowerValue.includes('accommodation')) return 'accommodation';
  if (lowerValue.includes('activité') || lowerValue.includes('activities')) return 'activities';
  
  return lowerValue;
};

export const normalizeHelpWithArray = (values: string[] | undefined): string[] => {
  if (!values || !Array.isArray(values)) return [];
  return values.map(v => normalizeHelpWith(v)).filter(Boolean) as string[];
};

export const normalizeClimate = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const lowerValue = value.toLowerCase().trim();
  
  if (Object.values(CLIMATE).includes(lowerValue as any)) return lowerValue;
  if (lowerValue.includes('importe') || lowerValue.includes("don't mind")) return CLIMATE.DONT_MIND;
  if (lowerValue.includes('chaud') || lowerValue.includes('hot')) return CLIMATE.HOT;
  if (lowerValue.includes('tempéré') || lowerValue.includes('temperate')) return CLIMATE.TEMPERATE;
  if (lowerValue.includes('froid') || lowerValue.includes('cold')) return CLIMATE.COLD;
  if (lowerValue.includes('tropical')) return CLIMATE.TROPICAL;
  if (lowerValue.includes('sec') || lowerValue.includes('dry')) return CLIMATE.DRY;
  
  return lowerValue;
};

export const normalizeClimateArray = (values: string[] | undefined): string[] => {
  if (!values || !Array.isArray(values)) return [];
  return values.map(v => normalizeClimate(v)).filter(Boolean) as string[];
};

export const normalizeAffinity = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const lowerValue = value.toLowerCase().trim();
  
  if (Object.values(AFFINITIES).includes(lowerValue as any)) return lowerValue;
  if (lowerValue.includes('importe') || lowerValue.includes("don't mind")) return AFFINITIES.DONT_MIND;
  if (lowerValue.includes('plage') || lowerValue.includes('beach')) return AFFINITIES.BEACH;
  if (lowerValue.includes('montagne') || lowerValue.includes('mountain')) return AFFINITIES.MOUNTAIN;
  if (lowerValue.includes('ville') || lowerValue.includes('city')) return AFFINITIES.CITY;
  if (lowerValue.includes('campagne') || lowerValue.includes('countryside')) return AFFINITIES.COUNTRYSIDE;
  if (lowerValue.includes('désert') || lowerValue.includes('desert')) return AFFINITIES.DESERT;
  if (lowerValue.includes('île') || lowerValue.includes('island')) return AFFINITIES.ISLAND;
  if (lowerValue.includes('safari')) return AFFINITIES.SAFARI;
  if (lowerValue.includes('road trip') || lowerValue.includes('circuit')) return AFFINITIES.ROAD_TRIP;
  
  return lowerValue;
};

export const normalizeAffinityArray = (values: string[] | undefined): string[] => {
  if (!values || !Array.isArray(values)) return [];
  return values.map(v => normalizeAffinity(v)).filter(Boolean) as string[];
};

export const normalizeAmbiance = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const lowerValue = value.toLowerCase().trim();
  
  if (Object.values(AMBIANCE).includes(lowerValue as any)) return lowerValue;
  if (lowerValue.includes('relaxation') || lowerValue.includes('détente')) return AMBIANCE.RELAXATION;
  if (lowerValue.includes('aventure') || lowerValue.includes('adventure')) return AMBIANCE.ADVENTURE;
  if (lowerValue.includes('culture')) return AMBIANCE.CULTURE;
  if (lowerValue.includes('fête') || lowerValue.includes('party')) return AMBIANCE.PARTY;
  if (lowerValue.includes('sport')) return AMBIANCE.SPORT;
  if (lowerValue.includes('bien-être') || lowerValue.includes('wellness')) return AMBIANCE.WELLNESS;
  if (lowerValue.includes('romantique') || lowerValue.includes('romantic')) return AMBIANCE.ROMANTIC;
  if (lowerValue.includes('famille') || lowerValue.includes('family')) return AMBIANCE.FAMILY;
  if (lowerValue.includes('découverte') || lowerValue.includes('discovery')) return AMBIANCE.DISCOVERY;
  
  return lowerValue;
};

export const normalizeAccommodationType = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const lowerValue = value.toLowerCase().trim();
  
  if (Object.values(ACCOMMODATION_TYPE).includes(lowerValue as any)) return lowerValue;
  if (lowerValue.includes('importe') || lowerValue.includes("don't mind")) return ACCOMMODATION_TYPE.DONT_MIND;
  if (lowerValue.includes('hôtel') || lowerValue.includes('hotel')) return ACCOMMODATION_TYPE.HOTEL;
  if (lowerValue.includes('appartement') || lowerValue.includes('apartment')) return ACCOMMODATION_TYPE.APARTMENT;
  if (lowerValue.includes('villa')) return ACCOMMODATION_TYPE.VILLA;
  if (lowerValue.includes('auberge') || lowerValue.includes('hostel')) return ACCOMMODATION_TYPE.HOSTEL;
  if (lowerValue.includes('maison') || lowerValue.includes('guesthouse') || lowerValue.includes('riad')) return ACCOMMODATION_TYPE.GUESTHOUSE;
  if (lowerValue.includes('lodge') || lowerValue.includes('eco')) return ACCOMMODATION_TYPE.LODGE;
  if (lowerValue.includes('camping') || lowerValue.includes('glamping')) return ACCOMMODATION_TYPE.CAMPING;
  if (lowerValue.includes('chambre') || lowerValue.includes('bed') || lowerValue.includes('breakfast')) return ACCOMMODATION_TYPE.BED_BREAKFAST;
  if (lowerValue.includes('resort')) return ACCOMMODATION_TYPE.RESORT;
  
  return lowerValue;
};

export const normalizeAccommodationTypeArray = (values: string[] | undefined): string[] => {
  if (!values || !Array.isArray(values)) return [];
  return values.map(v => normalizeAccommodationType(v)).filter(Boolean) as string[];
};

export const normalizeHotelPreference = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const lowerValue = value.toLowerCase().trim();
  
  if (Object.values(HOTEL_PREFERENCES).includes(lowerValue as any)) return lowerValue;
  if (lowerValue.includes('importe') || lowerValue.includes("don't mind")) return HOTEL_PREFERENCES.DONT_MIND;
  if (lowerValue.includes('breakfast') || lowerValue.includes('déjeuner')) return HOTEL_PREFERENCES.BREAKFAST;
  if (lowerValue.includes('half') || lowerValue.includes('demi')) return HOTEL_PREFERENCES.HALF_BOARD;
  if (lowerValue.includes('full') || lowerValue.includes('complète') || lowerValue.includes('complete')) return HOTEL_PREFERENCES.FULL_BOARD;
  if (lowerValue.includes('inclusive')) return HOTEL_PREFERENCES.ALL_INCLUSIVE;
  if (lowerValue.includes('room service')) return HOTEL_PREFERENCES.ROOM_SERVICE;
  if (lowerValue.includes('minibar')) return HOTEL_PREFERENCES.MINIBAR;
  if (lowerValue.includes('view') || lowerValue.includes('vue')) return HOTEL_PREFERENCES.VIEW;
  if (lowerValue.includes('balcon') || lowerValue.includes('balcony') || lowerValue.includes('terrasse') || lowerValue.includes('terrace')) return HOTEL_PREFERENCES.BALCONY;
  if (lowerValue.includes('concierge')) return HOTEL_PREFERENCES.CONCIERGE;
  
  return lowerValue;
};

export const normalizeHotelPreferencesArray = (values: string[] | undefined): string[] => {
  if (!values || !Array.isArray(values)) return [];
  return values.map(v => normalizeHotelPreference(v)).filter(Boolean) as string[];
};

export const normalizeComfort = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const lowerValue = value.toLowerCase().trim();
  
  if (Object.values(COMFORT).includes(lowerValue as any)) return lowerValue;
  if (lowerValue.includes('basique') || lowerValue.includes('basic') || lowerValue === '1') return COMFORT.BASIC;
  if (lowerValue.includes('standard') || lowerValue === '2' || lowerValue === '3') return COMFORT.STANDARD;
  if (lowerValue.includes('confort') || lowerValue.includes('comfort') || lowerValue === '4') return COMFORT.COMFORT;
  if (lowerValue.includes('premium') || lowerValue.includes('supérieur') || lowerValue === '5') return COMFORT.PREMIUM;
  if (lowerValue.includes('luxe') || lowerValue.includes('luxury')) return COMFORT.LUXURY;
  
  return lowerValue;
};

export const normalizeConstraint = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const lowerValue = value.toLowerCase().trim();
  
  if (Object.values(CONSTRAINTS).includes(lowerValue as any)) return lowerValue;
  if (lowerValue.includes('importe') || lowerValue.includes("don't mind")) return CONSTRAINTS.DONT_MIND;
  if (lowerValue.includes('halal')) return CONSTRAINTS.HALAL;
  if (lowerValue.includes('casher') || lowerValue.includes('kosher')) return CONSTRAINTS.KOSHER;
  if (lowerValue.includes('végétarien') || lowerValue.includes('vegetarian')) return CONSTRAINTS.VEGETARIAN;
  if (lowerValue.includes('vegan') || lowerValue.includes('végétalien')) return CONSTRAINTS.VEGAN;
  if (lowerValue.includes('gluten') || lowerValue.includes('sans gluten')) return CONSTRAINTS.GLUTEN_FREE;
  if (lowerValue.includes('porc') || lowerValue.includes('pork')) return CONSTRAINTS.NO_PORK;
  if (lowerValue.includes('alcool') || lowerValue.includes('alcohol')) return CONSTRAINTS.NO_ALCOHOL;
  if (lowerValue.includes('prière') || lowerValue.includes('prayer')) return CONSTRAINTS.PRAYER_PLACES;
  if (lowerValue.includes('bouddhist') || lowerValue.includes('buddhist')) return CONSTRAINTS.BUDDHIST;
  if (lowerValue.includes('accessibilité') || lowerValue.includes('accessibility')) return CONSTRAINTS.ACCESSIBILITY;
  
  return lowerValue;
};

export const normalizeConstraintsArray = (values: string[] | undefined): string[] => {
  if (!values || !Array.isArray(values)) return [];
  return values.map(v => normalizeConstraint(v)).filter(Boolean) as string[];
};

export const normalizeMobility = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const lowerValue = value.toLowerCase().trim();
  
  if (Object.values(MOBILITY).includes(lowerValue as any)) return lowerValue;
  if (lowerValue.includes('très mobile') || lowerValue.includes('very mobile')) return MOBILITY.VERY_MOBILE;
  if (lowerValue.includes('mobile') && !lowerValue.includes('très')) return MOBILITY.MOBILE;
  if (lowerValue.includes('limitée') || lowerValue.includes('limited')) return MOBILITY.LIMITED;
  if (lowerValue.includes('fauteuil') || lowerValue.includes('wheelchair')) return MOBILITY.WHEELCHAIR;
  
  return lowerValue;
};

export const normalizeRhythm = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const lowerValue = value.toLowerCase().trim();
  
  if (Object.values(RHYTHM).includes(lowerValue as any)) return lowerValue;
  if (lowerValue.includes('relax') || lowerValue.includes('posé') || lowerValue.includes('tranquille')) return RHYTHM.RELAXED;
  if (lowerValue.includes('équilibré') || lowerValue.includes('balanced')) return RHYTHM.BALANCED;
  if (lowerValue.includes('intense') || lowerValue.includes('soutenu')) return RHYTHM.INTENSE;
  
  return lowerValue;
};

export const normalizeSchedulePref = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const lowerValue = value.toLowerCase().trim();
  
  if (Object.values(SCHEDULE).includes(lowerValue as any)) return lowerValue;
  if (lowerValue.includes('matinal') || lowerValue.includes('early bird')) return SCHEDULE.EARLY_BIRD;
  if (lowerValue.includes('couche-tard') || lowerValue.includes('night owl')) return SCHEDULE.NIGHT_OWL;
  if (lowerValue.includes('sieste') || lowerValue.includes('siesta')) return SCHEDULE.NEEDS_SIESTA;
  if (lowerValue.includes('pause') || lowerValue.includes('breaks')) return SCHEDULE.NEEDS_BREAKS;
  if (lowerValue.includes('temps libre') || lowerValue.includes('free time')) return SCHEDULE.NEEDS_FREE_TIME;
  if (lowerValue.includes('flexible')) return SCHEDULE.FLEXIBLE;
  
  return lowerValue;
};

export const normalizeSchedulePrefsArray = (values: string[] | undefined): string[] => {
  if (!values || !Array.isArray(values)) return [];
  return values.map(v => normalizeSchedulePref(v)).filter(Boolean) as string[];
};

export const normalizeFlightPref = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const lowerValue = value.toLowerCase().trim();
  
  if (Object.values(FLIGHT_PREF).includes(lowerValue as any)) return lowerValue;
  if (lowerValue.includes('direct')) return FLIGHT_PREF.DIRECT;
  if (lowerValue.includes('escale') || lowerValue.includes('stop')) return FLIGHT_PREF.ONE_STOP;
  if (lowerValue.includes('moins cher') || lowerValue.includes('cheapest')) return FLIGHT_PREF.CHEAPEST;
  if (lowerValue.includes('rapide') || lowerValue.includes('fastest')) return FLIGHT_PREF.FASTEST;
  if (lowerValue.includes('confort') || lowerValue.includes('comfort')) return FLIGHT_PREF.COMFORT;
  
  return lowerValue;
};

export const normalizeLuggage = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const lowerValue = value.toLowerCase().trim();
  
  if (Object.values(LUGGAGE).includes(lowerValue as any)) return lowerValue;
  if (lowerValue.includes('personnel') || lowerValue.includes('personal')) return LUGGAGE.PERSONAL_ITEM;
  if (lowerValue.includes('cabine') && !lowerValue.includes('soute') && !lowerValue.includes('hold')) return LUGGAGE.CABIN;
  if (lowerValue.includes('soute') && !lowerValue.includes('cabine') || (lowerValue.includes('hold') && !lowerValue.includes('cabin'))) return LUGGAGE.HOLD;
  if ((lowerValue.includes('cabine') && lowerValue.includes('soute')) || (lowerValue.includes('cabin') && lowerValue.includes('hold'))) return LUGGAGE.CABIN_HOLD;
  
  return lowerValue;
};

// ============= LABEL GETTERS (pour affichage depuis codes) =============

export const getTravelGroupLabel = (value: string) => {
  const normalized = normalizeTravelGroup(value);
  const map: Record<string, string> = {
    'solo': 'questionnaire.solo',
    'duo': 'questionnaire.duo',
    'group35': 'questionnaire.group35',
    'family': 'questionnaire.family'
  };
  return map[normalized || ''] || value;
};

export const getYesNoLabel = (value: string) => {
  const normalized = normalizeYesNo(value);
  const map: Record<string, string> = {
    'yes': 'questionnaire.yes',
    'no': 'questionnaire.no'
  };
  return map[normalized || ''] || value;
};

export const getHelpWithLabel = (value: string) => {
  const map: Record<string, string> = {
    'flights': 'questionnaire.flights',
    'accommodation': 'questionnaire.accommodation',
    'activities': 'questionnaire.activities'
  };
  return map[value] || value;
};

export const getDatesTypeLabel = (value: string) => {
  const normalized = normalizeDatesType(value);
  const map: Record<string, string> = {
    'fixed': 'questionnaire.dates.fixed',
    'flexible': 'questionnaire.dates.flexible'
  };
  return map[normalized || ''] || value;
};

export const getRhythmLabel = (value: string) => {
  const map: Record<string, string> = {
    'relaxed': 'questionnaire.rhythm.relaxed',
    'balanced': 'questionnaire.rhythm.balanced',
    'intense': 'questionnaire.rhythm.intense',
  };
  return map[value] || value;
};

export const getSchedulePrefLabel = (value: string) => {
  const map: Record<string, string> = {
    'early_bird': 'questionnaire.schedule.earlyBird',
    'night_owl': 'questionnaire.schedule.nightOwl',
    'needs_siesta': 'questionnaire.schedule.needsSiesta',
    'needs_breaks': 'questionnaire.schedule.needsBreaks',
    'needs_free_time': 'questionnaire.schedule.needsFreeTime',
    'flexible_schedule': 'questionnaire.schedule.flexibleSchedule',
  };
  return map[value] || value;
};

export const getHotelPreferenceLabel = (value: string) => {
  const map: Record<string, string> = {
    'dont_mind': 'questionnaire.hotelPreferences.dontMind',
    'breakfast': 'questionnaire.hotelPreferences.breakfast',
    'half_board': 'questionnaire.hotelPreferences.halfBoard',
    'full_board': 'questionnaire.hotelPreferences.fullBoard',
    'all_inclusive': 'questionnaire.hotelPreferences.allInclusive',
    'room_service': 'questionnaire.hotelPreferences.roomService',
    'minibar': 'questionnaire.hotelPreferences.minibar',
    'view': 'questionnaire.hotelPreferences.view',
    'balcony': 'questionnaire.hotelPreferences.balcony',
    'concierge': 'questionnaire.hotelPreferences.concierge',
  };
  return map[value] || value;
};
