import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useUserPreferences, TemperatureUnit } from '@/contexts/UserPreferencesContext';
import { cn } from '@/lib/utils';

interface TemperatureToggleProps {
  className?: string;
}

const TemperatureToggle: React.FC<TemperatureToggleProps> = ({ className }) => {
  const { preferences, updateTemperatureUnit } = useUserPreferences();

  const handleToggle = async (unit: TemperatureUnit) => {
    await updateTemperatureUnit(unit);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'flex items-center justify-center px-3 py-2 text-sm font-medium transition-colors',
            'hover:bg-white/10 focus:outline-none',
            className
          )}
        >
          °{preferences.temperatureUnit}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="end">
        <div className="flex gap-1">
          <button
            onClick={() => handleToggle('C')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              preferences.temperatureUnit === 'C'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            )}
          >
            °C
          </button>
          <button
            onClick={() => handleToggle('F')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              preferences.temperatureUnit === 'F'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            )}
          >
            °F
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TemperatureToggle;
