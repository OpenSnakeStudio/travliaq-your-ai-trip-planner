/**
 * TabSwitcher - Switch between planner tabs from chat
 *
 * Allows users to navigate between Flights, Hotels, Activities
 * and other planner sections directly from the chat interface.
 */

import { cn } from "@/lib/utils";
import {
  Plane,
  Hotel,
  Compass,
  Car,
  Calendar,
  MapPin,
  Users,
  Wallet,
  Settings,
  LayoutGrid,
} from "lucide-react";

/**
 * Tab type
 */
export type PlannerTab =
  | "overview"
  | "flights"
  | "hotels"
  | "activities"
  | "transfers"
  | "calendar"
  | "map"
  | "travelers"
  | "budget"
  | "settings";

/**
 * Tab configuration
 */
export interface TabConfig {
  id: PlannerTab;
  label: string;
  icon: React.ElementType;
  /** Badge count (e.g., number of results) */
  badge?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Hidden from display */
  hidden?: boolean;
}

/**
 * Default tab configurations
 */
export const DEFAULT_TABS: TabConfig[] = [
  { id: "overview", label: "Aperçu", icon: LayoutGrid },
  { id: "flights", label: "Vols", icon: Plane },
  { id: "hotels", label: "Hôtels", icon: Hotel },
  { id: "activities", label: "Activités", icon: Compass },
  { id: "transfers", label: "Transferts", icon: Car },
  { id: "calendar", label: "Calendrier", icon: Calendar },
  { id: "map", label: "Carte", icon: MapPin },
];

/**
 * TabSwitcher props
 */
interface TabSwitcherProps {
  /** Available tabs */
  tabs?: TabConfig[];
  /** Currently active tab */
  activeTab: PlannerTab;
  /** Tab change callback */
  onTabChange: (tab: PlannerTab) => void;
  /** Size variant */
  size?: "sm" | "md";
  /** Layout variant */
  variant?: "pills" | "underline" | "buttons";
  /** Show labels */
  showLabels?: boolean;
  /** Show icons */
  showIcons?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Scrollable on overflow */
  scrollable?: boolean;
}

/**
 * Get icon for tab
 */
function TabIcon({ tab, size = 16 }: { tab: PlannerTab; size?: number }) {
  const icons: Record<PlannerTab, React.ElementType> = {
    overview: LayoutGrid,
    flights: Plane,
    hotels: Hotel,
    activities: Compass,
    transfers: Car,
    calendar: Calendar,
    map: MapPin,
    travelers: Users,
    budget: Wallet,
    settings: Settings,
  };

  const Icon = icons[tab];
  return <Icon size={size} />;
}

/**
 * TabSwitcher Component
 *
 * @example
 * ```tsx
 * <TabSwitcher
 *   activeTab="flights"
 *   onTabChange={(tab) => navigateToTab(tab)}
 *   tabs={[
 *     { id: "flights", label: "Vols", icon: Plane, badge: 12 },
 *     { id: "hotels", label: "Hôtels", icon: Hotel, badge: 8 },
 *     { id: "activities", label: "Activités", icon: Compass },
 *   ]}
 * />
 * ```
 */
export function TabSwitcher({
  tabs = DEFAULT_TABS,
  activeTab,
  onTabChange,
  size = "md",
  variant = "pills",
  showLabels = true,
  showIcons = true,
  fullWidth = false,
  scrollable = true,
}: TabSwitcherProps) {
  const visibleTabs = tabs.filter((tab) => !tab.hidden);

  const sizeClasses = {
    sm: showLabels ? "px-2.5 py-1.5 text-xs gap-1.5" : "p-1.5",
    md: showLabels ? "px-3 py-2 text-sm gap-2" : "p-2",
  };

  const iconSizes = {
    sm: 14,
    md: 16,
  };

  const variantClasses = {
    pills: {
      container: "bg-muted/50 rounded-lg p-1 gap-1",
      tab: (active: boolean) =>
        cn(
          "rounded-md transition-all",
          active
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
        ),
    },
    underline: {
      container: "border-b border-border gap-0",
      tab: (active: boolean) =>
        cn(
          "border-b-2 -mb-px transition-all",
          active
            ? "border-primary text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
        ),
    },
    buttons: {
      container: "gap-2",
      tab: (active: boolean) =>
        cn(
          "rounded-full border transition-all",
          active
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-background text-foreground border-border hover:border-primary/50"
        ),
    },
  };

  return (
    <div
      className={cn(
        "flex items-center",
        variantClasses[variant].container,
        fullWidth && "w-full",
        scrollable && "overflow-x-auto scrollbar-hide"
      )}
    >
      {visibleTabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            disabled={tab.disabled}
            className={cn(
              "inline-flex items-center justify-center font-medium whitespace-nowrap",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              sizeClasses[size],
              variantClasses[variant].tab(isActive),
              fullWidth && "flex-1"
            )}
          >
            {showIcons && (
              tab.icon ? (
                <tab.icon size={iconSizes[size]} />
              ) : (
                <TabIcon tab={tab.id} size={iconSizes[size]} />
              )
            )}
            {showLabels && <span>{tab.label}</span>}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span
                className={cn(
                  "rounded-full font-medium",
                  size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5",
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {tab.badge > 99 ? "99+" : tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Compact inline tab switcher
 */
export function InlineTabSwitcher({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: Array<{ id: PlannerTab; label: string; badge?: number }>;
  activeTab: PlannerTab;
  onTabChange: (tab: PlannerTab) => void;
}) {
  return (
    <div className="flex items-center gap-1 text-sm">
      {tabs.map((tab, index) => (
        <span key={tab.id} className="flex items-center gap-1">
          {index > 0 && <span className="text-muted-foreground">·</span>}
          <button
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "transition-colors",
              tab.id === activeTab
                ? "text-primary font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="text-xs text-muted-foreground ml-1">({tab.badge})</span>
            )}
          </button>
        </span>
      ))}
    </div>
  );
}

/**
 * Quick tab buttons for common navigation
 */
export function QuickTabButtons({
  onTabChange,
  size = "md",
  showCounts,
  counts,
}: {
  onTabChange: (tab: PlannerTab) => void;
  size?: "sm" | "md";
  showCounts?: boolean;
  counts?: Partial<Record<PlannerTab, number>>;
}) {
  const quickTabs: Array<{ id: PlannerTab; label: string; icon: React.ElementType }> = [
    { id: "flights", label: "Vols", icon: Plane },
    { id: "hotels", label: "Hôtels", icon: Hotel },
    { id: "activities", label: "Activités", icon: Compass },
  ];

  return (
    <div className="flex items-center gap-2">
      {quickTabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-border",
            "bg-background text-foreground hover:border-primary/50 transition-all",
            "hover:scale-[1.02] active:scale-[0.98]",
            size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"
          )}
        >
          <tab.icon size={size === "sm" ? 12 : 14} />
          <span>{tab.label}</span>
          {showCounts && counts?.[tab.id] !== undefined && (
            <span className="text-muted-foreground">({counts[tab.id]})</span>
          )}
        </button>
      ))}
    </div>
  );
}

export default TabSwitcher;
