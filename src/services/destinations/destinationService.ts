/**
 * Destination Suggestions API Service
 * Calls the external /api/v1/destinations/suggest endpoint
 */

import type {
  DestinationSuggestRequest,
  DestinationSuggestResponse,
  SuggestionErrorResponse,
} from "@/types/destinations";

const API_BASE = import.meta.env.VITE_API_URL || "";

export interface GetDestinationSuggestionsOptions {
  limit?: number;
  forceRefresh?: boolean;
}

/**
 * Fetches destination suggestions based on user preferences
 */
export async function getDestinationSuggestions(
  preferences: DestinationSuggestRequest,
  options?: GetDestinationSuggestionsOptions
): Promise<DestinationSuggestResponse> {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.forceRefresh) params.set("force_refresh", "true");

  const queryString = params.toString();
  const url = `${API_BASE}/api/v1/destinations/suggest${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(preferences),
  });

  if (!response.ok) {
    let errorMessage = "Failed to get destination suggestions";
    try {
      const errorData: SuggestionErrorResponse = await response.json();
      errorMessage = errorData.error?.message || errorMessage;
    } catch {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Health check for the destination suggestions service
 */
export async function checkDestinationsHealth(): Promise<{
  status: "healthy" | "degraded" | "unavailable";
  llm_enabled: boolean;
  profiles_loaded: number;
}> {
  const response = await fetch(`${API_BASE}/api/v1/destinations/suggest/health`);
  
  if (!response.ok) {
    return {
      status: "unavailable",
      llm_enabled: false,
      profiles_loaded: 0,
    };
  }
  
  return response.json();
}
