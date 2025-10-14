interface TravelCalendarProps {
  days: Array<{
    id: number;
    title: string;
    subtitle?: string;
    isSummary?: boolean;
  }>;
  activeDay: number;
  onScrollToDay?: (dayId: number | string) => void;
}

const TravelCalendar = ({ days, activeDay, onScrollToDay }: TravelCalendarProps) => {
  return (
    <div className="bg-gradient-to-br from-travliaq-deep-blue/70 to-travliaq-deep-blue/50 backdrop-blur-md rounded-lg border border-travliaq-turquoise/20 shadow-[0_0_15px_rgba(56,189,248,0.1)] p-2">
      {/* Compact step indicators */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {days.map((day) => (
          <button
            type="button"
            key={day.id}
            onClick={() => onScrollToDay?.(day.id)}
            className={`relative transition-all duration-300 ${
              activeDay === day.id ? 'scale-110' : 'scale-100'
            } focus:outline-none focus-visible:ring-2 focus-visible:ring-travliaq-turquoise/60 rounded-full`}
            aria-label={`Aller à l'étape ${day.isSummary ? 'Validation' : day.id}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-montserrat text-xs font-bold transition-all duration-300 ${
                activeDay === day.id
                  ? 'bg-gradient-to-br from-travliaq-turquoise to-travliaq-turquoise/80 text-white shadow-[0_0_15px_rgba(56,189,248,0.4)] ring-2 ring-travliaq-turquoise/50'
                  : 'bg-white/10 text-white/60 hover:bg-white/20 border border-white/20'
              }`}
            >
              {day.isSummary ? '✓' : day.id}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TravelCalendar;
