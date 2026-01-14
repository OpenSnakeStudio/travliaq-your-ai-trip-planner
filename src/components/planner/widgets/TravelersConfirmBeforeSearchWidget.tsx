import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

/**
 * Travelers Confirmation Widget (Before Search)
 *
 * Quick confirmation widget for single travelers or editing traveler count.
 * Shows "Are you traveling alone?" prompt with edit option.
 */

export interface TravelersConfirmBeforeSearchWidgetProps {
  currentTravelers: {
    adults: number;
    children: number;
    infants: number;
  };
  onConfirm: () => void;
  onEditConfirm: (travelers: {
    adults: number;
    children: number;
    infants: number;
  }) => void;
}

export function TravelersConfirmBeforeSearchWidget({
  currentTravelers,
  onConfirm,
  onEditConfirm,
}: TravelersConfirmBeforeSearchWidgetProps) {
  const { t } = useTranslation();
  const [confirmed, setConfirmed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [adults, setAdults] = useState(currentTravelers.adults);
  const [children, setChildren] = useState(currentTravelers.children);
  const [infants, setInfants] = useState(currentTravelers.infants);

  const handleConfirmSolo = () => {
    setConfirmed(true);
    onConfirm();
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleConfirmEdited = () => {
    setConfirmed(true);
    onEditConfirm({ adults, children, infants });
  };

  const handleAdultsChange = (val: number) => setAdults(Math.max(1, val));

  const CounterButton = ({
    value,
    onChange,
    min = 0,
    max = 9,
  }: {
    value: number;
    onChange: (v: number) => void;
    min?: number;
    max?: number;
  }) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-7 h-7 rounded-full bg-muted text-foreground flex items-center justify-center text-sm font-medium hover:bg-muted/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        −
      </button>
      <span className="w-5 text-center text-sm font-medium">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-7 h-7 rounded-full bg-muted text-foreground flex items-center justify-center text-sm font-medium hover:bg-muted/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        +
      </button>
    </div>
  );

  if (confirmed) {
    const total = adults + children + infants;
    const parts = [adults > 1 ? t("planner.travelers.adultPlural", { count: adults }) : t("planner.travelers.adultSingular", { count: adults })];
    if (children > 0) parts.push(children > 1 ? t("planner.travelers.childPlural", { count: children }) : t("planner.travelers.childSingular", { count: children }));
    if (infants > 0) parts.push(infants > 1 ? t("planner.travelers.infantPlural", { count: infants }) : t("planner.travelers.infantSingular", { count: infants }));
    return (
      <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium">
        <span>✓</span>
        <span>{parts.join(", ")}</span>
      </div>
    );
  }

  if (editing) {
    const total = adults + children + infants;
    return (
      <div className="mt-3 p-4 rounded-2xl bg-muted/50 border border-border/50 space-y-4 max-w-xs">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {t("planner.travelers.edit")}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">{t("planner.travelers.adults")}</div>
            <div className="text-xs text-muted-foreground">{t("planner.travelers.adultsDesc")}</div>
          </div>
          <CounterButton value={adults} onChange={handleAdultsChange} min={1} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">{t("planner.travelers.children")}</div>
            <div className="text-xs text-muted-foreground">{t("planner.travelers.childrenDesc")}</div>
          </div>
          <CounterButton value={children} onChange={setChildren} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">{t("planner.travelers.infants")}</div>
            <div className="text-xs text-muted-foreground">{t("planner.travelers.infantsDesc")}</div>
          </div>
          <CounterButton value={infants} onChange={setInfants} max={adults} />
        </div>

        <button
          onClick={handleConfirmEdited}
          className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
        >
          {total > 1 ? t("planner.travelers.confirmCount_plural", { count: total }) : t("planner.travelers.confirmCount", { count: total })}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 p-4 rounded-2xl bg-muted/50 border border-border/50 space-y-3 max-w-sm">
      <div className="text-sm text-foreground" dangerouslySetInnerHTML={{ __html: t("planner.travelers.travelingAlone") }} />
      <div className="flex gap-2">
        <button
          onClick={handleConfirmSolo}
          className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
        >
          {t("planner.travelers.yesSolo")}
        </button>
        <button
          onClick={handleEdit}
          className="flex-1 px-4 py-2.5 rounded-xl bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-all"
        >
          {t("planner.travelers.noEdit")}
        </button>
      </div>
    </div>
  );
}
