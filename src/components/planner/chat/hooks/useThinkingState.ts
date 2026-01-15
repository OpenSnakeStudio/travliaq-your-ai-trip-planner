/**
 * useThinkingState - Hook to manage AI thinking/reasoning state
 * 
 * Tracks when the AI is processing and provides reasoning data
 * for the ThinkingIndicator component.
 */

import { useState, useCallback, useRef } from "react";
import type { ReasoningData } from "./useChatStream";

export interface ThinkingState {
  isThinking: boolean;
  reasoning: ReasoningData | null;
  thinkingStartTime: number | null;
}

export interface UseThinkingStateReturn {
  /** Whether AI is currently in thinking phase */
  isThinking: boolean;
  /** Reasoning data from Chain of Thought */
  reasoning: ReasoningData | null;
  /** Duration of thinking in ms (null if not thinking) */
  thinkingDuration: number | null;
  /** Start thinking phase */
  startThinking: () => void;
  /** Set reasoning data (received from stream) */
  setReasoning: (data: ReasoningData) => void;
  /** Stop thinking phase */
  stopThinking: () => void;
  /** Reset all state */
  reset: () => void;
}

/**
 * Hook to manage AI thinking/reasoning state
 */
export function useThinkingState(): UseThinkingStateReturn {
  const [state, setState] = useState<ThinkingState>({
    isThinking: false,
    reasoning: null,
    thinkingStartTime: null,
  });

  // Track interval for duration updates
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [thinkingDuration, setThinkingDuration] = useState<number | null>(null);

  const startThinking = useCallback(() => {
    const startTime = Date.now();
    setState({
      isThinking: true,
      reasoning: null,
      thinkingStartTime: startTime,
    });
    setThinkingDuration(0);

    // Update duration every 100ms
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    durationIntervalRef.current = setInterval(() => {
      setThinkingDuration(Date.now() - startTime);
    }, 100);
  }, []);

  const setReasoning = useCallback((data: ReasoningData) => {
    setState((prev) => ({
      ...prev,
      reasoning: data,
    }));
  }, []);

  const stopThinking = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    setState((prev) => ({
      ...prev,
      isThinking: false,
    }));
  }, []);

  const reset = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    setState({
      isThinking: false,
      reasoning: null,
      thinkingStartTime: null,
    });
    setThinkingDuration(null);
  }, []);

  return {
    isThinking: state.isThinking,
    reasoning: state.reasoning,
    thinkingDuration,
    startThinking,
    setReasoning,
    stopThinking,
    reset,
  };
}

export default useThinkingState;
