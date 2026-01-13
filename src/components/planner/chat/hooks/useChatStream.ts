/**
 * useChatStream - Hook for streaming chat responses via SSE
 *
 * Features:
 * - SSE streaming with content updates
 * - AbortController for cancellation
 * - Retry mechanism with exponential backoff
 * - Error classification and handling
 * - Mounted check for cleanup
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { FlightFormData } from "@/types/flight";
import type { MissingField } from "@/contexts/FlightMemoryContext";
import { getMissingFieldLabel } from "../utils/flightDataToMemory";

/**
 * API message format for the chat endpoint
 */
export interface APIMessage {
  role: string;
  content: string;
}

/**
 * Stream response result
 */
export interface StreamResult {
  content: string;
  flightData: FlightFormData | null;
  accommodationData: any | null;
  quickReplies: QuickReplyData | null;
}

/**
 * Quick replies data from AI
 */
export interface QuickReplyData {
  replies: Array<{
    label: string;
    emoji: string;
    message: string;
  }>;
}

/**
 * Travel phase for adaptive chat behavior
 */
export type TravelPhase = "inspiration" | "research" | "comparison" | "planning" | "booking";

/**
 * Negative preference from user
 */
export interface NegativePreference {
  category: string;
  value: string;
  reason?: string;
}

/**
 * Memory context for building API requests
 */
export interface MemoryContext {
  flightSummary: string;
  activityContext: string;
  preferenceContext: string;
  missingFields: MissingField[];
  // NEW: Widget interaction history for better LLM context
  widgetHistory?: string;
  // NEW: Current travel phase for adaptive behavior
  currentPhase?: TravelPhase;
  // NEW: Negative preferences to avoid
  negativePreferences?: NegativePreference[];
}

/**
 * Callback for content updates during streaming
 */
export type OnContentUpdate = (messageId: string, content: string, isComplete: boolean) => void;

/**
 * Error types for better error handling
 */
export type StreamErrorType =
  | "network"      // Network connectivity issues
  | "auth"         // Authentication failures
  | "server"       // Server errors (5xx)
  | "rate_limit"   // Rate limiting (429)
  | "timeout"      // Request timeout
  | "cancelled"    // User cancelled
  | "unknown";     // Unknown error

/**
 * Stream error with classification
 */
export interface StreamError extends Error {
  type: StreamErrorType;
  retryable: boolean;
  statusCode?: number;
}

/**
 * Retry configuration
 */
interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
};

/**
 * Create a StreamError with classification
 */
function createStreamError(
  message: string,
  type: StreamErrorType,
  statusCode?: number
): StreamError {
  const error = new Error(message) as StreamError;
  error.type = type;
  error.statusCode = statusCode;
  error.retryable = type === "network" || type === "server" || type === "timeout";
  return error;
}

/**
 * Classify error based on response or exception
 */
function classifyError(error: unknown, statusCode?: number): StreamError {
  if (error instanceof Error) {
    // Check for abort
    if (error.name === "AbortError") {
      return createStreamError("Requête annulée", "cancelled");
    }

    // Check for network errors
    if (error.message.includes("fetch") || error.message.includes("network")) {
      return createStreamError("Erreur de connexion réseau", "network");
    }
  }

  // Classify by status code
  if (statusCode) {
    if (statusCode === 401 || statusCode === 403) {
      return createStreamError("Session expirée, veuillez vous reconnecter", "auth", statusCode);
    }
    if (statusCode === 429) {
      return createStreamError("Trop de requêtes, veuillez patienter", "rate_limit", statusCode);
    }
    if (statusCode >= 500) {
      return createStreamError("Erreur serveur, réessai en cours...", "server", statusCode);
    }
  }

  return createStreamError(
    error instanceof Error ? error.message : "Erreur inconnue",
    "unknown"
  );
}

/**
 * Calculate delay for exponential backoff
 */
function calculateBackoffDelay(attempt: number, config: RetryConfig): number {
  const delay = config.baseDelayMs * Math.pow(2, attempt);
  const jitter = Math.random() * 0.3 * delay; // Add 0-30% jitter
  return Math.min(delay + jitter, config.maxDelayMs);
}

/**
 * Sleep for a given duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Build the context message for the API
 */
function buildContextMessage(memoryContext: MemoryContext): string {
  const { flightSummary, activityContext, preferenceContext, missingFields, widgetHistory } = memoryContext;

  if (!flightSummary) return widgetHistory || "";

  const missingFieldsStr =
    missingFields.length > 0
      ? missingFields.map(getMissingFieldLabel).join(", ")
      : "Aucun - prêt à chercher";

  let context = `[CONTEXTE MÉMOIRE] ${flightSummary}${activityContext}${preferenceContext}\n[CHAMPS MANQUANTS] ${missingFieldsStr}`;
  
  // Add widget history if available
  if (widgetHistory) {
    context += `\n${widgetHistory}`;
  }
  
  return context;
}

/**
 * Build negative preferences context for LLM
 */
function buildNegativePreferencesContext(prefs: NegativePreference[]): string {
  if (!prefs || prefs.length === 0) return "";
  
  const lines = prefs.map(p => {
    return p.reason ? `- ${p.value} (${p.reason})` : `- ${p.value}`;
  });
  
  return `[PRÉFÉRENCES NÉGATIVES - NE PAS PROPOSER]\n${lines.join("\n")}`;
}

/**
 * Hook options
 */
export interface UseChatStreamOptions {
  retryConfig?: Partial<RetryConfig>;
  onError?: (error: StreamError) => void;
  onRetry?: (attempt: number, maxRetries: number) => void;
}

