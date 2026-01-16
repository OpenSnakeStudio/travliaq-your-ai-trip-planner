import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { MobileView } from "./PlannerMobileTopBar";

interface PlannerMobileBottomBarProps {
  mobileView: MobileView;
  onMobileViewChange: (view: MobileView) => void;
}

export default function PlannerMobileBottomBar({
  mobileView,
  onMobileViewChange,
}: PlannerMobileBottomBarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-background/95 backdrop-blur-md border-t border-border/50 z-30">
      <div className="flex items-center bg-muted rounded-full p-1 shadow-sm">
        <button
          onClick={() => onMobileViewChange("chat")}
          className={cn(
            "px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-200",
            mobileView === "chat"
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label={t("planner.tabs.chat") || "Chat"}
        >
          Chat
        </button>
        <button
          onClick={() => onMobileViewChange("maps")}
          className={cn(
            "px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-200",
            mobileView === "maps"
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label={t("planner.tabs.maps") || "Maps"}
        >
          Maps
        </button>
      </div>
    </div>
  );
}
