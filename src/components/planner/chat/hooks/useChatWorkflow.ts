/**
 * useChatWorkflow - Integration hook for workflow, booking, and export
 *
 * This hook provides a unified interface for:
 * - Workflow state management (from XState machine)
 * - Booking flow orchestration
 * - Trip export functionality
 * - Proactive alerts integration
 *
 * IMPORTANT: This hook properly cleans up eventBus emissions and refs
 * to prevent memory leaks.
 */

import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { eventBus } from "@/lib/eventBus";
import type { BookingSummary, BookingItem, TravelerInfo, ContactInfo } from "../widgets/booking/BookingFlowWidget";
import {
  exportTrip,
  downloadExport,
  type ExportFormat,
  type ExportOptions,
} from "../services/tripExport";
import {
  getWorkflowProgress,
  getMissingFields,
  isReadyForSearch,
  calculateTripCost,
  getSuggestedActions,
  type WorkflowProgress,
  type MissingField,
  type TripCost,
  type SuggestedAction,
} from "../services/workflowController";
import {
  detectConflicts,
  isTripBookable,
  type ConflictDetectionResult,
} from "../services/conflictDetector";
import {
  getProactiveAlerts,
  getCriticalAlertsCount,
  type ProactiveAlert,
} from "../services/proactiveAlerts";
import type { WorkflowContext } from "../machines/workflowMachine";

/**
 * Booking state
 */
interface BookingState {
  isActive: boolean;
  currentStep: "summary" | "travelers" | "contact" | "payment" | "confirmation";
  travelers: TravelerInfo[];
  contact: ContactInfo | null;
  selectedItems: BookingItem[];
  processingItemId: string | null;
}

/**
 * Export state
 */
interface ExportState {
  isExporting: boolean;
  lastExportFormat: ExportFormat | null;
  exportError: string | null;
}

/**
 * Hook options
 */
export interface UseChatWorkflowOptions {
  /** Current workflow context from state machine */
  context: WorkflowContext;
  /** Callback when booking is completed */
  onBookingComplete?: (summary: BookingSummary) => void;
  /** Callback when export is completed */
  onExportComplete?: (format: ExportFormat, data: string) => void;
  /** Callback when a conflict is detected */
  onConflictDetected?: (conflicts: ConflictDetectionResult) => void;
}

/**
 * Hook return type
 */
export interface UseChatWorkflowReturn {
  // Workflow state
  progress: WorkflowProgress;
  missingFields: MissingField[];
  isSearchReady: boolean;
  tripCost: TripCost | null;
  suggestedActions: SuggestedAction[];
  conflicts: ConflictDetectionResult;
  alerts: ProactiveAlert[];
  criticalAlertsCount: number;
  isBookable: boolean;

  // Booking
  bookingState: BookingState;
  startBooking: () => void;
  cancelBooking: () => void;
  setBookingStep: (step: BookingState["currentStep"]) => void;
  addToBooking: (item: BookingItem) => void;
  removeFromBooking: (itemId: string) => void;
  updateTravelers: (travelers: TravelerInfo[]) => void;
  updateContact: (contact: ContactInfo) => void;
  processBooking: (itemId: string) => Promise<boolean>;
  getBookingSummary: () => BookingSummary | null;

  // Export
  exportState: ExportState;
  exportTrip: (format: ExportFormat, options?: ExportOptions) => Promise<void>;
  downloadLastExport: () => void;

  // Actions
  goToStep: (step: string) => void;
  triggerSearch: (searchType?: "flights" | "hotels" | "activities") => void;
}

/**
 * Initial booking state
 */
const INITIAL_BOOKING_STATE: BookingState = {
  isActive: false,
  currentStep: "summary",
  travelers: [],
  contact: null,
  selectedItems: [],
  processingItemId: null,
};

/**
 * Initial export state
 */
const INITIAL_EXPORT_STATE: ExportState = {
  isExporting: false,
  lastExportFormat: null,
  exportError: null,
};

/**
 * useChatWorkflow Hook
 *
 * @example
 * ```tsx
 * const {
 *   progress,
 *   isSearchReady,
 *   bookingState,
 *   startBooking,
 *   exportTrip,
 * } = useChatWorkflow({
 *   context: workflowContext,
 *   onBookingComplete: (summary) => console.log("Booked!", summary),
 * });
 *
 * // Start booking flow
 * if (isSearchReady) {
 *   startBooking();
 * }
 *
 * // Export trip
 * await exportTrip("pdf");
 * ```
 */
