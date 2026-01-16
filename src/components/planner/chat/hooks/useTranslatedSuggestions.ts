/**
 * useTranslatedSuggestions - Provides i18n-aware suggestions
 * Wraps the suggestion engine with proper translations
 */

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Suggestion, SuggestionContext } from "../services/suggestionEngine";

type IconName = Suggestion['iconName'];

interface TranslatedSuggestion {
  id: string;
  label: string;
  message: string;
  iconName: IconName;
  emoji?: string;
}

export function useTranslatedSuggestions() {
  const { t } = useTranslation();

  const getMonthName = useMemo(() => {
    return (): string => {
      const monthKeys = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
      ];
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return t(`planner.months.${monthKeys[nextMonth.getMonth()]}`);
    };
  }, [t]);

  const getInspirationSuggestions = useMemo(() => {
    return (): TranslatedSuggestion[] => {
      const nextMonth = getMonthName();
      return [
        {
          id: 'inspire',
          label: t('planner.suggestions.inspire'),
          message: t('planner.suggestions.inspireMessage'),
          iconName: 'sparkles',
        },
        {
          id: 'weekend-sun',
          label: t('planner.suggestions.weekendSun'),
          message: t('planner.suggestions.weekendSunMessage'),
          iconName: 'sun',
        },
        {
          id: 'city-break',
          label: t('planner.suggestions.cityBreak'),
          message: t('planner.suggestions.cityBreakMessage'),
          iconName: 'building',
        },
        {
          id: 'where-month',
          label: t('planner.suggestions.whereIn', { month: nextMonth }),
          message: t('planner.suggestions.whereInMessage', { month: nextMonth }),
          iconName: 'calendar',
        },
      ];
    };
  }, [t, getMonthName]);

  const getDatesSuggestions = useMemo(() => {
    return (destinationName?: string): TranslatedSuggestion[] => {
      const dest = destinationName || t('planner.suggestions.thisDestination');
      return [
        {
          id: 'best-period',
          label: t('planner.suggestions.bestPeriod'),
          message: t('planner.suggestions.bestPeriodMessage', { destination: dest }),
          iconName: 'calendar',
        },
        {
          id: 'this-weekend',
          label: t('planner.suggestions.thisWeekend'),
          message: t('planner.suggestions.thisWeekendMessage', { destination: dest }),
          iconName: 'zap',
        },
        {
          id: 'next-week',
          label: t('planner.suggestions.nextWeek'),
          message: t('planner.suggestions.nextWeekMessage'),
          iconName: 'calendar',
        },
      ];
    };
  }, [t]);

  const getTravelersSuggestions = useMemo(() => {
    return (): TranslatedSuggestion[] => [
      {
        id: 'solo',
        label: t('planner.suggestions.solo'),
        message: t('planner.suggestions.soloMessage'),
        iconName: 'user',
      },
      {
        id: 'couple',
        label: t('planner.suggestions.couple'),
        message: t('planner.suggestions.coupleMessage'),
        iconName: 'users',
      },
      {
        id: 'family',
        label: t('planner.suggestions.family'),
        message: t('planner.suggestions.familyMessage'),
        iconName: 'users',
      },
    ];
  }, [t]);

  const getFlightSuggestions = useMemo(() => {
    return (context: Pick<SuggestionContext, 'destinationName' | 'cheapestFlightPrice' | 'visibleFlightsCount'>): TranslatedSuggestion[] => {
      const suggestions: TranslatedSuggestion[] = [];
      const dest = context.destinationName || t('planner.suggestions.thisDestination');

      if (context.cheapestFlightPrice) {
        suggestions.push({
          id: 'cheapest-flight',
          label: t('planner.suggestions.cheapestFlight', { price: context.cheapestFlightPrice }),
          message: t('planner.suggestions.cheapestFlightMessage', { price: context.cheapestFlightPrice }),
          iconName: 'plane',
        });
      }

      if (context.visibleFlightsCount > 2) {
        suggestions.push({
          id: 'compare-flights',
          label: t('planner.suggestions.compareFlights'),
          message: t('planner.suggestions.compareFlightsMessage'),
          iconName: 'scale',
        });
      }

      suggestions.push({
        id: 'morning-flight',
        label: t('planner.suggestions.morningFlight'),
        message: t('planner.suggestions.morningFlightMessage'),
        iconName: 'sunrise',
      });

      if (context.visibleFlightsCount === 0) {
        suggestions.unshift({
          id: 'find-flights',
          label: t('planner.suggestions.findFlights'),
          message: t('planner.suggestions.findFlightsMessage', { destination: dest }),
          iconName: 'search',
        });
      }

      return suggestions;
    };
  }, [t]);

  const getStaysSuggestions = useMemo(() => {
    return (context: Pick<SuggestionContext, 'destinationName' | 'cheapestHotelPrice' | 'visibleHotelsCount'>): TranslatedSuggestion[] => {
      const suggestions: TranslatedSuggestion[] = [];
      const dest = context.destinationName || t('planner.suggestions.thisDestination');

      if (context.cheapestHotelPrice) {
        suggestions.push({
          id: 'best-value',
          label: t('planner.suggestions.bestValue'),
          message: t('planner.suggestions.bestValueMessage'),
          iconName: 'star',
        });
      }

      suggestions.push({
        id: 'central-location',
        label: t('planner.suggestions.centralLocation'),
        message: t('planner.suggestions.centralLocationMessage', { destination: dest }),
        iconName: 'map-pin',
      });

      if (context.visibleHotelsCount > 2) {
        suggestions.push({
          id: 'compare-hotels',
          label: t('planner.suggestions.compareHotels'),
          message: t('planner.suggestions.compareHotelsMessage'),
          iconName: 'scale',
        });
      } else {
        suggestions.push({
          id: 'find-hotels',
          label: t('planner.suggestions.findHotels'),
          message: t('planner.suggestions.findHotelsMessage', { destination: dest }),
          iconName: 'search',
        });
      }

      return suggestions;
    };
  }, [t]);

  const getActivitiesSuggestions = useMemo(() => {
    return (destinationName?: string): TranslatedSuggestion[] => {
      const dest = destinationName || t('planner.suggestions.thisDestination');
      return [
        {
          id: 'must-see',
          label: t('planner.suggestions.mustSee'),
          message: t('planner.suggestions.mustSeeMessage', { destination: dest }),
          iconName: 'camera',
        },
        {
          id: 'hidden-gems',
          label: t('planner.suggestions.hiddenGems'),
          message: t('planner.suggestions.hiddenGemsMessage', { destination: dest }),
          iconName: 'compass',
        },
        {
          id: 'local-food',
          label: t('planner.suggestions.localFood'),
          message: t('planner.suggestions.localFoodMessage', { destination: dest }),
          iconName: 'utensils',
        },
      ];
    };
  }, [t]);

  const getPreferencesSuggestions = useMemo(() => {
    return (destinationName?: string): TranslatedSuggestion[] => {
      const dest = destinationName || t('planner.suggestions.thisDestination');
      return [
        {
          id: 'optimize-trip',
          label: t('planner.suggestions.optimizeTrip'),
          message: t('planner.suggestions.optimizeTripMessage', { destination: dest }),
          iconName: 'sparkles',
        },
        {
          id: 'itinerary',
          label: t('planner.suggestions.itinerary'),
          message: t('planner.suggestions.itineraryMessage', { destination: dest }),
          iconName: 'calendar',
        },
        {
          id: 'budget-tips',
          label: t('planner.suggestions.budgetTips'),
          message: t('planner.suggestions.budgetTipsMessage'),
          iconName: 'star',
        },
      ];
    };
  }, [t]);

  const getSearchReadySuggestions = useMemo(() => {
    return (destinationName?: string): TranslatedSuggestion[] => {
      const dest = destinationName || t('planner.suggestions.thisDestination');
      return [
        {
          id: 'launch-search',
          label: t('planner.suggestions.launchSearch'),
          message: t('planner.suggestions.launchSearchMessage'),
          iconName: 'search',
        },
        {
          id: 'direct-flights',
          label: t('planner.suggestions.directFlights'),
          message: t('planner.suggestions.directFlightsMessage'),
          iconName: 'plane',
        },
        {
          id: 'best-time',
          label: t('planner.suggestions.bestTime'),
          message: t('planner.suggestions.bestTimeMessage', { destination: dest }),
          iconName: 'clock',
        },
      ];
    };
  }, [t]);

  const getDestinationChoiceSuggestions = useMemo(() => {
    return (proposedDestinations: string[] = []): TranslatedSuggestion[] => {
      const suggestions: TranslatedSuggestion[] = [
        {
          id: 'choose-for-me',
          label: t('planner.suggestions.chooseForMe'),
          message: t('planner.suggestions.chooseForMeMessage'),
          iconName: 'sparkles',
        },
      ];

      if (proposedDestinations.length > 0) {
        suggestions.push({
          id: 'more-about-first',
          label: t('planner.suggestions.moreAbout', { destination: proposedDestinations[0] }),
          message: t('planner.suggestions.moreAboutMessage', { destination: proposedDestinations[0] }),
          iconName: 'compass',
        });
      }

      suggestions.push({
        id: 'other-destinations',
        label: t('planner.suggestions.otherDestinations'),
        message: t('planner.suggestions.otherDestinationsMessage'),
        iconName: 'search',
      });

      return suggestions;
    };
  }, [t]);

  return {
    getInspirationSuggestions,
    getDatesSuggestions,
    getTravelersSuggestions,
    getFlightSuggestions,
    getStaysSuggestions,
    getActivitiesSuggestions,
    getPreferencesSuggestions,
    getSearchReadySuggestions,
    getDestinationChoiceSuggestions,
    getMonthName,
  };
}
