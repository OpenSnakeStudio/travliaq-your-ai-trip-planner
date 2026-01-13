/**
 * Action Parser - Parse action tags from chat responses
 */

import { getCityCoords } from "../types";
import type { ChatQuickAction, WidgetType } from "@/types/flight";

/**
 * Parse action tags from chat content
 * Actions are embedded as <action>{"type": "zoom", "city": "Paris"}</action>
 * or <action>{"type": "chooseWidget", "widgetType": "destinationSuggestions", "option": "Japon"}</action>
 */
export function parseAction(content: string): {
  cleanContent: string;
  action: ChatQuickAction | null;
} {
  const actionMatch = content.match(/<action>(.*?)<\/action>/s);
  const cleanContent = content.replace(/<action>.*?<\/action>/gs, "").trim();

  if (!actionMatch) return { cleanContent, action: null };

  try {
    const actionData = JSON.parse(actionMatch[1]);

    // Handle zoom action
    if (actionData.type === "zoom" && actionData.city) {
      const coords = getCityCoords(actionData.city);
      if (coords) {
        return { cleanContent, action: { type: "zoom", center: coords, zoom: 12 } };
      }
    }

    // Handle tab action
    if (actionData.type === "tab" && actionData.tab) {
      return { cleanContent, action: { type: "tab", tab: actionData.tab } };
    }

    // Handle tabAndZoom action
    if (actionData.type === "tabAndZoom" && actionData.tab && actionData.city) {
      const coords = getCityCoords(actionData.city);
      if (coords) {
        return {
          cleanContent,
          action: { type: "tabAndZoom", tab: actionData.tab, center: coords, zoom: 12 },
        };
      }
    }

    // Handle chooseWidget action - LLM makes a choice for the user
    if (actionData.type === "chooseWidget" && actionData.widgetType && actionData.option) {
      return {
        cleanContent,
        action: {
          type: "chooseWidget",
          widgetType: actionData.widgetType as WidgetType,
          option: actionData.option,
          optionData: actionData.optionData,
          reason: actionData.reason,
        },
      };
    }
  } catch (e) {
    console.error("Failed to parse action:", e);
  }

  return { cleanContent, action: null };
}
