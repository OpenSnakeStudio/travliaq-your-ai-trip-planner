import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Users, Heart, Baby, UserCircle, Plane, Hotel, Compass, 
  MapPin, Calendar as CalendarIcon, Euro, Sparkles, Mountain,
  Waves, Sun, Snowflake, CheckCircle2, Mail, Globe, Palmtree,
  Camera, Utensils, Building, Car, MapPinned, Clock, Coffee,
  Moon, Sunrise, AlertCircle, Shield, Briefcase, PartyPopper,
  Music, Book, ShoppingBag, Wine, Dumbbell, ArrowRight, ArrowLeft
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CitySearch } from "@/components/questionnaire/CitySearch";
import { WorldMap } from "@/components/questionnaire-v2/WorldMap";
import { BudgetChart } from "@/components/questionnaire-v2/BudgetChart";
import { ProgressRing } from "@/components/questionnaire-v2/ProgressRing";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Traveler {
  type: 'adult' | 'child';
  age?: number;
}

interface QuestionnaireData {
  // Section 1: Voyageurs
  travelGroup?: string;
  travelers: Traveler[];
  
  // Section 2: Destination
  hasDestination?: boolean;
  destination?: string;
  departureCity?: string;
  climates: string[];
  affinities: string[];
  ambiance?: string;
  
  // Section 3: Dates
  datesType?: 'fixed' | 'flexible' | 'open';
  dateRange?: { from: Date; to?: Date };
  approximateDate?: Date;
  flexibility?: string;
  duration?: string;
  
  // Section 4: Services
  helpWith: string[];
  
  // Section 5: Vols
  flightPreference?: string;
  luggagePreferences: Record<number, string>;
  
  // Section 6: Hébergement
  accommodationTypes: string[];
  comfort?: string;
  neighborhood?: string;
  amenities: string[];
  
  // Section 7: Activités
  activities: string[];
  
  // Section 8: Budget
  budget: number;
  budgetType?: string;
  budgetCurrency?: string;
  
  // Section 9: Style & Rythme
  styles: string[];
  rhythm?: string;
  schedulePrefs: string[];
  
  // Section 10: Contraintes
  mobility: string[];
  dietaryRestrictions?: string;
  allergies?: string;
  
  // Section 11: Finalisation
  email: string;
  additionalInfo?: string;
}

