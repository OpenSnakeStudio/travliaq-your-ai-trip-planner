/**
 * useLocale - Centralized locale configuration hook
 * 
 * Provides consistent locale handling across the app:
 * - date-fns locale for date formatting
 * - Current language code
 * - Locale-aware formatting utilities
 */

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { fr, enUS, es } from "date-fns/locale";
import type { Locale } from "date-fns";

type SupportedLanguage = "fr" | "en" | "es";

interface LocaleConfig {
  /** Current language code */
  language: SupportedLanguage;
  /** date-fns locale object */
  dateFnsLocale: Locale;
  /** Format a number with locale-appropriate separators */
  formatNumber: (value: number) => string;
  /** Format currency */
  formatCurrency: (value: number, currency?: string) => string;
  /** Check if current language matches */
  isLanguage: (lang: SupportedLanguage) => boolean;
}

const DATE_FNS_LOCALES: Record<SupportedLanguage, Locale> = {
  fr: fr,
  en: enUS,
  es: es,
};

export function useLocale(): LocaleConfig {
  const { i18n } = useTranslation();
  
  const language = useMemo<SupportedLanguage>(() => {
    const lang = i18n.language?.split("-")[0] as SupportedLanguage;
    return ["fr", "en", "es"].includes(lang) ? lang : "fr";
  }, [i18n.language]);
  
  const dateFnsLocale = useMemo(() => {
    return DATE_FNS_LOCALES[language] || fr;
  }, [language]);
  
  const formatNumber = useMemo(() => {
    const formatter = new Intl.NumberFormat(language);
    return (value: number) => formatter.format(value);
  }, [language]);
  
  const formatCurrency = useMemo(() => {
    return (value: number, currency = "EUR") => {
      const formatter = new Intl.NumberFormat(language, {
        style: "currency",
        currency,
      });
      return formatter.format(value);
    };
  }, [language]);
  
  const isLanguage = useMemo(() => {
    return (lang: SupportedLanguage) => language === lang;
  }, [language]);
  
  return {
    language,
    dateFnsLocale,
    formatNumber,
    formatCurrency,
    isLanguage,
  };
}

export type { SupportedLanguage, LocaleConfig };
