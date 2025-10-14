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
  if (!searchTerm) return cities.slice(0, 50); // Show first 50 by default

  const lowerSearch = searchTerm.toLowerCase();
  return cities
    .filter(city => 
      city.search_text.includes(lowerSearch)
    )
    .slice(0, 100); // Limit results to 100
};
