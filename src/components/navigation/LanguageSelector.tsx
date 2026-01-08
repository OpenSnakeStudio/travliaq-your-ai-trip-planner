import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUserPreferences, Language } from '@/contexts/UserPreferencesContext';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface LanguageSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const languages: { code: Language; flag: string; labelKey: string }[] = [
  { code: 'fr', flag: '🇫🇷', labelKey: 'language.fr' },
  { code: 'en', flag: '🇬🇧', labelKey: 'language.en' },
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ open, onOpenChange }) => {
  const { preferences, updateLanguage } = useUserPreferences();
  const { t } = useTranslation();

  const handleSelect = async (language: Language) => {
    await updateLanguage(language);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">
            {t('preferences.chooseLanguage')}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 p-4">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleSelect(language.code)}
              className={cn(
                'relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all',
                'hover:border-primary hover:bg-primary/5',
                preferences.language === language.code
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 dark:border-gray-700'
              )}
            >
              {preferences.language === language.code && (
                <div className="absolute top-2 right-2">
                  <Check className="w-4 h-4 text-primary" />
                </div>
              )}
              <span className="text-3xl mb-2">{language.flag}</span>
              <span className="text-sm font-medium">{t(language.labelKey)}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LanguageSelector;
