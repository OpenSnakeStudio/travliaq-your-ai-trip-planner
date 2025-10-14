import { Calendar, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";

interface Activity {
  id: number;
  title: string;
}

interface TravelDayCalendarProps {
  days: Array<{
    id: number;
    title: string;
    day: number;
  }>;
  activeDay: number;
  startDate?: Date;
  onScrollToDay?: (dayId: number | string) => void;
}

const TravelDayCalendar = ({ days, activeDay, startDate = new Date(), onScrollToDay }: TravelDayCalendarProps) => {
  const activeDayRef = useRef<HTMLDivElement>(null);
  
  const handleActivityClick = (activityId: number) => {
    if (onScrollToDay) {
      onScrollToDay(activityId);
    }
  };
  
  // Regrouper les activités par jour
  const dayGroups: Array<{
    dayNumber: number;
    date: Date;
    dayOfWeek: string;
    dayOfMonth: number;
    month: string;
    activities: Array<{ id: number; title: string }>;
    hasActiveActivity: boolean;
  }> = [];

  // Déterminer le nombre de jours total
  const maxDay = Math.max(...days.map(d => d.day));

  // Créer les groupes de jours avec leurs activités
  for (let dayNum = 1; dayNum <= maxDay; dayNum++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + (dayNum - 1));
    
    const activitiesForDay = days.filter(d => d.day === dayNum);
    
    dayGroups.push({
      dayNumber: dayNum,
      date: new Date(currentDate),
      dayOfWeek: currentDate.toLocaleDateString('fr-FR', { weekday: 'long' }),
      dayOfMonth: currentDate.getDate(),
      month: currentDate.toLocaleDateString('fr-FR', { month: 'long' }),
      activities: activitiesForDay,
      hasActiveActivity: activitiesForDay.some(a => a.id === activeDay),
    });
  }

  // Auto-scroll vers le jour actif
  useEffect(() => {
    if (activeDayRef.current) {
      activeDayRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeDay]);

  return (
    <div className="bg-gradient-to-br from-travliaq-deep-blue/90 to-travliaq-deep-blue/70 backdrop-blur-md rounded-lg border border-travliaq-turquoise/30 shadow-[0_0_20px_rgba(56,189,248,0.15)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 pb-2 border-b border-travliaq-turquoise/30 bg-travliaq-deep-blue/50">
        <Calendar className="w-4 h-4 text-travliaq-turquoise" />
        <h3 className="font-montserrat text-white text-sm font-semibold">
          Planning du voyage
        </h3>
      </div>

      {/* Timeline view */}
      <ScrollArea className="h-[400px]">
        <div className="p-3 space-y-3">
          {dayGroups.map((dayGroup, index) => (
            <div
              key={index}
              ref={dayGroup.hasActiveActivity ? activeDayRef : null}
              className={`rounded-lg transition-all duration-300 overflow-hidden ${
                dayGroup.hasActiveActivity
                  ? 'bg-gradient-to-br from-travliaq-turquoise/20 to-travliaq-turquoise/10 border-2 border-travliaq-turquoise shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                  : 'bg-white/10 border border-white/20'
              }`}
            >
              {/* Day header */}
              <div className={`p-2 border-b ${
                dayGroup.hasActiveActivity 
                  ? 'border-travliaq-turquoise/40 bg-travliaq-turquoise/10' 
                  : 'border-white/10 bg-white/5'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-montserrat text-xs font-bold uppercase ${
                      dayGroup.hasActiveActivity ? 'text-travliaq-turquoise' : 'text-white/80'
                    }`}>
                      {dayGroup.dayOfWeek}
                    </div>
                    <div className={`font-inter text-[10px] ${
                      dayGroup.hasActiveActivity ? 'text-white/90' : 'text-white/60'
                    }`}>
                      {dayGroup.dayOfMonth} {dayGroup.month}
                    </div>
                  </div>
                  <div className={`font-montserrat text-lg font-bold ${
                    dayGroup.hasActiveActivity ? 'text-white' : 'text-white/70'
                  }`}>
                    Jour {dayGroup.dayNumber}
                  </div>
                </div>
              </div>

              {/* Activities for this day */}
              <div className="p-2 space-y-1.5">
                {dayGroup.activities.length > 0 ? (
                  dayGroup.activities.map((activity, actIndex) => (
                    <button
                      key={activity.id}
                      onClick={() => handleActivityClick(activity.id)}
                      className={`w-full flex items-start gap-2 p-2 rounded transition-all cursor-pointer ${
                        activity.id === activeDay
                          ? 'bg-travliaq-turquoise/30 border border-travliaq-turquoise'
                          : 'bg-white/5 hover:bg-white/15 border border-transparent hover:border-white/20'
                      }`}
                    >
                      <div className={`flex-shrink-0 flex items-center gap-1 ${
                        activity.id === activeDay ? 'text-travliaq-turquoise' : 'text-white/60'
                      }`}>
                        <Clock className="w-3 h-3" />
                        <span className="font-inter text-[10px]">
                          {8 + actIndex * 2}h00
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className={`font-inter text-xs leading-tight ${
                          activity.id === activeDay ? 'text-white font-semibold' : 'text-white/80'
                        }`}>
                          {activity.title}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-white/40 text-xs italic text-center py-2">
                    Aucune activité prévue
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TravelDayCalendar;
