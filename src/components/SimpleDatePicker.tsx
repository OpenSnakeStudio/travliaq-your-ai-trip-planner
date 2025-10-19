import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";

interface SimpleDatePickerProps {
  selected?: Date;
  onSelect: (date: Date) => void;
  minDate?: Date;
}

export function SimpleDatePicker({ selected, onSelect, minDate = new Date() }: SimpleDatePickerProps) {
  const { i18n } = useTranslation();
  const locale = i18n.language === 'fr' ? fr : enUS;
  const [currentMonth, setCurrentMonth] = useState(selected || new Date());

  const weekStartsOn = i18n.language === 'fr' ? 1 : 0; // Lundi pour français, Dimanche pour anglais
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { locale, weekStartsOn });
  const endDate = endOfWeek(monthEnd, { locale, weekStartsOn });

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Week days - use locale-specific format with proper start day
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + i);
    return format(dayDate, 'EEEEEE', { locale });
  });

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDayClick = (day: Date) => {
    if (day < minDate) return;
    onSelect(day);
  };

  return (
    <div className="bg-card border rounded-lg p-4 shadow-sm w-full max-w-sm mx-auto">
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-base font-semibold text-travliaq-deep-blue">
          {format(currentMonth, "MMMM yyyy", { locale })}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNextMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-xs font-medium text-muted-foreground text-center py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelectedDay = selected && isSameDay(day, selected);
          const isTodayDay = isToday(day);
          const isDisabled = day < minDate;

          return (
            <button
              key={idx}
              onClick={() => handleDayClick(day)}
              disabled={isDisabled}
              className={`
                h-10 w-full rounded-md text-sm font-medium transition-all
                ${!isCurrentMonth ? "text-muted-foreground/40" : "text-foreground"}
                ${isSelectedDay ? "bg-primary text-primary-foreground font-bold shadow-lg" : ""}
                ${isTodayDay && !isSelectedDay ? "bg-accent/30 border-2 border-primary font-bold" : ""}
                ${!isSelectedDay && !isTodayDay && isCurrentMonth ? "hover:bg-primary/10 hover:scale-110" : ""}
                ${isDisabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
                ${!isDisabled && !isSelectedDay ? "hover:shadow-md" : ""}
              `}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
