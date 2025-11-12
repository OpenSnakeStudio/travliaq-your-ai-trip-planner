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

// Hotel preferences codes
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

export const DATES_TYPE = {
  FIXED: 'fixed',
  FLEXIBLE: 'flexible'
} as const;

// Normaliser les valeurs traduites vers les codes internes
// Accepte à la fois les codes (solo, duo) et les labels traduits (Solo, Duo, etc.)
export const normalizeTravelGroup = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const lowerValue = value.toLowerCase().trim();
  
  // Si c'est déjà un code interne, le retourner
  if (['solo', 'duo', 'group35', 'family'].includes(lowerValue)) {
    return lowerValue;
  }
  
  // Sinon, essayer de détecter depuis les labels traduits
  if (lowerValue === 'groupe 3-5' || lowerValue === 'group 3-5') return 'group35';
  if (lowerValue.includes('famille') || lowerValue.includes('family')) return 'family';
  
  return lowerValue; // Retourner la valeur normalisée
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
  
  // Si c'est déjà un code interne
  if (['fixed', 'flexible'].includes(lowerValue)) {
    return lowerValue;
  }
  
  // Détecter depuis les labels traduits
  if (lowerValue.includes('fixe') || lowerValue.includes('précise')) return 'fixed';
  if (lowerValue.includes('flexible')) return 'flexible';
  
  return lowerValue;
};

// Normaliser helpWith - convertir les traductions en codes internes
export const normalizeHelpWith = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const lowerValue = value.toLowerCase().trim();
  
  // Si c'est déjà un code interne
  if (['flights', 'accommodation', 'activities'].includes(lowerValue)) {
    return lowerValue;
  }
  
  // Détecter depuis les labels traduits
  if (lowerValue.includes('vol') || lowerValue.includes('flight')) return 'flights';
  if (lowerValue.includes('hébergement') || lowerValue.includes('accommodation')) return 'accommodation';
  if (lowerValue.includes('activité') || lowerValue.includes('activities')) return 'activities';
  
  return lowerValue;
};

// Normaliser un tableau de helpWith
export const normalizeHelpWithArray = (values: string[] | undefined): string[] => {
  if (!values || !Array.isArray(values)) return [];
  return values.map(v => normalizeHelpWith(v)).filter(Boolean) as string[];
};

// Normaliser une préférence d'hôtel vers un code interne
export const normalizeHotelPreference = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const lowerValue = value.toLowerCase().trim();
  
  // Si c'est déjà un code interne, le retourner
  if (Object.values(HOTEL_PREFERENCES).includes(lowerValue as any)) {
    return lowerValue;
  }
  
  // Don't mind / Peu importe
  if (lowerValue.includes('importe') || lowerValue.includes("don't mind")) {
    return HOTEL_PREFERENCES.DONT_MIND;
  }
  
  // Breakfast / Petit-déjeuner
  if (lowerValue.includes('breakfast') || lowerValue.includes('déjeuner')) {
    return HOTEL_PREFERENCES.BREAKFAST;
  }
  
  // Half board / Demi-pension
  if (lowerValue.includes('half') || lowerValue.includes('demi')) {
    return HOTEL_PREFERENCES.HALF_BOARD;
  }
  
  // Full board / Pension complète
  if (lowerValue.includes('full') || lowerValue.includes('complète') || lowerValue.includes('complete')) {
    return HOTEL_PREFERENCES.FULL_BOARD;
  }
  
  // All-inclusive
  if (lowerValue.includes('inclusive')) {
    return HOTEL_PREFERENCES.ALL_INCLUSIVE;
  }
  
  // Room service
  if (lowerValue.includes('room service')) {
    return HOTEL_PREFERENCES.ROOM_SERVICE;
  }
  
  // Minibar
  if (lowerValue.includes('minibar')) {
    return HOTEL_PREFERENCES.MINIBAR;
  }
  
  // View / Vue
  if (lowerValue.includes('view') || lowerValue.includes('vue')) {
    return HOTEL_PREFERENCES.VIEW;
  }
  
  // Balcony / Balcon / Terrasse
  if (lowerValue.includes('balcon') || lowerValue.includes('balcony') || lowerValue.includes('terrasse') || lowerValue.includes('terrace')) {
    return HOTEL_PREFERENCES.BALCONY;
  }
  
  // Concierge / Conciergerie
  if (lowerValue.includes('concierge')) {
    return HOTEL_PREFERENCES.CONCIERGE;
  }
  
  return lowerValue;
};

// Normaliser un tableau de préférences d'hôtel
export const normalizeHotelPreferencesArray = (values: string[] | undefined): string[] => {
  if (!values || !Array.isArray(values)) return [];
  return values.map(v => normalizeHotelPreference(v)).filter(Boolean) as string[];
};

// Helper pour obtenir la clé de traduction à partir de la valeur
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

// Rhythm mapping
export const getRhythmLabel = (value: string) => {
  const map: Record<string, string> = {
    'relaxed': 'questionnaire.rhythm.relaxed',
    'balanced': 'questionnaire.rhythm.balanced',
    'intense': 'questionnaire.rhythm.intense',
  };
  return map[value] || value;
};

// Schedule preferences mapping
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

// Hotel preferences mapping
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
