import { Calendar, DollarSign, CloudSun, Sparkles, MapPin, Users, Activity } from "lucide-react";
import type { SummaryStat } from "@/components/travel/FooterSummary";

/**
 * Helper to create summary stats for trips
 * Use this to generate the stats array for the FooterSummary component
 */

export const createSummaryStats = {
  days: (value: number): SummaryStat => ({
    icon: Calendar,
    value,
    label: "Jours",
    color: 'turquoise'
  }),
  
  budget: (value: string): SummaryStat => ({
    icon: DollarSign,
    value,
    label: "Budget",
    color: 'golden'
  }),
  
  weather: (value: string): SummaryStat => ({
    icon: CloudSun,
    value,
    label: "Météo moy.",
    color: 'turquoise'
  }),
  
  style: (value: string): SummaryStat => ({
    icon: Sparkles,
    value,
    label: "Style",
    color: 'golden'
  }),
  
  cities: (value: number): SummaryStat => ({
    icon: MapPin,
    value,
    label: "Villes",
    color: 'turquoise'
  }),
  
  people: (value: number): SummaryStat => ({
    icon: Users,
    value,
    label: "Personnes",
    color: 'golden'
  }),
  
  activities: (value: number): SummaryStat => ({
    icon: Activity,
    value,
    label: "Activités",
    color: 'turquoise'
  }),
  
  // Generic custom stat
  custom: (icon: any, value: string | number, label: string, color: 'turquoise' | 'golden'): SummaryStat => ({
    icon,
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
 *   createSummaryStats.custom(Plane, "Direct", "VOL", 'golden')
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
