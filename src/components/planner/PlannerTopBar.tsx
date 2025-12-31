import { useState, useCallback } from "react";
import { Plane, Compass, Bed, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TabType } from "@/pages/TravelPlanner";
import logo from "@/assets/logo-travliaq.png";
import { usePlannerEvent } from "@/lib/eventBus";

interface PlannerTopBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; icon: React.ElementType }[] = [
  { id: "flights", icon: Plane },
  { id: "activities", icon: Compass },
  { id: "stays", icon: Bed },
  { id: "preferences", icon: SlidersHorizontal },
];

export default function PlannerTopBar({ activeTab, onTabChange }: PlannerTopBarProps) {
  const [flashingTab, setFlashingTab] = useState<TabType | null>(null);

  // Listen to flash events
  const handleFlash = useCallback((data: { tab: TabType }) => {
    // Don't flash if it's already the active tab
    if (data.tab === activeTab) return;

    setFlashingTab(data.tab);
    // Remove flash after animation completes
    setTimeout(() => setFlashingTab(null), 2000);
  }, [activeTab]);

  usePlannerEvent("tab:flash", handleFlash);
  return (
    <div className="absolute top-0 left-0 right-0 z-20 h-12 bg-background/80 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-4">
      {/* Tab icons - left side */}
      <div className="flex items-center gap-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          const isFlashing = flashingTab === t.id;

          return (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center transition-all relative",
                isActive
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                isFlashing && "animate-flash"
              )}
              aria-label={t.id}
            >
              <Icon className="h-4 w-4" />
              {isFlashing && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      {/* Logo - right side */}
      <img src={logo} alt="Travliaq" className="h-6 w-auto opacity-80" />
    </div>
  );
}
