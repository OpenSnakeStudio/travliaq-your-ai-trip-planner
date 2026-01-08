/**
 * Chat Components - Barrel export
 */

// Types
export * from "./types";

// Core components
export { ChatInput, type ChatInputRef } from "./ChatInput";
export { ChatMessage } from "./ChatMessage";
export { ChatMessages } from "./ChatMessages";
export { QuickReplies, QUICK_REPLY_PRESETS } from "./QuickReplies";

// Widgets
export {
  DatePickerWidget,
  DateRangePickerWidget,
  TravelersWidget,
  TravelersConfirmBeforeSearchWidget,
  TripTypeConfirmWidget,
  CitySelectionWidget,
  AirportButton,
  DualAirportSelection,
  AirportConfirmationWidget,
} from "./widgets";

// Rich Content
export {
  DestinationCard,
  FlightPreview,
  FlightPreviewList,
  ActivityCarousel,
  HotelCarousel,
} from "./RichContent";

// Hooks
export {
  useChatStream,
  useChatWidgetFlow,
  useChatImperativeHandlers,
  type APIMessage,
  type StreamResult,
  type MemoryContext,
  type UseChatWidgetFlowOptions,
  type WidgetFlowState,
  type UseChatImperativeHandlersOptions,
} from "./hooks";

// Utils
export {
  parseAction,
  flightDataToMemory,
  getMissingFieldLabel,
  formatMissingFieldsMessage,
  type FlightMemoryUpdate,
} from "./utils";

// Machines (XState)
// NOTE: To use the state machine, install @xstate/react: npm install @xstate/react
export {
  chatMachine,
  useChatMachine,
  type ChatMachineContext,
  type ChatMachineEvent,
  type TravelerCounts,
  type UseChatMachineReturn,
} from "./machines";
