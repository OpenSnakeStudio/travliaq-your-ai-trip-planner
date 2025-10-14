import * as React from "react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import RangeCalendar from "@/components/RangeCalendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  disabled?: (date: Date) => boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  disabled,
  open,
  onOpenChange,
  className,
}: DateRangePickerProps) {
  const hasFrom = !!value?.from;
  const hasTo = !!value?.to;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full h-14 justify-start text-left font-normal text-base",
            !hasFrom && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          {hasFrom && hasTo ? (
            <span className="truncate">
              {format(value!.from!, "dd MMM yyyy", { locale: fr })} → {format(value!.to!, "dd MMM yyyy", { locale: fr })}
            </span>
          ) : hasFrom ? (
            <span className="truncate">{format(value!.from!, "dd MMMM yyyy", { locale: fr })} - Sélectionnez la date de retour</span>
          ) : (
            <span className="truncate">Sélectionnez vos dates de voyage</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3 md:p-6 max-w-[95vw]" align="center" side="top" sideOffset={10}>
        <div className="text-xs sm:text-sm text-muted-foreground text-center mb-3 sm:mb-4 px-2">
          {!hasFrom && "Sélectionnez votre date de départ"}
          {hasFrom && !hasTo && "Maintenant, sélectionnez votre date de retour"}
          {hasFrom && hasTo && "Dates sélectionnées !"}
        </div>
        <RangeCalendar
          value={value}
          onChange={(range) => {
            onChange?.(range);
            if (range?.from && range.to && range.from.getTime() !== range.to.getTime()) {
              setTimeout(() => onOpenChange?.(false), 300);
            }
          }}
          disabled={disabled}
          locale={fr}
          weekStartsOn={1}
          className={cn("pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}

export default DateRangePicker;
