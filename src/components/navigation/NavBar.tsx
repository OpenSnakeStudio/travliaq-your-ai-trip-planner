import React, { useState } from 'react';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import logo from '@/assets/logo-travliaq.png';
import CurrencySelector from './CurrencySelector';
import LanguageSelector from './LanguageSelector';
import TemperatureToggle from './TemperatureToggle';
import UserMenu from './UserMenu';
import { cn } from '@/lib/utils';

interface NavBarProps {
  variant?: 'default' | 'minimal';
  theme?: 'dark' | 'light';
}

const NavBar: React.FC<NavBarProps> = ({ variant = 'default', theme = 'dark' }) => {
  const { preferences } = useUserPreferences();
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  const isMinimal = variant === 'minimal';
  const textColor = theme === 'light' ? 'text-gray-800' : 'text-white';
  const bgClass = theme === 'light' 
    ? 'bg-white/90 backdrop-blur-sm shadow-sm' 
    : '';
  const barBg = theme === 'light'
    ? 'bg-gray-100 border border-gray-200'
    : 'bg-white/10 backdrop-blur-md border border-white/20';

  // Symboles devise
  const currencySymbols: Record<string, string> = {
    EUR: '€',
    USD: '$',
    GBP: '£',
  };

  // Drapeaux langue
  const languageFlags: Record<string, string> = {
    fr: '🇫🇷',
    en: '🇬🇧',
  };

  return (
    <>
      <header className={cn('absolute top-0 left-0 right-0 z-20 p-3 md:p-4', bgClass)}>
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <a href="/" className="block">
            <img 
              src={logo} 
              alt="Travliaq" 
              className="h-10 md:h-12 w-auto" 
            />
          </a>

          {/* Preference Bar */}
          {!isMinimal && (
            <div className={cn('flex items-center rounded-xl overflow-hidden', barBg, textColor)}>
              {/* Currency */}
              <button
                onClick={() => setCurrencyOpen(true)}
                className="flex items-center justify-center px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 border-r border-white/20"
              >
                {currencySymbols[preferences.currency] || '€'}
              </button>

              {/* Language */}
              <button
                onClick={() => setLanguageOpen(true)}
                className="flex items-center justify-center px-3 py-2 text-sm transition-colors hover:bg-white/10 border-r border-white/20"
              >
                {languageFlags[preferences.language] || '🇫🇷'}
              </button>

              {/* Temperature */}
              <TemperatureToggle className={cn('border-r border-white/20', textColor)} />

              {/* User Menu */}
              <UserMenu className={textColor} />
            </div>
          )}
        </div>
      </header>

      {/* Modals */}
      <CurrencySelector open={currencyOpen} onOpenChange={setCurrencyOpen} />
      <LanguageSelector open={languageOpen} onOpenChange={setLanguageOpen} />
    </>
  );
};

export default NavBar;
