/**
 * MissingFieldsCard - Shows missing required fields before search
 *
 * Displays a list of missing required fields with clickable actions
 * to fill them in. Used before triggering a search.
 */

import { cn } from "@/lib/utils";
import {
  AlertCircle,
  MapPin,
  Calendar,
  Users,
  Plane,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

/**
 * Missing field definition
 */
export interface MissingField {
  id: string;
  label: string;
  type: "destination" | "dates" | "travelers" | "departure" | "return" | "custom";
  description?: string;
  required: boolean;
  filled?: boolean;
}

/**
 * MissingFieldsCard props
 */
interface MissingFieldsCardProps {
  /** List of fields to check */
  fields: MissingField[];
  /** Callback when a field is clicked */
  onFieldClick: (fieldId: string) => void;
  /** Title */
  title?: string;
  /** Show filled fields */
  showFilledFields?: boolean;
  /** Size variant */
  size?: "sm" | "md";
  /** Compact list style */
  compact?: boolean;
}

/**
 * Get icon for field type
 */
function FieldIcon({ type, filled, size = 16 }: { type: MissingField["type"]; filled?: boolean; size?: number }) {
  if (filled) {
    return <CheckCircle2 size={size} className="text-green-600" />;
  }

  switch (type) {
    case "destination":
      return <MapPin size={size} className="text-muted-foreground" />;
    case "dates":
    case "departure":
    case "return":
      return <Calendar size={size} className="text-muted-foreground" />;
    case "travelers":
      return <Users size={size} className="text-muted-foreground" />;
    default:
      return <AlertCircle size={size} className="text-muted-foreground" />;
  }
}

/**
 * MissingFieldsCard Component
 *
 * @example
 * ```tsx
 * <MissingFieldsCard
 *   fields={[
 *     { id: "destination", label: "Destination", type: "destination", required: true, filled: true },
 *     { id: "dates", label: "Dates de voyage", type: "dates", required: true, filled: false },
 *     { id: "travelers", label: "Voyageurs", type: "travelers", required: true, filled: false },
 *   ]}
 *   onFieldClick={(fieldId) => focusField(fieldId)}
 * />
 * ```
 */
export function MissingFieldsCard({
  fields,
  onFieldClick,
  title = "Informations manquantes",
  showFilledFields = true,
  size = "md",
  compact = false,
}: MissingFieldsCardProps) {
  const missingFields = fields.filter((f) => !f.filled && f.required);
  const filledFields = fields.filter((f) => f.filled);
  const optionalMissing = fields.filter((f) => !f.filled && !f.required);

  const allFieldsFilled = missingFields.length === 0;

  if (allFieldsFilled && !showFilledFields) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {missingFields.map((field) => (
          <button
            key={field.id}
            type="button"
            onClick={() => onFieldClick(field.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-3 py-1.5 text-sm transition-all",
              "hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:scale-[1.02]"
            )}
          >
            <FieldIcon type={field.type} size={14} />
            <span className="font-medium text-amber-800 dark:text-amber-200">{field.label}</span>
            <ChevronRight size={14} className="text-amber-600" />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border",
        allFieldsFilled
          ? "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20"
          : "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20",
        size === "sm" ? "p-3" : "p-4"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        {allFieldsFilled ? (
          <CheckCircle2 size={18} className="text-green-600" />
        ) : (
          <AlertCircle size={18} className="text-amber-600" />
        )}
        <span
          className={cn(
            "font-medium",
            allFieldsFilled ? "text-green-800 dark:text-green-200" : "text-amber-800 dark:text-amber-200",
            size === "sm" ? "text-sm" : "text-base"
          )}
        >
          {allFieldsFilled ? "Prêt à rechercher" : title}
        </span>
        {!allFieldsFilled && (
          <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 rounded">
            {missingFields.length} requis
          </span>
        )}
      </div>

      {/* Missing required fields */}
      {missingFields.length > 0 && (
        <div className="space-y-2">
          {missingFields.map((field) => (
            <button
              key={field.id}
              type="button"
              onClick={() => onFieldClick(field.id)}
              className={cn(
                "w-full flex items-center gap-3 rounded-lg border border-transparent bg-white/60 dark:bg-slate-800/60 transition-all",
                "hover:border-amber-300 hover:bg-white dark:hover:bg-slate-800",
                size === "sm" ? "p-2" : "p-3"
              )}
            >
              <FieldIcon type={field.type} size={size === "sm" ? 16 : 18} />
              <div className="flex-1 text-left">
                <span className={cn("font-medium text-foreground", size === "sm" ? "text-sm" : "text-base")}>
                  {field.label}
                </span>
                {field.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{field.description}</p>
                )}
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))}
        </div>
      )}

      {/* Filled fields (collapsed) */}
      {showFilledFields && filledFields.length > 0 && (
        <div className={cn("mt-3 pt-3 border-t border-border/50", missingFields.length === 0 && "mt-0 pt-0 border-0")}>
          <div className="flex flex-wrap gap-2">
            {filledFields.map((field) => (
              <div
                key={field.id}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs"
              >
                <CheckCircle2 size={12} />
                <span>{field.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optional missing fields */}
      {optionalMissing.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-2">Optionnel</p>
          <div className="flex flex-wrap gap-1.5">
            {optionalMissing.map((field) => (
              <button
                key={field.id}
                type="button"
                onClick={() => onFieldClick(field.id)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs hover:bg-muted/80 transition-colors"
              >
                <span>+ {field.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Inline missing field indicator
 */
export function MissingFieldIndicator({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-amber-600 hover:text-amber-700 text-sm transition-colors"
    >
      <AlertCircle size={14} />
      <span className="underline underline-offset-2">{label} requis</span>
    </button>
  );
}

/**
 * Helper: Create field list from form data
 */
export function createFieldsFromFormData(formData: {
  destination?: string;
  departureDate?: Date | string;
  returnDate?: Date | string;
  travelers?: number;
}): MissingField[] {
  return [
    {
      id: "destination",
      label: "Destination",
      type: "destination",
      required: true,
      filled: !!formData.destination,
    },
    {
      id: "departureDate",
      label: "Date de départ",
      type: "departure",
      required: true,
      filled: !!formData.departureDate,
    },
    {
      id: "returnDate",
      label: "Date de retour",
      type: "return",
      required: false,
      filled: !!formData.returnDate,
    },
    {
      id: "travelers",
      label: "Voyageurs",
      type: "travelers",
      required: true,
      filled: !!formData.travelers && formData.travelers > 0,
    },
  ];
}

export default MissingFieldsCard;
