import type { SummaryStat } from "@/components/travel/FooterSummary";

/**
 * Helper to create summary stats for trips
 * Use this to generate the stats array for the FooterSummary component
 */

export const createSummaryStats = {
  days: (value: number): SummaryStat => ({
    type: 'days',
    value
  }),
  
  budget: (value: string): SummaryStat => ({
    type: 'budget',
    value
  }),
  
  weather: (value: string): SummaryStat => ({
    type: 'weather',
    value
  }),
  
  style: (value: string): SummaryStat => ({
    type: 'style',
    value
  }),
  
  cities: (value: number): SummaryStat => ({
    type: 'cities',
    value
  }),
  
  people: (value: number): SummaryStat => ({
    type: 'people',
    value
  }),
  
  activities: (value: number): SummaryStat => ({
    type: 'activities',
    value
  }),
  
  // Generic custom stat with icon name (e.g., "Plane", "MapPin")
  custom: (iconName: string, value: string | number, label: string, color: 'turquoise' | 'golden'): SummaryStat => ({
    type: 'custom',
    icon: iconName,
    value,
    label,
    color
  })
};

/**
 * Example usage with 8 comprehensive stats:
 * 
 * const stats = [
 *   createSummaryStats.days(7),
 *   createSummaryStats.budget("3 200 €"),
 *   createSummaryStats.weather("21°C"),
 *   createSummaryStats.style("Culture & Gastronomie"),
 *   createSummaryStats.people(2),
 *   createSummaryStats.activities(15),
 *   createSummaryStats.cities(3),
 *   createSummaryStats.custom("Plane", "Direct", "VOL", 'golden')
 * ];
 * 
 * <FooterSummary stats={stats} />
 * 
 * Or use the automatic calculation:
 * <FooterSummary 
 *   summary={travelData.summary} 
 *   travelers={2}
 *   activities={15}
 *   cities={3}
 *   stopovers={0}
 * />
 */
