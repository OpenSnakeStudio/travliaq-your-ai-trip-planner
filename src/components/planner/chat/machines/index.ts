/**
 * Chat Machines - XState state machines for chat flow
 */

export {
  chatMachine,
  type ChatMachineContext,
  type ChatMachineEvent,
  type TravelerCounts,
  type MachineMessage,
  type ChatMachineState,
  type ChatMachineSnapshot,
} from "./chatMachine";

export { useChatMachine, type UseChatMachineReturn } from "./useChatMachine";

// Workflow Machine - Planning step orchestration
export {
  workflowMachine,
  PLANNING_STEPS,
  type PlanningStep,
  type StepMetadata,
  type StepSelections,
  type WorkflowContext,
  type WorkflowEvent,
  type WorkflowMachineState,
  type WorkflowSnapshot,
} from "./workflowMachine";

// Widget Controller Machine - Centralized widget state management
export {
  widgetControllerMachine,
  type WidgetControllerContext,
  type WidgetControllerEvent,
  type TravelerConfig,
  type CollectedFlightData,
  type ActiveWidget,
  type WidgetControllerState,
  type WidgetControllerSnapshot,
} from "./widgetControllerMachine";
