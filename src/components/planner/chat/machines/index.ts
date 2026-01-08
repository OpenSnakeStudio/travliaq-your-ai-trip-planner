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
