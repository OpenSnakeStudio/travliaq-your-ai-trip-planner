import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUserPreferences, Currency } from '@/contexts/UserPreferencesContext';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface CurrencySelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const currencies: { code: Currency; symbol: string; labelKey: string }[] = [
  { code: 'EUR', symbol: '€', labelKey: 'currency.EUR' },
  { code: 'USD', symbol: '$', labelKey: 'currency.USD' },
  { code: 'GBP', symbol: '£', labelKey: 'currency.GBP' },
];

const CurrencySelector: React.FC<CurrencySelectorProps> = ({ open, onOpenChange }) => {
  const { preferences, updateCurrency } = useUserPreferences();
  const { t } = useTranslation();

  const handleSelect = async (currency: Currency) => {
    await updateCurrency(currency);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">
            {t('preferences.chooseCurrency')}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 p-4">
          {currencies.map((currency) => (
            <button
              key={currency.code}
              onClick={() => handleSelect(currency.code)}
              className={cn(
                'relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all',
                'hover:border-primary hover:bg-primary/5',
                preferences.currency === currency.code
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 dark:border-gray-700'
              )}
            >
              {preferences.currency === currency.code && (
                <div className="absolute top-2 right-2">
                  <Check className="w-4 h-4 text-primary" />
                </div>
              )}
              <span className="text-2xl font-bold text-primary mb-1">
                {currency.symbol}
              </span>
              <span className="text-sm font-medium">{t(currency.labelKey)}</span>
              <span className="text-xs text-muted-foreground">{currency.code}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CurrencySelector;
