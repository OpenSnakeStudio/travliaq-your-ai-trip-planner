import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp, Edit2, Mail, Loader2 } from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ReviewStepProps {
  answers: any;
  email: string;
  onEmailChange: (email: string) => void;
  onEdit: (section: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const ReviewStep = ({ answers, email, onEmailChange, onEdit, onSubmit, isSubmitting }: ReviewStepProps) => {
  const { t } = useTranslation();
  
  const [openSections, setOpenSections] = useState<string[]>(['contact']);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const sections = [
    {
      id: 'group',
      title: t('questionnaire.review.group'),
      data: [
        { label: t('questionnaire.travelGroup'), value: answers.travelGroup },
        { label: t('questionnaire.numberOfTravelers'), value: answers.numberOfTravelers }
      ]
    },
    {
      id: 'destination',
      title: t('questionnaire.review.destination'),
      data: [
        { label: t('questionnaire.hasDestination'), value: answers.hasDestination },
        { label: t('questionnaire.destination'), value: answers.destination },
        { label: t('questionnaire.departureLocation'), value: answers.departureLocation }
      ]
    },
    {
      id: 'dates',
      title: t('questionnaire.review.dates'),
      data: [
        { label: t('questionnaire.datesType'), value: answers.datesType },
        { label: t('questionnaire.departureDate'), value: answers.departureDate },
        { label: t('questionnaire.returnDate'), value: answers.returnDate },
        { label: t('questionnaire.duration'), value: answers.duration }
      ]
    },
    {
      id: 'budget',
      title: t('questionnaire.review.budget'),
      data: [
        { label: t('questionnaire.budget'), value: answers.budget },
        { label: t('questionnaire.budgetAmount'), value: answers.budgetAmount },
        { label: t('questionnaire.budgetCurrency'), value: answers.budgetCurrency }
      ]
    },
    {
      id: 'preferences',
      title: t('questionnaire.review.preferences'),
      data: [
        { label: t('questionnaire.travelAmbiance'), value: answers.travelAmbiance },
        { label: t('questionnaire.styles'), value: answers.styles?.join(', ') },
        { label: t('questionnaire.rhythm'), value: answers.rhythm },
        { label: t('questionnaire.schedulePrefs'), value: answers.schedulePrefs?.join(', ') }
      ]
    },
    {
      id: 'accommodation',
      title: t('questionnaire.review.accommodation'),
      data: [
        { label: t('questionnaire.accommodationType'), value: answers.accommodationType?.join(', ') },
        { label: t('questionnaire.hotelPreferences'), value: answers.hotelPreferences?.join(', ') },
        { label: t('questionnaire.comfort'), value: answers.comfort }
      ]
    },
    {
      id: 'constraints',
      title: t('questionnaire.review.constraints'),
      data: [
        { label: t('questionnaire.security'), value: answers.security?.join(', ') },
        { label: t('questionnaire.mobility'), value: answers.mobility?.join(', ') },
        { label: t('questionnaire.constraints'), value: answers.constraints?.join(', ') }
      ]
    }
  ];

  return (
    <div className="space-y-6 animate-fade-up max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-travliaq-deep-blue">
          {t('questionnaire.review.title')}
        </h2>
        <p className="text-muted-foreground">
          {t('questionnaire.review.description')}
        </p>
      </div>

      {/* Email et bouton en ligne */}
      <Card className="border-[2px] border-travliaq-golden-sand bg-travliaq-golden-sand/5">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-travliaq-deep-blue flex items-center gap-2 mb-4">
            <Mail className="h-5 w-5" />
            {t('questionnaire.review.contact')}
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="review-email" className="text-sm font-medium mb-2 block">
                {t('questionnaire.email')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="review-email"
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder={t('questionnaire.emailPlaceholder')}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t('questionnaire.review.emailDesc')}
              </p>
            </div>
            <div className="flex items-end">
              <Button
                variant="hero"
                size="lg"
                onClick={onSubmit}
                disabled={isSubmitting || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
                className="bg-travliaq-golden-sand text-travliaq-deep-blue hover:bg-travliaq-golden-sand/90 whitespace-nowrap"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t('questionnaire.submitting')}
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-5 w-5" />
                    {t('questionnaire.submit')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Sections à valider */}
      <div className="space-y-4">
        {sections.map((section) => (
          <Collapsible
            key={section.id}
            open={openSections.includes(section.id)}
            onOpenChange={() => toggleSection(section.id)}
          >
            <Card className="overflow-hidden">
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-4 bg-travliaq-turquoise/10 hover:bg-travliaq-turquoise/20 cursor-pointer transition-colors">
                  <h3 className="text-lg font-semibold text-travliaq-deep-blue">
                    {section.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(section.id);
                      }}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      {t('questionnaire.review.edit')}
                    </Button>
                    {openSections.includes(section.id) ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 space-y-2">
                  {section.data.map((item, idx) => (
                    item.value && (
                      <div key={idx} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-muted-foreground">{item.label}:</span>
                        <span className="text-sm font-medium text-travliaq-deep-blue">{item.value}</span>
                      </div>
                    )
                  ))}
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>
    </div>
  );
};
