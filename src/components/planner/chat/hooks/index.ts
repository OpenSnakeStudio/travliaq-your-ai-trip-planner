/**
 * Chat Hooks - Custom hooks for the chat system
 */

// Streaming and API
export {
  useChatStream,
  type APIMessage,
  type StreamResult,
  type MemoryContext,
  type StreamError,
  type StreamErrorType,
  type UseChatStreamOptions,
} from "./useChatStream";

// Widget flow management
export { useChatWidgetFlow, type UseChatWidgetFlowOptions, type WidgetFlowState } from "./useChatWidgetFlow";

// Imperative handlers
export {
  useChatImperativeHandlers,
  type UseChatImperativeHandlersOptions,
} from "./useChatImperativeHandlers";

// Workflow integration
export {
  useChatWorkflow,
  type UseChatWorkflowOptions,
  type UseChatWorkflowReturn,
} from "./useChatWorkflow";

// Widget tracking for LLM context
export { useWidgetTracking } from "./useWidgetTracking";

// Performance optimization hooks
export {
  useDebounce,
  useDebouncedCallback,
  useThrottle,
  useThrottledCallback,
  useStableCallback,
  useLazyInit,
  usePrevious,
  useUpdateEffect,
  useIsMounted,
  useRenderCount,
  useMemoCompare,
} from "./usePerformance";
