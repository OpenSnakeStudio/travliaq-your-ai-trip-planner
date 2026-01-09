import { useState } from "react";
import { Plane, Compass, Bed, SlidersHorizontal, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TabType } from "@/pages/TravelPlanner";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import CurrencySelector from "@/components/navigation/CurrencySelector";
import LanguageSelector from "@/components/navigation/LanguageSelector";
import UserMenu from "@/components/navigation/UserMenu";

interface PlannerTopBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isChatCollapsed?: boolean;
  onOpenChat?: () => void;
}

// Order: Flights → Stays → Activities → Preferences
const tabs: { id: TabType; icon: React.ElementType; label: string; emoji: string }[] = [
  { id: "flights", icon: Plane, label: "Vols", emoji: "✈️" },
  { id: "stays", icon: Bed, label: "Hébergements", emoji: "🏨" },
  { id: "activities", icon: Compass, label: "Activités", emoji: "🎭" },
  { id: "preferences", icon: SlidersHorizontal, label: "Préférences", emoji: "⚙️" },
];

export default function PlannerTopBar({ activeTab, onTabChange, isChatCollapsed, onOpenChat }: PlannerTopBarProps) {
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const { preferences, updateTemperatureUnit } = useUserPreferences();

  return (
    <>
      <div
        className="absolute top-0 left-0 right-0 z-20 h-12 bg-background/80 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-4"
        data-tour="tabs-nav"
      >
        {/* Left: Chat toggle (only when chat is collapsed) + Tab buttons */}
        <div className="flex items-center gap-2">
          {isChatCollapsed && onOpenChat && (
            <button
              onClick={onOpenChat}
              className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Ouvrir le chat"
              aria-label="Ouvrir le chat"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          )}

          <nav className="flex items-center gap-1" aria-label="Navigation des onglets">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;

              return (
                <button
                  key={t.id}
                  onClick={() => onTabChange(t.id)}
                  data-tour={`${t.id}-tab`}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  aria-label={t.label}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="text-base">{t.emoji}</span>
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: User preferences bar */}
        <div className="flex items-center gap-0.5 rounded-lg overflow-hidden bg-muted/50 border border-border/50">
          {/* Currency */}
          <button
            onClick={() => setCurrencyOpen(true)}
            className="flex items-center justify-center px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
            title="Devise"
          >
            {{ EUR: "€", USD: "$", GBP: "£" }[preferences.currency] || "€"}
          </button>

          <div className="w-px h-4 bg-border/50" />

          {/* Language */}
          <button
            onClick={() => setLanguageOpen(true)}
            className="flex items-center justify-center px-2.5 py-1.5 text-xs transition-colors hover:bg-muted"
            title="Langue"
          >
            {{ fr: "🇫🇷", en: "🇬🇧", es: "🇪🇸" }[preferences.language] || "🇫🇷"}
          </button>

          <div className="w-px h-4 bg-border/50" />

          {/* Temperature Toggle */}
          <button
            onClick={() => updateTemperatureUnit(preferences.temperatureUnit === "C" ? "F" : "C")}
            className="flex items-center justify-center px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
            title="Changer l'unité de température"
          >
            {preferences.temperatureUnit === "C" ? "°C" : "°F"}
          </button>

          <div className="w-px h-4 bg-border/50" />

          {/* User Menu */}
          <UserMenu className="text-foreground" />
        </div>
      </div>

      {/* Preference Modals */}
      <CurrencySelector open={currencyOpen} onOpenChange={setCurrencyOpen} />
      <LanguageSelector open={languageOpen} onOpenChange={setLanguageOpen} />
    </>
  );
}