export function useChatWorkflow(
  options: UseChatWorkflowOptions
): UseChatWorkflowReturn {
  const { context, onBookingComplete, onExportComplete, onConflictDetected } =
    options;

  // Booking state
  const [bookingState, setBookingState] = useState<BookingState>(
    INITIAL_BOOKING_STATE
  );

  // Export state
  const [exportState, setExportState] = useState<ExportState>(
    INITIAL_EXPORT_STATE
  );

  // Last export data ref
  const lastExportDataRef = useRef<{
    data: string;
    filename: string;
    mimeType: string;
  } | null>(null);

  // Computed workflow values
  const progress = useMemo(() => getWorkflowProgress(context), [context]);

  const missingFields = useMemo(() => getMissingFields(context), [context]);

  const isSearchReady = useMemo(() => isReadyForSearch(context), [context]);

  const tripCost = useMemo(() => {
    try {
      return calculateTripCost(context);
    } catch {
      return null;
    }
  }, [context]);

  const suggestedActions = useMemo(
    () => getSuggestedActions(context),
    [context]
  );

  const conflicts = useMemo(() => {
    const result = detectConflicts(context);
    if (result.hasBlockingConflicts && onConflictDetected) {
      onConflictDetected(result);
    }
    return result;
  }, [context, onConflictDetected]);

  const alerts = useMemo(() => getProactiveAlerts(context), [context]);

  const criticalAlertsCount = useMemo(
    () => getCriticalAlertsCount(alerts),
    [alerts]
  );

  const isBookable = useMemo(
    () => isTripBookable(detectConflicts(context)),
    [context]
  );

  // Booking actions
  const startBooking = useCallback(() => {
    setBookingState((prev) => ({
      ...prev,
      isActive: true,
      currentStep: "summary",
    }));
    eventBus.emit("booking:start", { context });
  }, [context]);

  const cancelBooking = useCallback(() => {
    setBookingState(INITIAL_BOOKING_STATE);
    eventBus.emit("booking:cancel", {});
  }, []);

  const setBookingStep = useCallback(
    (step: BookingState["currentStep"]) => {
      setBookingState((prev) => ({
        ...prev,
        currentStep: step,
      }));
      eventBus.emit("booking:stepChange", { step });
    },
    []
  );

  const addToBooking = useCallback((item: BookingItem) => {
    setBookingState((prev) => ({
      ...prev,
      selectedItems: [...prev.selectedItems, item],
    }));
    eventBus.emit("booking:addItem", { item });
  }, []);

  const removeFromBooking = useCallback((itemId: string) => {
    setBookingState((prev) => ({
      ...prev,
      selectedItems: prev.selectedItems.filter((item) => item.id !== itemId),
    }));
    eventBus.emit("booking:removeItem", { itemId });
  }, []);

  const updateTravelers = useCallback((travelers: TravelerInfo[]) => {
    setBookingState((prev) => ({
      ...prev,
      travelers,
    }));
  }, []);

  const updateContact = useCallback((contact: ContactInfo) => {
    setBookingState((prev) => ({
      ...prev,
      contact,
    }));
  }, []);

  // Ref to track if component is mounted (for async cleanup)
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Clear export data ref on unmount
      lastExportDataRef.current = null;
    };
  }, []);

  const processBooking = useCallback(
    async (itemId: string): Promise<boolean> => {
      // Guard against concurrent processing of the same item
      setBookingState((prev) => {
        // If already processing, don't change state
        if (prev.processingItemId !== null) {
          return prev;
        }
        return {
          ...prev,
          processingItemId: itemId,
        };
      });

      try {
        // Simulate booking API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Only update state if still mounted
        if (!isMountedRef.current) return false;

        setBookingState((prev) => ({
          ...prev,
          processingItemId: null,
          selectedItems: prev.selectedItems.map((item) =>
            item.id === itemId ? { ...item, status: "confirmed" as const } : item
          ),
        }));

        eventBus.emit("booking:itemConfirmed", { itemId });
        return true;
      } catch (error) {
        // Only update state if still mounted
        if (!isMountedRef.current) return false;

        setBookingState((prev) => ({
          ...prev,
          processingItemId: null,
          selectedItems: prev.selectedItems.map((item) =>
            item.id === itemId ? { ...item, status: "failed" as const } : item
          ),
        }));
        return false;
      }
    },
    []
  );

  const getBookingSummary = useCallback((): BookingSummary | null => {
    if (!bookingState.isActive || bookingState.selectedItems.length === 0) {
      return null;
    }

    const items = bookingState.selectedItems;
    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    const fees = Math.round(subtotal * 0.02); // 2% fees
    const total = subtotal + fees;

    // Access selections from context (not root level)
    const { selections } = context;

    return {
      items,
      subtotal,
      fees,
      total,
      currency: "EUR",
      travelers: {
        adults: selections.travelers?.adults || 1,
        children: selections.travelers?.children || 0,
        infants: selections.travelers?.infants || 0,
      },
      dates: {
        departure: selections.dates?.departure
          ? new Date(selections.dates.departure)
          : new Date(),
        return: selections.dates?.return
          ? new Date(selections.dates.return)
          : undefined,
      },
      destination: selections.destination?.city || "Destination",
    };
  }, [bookingState, context]);

  // Export actions
  const handleExportTrip = useCallback(
    async (format: ExportFormat, exportOptions?: ExportOptions) => {
      setExportState({
        isExporting: true,
        lastExportFormat: format,
        exportError: null,
      });

      try {
        const result = await exportTrip(context, format, exportOptions);

        lastExportDataRef.current = result;

        setExportState({
          isExporting: false,
          lastExportFormat: format,
          exportError: null,
        });

        // Auto-download for certain formats
        if (format === "pdf" || format === "ical") {
          downloadExport(result.data, result.filename, result.mimeType);
        }

        if (onExportComplete) {
          onExportComplete(format, result.data);
        }

        eventBus.emit("trip:exported", { format, filename: result.filename });
      } catch (error) {
        setExportState({
          isExporting: false,
          lastExportFormat: format,
          exportError:
            error instanceof Error ? error.message : "Export failed",
        });
      }
    },
    [context, onExportComplete]
  );

  const downloadLastExport = useCallback(() => {
    if (lastExportDataRef.current) {
      const { data, filename, mimeType } = lastExportDataRef.current;
      downloadExport(data, filename, mimeType);
    }
  }, []);

  // Navigation actions
  const goToStep = useCallback((step: string) => {
    eventBus.emit("workflow:goToStep", { step });
  }, []);

  const triggerSearch = useCallback(
    (searchType?: "flights" | "hotels" | "activities") => {
      if (searchType) {
        eventBus.emit(`${searchType}:triggerSearch` as "flights:triggerSearch", {});
      } else {
        eventBus.emit("flight:triggerSearch", {});
      }
    },
    []
  );

  // Complete booking handler
  const handleBookingComplete = useCallback(() => {
    const summary = getBookingSummary();
    if (summary && onBookingComplete) {
      onBookingComplete(summary);
    }

    setBookingState((prev) => ({
      ...prev,
      currentStep: "confirmation",
    }));
  }, [getBookingSummary, onBookingComplete]);

  // Watch for all items confirmed (using useEffect, not useMemo, for side effects)
  useEffect(() => {
    if (
      bookingState.isActive &&
      bookingState.selectedItems.length > 0 &&
      bookingState.selectedItems.every((item) => item.status === "confirmed")
    ) {
      handleBookingComplete();
    }
  }, [bookingState.isActive, bookingState.selectedItems, handleBookingComplete]);

  return {
    // Workflow state
    progress,
    missingFields,
    isSearchReady,
    tripCost,
    suggestedActions,
    conflicts,
    alerts,
    criticalAlertsCount,
    isBookable,

    // Booking
    bookingState,
    startBooking,
    cancelBooking,
    setBookingStep,
    addToBooking,
    removeFromBooking,
    updateTravelers,
    updateContact,
    processBooking,
    getBookingSummary,

    // Export
    exportState,
    exportTrip: handleExportTrip,
    downloadLastExport,

    // Actions
    goToStep,
    triggerSearch,
  };
}

export default useChatWorkflow;
