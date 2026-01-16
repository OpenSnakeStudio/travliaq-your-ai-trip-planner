import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import CurrencySelector from "@/components/navigation/CurrencySelector";
import LanguageSelector from "@/components/navigation/LanguageSelector";
import UserMenu from "@/components/navigation/UserMenu";
import logo from "@/assets/logo-travliaq.png";

export type MobileView = "chat" | "maps";

interface PlannerMobileTopBarProps {
  mobileView: MobileView;
  onMobileViewChange: (view: MobileView) => void;
  confirmLeave?: boolean;
  confirmLeaveMessage?: string;
}

export default function PlannerMobileTopBar({
  mobileView,
  onMobileViewChange,
  confirmLeave,
  confirmLeaveMessage,
}: PlannerMobileTopBarProps) {
  const { t } = useTranslation();
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const { preferences, updateTemperatureUnit } = useUserPreferences();

  return (
    <>
      <header className="flex items-center justify-between px-3 py-2 bg-background/95 backdrop-blur-md border-b border-border/50 z-30">
        {/* Left: Logo */}
        <Link
          to="/"
          title={t("planner.tabs.backToHome")}
          onClick={(e) => {
            if (!confirmLeave) return;
            const ok = window.confirm(confirmLeaveMessage || t("planner.tabs.leaveConfirm"));
            if (!ok) e.preventDefault();
          }}
          className="shrink-0"
        >
          <img
            src={logo}
            alt="Travliaq"
            className="h-8 w-8 object-contain"
          />
        </Link>

        {/* Center: Toggle Chat / Maps */}
        <div className="flex items-center bg-muted rounded-full p-1">
          <button
            onClick={() => onMobileViewChange("chat")}
            className={cn(
              "px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
              mobileView === "chat"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground"
            )}
          >
            Chat
          </button>
          <button
            onClick={() => onMobileViewChange("maps")}
            className={cn(
              "px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
              mobileView === "maps"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground"
            )}
          >
            Maps
          </button>
        </div>

        {/* Right: Compact settings */}
        <div className="flex items-center gap-0.5 rounded-lg overflow-hidden bg-muted/50 border border-border/50">
          {/* Currency */}
          <button
            onClick={() => setCurrencyOpen(true)}
            className="flex items-center justify-center px-2 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
            title={t("preferences.currency")}
          >
            {{ EUR: "€", USD: "$", GBP: "£" }[preferences.currency] || "€"}
          </button>

          <div className="w-px h-4 bg-border/50" />

          {/* Language */}
          <button
            onClick={() => setLanguageOpen(true)}
            className="flex items-center justify-center px-2 py-1.5 text-xs transition-colors hover:bg-muted"
            title={t("preferences.language")}
          >
            {{ fr: "🇫🇷", en: "🇬🇧", es: "🇪🇸" }[preferences.language] || "🇫🇷"}
          </button>

          <div className="w-px h-4 bg-border/50" />

          {/* Temperature Toggle */}
          <button
            onClick={() => updateTemperatureUnit(preferences.temperatureUnit === "C" ? "F" : "C")}
            className="flex items-center justify-center px-2 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
            title={t("preferences.temperature")}
          >
            {preferences.temperatureUnit === "C" ? "°C" : "°F"}
          </button>

          <div className="w-px h-4 bg-border/50" />

          {/* User Menu */}
          <UserMenu className="text-foreground" />
        </div>
      </header>

      {/* Preference Modals */}
      <CurrencySelector open={currencyOpen} onOpenChange={setCurrencyOpen} />
      <LanguageSelector open={languageOpen} onOpenChange={setLanguageOpen} />
    </>
  );
}
