import { useTranslation } from "react-i18next";
import { Plane, Hotel, Ticket, Map } from "lucide-react";
import { cn } from "@/lib/utils";

export type CoPilotTabType = "flights" | "hotels" | "activities" | "trip";

interface CoPilotTabsProps {
  activeTab: CoPilotTabType;
  onTabChange: (tab: CoPilotTabType) => void;
}

const CoPilotTabs = ({ activeTab, onTabChange }: CoPilotTabsProps) => {
  const { t } = useTranslation();

  const tabs: { id: CoPilotTabType; icon: typeof Plane; labelKey: string }[] = [
    { id: "flights", icon: Plane, labelKey: "copilot.tabs.flights" },
    { id: "hotels", icon: Hotel, labelKey: "copilot.tabs.hotels" },
    { id: "activities", icon: Ticket, labelKey: "copilot.tabs.activities" },
    { id: "trip", icon: Map, labelKey: "copilot.tabs.trip" },
  ];

  return (
    <div className="flex bg-card/50 backdrop-blur-sm border-b border-border/50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all relative",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Icon className={cn("w-4 h-4", isActive && "text-primary")} />
            <span className="hidden sm:inline">{t(tab.labelKey)}</span>
            
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default CoPilotTabs;
