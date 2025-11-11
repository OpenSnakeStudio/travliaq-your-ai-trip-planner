import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTranslation } from "react-i18next";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface RhythmStepProps {
  rhythm: string;
  schedulePrefs: string[];
  onUpdateRhythm: (rhythm: string) => void;
  onUpdateSchedulePrefs: (prefs: string[]) => void;
  onNext: () => void;
}

export const RhythmStep = ({ 
  rhythm, 
  schedulePrefs, 
  onUpdateRhythm, 
  onUpdateSchedulePrefs, 
  onNext 
}: RhythmStepProps) => {
  const { t } = useTranslation();

  const handleSchedulePrefToggle = (pref: string) => {
    if (schedulePrefs.includes(pref)) {
      onUpdateSchedulePrefs(schedulePrefs.filter(p => p !== pref));
    } else if (schedulePrefs.length < 3) {
      onUpdateSchedulePrefs([...schedulePrefs, pref]);
    }
  };

  const rhythmOptions = [
    { value: 'relaxed', icon: '🐢', label: t('questionnaire.rhythm.relaxed'), desc: t('questionnaire.rhythm.relaxed.desc') },
    { value: 'balanced', icon: '⚖️', label: t('questionnaire.rhythm.balanced'), desc: t('questionnaire.rhythm.balanced.desc') },
    { value: 'intense', icon: '⚡', label: t('questionnaire.rhythm.intense'), desc: t('questionnaire.rhythm.intense.desc') }
  ];

  const schedulePrefOptions = [
    { value: 'early_bird', icon: '🌅', label: t('questionnaire.schedule.earlyBird') },
    { value: 'night_owl', icon: '🌙', label: t('questionnaire.schedule.nightOwl') },
    { value: 'needs_siesta', icon: '😴', label: t('questionnaire.schedule.needsSiesta') },
    { value: 'needs_breaks', icon: '☕', label: t('questionnaire.schedule.needsBreaks') },
    { value: 'needs_free_time', icon: '🕐', label: t('questionnaire.schedule.needsFreeTime') },
    { value: 'flexible_schedule', icon: '🔄', label: t('questionnaire.schedule.flexibleSchedule') }
  ];

  return (
    <div className="space-y-3 animate-fade-up">
      <div className="text-center space-y-1">
        <h2 className="text-xl md:text-2xl font-bold text-travliaq-deep-blue">
          {t('questionnaire.rhythm.title')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('questionnaire.rhythm.description')}
        </p>
      </div>

      {/* Rhythm Selection - Radio */}
      <div className="space-y-2 max-w-3xl mx-auto">
        <Label className="text-base font-semibold text-travliaq-deep-blue">
          {t('questionnaire.rhythm.selectRhythm')} <span className="text-red-500">*</span>
        </Label>
        <RadioGroup value={rhythm} onValueChange={onUpdateRhythm}>
          <div className="grid gap-2">
            {rhythmOptions.map((option) => (
              <Card
                key={option.value}
                className={`p-3 cursor-pointer transition-all hover:scale-105 ${
                  rhythm === option.value
                    ? "border-[3px] border-travliaq-turquoise bg-travliaq-turquoise/15 shadow-golden scale-105"
                    : "hover:shadow-golden hover:border-travliaq-deep-blue"
                }`}
                onClick={() => onUpdateRhythm(option.value)}
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <span className="text-3xl">{option.icon}</span>
                  <div className="flex-1">
                    <Label htmlFor={option.value} className="text-base font-semibold text-travliaq-deep-blue cursor-pointer">
                      {option.label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">{option.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </RadioGroup>
      </div>

      {/* Schedule Preferences - Checkboxes */}
      <div className="space-y-2 max-w-3xl mx-auto">
        <Label className="text-base font-semibold text-travliaq-deep-blue">
          {t('questionnaire.schedule.title')} ({t('questionnaire.optional')})
        </Label>
        <p className="text-xs text-muted-foreground">
          {t('questionnaire.schedule.description')}
        </p>
        
        {schedulePrefs.length >= 3 && (
          <Alert className="py-2">
            <Info className="h-3 w-3" />
            <AlertDescription className="text-xs">
              {t('questionnaire.schedule.maxReached')}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {schedulePrefOptions.map((option) => {
            const isSelected = schedulePrefs.includes(option.value);
            const isDisabled = !isSelected && schedulePrefs.length >= 3;
            
            return (
              <Card
                key={option.value}
                className={`p-2 cursor-pointer transition-all ${
                  isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                } ${
                  isSelected
                    ? "border-[3px] border-travliaq-golden-sand bg-travliaq-golden-sand/15 shadow-golden"
                    : "hover:shadow-golden hover:border-travliaq-deep-blue"
                }`}
                onClick={() => !isDisabled && handleSchedulePrefToggle(option.value)}
              >
                <div className="flex flex-col items-center space-y-1">
                  <Checkbox
                    id={option.value}
                    checked={isSelected}
                    disabled={isDisabled}
                    onCheckedChange={() => handleSchedulePrefToggle(option.value)}
                    className="hidden"
                  />
                  <span className="text-2xl">{option.icon}</span>
                  <span 
                    className={`text-xs font-semibold text-travliaq-deep-blue cursor-pointer text-center ${isDisabled ? 'cursor-not-allowed' : ''}`}
                  >
                    {option.label}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center pt-2">
        <Button
          variant="hero"
          size="lg"
          onClick={onNext}
          disabled={!rhythm}
          className="bg-travliaq-deep-blue"
        >
          {t('questionnaire.continue')}
        </Button>
      </div>
    </div>
  );
};
