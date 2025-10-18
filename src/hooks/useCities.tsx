import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface City {
  id: string;
  name: string;
  country: string;
  country_code: string;
  search_text: string;
}

export const useCities = () => {
  return useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cities")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as City[];
    },
    staleTime: Infinity, // Cities don't change often, cache forever in this session
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
  });
};

export const useFilteredCities = (searchTerm: string, cities: City[] | undefined) => {
  if (!cities) return [];

  // Prioritize popular cities (ensures Paris appears first)
  const priorityNames = new Set([
    'Paris','Marseille','Lyon','Toulouse','Nice','Bordeaux','Lille','Nantes','Strasbourg','Montpellier','Rennes','Reims','Le Havre','Saint-Étienne','Toulon','Grenoble','Dijon','Angers','Nîmes','Villeurbanne','Pau',
    'London','Manchester','Birmingham','Edinburgh','Glasgow','Cardiff','Belfast',
    'New York','Los Angeles','Chicago','San Francisco','Miami','Boston','Seattle','Washington','Dallas','Houston','Philadelphia','Phoenix','San Diego','San Jose','Austin','Orlando','Denver',
    'Berlin','Munich','Hamburg','Cologne','Frankfurt','Stuttgart','Düsseldorf','Dortmund','Leipzig','Bremen','Dresden','Nuremberg','Hanover'
  ]);

  if (!searchTerm || searchTerm.trim() === '') {
    return cities
      .slice(0, 100)
      .sort((a, b) => (priorityNames.has(b.name) ? 1 : 0) - (priorityNames.has(a.name) ? 1 : 0));
  }

  const lowerSearch = searchTerm.toLowerCase().trim();
  
  return cities
    .filter((city) => {
      const nameMatch = city.name.toLowerCase().includes(lowerSearch);
      const countryMatch = city.country.toLowerCase().includes(lowerSearch);
      const searchTextMatch = city.search_text && city.search_text.toLowerCase().includes(lowerSearch);
      
      return nameMatch || countryMatch || searchTextMatch;
    })
    .sort((a, b) => {
      // Prioritize exact name matches
      const aExact = a.name.toLowerCase() === lowerSearch;
      const bExact = b.name.toLowerCase() === lowerSearch;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Then prioritize name starts with search
      const aStarts = a.name.toLowerCase().startsWith(lowerSearch);
      const bStarts = b.name.toLowerCase().startsWith(lowerSearch);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      
      // Finally prioritize popular cities
      const aPriority = priorityNames.has(a.name);
      const bPriority = priorityNames.has(b.name);
      if (aPriority && !bPriority) return -1;
      if (!aPriority && bPriority) return 1;
      
      return 0;
    })
    .slice(0, 100);
};
