import { useMemo } from "react";
import { Plane, MapPin, Building2, User, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { TabType } from "@/pages/TravelPlanner";

interface PlannerTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const PlannerTabs = ({ activeTab, onTabChange }: PlannerTabsProps) => {
  const { t } = useTranslation();
  
  const tabs = useMemo(() => [
    { id: "flights" as TabType, label: t("planner.tabs.flights"), icon: Plane, emoji: "✈️" },
    { id: "stays" as TabType, label: t("planner.tabs.stays"), icon: Building2, emoji: "🏨" },
    { id: "activities" as TabType, label: t("planner.tabs.activities"), icon: MapPin, emoji: "🎭" },
    { id: "preferences" as TabType, label: t("planner.tabs.preferences"), icon: User, emoji: "⚙️" },
  ], [t]);
  return (
    <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-2 shrink-0">
      {/* Back Button */}
      <Link
        to="/"
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mr-4"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium hidden sm:inline">{t("common.back")}</span>
      </Link>

      {/* Logo/Title */}
      <div className="flex items-center gap-2 mr-6">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <Plane className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-montserrat font-bold text-foreground hidden md:inline">
          {t("userMenu.planner")}
        </span>
      </div>

      {/* Tab Navigation */}
      <nav className="flex items-center gap-1 flex-1" aria-label="Navigation des onglets">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              data-tour={`${tab.id}-tab`}
              className={cn(
                "group relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300",
                isActive
                  ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80 hover:scale-[1.01]"
              )}
            >
              {/* Animated background glow on hover */}
              <span className={cn(
                "absolute inset-0 rounded-xl transition-opacity duration-300",
                isActive ? "opacity-0" : "opacity-0 group-hover:opacity-100 bg-gradient-to-r from-primary/5 to-primary/10"
              )} />
              
              <span className="relative z-10 text-base">{tab.emoji}</span>
              <span className="relative z-10 hidden sm:inline">{tab.label}</span>
              
              {/* Active indicator dot */}
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary-foreground/80" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2">
        <button className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          {t("planner.myTrip")}
        </button>
      </div>
    </header>
  );
};

export default PlannerTabs;
