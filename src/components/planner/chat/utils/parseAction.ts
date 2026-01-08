/**
 * Action Parser - Parse action tags from chat responses
 */

import { getCityCoords } from "../types";
import type { ChatQuickAction } from "@/types/flight";

/**
 * Parse action tags from chat content
 * Actions are embedded as <action>{"type": "zoom", "city": "Paris"}</action>
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

    if (actionData.type === "zoom" && actionData.city) {
      const coords = getCityCoords(actionData.city);
      if (coords) {
        return { cleanContent, action: { type: "zoom", center: coords, zoom: 12 } };
      }
    }

    if (actionData.type === "tab" && actionData.tab) {
      return { cleanContent, action: { type: "tab", tab: actionData.tab } };
    }

    if (actionData.type === "tabAndZoom" && actionData.tab && actionData.city) {
      const coords = getCityCoords(actionData.city);
      if (coords) {
        return {
          cleanContent,
          action: { type: "tabAndZoom", tab: actionData.tab, center: coords, zoom: 12 },
        };
      }
    }
  } catch (e) {
    console.error("Failed to parse action:", e);
  }

  return { cleanContent, action: null };
}
