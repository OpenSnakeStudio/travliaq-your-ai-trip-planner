import { Building2, MapPin, Plane, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TabType } from "@/pages/TravelPlanner";

interface PlannerTopBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: "flights", label: "Vols", icon: Plane },
  { id: "activities", label: "Activités", icon: MapPin },
  { id: "stays", label: "Hébergements", icon: Building2 },
  { id: "preferences", label: "Préférences", icon: Settings2 },
];

export default function PlannerTopBar({ activeTab, onTabChange }: PlannerTopBarProps) {
  return (
    <div className="pointer-events-none absolute top-4 left-8 z-20">
      {/* Tabs - positioned left with travel/AI aesthetic */}
      <div className="pointer-events-auto inline-flex items-center gap-1 rounded-2xl bg-secondary/90 backdrop-blur-xl shadow-deep px-2 py-2 border border-primary/20">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;

          return (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={cn(
                "h-10 px-5 rounded-xl text-sm font-medium flex items-center gap-2.5 transition-all duration-300",
                isActive
                  ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-glow"
                  : "text-secondary-foreground/80 hover:text-secondary-foreground hover:bg-secondary-foreground/10"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden md:inline">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