const QuestionnaireV2 = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentSection, setCurrentSection] = useState(0);
  const [data, setData] = useState<QuestionnaireData>({
    travelers: [{ type: 'adult' }],
    helpWith: [],
    climates: [],
    affinities: [],
    accommodationTypes: [],
    amenities: [],
    activities: [],
    styles: [],
    schedulePrefs: [],
    mobility: [],
    luggagePreferences: {},
    budget: 1000,
    email: ""
  });

  const totalSections = 11;
  const progress = ((currentSection + 1) / totalSections) * 100;

  const sections = [
    { id: 0, title: t("questionnaire.sections.travelers"), icon: Users },
    { id: 1, title: t("questionnaire.sections.destination"), icon: Globe },
    { id: 2, title: t("questionnaire.sections.dates"), icon: CalendarIcon },
    { id: 3, title: t("questionnaire.sections.services"), icon: Sparkles },
    { id: 4, title: t("questionnaire.sections.flights"), icon: Plane },
    { id: 5, title: t("questionnaire.sections.accommodation"), icon: Hotel },
    { id: 6, title: t("questionnaire.sections.activities"), icon: Camera },
    { id: 7, title: t("questionnaire.sections.budget"), icon: Euro },
    { id: 8, title: t("questionnaire.sections.style"), icon: Clock },
    { id: 9, title: t("questionnaire.sections.constraints"), icon: Shield },
    { id: 10, title: t("questionnaire.sections.finalization"), icon: CheckCircle2 },
  ];

  const travelGroups = [
    { id: "solo", label: t("questionnaire.groups.solo"), icon: UserCircle, color: "from-purple-500 to-pink-500" },
    { id: "duo", label: t("questionnaire.groups.duo"), icon: Heart, color: "from-red-500 to-rose-500" },
    { id: "family", label: t("questionnaire.groups.family"), icon: Baby, color: "from-blue-500 to-cyan-500" },
    { id: "friends", label: t("questionnaire.groups.friends"), icon: Users, color: "from-green-500 to-emerald-500" },
  ];

  const services = [
    { id: "flights", label: t("questionnaire.services.flights"), icon: Plane, desc: t("questionnaire.services.flightsDesc") },
    { id: "accommodation", label: t("questionnaire.services.accommodation"), icon: Hotel, desc: t("questionnaire.services.accommodationDesc") },
    { id: "activities", label: t("questionnaire.services.activities"), icon: Compass, desc: t("questionnaire.services.activitiesDesc") },
    { id: "transport", label: t("questionnaire.services.transport"), icon: Car, desc: t("questionnaire.services.transportDesc") },
  ];

  const climates = [
    { id: "hot", label: t("questionnaire.climate.hot"), icon: Sun, color: "from-orange-500 to-red-500" },
    { id: "mild", label: t("questionnaire.climate.mild"), icon: Sparkles, color: "from-yellow-500 to-orange-500" },
    { id: "cold", label: t("questionnaire.climate.cold"), icon: Snowflake, color: "from-blue-500 to-cyan-500" },
  ];

  const affinities = [
    { id: "beach", label: t("questionnaire.affinities.beach"), icon: Waves },
    { id: "mountain", label: t("questionnaire.affinities.mountain"), icon: Mountain },
    { id: "city", label: t("questionnaire.affinities.city"), icon: Building },
    { id: "nature", label: t("questionnaire.affinities.nature"), icon: Palmtree },
    { id: "culture", label: t("questionnaire.affinities.culture"), icon: Book },
    { id: "adventure", label: t("questionnaire.affinities.adventure"), icon: Compass },
  ];

  const activitiesList = [
    { id: "museums", label: t("questionnaire.activities.museums"), icon: Book },
    { id: "gastronomy", label: t("questionnaire.activities.gastronomy"), icon: Utensils },
    { id: "shopping", label: t("questionnaire.activities.shopping"), icon: ShoppingBag },
    { id: "nightlife", label: t("questionnaire.activities.nightlife"), icon: Music },
    { id: "sports", label: t("questionnaire.activities.sports"), icon: Dumbbell },
    { id: "relaxation", label: t("questionnaire.activities.relaxation"), icon: Coffee },
    { id: "wine", label: t("questionnaire.activities.wine"), icon: Wine },
    { id: "photography", label: t("questionnaire.activities.photography"), icon: Camera },
  ];

  const accommodationTypesList = [
    { id: "hotel", label: t("questionnaire.accommodation.hotel"), icon: Hotel },
    { id: "airbnb", label: t("questionnaire.accommodation.airbnb"), icon: Building },
    { id: "resort", label: t("questionnaire.accommodation.resort"), icon: Palmtree },
    { id: "hostel", label: t("questionnaire.accommodation.hostel"), icon: Users },
  ];

  const amenitiesList = [
    { id: "pool", label: t("questionnaire.accommodation.pool") },
    { id: "spa", label: t("questionnaire.accommodation.spa") },
    { id: "gym", label: t("questionnaire.accommodation.gym") },
    { id: "restaurant", label: t("questionnaire.accommodation.restaurant") },
    { id: "wifi", label: t("questionnaire.accommodation.wifi") },
    { id: "parking", label: t("questionnaire.accommodation.parking") },
  ];

  const schedulePrefs = [
    { id: "early_bird", label: t("questionnaire.style.earlyBird"), icon: Sunrise },
    { id: "night_owl", label: t("questionnaire.style.nightOwl"), icon: Moon },
    { id: "flexible", label: t("questionnaire.style.flexible"), icon: Clock },
  ];

  const toggleItem = (key: keyof QuestionnaireData, value: string) => {
    const array = data[key] as string[];
    if (array.includes(value)) {
      setData({ ...data, [key]: array.filter(v => v !== value) });
    } else {
      setData({ ...data, [key]: [...array, value] });
    }
  };

  const canProceed = () => {
    switch(currentSection) {
      case 0: return data.travelGroup && data.travelers.length > 0;
      case 1: return true; // Optional destination
      case 2: return data.datesType;
      case 3: return data.helpWith.length > 0;
      case 4: return data.helpWith.includes('flights') ? data.flightPreference : true;
      case 5: return data.helpWith.includes('accommodation') ? data.accommodationTypes.length > 0 : true;
      case 6: return data.helpWith.includes('activities') ? data.activities.length > 0 : true;
      case 7: return data.budget > 0;
      case 8: return data.styles.length > 0 && data.rhythm;
      case 9: return true; // Optional
      case 10: return data.email && data.email.includes('@');
      default: return false;
    }
  };

  const nextSection = () => {
    if (!canProceed()) {
      toast({
        title: t("questionnaire.toast.missingInfo"),
        description: t("questionnaire.toast.missingInfoDesc"),
        variant: "destructive"
      });
      return;
    }

    if (currentSection < totalSections - 1) {
      setCurrentSection(currentSection + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    console.log("Submitting:", data);
    toast({
      title: t("questionnaire.toast.submitted"),
      description: t("questionnaire.toast.submittedDesc"),
    });
    // TODO: Submit to API
  };

  const addTraveler = (type: 'adult' | 'child') => {
    setData({
      ...data,
      travelers: [...data.travelers, { type, age: type === 'child' ? 5 : undefined }]
    });
  };

  const removeTraveler = (index: number) => {
    const newTravelers = data.travelers.filter((_, i) => i !== index);
    setData({ ...data, travelers: newTravelers });
  };

  const updateTravelerAge = (index: number, age: number) => {
    const newTravelers = [...data.travelers];
    newTravelers[index].age = age;
    setData({ ...data, travelers: newTravelers });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50">
      <Navigation theme="light" />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl pt-24">
        {/* Hero Header with Progress */}
        <div className="text-center mb-8 space-y-6">
          <div className="inline-block">
            <Badge className="text-lg px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
              ✨ {t("questionnaire.badge")}
            </Badge>
          </div>

          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t("questionnaire.title")}
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("questionnaire.subtitle")}
          </p>

          {/* Progress Ring */}
          <div className="flex justify-center">
            <ProgressRing percentage={progress} title={t("questionnaire.progress")} />
          </div>

          {/* Section Navigation */}
          <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
            {sections.map((section, idx) => {
              const Icon = section.icon;
              const isActive = idx === currentSection;
              const isCompleted = idx < currentSection;
              
              return (
                <Button
                  key={section.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "transition-all",
                    isCompleted && "bg-green-100 border-green-500 text-green-700 hover:bg-green-200"
                  )}
                  onClick={() => setCurrentSection(idx)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {section.title}
                  {isCompleted && <CheckCircle2 className="w-4 h-4 ml-2" />}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Content Sections */}
        <div className="max-w-5xl mx-auto">
          
          {/* Section 0: Voyageurs */}
          {currentSection === 0 && (
            <div className="space-y-8 animate-fade-in">
              <Card className="p-8 border-2 shadow-xl bg-white/80 backdrop-blur">
                <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {t("questionnaire.travelers.title")}
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {travelGroups.map((group) => {
                    const Icon = group.icon;
                    const isSelected = data.travelGroup === group.id;
                    return (
                      <button
                        key={group.id}
                        onClick={() => setData({ ...data, travelGroup: group.id })}
                        className={cn(
                          "relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl",
                          isSelected
                            ? `bg-gradient-to-br ${group.color} text-white border-transparent shadow-2xl scale-105`
                            : "bg-white hover:border-primary"
                        )}
                      >
                        {isSelected && (
                          <CheckCircle2 className="absolute top-2 right-2 w-6 h-6" />
                        )}
                        <Icon className="w-12 h-12 mx-auto mb-2" />
                        <p className="font-semibold text-center">{group.label}</p>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">{t("questionnaire.travelers.details")}</h3>
                    <div className="flex gap-2">
                      <Button onClick={() => addTraveler('adult')} size="sm">
                        {t("questionnaire.travelers.addAdult")}
                      </Button>
                      <Button onClick={() => addTraveler('child')} size="sm" variant="outline">
                        {t("questionnaire.travelers.addChild")}
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {data.travelers.map((traveler, idx) => (
                      <Card key={idx} className="p-4 flex items-center gap-4">
                        <Badge variant={traveler.type === 'adult' ? 'default' : 'secondary'}>
                          {traveler.type === 'adult' ? `👤 ${t("questionnaire.travelers.adult")}` : `👶 ${t("questionnaire.travelers.child")}`}
                        </Badge>

                        {traveler.type === 'child' && (
                          <div className="flex items-center gap-2 flex-1">
                            <Label className="text-sm">{t("questionnaire.travelers.age")}</Label>
                            <Input
                              type="number"
                              min="0"
                              max="17"
                              value={traveler.age || 5}
                              onChange={(e) => updateTravelerAge(idx, parseInt(e.target.value))}
                              className="w-20"
                            />
                            <span className="text-sm text-muted-foreground">{t("questionnaire.travelers.years")}</span>
                          </div>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTraveler(idx)}
                          disabled={data.travelers.length === 1}
                        >
                          ✕
                        </Button>
                      </Card>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Section 1: Destination */}
          {currentSection === 1 && (
            <div className="space-y-8 animate-fade-in">
              <Card className="p-8 border-2 shadow-xl bg-white/80 backdrop-blur">
                <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {t("questionnaire.destination.title")}
                </h2>

                <div className="space-y-6">
                  <div className="text-center mb-4">
                    <Label className="text-lg font-semibold">{t("questionnaire.destination.hasDestination")}</Label>
                    <RadioGroup
                      value={data.hasDestination ? "yes" : "no"}
                      onValueChange={(v) => setData({ ...data, hasDestination: v === "yes" })}
                      className="flex justify-center gap-4 mt-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="dest-yes" />
                        <Label htmlFor="dest-yes" className="cursor-pointer">{t("questionnaire.destination.yes")}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="dest-no" />
                        <Label htmlFor="dest-no" className="cursor-pointer">{t("questionnaire.destination.no")}</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {data.hasDestination && (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label className="mb-2 flex items-center gap-2 text-lg">
                          <MapPin className="w-5 h-5" />
                          {t("questionnaire.destination.label")}
                        </Label>
                        <CitySearch
                          value={data.destination || ""}
                          onChange={(city) => setData({ ...data, destination: city })}
                          placeholder={t("questionnaire.destination.placeholder")}
                        />
                      </div>
                      <div>
                        <Label className="mb-2 flex items-center gap-2 text-lg">
                          <Plane className="w-5 h-5" />
                          {t("questionnaire.destination.departureLabel")}
                        </Label>
                        <CitySearch
                          value={data.departureCity || ""}
                          onChange={(city) => setData({ ...data, departureCity: city })}
                          placeholder={t("questionnaire.destination.departurePlaceholder")}
                        />
                      </div>
                    </div>
                  )}

                  <div className="my-8">
                    <WorldMap />
                  </div>

                  <div>
                    <Label className="text-lg font-semibold mb-4 block">{t("questionnaire.climate.title")}</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {climates.map((climate) => {
                        const Icon = climate.icon;
                        const isSelected = data.climates.includes(climate.id);
                        return (
                          <button
                            key={climate.id}
                            onClick={() => toggleItem("climates", climate.id)}
                            className={cn(
                              "p-6 rounded-xl border-2 transition-all hover:scale-105",
                              isSelected
                                ? `bg-gradient-to-br ${climate.color} text-white border-transparent shadow-xl`
                                : "bg-white hover:border-primary"
                            )}
                          >
                            <Icon className="w-10 h-10 mx-auto mb-2" />
                            <p className="font-semibold">{climate.label}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label className="text-lg font-semibold mb-4 block">{t("questionnaire.affinities.title")}</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {affinities.map((affinity) => {
                        const Icon = affinity.icon;
                        const isSelected = data.affinities.includes(affinity.id);
                        return (
                          <button
                            key={affinity.id}
                            onClick={() => toggleItem("affinities", affinity.id)}
                            className={cn(
                              "p-4 rounded-lg border-2 transition-all hover:scale-105 flex items-center gap-3",
                              isSelected
                                ? "bg-cyan-500 text-white border-cyan-600 shadow-lg"
                                : "bg-white hover:border-cyan-400"
                            )}
                          >
                            <Icon className="w-6 h-6" />
                            <span className="font-medium">{affinity.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Section 2: Dates */}
          {currentSection === 2 && (
            <div className="space-y-8 animate-fade-in">
              <Card className="p-8 border-2 shadow-xl bg-white/80 backdrop-blur">
                <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {t("questionnaire.dates.title")}
                </h2>

                <div className="space-y-6">
                  <RadioGroup
                    value={data.datesType}
                    onValueChange={(v: any) => setData({ ...data, datesType: v })}
                    className="grid md:grid-cols-3 gap-4"
                  >
                    <Label
                      htmlFor="fixed"
                      className={cn(
                        "flex flex-col items-center p-6 rounded-xl border-2 cursor-pointer transition-all hover:scale-105",
                        data.datesType === 'fixed' ? "bg-orange-500 text-white border-orange-600 shadow-xl" : "bg-white hover:border-orange-400"
                      )}
                    >
                      <RadioGroupItem value="fixed" id="fixed" className="sr-only" />
                      <CalendarIcon className="w-12 h-12 mb-2" />
                      <span className="font-semibold">{t("questionnaire.dates.fixed")}</span>
                    </Label>

                    <Label
                      htmlFor="flexible"
                      className={cn(
                        "flex flex-col items-center p-6 rounded-xl border-2 cursor-pointer transition-all hover:scale-105",
                        data.datesType === 'flexible' ? "bg-orange-500 text-white border-orange-600 shadow-xl" : "bg-white hover:border-orange-400"
                      )}
                    >
                      <RadioGroupItem value="flexible" id="flexible" className="sr-only" />
                      <Clock className="w-12 h-12 mb-2" />
                      <span className="font-semibold">{t("questionnaire.dates.flexible")}</span>
                    </Label>

                    <Label
                      htmlFor="open"
                      className={cn(
                        "flex flex-col items-center p-6 rounded-xl border-2 cursor-pointer transition-all hover:scale-105",
                        data.datesType === 'open' ? "bg-orange-500 text-white border-orange-600 shadow-xl" : "bg-white hover:border-orange-400"
                      )}
                    >
                      <RadioGroupItem value="open" id="open" className="sr-only" />
                      <Sparkles className="w-12 h-12 mb-2" />
                      <span className="font-semibold">{t("questionnaire.dates.open")}</span>
                    </Label>
                  </RadioGroup>

                  {(data.datesType === 'fixed' || data.datesType === 'flexible') && (
                    <div className="flex justify-center">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full max-w-md h-16 text-lg">
                            <CalendarIcon className="mr-2 h-6 w-6" />
                            {data.dateRange?.from ? (
                              data.dateRange.to ? (
                                <>
                                  {format(data.dateRange.from, "dd MMM")} - {format(data.dateRange.to, "dd MMM yyyy")}
                                </>
                              ) : (
                                format(data.dateRange.from, "dd MMM yyyy")
                              )
                            ) : (
                              <span>{t("questionnaire.dates.select")}</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="center">
                          <Calendar
                            initialFocus
                            mode="range"
                            selected={data.dateRange}
                            onSelect={(range) => setData({ ...data, dateRange: range })}
                            numberOfMonths={2}
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Section 3: Services */}
          {currentSection === 3 && (
            <div className="space-y-8 animate-fade-in">
              <Card className="p-8 border-2 shadow-xl bg-white/80 backdrop-blur">
                <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {t("questionnaire.services.title")}
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  {services.map((service) => {
                    const Icon = service.icon;
                    const isSelected = data.helpWith.includes(service.id);
                    return (
                      <button
                        key={service.id}
                        onClick={() => toggleItem("helpWith", service.id)}
                        className={cn(
                          "p-6 rounded-xl border-2 transition-all hover:scale-105 text-left relative",
                          isSelected 
                            ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white border-transparent shadow-xl"
                            : "bg-white hover:border-green-400"
                        )}
                      >
                        {isSelected && (
                          <CheckCircle2 className="absolute top-4 right-4 w-6 h-6" />
                        )}
                        <Icon className="w-12 h-12 mb-3" />
                        <h3 className="text-xl font-bold mb-1">{service.label}</h3>
                        <p className={cn("text-sm", isSelected ? "text-white/90" : "text-muted-foreground")}>
                          {service.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}

          {/* Section 4: Vols */}
          {currentSection === 4 && data.helpWith.includes('flights') && (
            <div className="space-y-8 animate-fade-in">
              <Card className="p-8 border-2 shadow-xl bg-white/80 backdrop-blur">
                <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                  ✈️ {t("questionnaire.flights.title")}
                </h2>

                <div className="space-y-6">
                  <div>
                    <Label className="text-lg font-semibold mb-4 block">{t("questionnaire.flights.typeLabel")}</Label>
                    <RadioGroup
                      value={data.flightPreference}
                      onValueChange={(v) => setData({ ...data, flightPreference: v })}
                      className="space-y-3"
                    >
                      {[
                        { value: "direct", label: t("questionnaire.flights.direct"), icon: "✈️" },
                        { value: "one_stop", label: t("questionnaire.flights.oneStop"), icon: "🔄" },
                        { value: "flexible", label: t("questionnaire.flights.flexible"), icon: "💰" },
                      ].map((option) => (
                        <Label
                          key={option.value}
                          htmlFor={option.value}
                          className={cn(
                            "flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-[1.02]",
                            data.flightPreference === option.value 
                              ? "bg-sky-500 text-white border-sky-600 shadow-lg"
                              : "bg-white hover:border-sky-400"
                          )}
                        >
                          <RadioGroupItem value={option.value} id={option.value} className="mr-3" />
                          <span className="text-2xl mr-3">{option.icon}</span>
                          <span className="font-medium">{option.label}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-lg font-semibold mb-4 block">{t("questionnaire.flights.luggageLabel")}</Label>
                    {data.travelers.map((traveler, idx) => (
                      <div key={idx} className="mb-3">
                        <Label className="text-sm mb-2 block">
                          {traveler.type === 'adult' ? `${t("questionnaire.travelers.adult")} ${idx + 1}` : `${t("questionnaire.travelers.child")} ${idx + 1}`}
                        </Label>
                        <RadioGroup
                          value={data.luggagePreferences[idx]}
                          onValueChange={(v) => setData({
                            ...data,
                            luggagePreferences: { ...data.luggagePreferences, [idx]: v }
                          })}
                          className="flex gap-2"
                        >
                          {[
                            { value: "cabin", label: t("questionnaire.flights.cabin") },
                            { value: "checked", label: t("questionnaire.flights.checked") },
                            { value: "both", label: t("questionnaire.flights.both") },
                          ].map((option) => (
                            <Label
                              key={option.value}
                              htmlFor={`luggage-${idx}-${option.value}`}
                              className={cn(
                                "flex-1 p-3 rounded-lg border-2 cursor-pointer text-center transition-all",
                                data.luggagePreferences[idx] === option.value
                                  ? "bg-sky-500 text-white border-sky-600"
                                  : "bg-white hover:border-sky-400"
                              )}
                            >
                              <RadioGroupItem 
                                value={option.value} 
                                id={`luggage-${idx}-${option.value}`} 
                                className="sr-only"
                              />
                              {option.label}
                            </Label>
                          ))}
                        </RadioGroup>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Section 5: Hébergement */}
          {currentSection === 5 && data.helpWith.includes('accommodation') && (
            <div className="space-y-8 animate-fade-in">
              <Card className="p-8 border-2 shadow-xl bg-white/80 backdrop-blur">
                <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  🏨 {t("questionnaire.accommodation.title")}
                </h2>

                <div className="space-y-6">
                  <div>
                    <Label className="text-lg font-semibold mb-4 block">{t("questionnaire.accommodation.typeLabel")}</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {accommodationTypesList.map((type) => {
                        const Icon = type.icon;
                        const isSelected = data.accommodationTypes.includes(type.id);
                        return (
                          <button
                            key={type.id}
                            onClick={() => toggleItem("accommodationTypes", type.id)}
                            className={cn(
                              "p-4 rounded-lg border-2 transition-all hover:scale-105",
                              isSelected 
                                ? "bg-purple-500 text-white border-purple-600 shadow-lg"
                                : "bg-white hover:border-purple-400"
                            )}
                          >
                            <Icon className="w-8 h-8 mx-auto mb-2" />
                            <p className="font-medium text-sm">{type.label}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label className="text-lg font-semibold mb-4 block">{t("questionnaire.accommodation.comfortLabel")}</Label>
                    <RadioGroup
                      value={data.comfort}
                      onValueChange={(v) => setData({ ...data, comfort: v })}
                      className="grid grid-cols-3 gap-3"
                    >
                      {[
                        { value: "budget", label: t("questionnaire.accommodation.budget"), icon: "💰" },
                        { value: "standard", label: t("questionnaire.accommodation.standard"), icon: "⭐" },
                        { value: "luxury", label: t("questionnaire.accommodation.luxury"), icon: "💎" },
                      ].map((option) => (
                        <Label
                          key={option.value}
                          htmlFor={`comfort-${option.value}`}
                          className={cn(
                            "flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105",
                            data.comfort === option.value 
                              ? "bg-purple-500 text-white border-purple-600 shadow-lg"
                              : "bg-white hover:border-purple-400"
                          )}
                        >
                          <RadioGroupItem value={option.value} id={`comfort-${option.value}`} className="sr-only" />
                          <span className="text-3xl mb-2">{option.icon}</span>
                          <span className="font-medium">{option.label}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-lg font-semibold mb-4 block">{t("questionnaire.accommodation.amenitiesLabel")}</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {amenitiesList.map((amenity) => {
                        const isSelected = data.amenities.includes(amenity.id);
                        return (
                          <button
                            key={amenity.id}
                            onClick={() => toggleItem("amenities", amenity.id)}
                            className={cn(
                              "p-3 rounded-lg border-2 transition-all text-sm font-medium",
                              isSelected 
                                ? "bg-purple-500 text-white border-purple-600"
                                : "bg-white hover:border-purple-400"
                            )}
                          >
                            {amenity.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Section 6: Activités */}
          {currentSection === 6 && data.helpWith.includes('activities') && (
            <div className="space-y-8 animate-fade-in">
              <Card className="p-8 border-2 shadow-xl bg-white/80 backdrop-blur">
                <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  🎭 {t("questionnaire.activities.title")}
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {activitiesList.map((activity) => {
                    const Icon = activity.icon;
                    const isSelected = data.activities.includes(activity.id);
                    return (
                      <button
                        key={activity.id}
                        onClick={() => toggleItem("activities", activity.id)}
                        className={cn(
                          "p-5 rounded-xl border-2 transition-all hover:scale-105",
                          isSelected 
                            ? "bg-gradient-to-br from-orange-500 to-red-500 text-white border-transparent shadow-xl"
                            : "bg-white hover:border-orange-400"
                        )}
                      >
                        <Icon className="w-10 h-10 mx-auto mb-2" />
                        <p className="font-medium text-sm">{activity.label}</p>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}

          {/* Section 7: Budget */}
          {currentSection === 7 && (
            <div className="space-y-8 animate-fade-in">
              <Card className="p-8 border-2 shadow-xl bg-white/80 backdrop-blur">
                <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  💰 {t("questionnaire.budget.title")}
                </h2>

                <div className="space-y-8">
                  <div>
                    <Label className="text-lg font-semibold mb-4 block text-center">
                      {t("questionnaire.budget.perPerson")}
                    </Label>
                    
                    <BudgetChart value={data.budget} max={5000} />
                    
                    <div className="mt-6 space-y-4">
                      <Slider
                        value={[data.budget]}
                        onValueChange={(value) => setData({ ...data, budget: value[0] })}
                        max={5000}
                        min={0}
                        step={50}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>€0</span>
                        <span>€1,250</span>
                        <span>€2,500</span>
                        <span>€3,750</span>
                        <span>€5,000+</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200">
                    <p className="text-sm text-muted-foreground mb-2">{t("questionnaire.budget.total")}</p>
                    <p className="text-4xl font-bold text-cyan-600">
                      €{(data.budget * data.travelers.length).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("questionnaire.budget.forTravelers", { count: data.travelers.length })}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Section 8: Style & Rythme */}
          {currentSection === 8 && (
            <div className="space-y-8 animate-fade-in">
              <Card className="p-8 border-2 shadow-xl bg-white/80 backdrop-blur">
                <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  🎨 {t("questionnaire.style.title")}
                </h2>

                <div className="space-y-8">
                  <div>
                    <Label className="text-lg font-semibold mb-4 block">{t("questionnaire.style.stylesLabel")}</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { id: "cultural", label: t("questionnaire.style.cultural"), icon: Book },
                        { id: "adventure", label: t("questionnaire.style.adventure"), icon: Compass },
                        { id: "relaxation", label: t("questionnaire.style.relaxation"), icon: Coffee },
                        { id: "gastronomy", label: t("questionnaire.style.gastronomy"), icon: Utensils },
                        { id: "party", label: t("questionnaire.style.party"), icon: PartyPopper },
                        { id: "romantic", label: t("questionnaire.style.romantic"), icon: Heart },
                      ].map((style) => {
                        const Icon = style.icon;
                        const isSelected = data.styles.includes(style.id);
                        return (
                          <button
                            key={style.id}
                            onClick={() => toggleItem("styles", style.id)}
                            className={cn(
                              "p-4 rounded-xl border-2 transition-all hover:scale-105 flex items-center gap-3",
                              isSelected 
                                ? "bg-indigo-500 text-white border-indigo-600 shadow-lg"
                                : "bg-white hover:border-indigo-400"
                            )}
                          >
                            <Icon className="w-6 h-6" />
                            <span className="font-medium">{style.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label className="text-lg font-semibold mb-4 block">{t("questionnaire.style.rhythmLabel")}</Label>
                    <RadioGroup
                      value={data.rhythm}
                      onValueChange={(v) => setData({ ...data, rhythm: v })}
                      className="grid grid-cols-3 gap-4"
                    >
                      {[
                        { value: "relaxed", label: t("questionnaire.style.relaxed"), icon: "😌", desc: t("questionnaire.style.relaxedDesc") },
                        { value: "balanced", label: t("questionnaire.style.balanced"), icon: "⚖️", desc: t("questionnaire.style.balancedDesc") },
                        { value: "intense", label: t("questionnaire.style.intense"), icon: "⚡", desc: t("questionnaire.style.intenseDesc") },
                      ].map((option) => (
                        <Label
                          key={option.value}
                          htmlFor={`rhythm-${option.value}`}
                          className={cn(
                            "flex flex-col items-center p-6 rounded-xl border-2 cursor-pointer transition-all hover:scale-105",
                            data.rhythm === option.value 
                              ? "bg-indigo-500 text-white border-indigo-600 shadow-xl"
                              : "bg-white hover:border-indigo-400"
                          )}
                        >
                          <RadioGroupItem value={option.value} id={`rhythm-${option.value}`} className="sr-only" />
                          <span className="text-4xl mb-2">{option.icon}</span>
                          <span className="font-bold mb-1">{option.label}</span>
                          <span className={cn("text-xs", data.rhythm === option.value ? "text-white/80" : "text-muted-foreground")}>
                            {option.desc}
                          </span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-lg font-semibold mb-4 block">{t("questionnaire.style.scheduleLabel")}</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {schedulePrefs.map((pref) => {
                        const Icon = pref.icon;
                        const isSelected = data.schedulePrefs.includes(pref.id);
                        return (
                          <button
                            key={pref.id}
                            onClick={() => toggleItem("schedulePrefs", pref.id)}
                            className={cn(
                              "p-4 rounded-lg border-2 transition-all hover:scale-105 flex flex-col items-center gap-2",
                              isSelected 
                                ? "bg-indigo-500 text-white border-indigo-600 shadow-lg"
                                : "bg-white hover:border-indigo-400"
                            )}
                          >
                            <Icon className="w-8 h-8" />
                            <span className="font-medium text-sm">{pref.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Section 9: Contraintes */}
          {currentSection === 9 && (
            <div className="space-y-8 animate-fade-in">
              <Card className="p-8 border-2 shadow-xl bg-white/80 backdrop-blur">
                <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  ⚠️ {t("questionnaire.constraints.title")}
                </h2>

                <div className="space-y-6">
                  <div>
                    <Label className="text-lg font-semibold mb-4 block">{t("questionnaire.constraints.mobilityLabel")}</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "wheelchair", label: t("questionnaire.constraints.wheelchair") },
                        { id: "reduced_mobility", label: t("questionnaire.constraints.reducedMobility") },
                        { id: "elderly", label: t("questionnaire.constraints.elderly") },
                        { id: "pregnant", label: t("questionnaire.constraints.pregnant") },
                      ].map((mobility) => {
                        const isSelected = data.mobility.includes(mobility.id);
                        return (
                          <button
                            key={mobility.id}
                            onClick={() => toggleItem("mobility", mobility.id)}
                            className={cn(
                              "p-4 rounded-lg border-2 transition-all text-sm font-medium",
                              isSelected 
                                ? "bg-amber-500 text-white border-amber-600"
                                : "bg-white hover:border-amber-400"
                            )}
                          >
                            {mobility.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="dietary" className="text-lg font-semibold mb-2 block">
                      {t("questionnaire.constraints.dietaryLabel")}
                    </Label>
                    <Textarea
                      id="dietary"
                      placeholder={t("questionnaire.constraints.dietaryPlaceholder")}
                      value={data.dietaryRestrictions || ""}
                      onChange={(e) => setData({ ...data, dietaryRestrictions: e.target.value })}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="allergies" className="text-lg font-semibold mb-2 block">
                      {t("questionnaire.constraints.allergiesLabel")}
                    </Label>
                    <Textarea
                      id="allergies"
                      placeholder={t("questionnaire.constraints.allergiesPlaceholder")}
                      value={data.allergies || ""}
                      onChange={(e) => setData({ ...data, allergies: e.target.value })}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Section 10: Finalisation */}
          {currentSection === 10 && (
            <div className="space-y-8 animate-fade-in">
              <Card className="p-8 border-2 shadow-xl bg-gradient-to-br from-cyan-50 to-blue-50 backdrop-blur">
                <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  ✨ {t("questionnaire.finalization.title")}
                </h2>

                <div className="space-y-6 max-w-2xl mx-auto">
                  <div>
                    <Label htmlFor="email" className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      {t("questionnaire.finalization.emailLabel")}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("questionnaire.finalization.emailPlaceholder")}
                      value={data.email}
                      onChange={(e) => setData({ ...data, email: e.target.value })}
                      className="h-14 text-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="additional" className="text-lg font-semibold mb-2 block">
                      {t("questionnaire.finalization.additionalLabel")}
                    </Label>
                    <Textarea
                      id="additional"
                      placeholder={t("questionnaire.finalization.additionalPlaceholder")}
                      value={data.additionalInfo || ""}
                      onChange={(e) => setData({ ...data, additionalInfo: e.target.value })}
                      className="min-h-[150px] text-base"
                    />
                  </div>

                  <div className="bg-white p-6 rounded-xl border-2 border-cyan-200">
                    <h3 className="font-bold text-lg mb-4">📋 {t("questionnaire.finalization.summary")}</h3>
                    <div className="space-y-2 text-sm">
                      <p>👥 {t("questionnaire.finalization.travelers", { count: data.travelers.length })}</p>
                      {data.destination && <p>📍 {t("questionnaire.finalization.destination", { destination: data.destination })}</p>}
                      {data.dateRange?.from && (
                        <p>📅 {t("questionnaire.finalization.dates", { from: format(data.dateRange.from, "dd/MM/yyyy"), to: data.dateRange.to ? format(data.dateRange.to, "dd/MM/yyyy") : "" })}</p>
                      )}
                      <p>💰 {t("questionnaire.finalization.budget", { perPerson: data.budget, total: data.budget * data.travelers.length })}</p>
                      <p>🎯 {t("questionnaire.finalization.services", { services: data.helpWith.join(', ') })}</p>
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    size="lg"
                    className="w-full h-16 text-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-xl"
                  >
                    <Sparkles className="w-6 h-6 mr-2" />
                    {t("questionnaire.finalization.submit")}
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t-2">
            <Button
              onClick={prevSection}
              disabled={currentSection === 0}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              {t("questionnaire.navigation.back")}
            </Button>

            <div className="flex items-center gap-3">
              {currentSection < totalSections - 1 ? (
                <Button
                  onClick={nextSection}
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                >
                  {t("questionnaire.navigation.next")}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {t("questionnaire.navigation.submit")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireV2;
