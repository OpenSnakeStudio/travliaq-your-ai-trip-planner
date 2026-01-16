/**
 * useChatTranslations - Provides i18n translations for chat session management
 * Separated to allow useChatSessions to remain a regular hook while supporting i18n
 */

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export interface ChatTranslations {
  newConversation: string;
  startConversation: string;
  welcomeMessage: string;
}

export function useChatTranslations(): ChatTranslations {
  const { t } = useTranslation();
  
  return useMemo(() => ({
    newConversation: t("planner.chat.newConversation"),
    startConversation: t("planner.chat.startConversation"),
    welcomeMessage: t("planner.chat.welcomeMessage"),
  }), [t]);
}
