/**
 * TripTypeConfirmWidget - Trip type selection
 * 
 * Quick chip buttons for selecting roundtrip, oneway, or multi-destination.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

type TripType = "roundtrip" | "oneway" | "multi";

interface TripTypeConfirmWidgetProps {
  currentType?: TripType;
  onConfirm: (tripType: TripType) => void;
}

export const TripTypeConfirmWidget = ({
  currentType = "roundtrip",
  onConfirm,
}: TripTypeConfirmWidgetProps) => {
  const { t } = useTranslation();
  const [confirmed, setConfirmed] = useState(false);
  const [selected, setSelected] = useState<TripType>(currentType);

  const handleSelect = (type: TripType) => {
    setSelected(type);
    setConfirmed(true);
    onConfirm(type);
  };

  const getLabel = (type: TripType) => {
    switch (type) {
      case "roundtrip":
        return t("planner.tripType.roundtrip");
      case "oneway":
        return t("planner.tripType.oneway");
      case "multi":
        return t("planner.tripType.multi");
    }
  };

  if (confirmed) {
    return (
      <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium">
        <span>✓</span>
        <span>{getLabel(selected)}</span>
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <button
        onClick={() => handleSelect("roundtrip")}
        className={cn(
          "px-4 py-2 rounded-xl text-sm font-medium transition-all",
          selected === "roundtrip"
            ? "bg-primary text-primary-foreground shadow-md"
            : "bg-muted text-foreground hover:bg-muted/80"
        )}
      >
        ↔ {t("planner.tripType.roundtrip")}
      </button>
      <button
        onClick={() => handleSelect("oneway")}
        className={cn(
          "px-4 py-2 rounded-xl text-sm font-medium transition-all",
          selected === "oneway"
            ? "bg-primary text-primary-foreground shadow-md"
            : "bg-muted text-foreground hover:bg-muted/80"
        )}
      >
        → {t("planner.tripType.oneway")}
      </button>
      <button
        onClick={() => handleSelect("multi")}
        className={cn(
          "px-4 py-2 rounded-xl text-sm font-medium transition-all",
          selected === "multi"
            ? "bg-primary text-primary-foreground shadow-md"
            : "bg-muted text-foreground hover:bg-muted/80"
        )}
      >
        🔀 {t("planner.tripType.multi")}
      </button>
    </div>
  );
};
