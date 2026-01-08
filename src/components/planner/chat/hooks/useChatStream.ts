/**
 * useChatStream - Hook for streaming chat responses via SSE
 */

import { useState, useCallback } from "react";
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
}

/**
 * Memory context for building API requests
 */
export interface MemoryContext {
  flightSummary: string;
  activityContext: string;
  preferenceContext: string;
  missingFields: MissingField[];
}

/**
 * Callback for content updates during streaming
 */
export type OnContentUpdate = (messageId: string, content: string, isComplete: boolean) => void;

/**
 * Build the context message for the API
 */
function buildContextMessage(memoryContext: MemoryContext): string {
  const { flightSummary, activityContext, preferenceContext, missingFields } = memoryContext;

  if (!flightSummary) return "";

  const missingFieldsStr =
    missingFields.length > 0
      ? missingFields.map(getMissingFieldLabel).join(", ")
      : "Aucun - prêt à chercher";

  return `[CONTEXTE MÉMOIRE] ${flightSummary}${activityContext}${preferenceContext}\n[CHAMPS MANQUANTS] ${missingFieldsStr}`;
}

/**
 * Hook for streaming chat responses
 */
export function useChatStream() {
  const [isStreaming, setIsStreaming] = useState(false);

  const streamResponse = useCallback(
    async (
      apiMessages: APIMessage[],
      messageId: string,
      memoryContext: MemoryContext,
      onContentUpdate: OnContentUpdate
    ): Promise<StreamResult> => {
      setIsStreaming(true);

      let fullContent = "";
      let flightData: FlightFormData | null = null;
      let accommodationData: any | null = null;

      try {
        const contextMessage = buildContextMessage(memoryContext);

        const response = await fetch(
          `https://cinbnmlfpffmyjmkwbco.supabase.co/functions/v1/planner-chat`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${
                (await supabase.auth.getSession()).data.session?.access_token
              }`,
              apikey:
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpbmJubWxmcGZmbXlqbWt3YmNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NDQ2MTQsImV4cCI6MjA3MzUyMDYxNH0.yrju-Pv4OlfU9Et-mRWg0GRHTusL7ZpJevqKemJFbuA",
            },
            body: JSON.stringify({
              messages: apiMessages,
              stream: true,
              memoryContext: contextMessage,
              missingFields: memoryContext.missingFields,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Stream request failed");
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();

        while (true) {
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
                } else if (parsed.type === "content" && parsed.content) {
                  fullContent += parsed.content;
                  // Notify about content update (streaming)
                  onContentUpdate(messageId, fullContent, false);
                }
              } catch (e) {
                // Ignore parse errors for malformed chunks
              }
            }
          }
        }

        // Mark streaming as complete
        onContentUpdate(messageId, fullContent, true);

        return { content: fullContent, flightData, accommodationData };
      } finally {
        setIsStreaming(false);
      }
    },
    []
  );

  return {
    streamResponse,
    isStreaming,
  };
}

export default useChatStream;