/**
 * Hook for streaming chat responses
 */
export function useChatStream(options: UseChatStreamOptions = {}) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<StreamError | null>(null);

  // Track mounted state for cleanup
  const isMountedRef = useRef(true);

  // Store current abort controller
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Cancel the current stream
   */
  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const streamResponse = useCallback(
    async (
      apiMessages: APIMessage[],
      messageId: string,
      memoryContext: MemoryContext,
      onContentUpdate: OnContentUpdate
    ): Promise<StreamResult> => {
      // Cancel any previous request
      cancelStream();

      // Create new abort controller
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...options.retryConfig };

      if (isMountedRef.current) {
        setIsStreaming(true);
        setError(null);
      }

      let fullContent = "";
      let flightData: FlightFormData | null = null;
      let accommodationData: any | null = null;
      let lastError: StreamError | null = null;

      for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
        try {
          // Check if cancelled
          if (abortController.signal.aborted) {
            throw createStreamError("Requête annulée", "cancelled");
          }

          // Notify retry attempt
          if (attempt > 0 && options.onRetry) {
            options.onRetry(attempt, retryConfig.maxRetries);
          }

          const contextMessage = buildContextMessage(memoryContext);
          const negativeContext = buildNegativePreferencesContext(memoryContext.negativePreferences || []);

          // Get session
          const session = (await supabase.auth.getSession()).data.session;
          const supabaseUrl = "https://cinbnmlfpffmyjmkwbco.supabase.co";
          const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpbmJubWxmcGZmbXlqbWt3YmNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NDQ2MTQsImV4cCI6MjA3MzUyMDYxNH0.yrju-Pv4OlfU9Et-mRWg0GRHTusL7ZpJevqKemJFbuA";

          const response = await fetch(
            `${supabaseUrl}/functions/v1/planner-chat`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session?.access_token}`,
                apikey: supabaseAnonKey,
              },
              body: JSON.stringify({
                messages: apiMessages,
                stream: true,
                memoryContext: contextMessage,
                missingFields: memoryContext.missingFields,
                currentPhase: memoryContext.currentPhase || "research",
                negativePreferences: negativeContext,
                widgetHistory: memoryContext.widgetHistory || "",
              }),
              signal: abortController.signal,
            }
          );

          if (!response.ok) {
            throw classifyError(null, response.status);
          }

          const reader = response.body!.getReader();
          const decoder = new TextDecoder();

      // Reset content for this attempt
      fullContent = "";
      let quickReplies: QuickReplyData | null = null;
      
      // Throttle UI updates to reduce re-renders (max every 50ms)
          let lastUpdateTime = 0;
          const THROTTLE_MS = 50;
          let pendingUpdate = false;
          
          const throttledUpdate = () => {
            const now = Date.now();
            if (now - lastUpdateTime >= THROTTLE_MS) {
              lastUpdateTime = now;
              if (isMountedRef.current) {
                onContentUpdate(messageId, fullContent, false);
              }
              pendingUpdate = false;
            } else if (!pendingUpdate) {
              pendingUpdate = true;
              setTimeout(() => {
                if (isMountedRef.current && pendingUpdate) {
                  lastUpdateTime = Date.now();
                  onContentUpdate(messageId, fullContent, false);
                  pendingUpdate = false;
                }
              }, THROTTLE_MS - (now - lastUpdateTime));
            }
          };

          while (true) {
            // Check if cancelled
            if (abortController.signal.aborted) {
              reader.cancel();
              throw createStreamError("Requête annulée", "cancelled");
            }

            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n").filter((line) => line.trim() !== "");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const jsonStr = line.slice(6);
                if (jsonStr === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(jsonStr);

                  if (parsed.type === "flightData" && parsed.flightData) {
                    flightData = parsed.flightData;
                  } else if (parsed.type === "accommodationData" && parsed.accommodationData) {
                    accommodationData = parsed.accommodationData;
                  } else if (parsed.type === "quickReplies" && parsed.quickReplies) {
                    quickReplies = parsed.quickReplies;
                  } else if (parsed.type === "content" && parsed.content) {
                    fullContent += parsed.content;
                    // Throttled content update to reduce flickering
                    throttledUpdate();
                  }
                } catch {
                  // Ignore parse errors for malformed chunks
                }
              }
            }
          }

          // Success - mark streaming as complete
          if (isMountedRef.current) {
            onContentUpdate(messageId, fullContent, true);
          }

          return { content: fullContent, flightData, accommodationData, quickReplies };

        } catch (err) {
          lastError = err instanceof Error && "type" in err
            ? (err as StreamError)
            : classifyError(err);

          // Don't retry non-retryable errors
          if (!lastError.retryable || lastError.type === "cancelled") {
            break;
          }

          // Don't retry if we've exhausted attempts
          if (attempt >= retryConfig.maxRetries) {
            break;
          }

          // Wait before retrying
          const delay = calculateBackoffDelay(attempt, retryConfig);
          await sleep(delay);
        }
      }

      // All retries failed
      if (isMountedRef.current) {
        setError(lastError);
        if (options.onError && lastError) {
          options.onError(lastError);
        }
      }

      throw lastError || createStreamError("Erreur inconnue", "unknown");
    },
    [cancelStream, options]
  );

  // Cleanup streaming state
  useEffect(() => {
    return () => {
      if (isMountedRef.current) {
        setIsStreaming(false);
      }
    };
  }, []);

  return {
    streamResponse,
    isStreaming,
    error,
    cancelStream,
    clearError: useCallback(() => setError(null), []),
  };
}

export default useChatStream;
