/**
 * ConfirmedWidget - Displays a confirmed widget selection in read-only mode
 * 
 * This component shows the user's selection from a widget after they've made
 * their choice. The widget remains visible in the chat history.
 */

import { Check, Calendar, Users, Plane, MapPin, Heart, Utensils, Sliders } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WidgetType } from "@/types/flight";

interface ConfirmedWidgetProps {
  widgetType: WidgetType;
  selectedValue: unknown;
  displayLabel: string;
  className?: string;
}

// Map widget types to icons
const widgetIcons: Partial<Record<WidgetType, React.ReactNode>> = {
  datePicker: <Calendar className="h-3.5 w-3.5" />,
  dateRangePicker: <Calendar className="h-3.5 w-3.5" />,
  returnDatePicker: <Calendar className="h-3.5 w-3.5" />,
  travelersSelector: <Users className="h-3.5 w-3.5" />,
  travelersConfirmBeforeSearch: <Users className="h-3.5 w-3.5" />,
  tripTypeConfirm: <Plane className="h-3.5 w-3.5" />,
  citySelector: <MapPin className="h-3.5 w-3.5" />,
  destinationSuggestions: <MapPin className="h-3.5 w-3.5" />,
  preferenceStyle: <Sliders className="h-3.5 w-3.5" />,
  preferenceInterests: <Heart className="h-3.5 w-3.5" />,
  mustHaves: <Heart className="h-3.5 w-3.5" />,
  dietary: <Utensils className="h-3.5 w-3.5" />,
  airportConfirmation: <Plane className="h-3.5 w-3.5" />,
};

// Map widget types to labels
const widgetLabels: Partial<Record<WidgetType, string>> = {
  datePicker: "Date",
  dateRangePicker: "Dates",
  returnDatePicker: "Retour",
  travelersSelector: "Voyageurs",
  travelersConfirmBeforeSearch: "Voyageurs",
  tripTypeConfirm: "Type",
  citySelector: "Destination",
  destinationSuggestions: "Destination",
  preferenceStyle: "Style",
  preferenceInterests: "Intérêts",
  mustHaves: "Critères",
  dietary: "Régime",
  airportConfirmation: "Aéroports",
};

export function ConfirmedWidget({
  widgetType,
  displayLabel,
  className,
}: ConfirmedWidgetProps) {
  const icon = widgetIcons[widgetType] || <Check className="h-3.5 w-3.5" />;
  const typeLabel = widgetLabels[widgetType] || "Sélection";

  return (
    <div
      className={cn(
        "mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl",
        "bg-primary/10 border border-primary/20",
        "text-sm",
        className
      )}
    >
      <span className="text-primary">{icon}</span>
      <span className="text-muted-foreground">{typeLabel} :</span>
      <span className="font-medium text-foreground">{displayLabel}</span>
      <Check className="h-3.5 w-3.5 text-green-500" />
    </div>
  );
}

export default ConfirmedWidget;
