/**
 * QuickReplies - Clickable chips after assistant messages for guided interaction
 * Fully i18n-enabled
 */

import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { eventBus, emitTabChange } from "@/lib/eventBus";
import type { QuickReply, QuickReplyAction } from "./types";

interface QuickRepliesProps {
  replies: QuickReply[];
  onSendMessage: (message: string) => void;
  onFillInput?: (message: string) => void;
  onTriggerWidget?: (widget: string) => void;
  disabled?: boolean;
  className?: string;
}

export function QuickReplies({
  replies,
  onSendMessage,
  onFillInput,
  onTriggerWidget,
  disabled = false,
  className,
}: QuickRepliesProps) {
  const handleQuickReply = (reply: QuickReply) => {
    if (disabled) return;

    const action = reply.action;

    switch (action.type) {
      // IMPORTANT: sendMessage now behaves like fillInput - never send directly!
      // This ensures users always have a chance to review/modify before sending
      case "sendMessage":
      case "fillInput":
        onFillInput?.(action.message);
        break;

      case "triggerWidget":
        onTriggerWidget?.(action.widget);
        break;

      case "emitEvent":
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        eventBus.emit(action.event as any, action.payload);
        break;

      case "navigate":
        emitTabChange(action.tab);
        break;
    }
  };

  if (!replies || replies.length === 0) return null;

  // Handle horizontal scroll with mouse wheel
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY !== 0) {
      e.currentTarget.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  };

  return (
    <div
      onWheel={handleWheel}
      className={cn(
        "flex gap-2 mt-3 overflow-x-auto pb-1 themed-scroll",
        className
      )}
      style={{ scrollbarWidth: 'thin' }}
    >
      {replies.map((reply) => (
        <button
          key={reply.id}
          onClick={() => handleQuickReply(reply)}
          disabled={disabled}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all shrink-0",
            "hover:scale-[1.02] active:scale-[0.98]",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1",
            // Variants
            reply.variant === "primary" && [
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90",
              "shadow-sm shadow-primary/20",
            ],
            reply.variant === "outline" && [
              "border border-border bg-background text-foreground",
              "hover:bg-accent hover:border-primary/50",
            ],
            (!reply.variant || reply.variant === "default") && [
              "bg-muted text-foreground",
              "hover:bg-muted/80 hover:text-primary",
            ],
            // Disabled state
            disabled && "opacity-50 cursor-not-allowed hover:scale-100"
          )}
        >
          {reply.icon && <span className="text-base leading-none">{reply.icon}</span>}
          <span>{reply.label}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * Hook to get localized quick reply presets
 */
export function useQuickReplyPresets() {
  const { t } = useTranslation();
  
  return {
    afterDestination: (city: string): QuickReply[] => [
      {
        id: "when-to-go",
        label: t("planner.quick.whenToGo"),
        icon: "📅",
        action: { type: "triggerWidget", widget: "datePicker" },
      },
      {
        id: "budget",
        label: t("planner.quick.howMuch"),
        icon: "💰",
        action: { type: "fillInput", message: `Quel est le budget moyen pour un voyage à ${city}?` },
      },
      {
        id: "activities",
        label: t("planner.quick.seeActivities"),
        icon: "🎭",
        action: { type: "navigate", tab: "activities" },
      },
    ],

    afterFlightSearch: (): QuickReply[] => [
      {
        id: "cheapest",
        label: t("planner.quick.cheapestFlight"),
        icon: "💵",
        action: { type: "fillInput", message: "Montre-moi le vol le moins cher" },
        variant: "primary",
      },
      {
        id: "fastest",
        label: t("planner.quick.fastestFlight"),
        icon: "⚡",
        action: { type: "fillInput", message: "Montre-moi le vol le plus rapide" },
      },
      {
        id: "hotels",
        label: t("planner.quick.findHotel"),
        icon: "🏨",
        action: { type: "navigate", tab: "stays" },
      },
    ],

    afterDateSelection: (): QuickReply[] => [
      {
        id: "travelers",
        label: t("planner.quick.travelers"),
        icon: "👥",
        action: { type: "triggerWidget", widget: "travelersSelector" },
      },
      {
        id: "flexible",
        label: t("planner.quick.flexible"),
        icon: "🔄",
        action: { type: "fillInput", message: "Je suis flexible sur les dates, +/- quelques jours" },
      },
    ],

    afterAccommodation: (): QuickReply[] => [
      {
        id: "activities",
        label: t("planner.quick.discoverActivities"),
        icon: "🎡",
        action: { type: "navigate", tab: "activities" },
        variant: "primary",
      },
      {
        id: "other-hotels",
        label: t("planner.quick.otherHotels"),
        icon: "🏨",
        action: { type: "fillInput", message: "Montre-moi d'autres options d'hébergement" },
      },
      {
        id: "summary",
        label: t("planner.quick.summary"),
        icon: "📋",
        action: { type: "fillInput", message: "Fais-moi un récapitulatif de mon voyage" },
      },
    ],

    general: (): QuickReply[] => [
      {
        id: "help",
        label: t("planner.quick.help"),
        icon: "❓",
        action: { type: "fillInput", message: "Comment puis-je planifier mon voyage?" },
      },
      {
        id: "inspire",
        label: t("planner.quick.inspireMe"),
        icon: "✨",
        action: { type: "fillInput", message: "Suggère-moi une destination pour mes prochaines vacances" },
      },
    ],
  };
}

/**
 * Pre-defined quick reply sets for common scenarios
 * @deprecated Use useQuickReplyPresets() hook instead for i18n support
 */
export const QUICK_REPLY_PRESETS = {
  afterDestination: (city: string): QuickReply[] => [
    {
      id: "when-to-go",
      label: "When to go?",
      icon: "📅",
      action: { type: "triggerWidget", widget: "datePicker" },
    },
    {
      id: "budget",
      label: "How much?",
      icon: "💰",
      action: { type: "fillInput", message: `What is the average budget for a trip to ${city}?` },
    },
    {
      id: "activities",
      label: "See activities",
      icon: "🎭",
      action: { type: "navigate", tab: "activities" },
    },
  ],

  afterFlightSearch: (): QuickReply[] => [
    {
      id: "cheapest",
      label: "Cheapest flight",
      icon: "💵",
      action: { type: "fillInput", message: "Show me the cheapest flight" },
      variant: "primary",
    },
    {
      id: "fastest",
      label: "Fastest flight",
      icon: "⚡",
      action: { type: "fillInput", message: "Show me the fastest flight" },
    },
    {
      id: "hotels",
      label: "Find a hotel",
      icon: "🏨",
      action: { type: "navigate", tab: "stays" },
    },
  ],

  afterDateSelection: (): QuickReply[] => [
    {
      id: "travelers",
      label: "Number of travelers",
      icon: "👥",
      action: { type: "triggerWidget", widget: "travelersSelector" },
    },
    {
      id: "flexible",
      label: "Flexible dates?",
      icon: "🔄",
      action: { type: "fillInput", message: "I'm flexible on dates, +/- a few days" },
    },
  ],

  afterAccommodation: (): QuickReply[] => [
    {
      id: "activities",
      label: "Discover activities",
      icon: "🎡",
      action: { type: "navigate", tab: "activities" },
      variant: "primary",
    },
    {
      id: "other-hotels",
      label: "Other hotels",
      icon: "🏨",
      action: { type: "fillInput", message: "Show me other accommodation options" },
    },
    {
      id: "summary",
      label: "Summary",
      icon: "📋",
      action: { type: "fillInput", message: "Give me a summary of my trip" },
    },
  ],

  general: (): QuickReply[] => [
    {
      id: "help",
      label: "Help",
      icon: "❓",
      action: { type: "fillInput", message: "How can I plan my trip?" },
    },
    {
      id: "inspire",
      label: "Inspire me",
      icon: "✨",
      action: { type: "fillInput", message: "Suggest a destination for my next vacation" },
    },
  ],
} as const;
