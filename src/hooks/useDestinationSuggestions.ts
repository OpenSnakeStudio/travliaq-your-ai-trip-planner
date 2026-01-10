/**
 * React Query hook for destination suggestions
 */

import { useQuery } from "@tanstack/react-query";
import { getDestinationSuggestions } from "@/services/destinations";
import type { DestinationSuggestRequest, DestinationSuggestResponse } from "@/types/destinations";

interface UseDestinationSuggestionsOptions {
  limit?: number;
  enabled?: boolean;
}

export function useDestinationSuggestions(
  preferences: DestinationSuggestRequest,
  options?: UseDestinationSuggestionsOptions
) {
  return useQuery<DestinationSuggestResponse, Error>({
    queryKey: ["destinations", "suggest", preferences],
    queryFn: () => getDestinationSuggestions(preferences, { limit: options?.limit }),
    enabled: options?.enabled ?? false, // Manual trigger by default
    staleTime: 1000 * 60 * 60, // 1 hour cache (matches backend)
    gcTime: 1000 * 60 * 60 * 2, // 2 hours garbage collection
  });
}
