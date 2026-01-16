import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Plane, Compass, Bed, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TabType } from "@/pages/TravelPlanner";

interface PlannerMobileTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function PlannerMobileTabBar({ activeTab, onTabChange }: PlannerMobileTabBarProps) {
  const { t } = useTranslation();

  const tabs = useMemo(() => [
    { id: "flights" as TabType, icon: Plane, label: t("planner.tabs.flights"), emoji: "✈️" },
    { id: "stays" as TabType, icon: Bed, label: t("planner.tabs.stays"), emoji: "🏨" },
    { id: "activities" as TabType, icon: Compass, label: t("planner.tabs.activities"), emoji: "🎭" },
    { id: "preferences" as TabType, icon: SlidersHorizontal, label: t("planner.tabs.preferences"), emoji: "⚙️" },
  ], [t]);

  return (
    <nav 
      className="flex items-center gap-1 px-3 py-2 bg-background/90 backdrop-blur-md border-b border-border/30 z-20"
      aria-label={t("planner.tabs.navigation") || "Navigation des onglets"}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 flex-1 justify-center",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            aria-label={tab.label}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="text-sm">{tab.emoji}</span>
            <span className="hidden xs:inline truncate">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
