import { useEffect, useState } from "react";

interface TimelineSyncProps {
  days: Array<{ id: number; title: string; isSummary?: boolean }>;
  activeDay: number;
  scrollProgress: number;
  onScrollToDay?: (dayId: number | string) => void;

}

const TimelineSync = ({ days, activeDay, scrollProgress, onScrollToDay }: TimelineSyncProps) => {
  // Visible dès que l'on quitte le hero: basé sur la section active
  const isVisible = activeDay >= 1 && activeDay <= days.length;

  const scrollToDay = (dayId: number | string) => {
    if (onScrollToDay) {
      onScrollToDay(dayId);
    } else {
      const element = document.querySelector(`[data-day-id="${dayId}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <>
      {/* Desktop - Timeline verticale fixe à gauche */}
      <div
        className={`hidden lg:block fixed left-8 top-1/2 -translate-y-1/2 z-50 transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
        }`}
      >
        <div className="relative">
          {/* Ligne de progression */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20 -translate-x-1/2" />
          <div
            className="absolute left-1/2 top-0 w-0.5 bg-travliaq-turquoise -translate-x-1/2 transition-all duration-300"
            style={{ height: `${(activeDay / days.length) * 100}%` }}
          />

          {/* Points de timeline */}
          <div className="relative space-y-12">
            {days.map((day) => (
              <button
                key={day.id}
                onClick={() => scrollToDay(day.id)}
                className={`group flex items-center gap-3 transition-all duration-300 ${
                  activeDay === day.id ? 'scale-110' : 'scale-100'
                }`}

              >
                {/* Point */}
                <div
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                    activeDay === day.id
                      ? 'bg-travliaq-turquoise border-travliaq-turquoise shadow-glow scale-125'
                      : 'bg-travliaq-deep-blue border-white/40 group-hover:border-travliaq-turquoise'
                  }`}
                />

                {/* Label */}
                <span
                  className={`font-montserrat text-sm whitespace-nowrap transition-all duration-300 ${
                    activeDay === day.id
                      ? 'text-white font-semibold opacity-100'
                      : 'text-white/60 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {day.isSummary ? 'Validation' : `Étape ${day.id}`}
                </span>

              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile - Timeline horizontale fixe en bas */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-travliaq-deep-blue/95 backdrop-blur-md border-t border-white/10 transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="relative flex justify-between items-center">
            {/* Ligne de progression */}
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white/20 -translate-y-1/2" />
            <div
              className="absolute left-0 top-1/2 h-0.5 bg-travliaq-turquoise -translate-y-1/2 transition-all duration-300"
              style={{ width: `${(activeDay / days.length) * 100}%` }}
            />

            {/* Points de timeline */}
            {days.map((day) => (
              <button
                key={day.id}
                onClick={() => scrollToDay(day.id)}
                className="relative z-10"
              >
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-montserrat text-sm font-semibold transition-all duration-300 ${
                    activeDay === day.id
                      ? 'bg-travliaq-turquoise border-travliaq-turquoise text-white shadow-glow scale-110'
                      : 'bg-travliaq-deep-blue border-white/40 text-white/60'
                  }`}
                  aria-label={`Aller à l'étape ${day.isSummary ? 'Validation' : day.id}`}
                >
                  {day.isSummary ? '✓' : day.id}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default TimelineSync;
