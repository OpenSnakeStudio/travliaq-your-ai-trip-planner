import { useState, useEffect, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { useTranslation } from "react-i18next";

interface BudgetSliderProps {
  value: number;
  onChange: (value: number) => void;
  currency?: string;
}

// Define budget steps with progressive increments
const generateBudgetSteps = (): number[] => {
  const steps: number[] = [];
  
  // 300€ to 500€: +50€ increments
  for (let i = 300; i <= 500; i += 50) {
    steps.push(i);
  }
  
  // 500€ to 2000€: +100€ increments (skip 500 as it's already added)
  for (let i = 600; i <= 2000; i += 100) {
    steps.push(i);
  }
  
  // 2000€ to 5000€: +200€ increments (skip 2000 as it's already added)
  for (let i = 2200; i <= 5000; i += 200) {
    steps.push(i);
  }
  
  // 5000€ to 10000€: +500€ increments (skip 5000 as it's already added)
  for (let i = 5500; i <= 10000; i += 500) {
    steps.push(i);
  }
  
  return steps;
};

const BUDGET_STEPS = generateBudgetSteps();
const MIN_INDEX = 0;
const MAX_INDEX = BUDGET_STEPS.length - 1;

export const BudgetSlider = ({ value, onChange, currency = "EUR" }: BudgetSliderProps) => {
  const { t } = useTranslation();
  
  // Find the closest index for the current value
  const valueToIndex = (val: number): number => {
    if (val <= BUDGET_STEPS[0]) return 0;
    if (val >= BUDGET_STEPS[BUDGET_STEPS.length - 1]) return BUDGET_STEPS.length - 1;
    
    // Find closest step
    let closestIndex = 0;
    let minDiff = Math.abs(BUDGET_STEPS[0] - val);
    
    for (let i = 1; i < BUDGET_STEPS.length; i++) {
      const diff = Math.abs(BUDGET_STEPS[i] - val);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }
    
    return closestIndex;
  };
  
  const [sliderIndex, setSliderIndex] = useState(() => valueToIndex(value || 1000));
  
  useEffect(() => {
    if (value && value !== BUDGET_STEPS[sliderIndex]) {
      setSliderIndex(valueToIndex(value));
    }
  }, [value]);
  
  const handleSliderChange = (values: number[]) => {
    const newIndex = values[0];
    setSliderIndex(newIndex);
    onChange(BUDGET_STEPS[newIndex]);
  };
  
  const currentValue = BUDGET_STEPS[sliderIndex];
  
  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case "EUR": return "€";
      case "USD": return "$";
      case "GBP": return "£";
      default: return "€";
    }
  };
  
  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };
  
  // Calculate marker positions for visual reference
  const markers = useMemo(() => {
    const markerValues = [500, 1000, 2000, 5000, 10000];
    return markerValues.map(val => ({
      value: val,
      index: valueToIndex(val),
      position: (valueToIndex(val) / MAX_INDEX) * 100
    }));
  }, []);
  
  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Current value display */}
      <div className="text-center">
        <div className="inline-flex items-baseline gap-1 bg-gradient-to-r from-travliaq-deep-blue to-travliaq-turquoise bg-clip-text">
          <span className="text-5xl md:text-6xl font-bold text-transparent">
            {formatBudget(currentValue)}
          </span>
          <span className="text-3xl md:text-4xl font-semibold text-travliaq-turquoise">
            {getCurrencySymbol(currency)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {t('questionnaire.budget.perPerson')}
        </p>
      </div>
      
      {/* Slider */}
      <div className="px-4 py-6">
        <Slider
          value={[sliderIndex]}
          onValueChange={handleSliderChange}
          min={MIN_INDEX}
          max={MAX_INDEX}
          step={1}
          className="w-full"
        />
        
        {/* Markers */}
        <div className="relative mt-4 h-6">
          {markers.map((marker) => (
            <div
              key={marker.value}
              className="absolute transform -translate-x-1/2"
              style={{ left: `${marker.position}%` }}
            >
              <span className="text-xs text-muted-foreground font-medium">
                {marker.value >= 1000 ? `${marker.value / 1000}k` : marker.value}€
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Range info */}
      <div className="flex justify-between text-sm text-muted-foreground px-2">
        <span>300{getCurrencySymbol(currency)}</span>
        <span>10 000{getCurrencySymbol(currency)}</span>
      </div>
    </div>
  );
};
