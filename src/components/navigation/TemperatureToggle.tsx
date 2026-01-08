import React from 'react';
import { useUserPreferences, TemperatureUnit } from '@/contexts/UserPreferencesContext';
import { cn } from '@/lib/utils';

interface TemperatureToggleProps {
  className?: string;
}

const TemperatureToggle: React.FC<TemperatureToggleProps> = ({ className }) => {
  const { preferences, updateTemperatureUnit } = useUserPreferences();

  const handleToggle = async () => {
    const newUnit: TemperatureUnit = preferences.temperatureUnit === 'C' ? 'F' : 'C';
    await updateTemperatureUnit(newUnit);
  };

  return (
    <button
      onClick={handleToggle}
      className={cn(
        'flex items-center justify-center px-3 py-2 text-sm font-medium transition-colors',
        'hover:bg-white/10 focus:outline-none',
        className
      )}
      title={`Basculer vers °${preferences.temperatureUnit === 'C' ? 'F' : 'C'}`}
    >
      °{preferences.temperatureUnit}
    </button>
  );
};

export default TemperatureToggle;
