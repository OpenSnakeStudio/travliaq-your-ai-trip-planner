import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { 
  MapPin, 
  Users, 
  Wallet, 
  Palmtree, 
  Calendar, 
  Bed, 
  Plane, 
  Snowflake,
  ChevronLeft,
  Mail,
  User
} from "lucide-react";

type Answer = {
  destination?: string;
  travelers?: string;
  budget?: string;
  activities?: string[];
  duration?: string;
  accommodation?: string;
  transport?: string;
  season?: string;
  dietary?: string;
  name?: string;
  email?: string;
};

const Questionnaire = () => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Answer>({});
  const totalSteps = 11;

  const progress = (step / totalSteps) * 100;

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleChoice = (field: keyof Answer, value: any) => {
    setAnswers({ ...answers, [field]: value });
    setTimeout(nextStep, 300);
  };

  const handleMultiChoice = (field: keyof Answer, value: string) => {
    const current = (answers[field] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setAnswers({ ...answers, [field]: updated });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-travliaq-sky-blue via-white to-travliaq-golden-sand/20">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-travliaq-deep-blue transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="pt-8 pb-4 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-montserrat font-bold text-travliaq-deep-blue text-center">
            VOTRE VOYAGE SUR MESURE
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {step > 1 && (
          <Button
            variant="ghost"
            onClick={prevStep}
            className="mb-6 text-travliaq-deep-blue hover:text-travliaq-deep-blue/80"
          >
            <ChevronLeft className="mr-2" />
            Retour
          </Button>
        )}

        <div className="bg-white rounded-2xl shadow-adventure p-8 md:p-12 min-h-[400px]">
          {/* Step 1: Destination */}
          {step === 1 && (
            <div className="space-y-8 animate-fade-up">
              <h2 className="text-2xl md:text-3xl font-bold text-center text-travliaq-deep-blue">
                Où souhaitez-vous voyager ?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {[
                  { label: "Europe", icon: "🇪🇺" },
                  { label: "Asie", icon: "🌏" },
                  { label: "Amérique", icon: "🌎" },
                  { label: "Afrique", icon: "🌍" },
                  { label: "Océanie", icon: "🏝️" },
                  { label: "Je ne sais pas encore", icon: "🤔" }
                ].map((option) => (
                  <Card
                    key={option.label}
                    className="p-6 cursor-pointer hover:shadow-golden hover:border-travliaq-deep-blue transition-all hover:scale-105"
                    onClick={() => handleChoice("destination", option.label)}
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-4xl">{option.icon}</span>
                      <span className="text-lg font-semibold text-travliaq-deep-blue">
                        {option.label}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Number of travelers */}
          {step === 2 && (
            <div className="space-y-8 animate-fade-up">
              <h2 className="text-2xl md:text-3xl font-bold text-center text-travliaq-deep-blue">
                Combien de personnes voyagent ?
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                {["1 personne", "2 personnes", "3-4 personnes", "5-6 personnes", "7+ personnes", "Groupe"].map((option) => (
                  <Card
                    key={option}
                    className="p-6 cursor-pointer hover:shadow-golden hover:border-travliaq-deep-blue transition-all hover:scale-105"
                    onClick={() => handleChoice("travelers", option)}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <Users className="w-8 h-8 text-travliaq-deep-blue" />
                      <span className="text-center font-semibold text-travliaq-deep-blue">
                        {option}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Budget */}
          {step === 3 && (
            <div className="space-y-8 animate-fade-up">
              <h2 className="text-2xl md:text-3xl font-bold text-center text-travliaq-deep-blue">
                Quel est votre budget par personne ?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {[
                  { label: "Moins de 500€", icon: "💰" },
                  { label: "500€ - 1000€", icon: "💵" },
                  { label: "1000€ - 2000€", icon: "💶" },
                  { label: "2000€ - 3500€", icon: "💷" },
                  { label: "Plus de 3500€", icon: "💎" },
                  { label: "Budget flexible", icon: "🎯" }
                ].map((option) => (
                  <Card
                    key={option.label}
                    className="p-6 cursor-pointer hover:shadow-golden hover:border-travliaq-deep-blue transition-all hover:scale-105"
                    onClick={() => handleChoice("budget", option.label)}
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-3xl">{option.icon}</span>
                      <span className="text-lg font-semibold text-travliaq-deep-blue">
                        {option.label}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Activities (multi-select) */}
          {step === 4 && (
            <div className="space-y-8 animate-fade-up">
              <h2 className="text-2xl md:text-3xl font-bold text-center text-travliaq-deep-blue">
                Quelles activités vous intéressent ?
              </h2>
              <p className="text-center text-muted-foreground">Sélectionnez toutes les options qui vous plaisent</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {[
                  { label: "Culture & Musées", icon: "🏛️" },
                  { label: "Plage & Détente", icon: "🏖️" },
                  { label: "Randonnée & Nature", icon: "🥾" },
                  { label: "Gastronomie", icon: "🍽️" },
                  { label: "Aventure & Sports", icon: "🧗" },
                  { label: "Shopping", icon: "🛍️" },
                  { label: "Vie nocturne", icon: "🎉" },
                  { label: "Découverte locale", icon: "🗺️" }
                ].map((option) => {
                  const isSelected = (answers.activities || []).includes(option.label);
                  return (
                    <Card
                      key={option.label}
                      className={`p-6 cursor-pointer transition-all hover:scale-105 ${
                        isSelected 
                          ? "border-2 border-travliaq-deep-blue bg-travliaq-sky-blue/10 shadow-golden" 
                          : "hover:shadow-golden hover:border-travliaq-deep-blue"
                      }`}
                      onClick={() => handleMultiChoice("activities", option.label)}
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-3xl">{option.icon}</span>
                        <span className="text-lg font-semibold text-travliaq-deep-blue">
                          {option.label}
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>
              <div className="flex justify-center pt-4">
                <Button
                  variant="hero"
                  size="lg"
                  onClick={nextStep}
                  disabled={!answers.activities || answers.activities.length === 0}
                  className="bg-travliaq-deep-blue"
                >
                  Continuer
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Duration */}
          {step === 5 && (
            <div className="space-y-8 animate-fade-up">
              <h2 className="text-2xl md:text-3xl font-bold text-center text-travliaq-deep-blue">
                Quelle sera la durée de votre voyage ?
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                {[
                  "Week-end (2-3 jours)",
                  "4-7 jours",
                  "1-2 semaines",
                  "2-3 semaines",
                  "3-4 semaines",
                  "Plus d'un mois"
                ].map((option) => (
                  <Card
                    key={option}
                    className="p-6 cursor-pointer hover:shadow-golden hover:border-travliaq-deep-blue transition-all hover:scale-105"
                    onClick={() => handleChoice("duration", option)}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <Calendar className="w-8 h-8 text-travliaq-deep-blue" />
                      <span className="text-center font-semibold text-travliaq-deep-blue text-sm">
                        {option}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Accommodation */}
          {step === 6 && (
            <div className="space-y-8 animate-fade-up">
              <h2 className="text-2xl md:text-3xl font-bold text-center text-travliaq-deep-blue">
                Quel type d'hébergement préférez-vous ?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {[
                  { label: "Hôtel confort", icon: "🏨" },
                  { label: "Hôtel luxe", icon: "⭐" },
                  { label: "Auberge / Hostel", icon: "🛏️" },
                  { label: "Airbnb / Appartement", icon: "🏠" },
                  { label: "Camping / Nature", icon: "⛺" },
                  { label: "Peu importe", icon: "🤷‍♂️" }
                ].map((option) => (
                  <Card
                    key={option.label}
                    className="p-6 cursor-pointer hover:shadow-golden hover:border-travliaq-deep-blue transition-all hover:scale-105"
                    onClick={() => handleChoice("accommodation", option.label)}
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-3xl">{option.icon}</span>
                      <span className="text-lg font-semibold text-travliaq-deep-blue">
                        {option.label}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 7: Transport */}
          {step === 7 && (
            <div className="space-y-8 animate-fade-up">
              <h2 className="text-2xl md:text-3xl font-bold text-center text-travliaq-deep-blue">
                Comment souhaitez-vous vous déplacer ?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {[
                  { label: "Avion direct", icon: "✈️" },
                  { label: "Avion avec escales", icon: "🛫" },
                  { label: "Train", icon: "🚄" },
                  { label: "Voiture de location", icon: "🚗" },
                  { label: "Transports locaux", icon: "🚌" },
                  { label: "Flexible", icon: "🎲" }
                ].map((option) => (
                  <Card
                    key={option.label}
                    className="p-6 cursor-pointer hover:shadow-golden hover:border-travliaq-deep-blue transition-all hover:scale-105"
                    onClick={() => handleChoice("transport", option.label)}
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-3xl">{option.icon}</span>
                      <span className="text-lg font-semibold text-travliaq-deep-blue">
                        {option.label}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 8: Season */}
          {step === 8 && (
            <div className="space-y-8 animate-fade-up">
              <h2 className="text-2xl md:text-3xl font-bold text-center text-travliaq-deep-blue">
                Quelle période vous convient le mieux ?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {[
                  { label: "Printemps (Mars-Mai)", icon: "🌸" },
                  { label: "Été (Juin-Août)", icon: "☀️" },
                  { label: "Automne (Sept-Nov)", icon: "🍂" },
                  { label: "Hiver (Déc-Fév)", icon: "❄️" },
                  { label: "Dates précises en tête", icon: "📅" },
                  { label: "Flexible", icon: "🎯" }
                ].map((option) => (
                  <Card
                    key={option.label}
                    className="p-6 cursor-pointer hover:shadow-golden hover:border-travliaq-deep-blue transition-all hover:scale-105"
                    onClick={() => handleChoice("season", option.label)}
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-3xl">{option.icon}</span>
                      <span className="text-lg font-semibold text-travliaq-deep-blue">
                        {option.label}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 9: Dietary/Special requirements */}
          {step === 9 && (
            <div className="space-y-8 animate-fade-up">
              <h2 className="text-2xl md:text-3xl font-bold text-center text-travliaq-deep-blue">
                Avez-vous des besoins particuliers ?
              </h2>
              <p className="text-center text-muted-foreground">
                Régimes alimentaires, accessibilité, allergies, etc.
              </p>
              <div className="max-w-xl mx-auto space-y-4">
                <Textarea
                  placeholder="Décrivez vos besoins spécifiques (optionnel)..."
                  className="min-h-[150px] text-base"
                  value={answers.dietary || ""}
                  onChange={(e) => setAnswers({ ...answers, dietary: e.target.value })}
                />
                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={nextStep}
                  >
                    Passer
                  </Button>
                  <Button
                    variant="hero"
                    size="lg"
                    onClick={nextStep}
                    className="bg-travliaq-deep-blue"
                  >
                    Continuer
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 10: Name */}
          {step === 10 && (
            <div className="space-y-8 animate-fade-up">
              <h2 className="text-2xl md:text-3xl font-bold text-center text-travliaq-deep-blue">
                Comment vous appelez-vous ?
              </h2>
              <div className="max-w-xl mx-auto space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Votre nom complet"
                    className="pl-10 h-12 text-base"
                    value={answers.name || ""}
                    onChange={(e) => setAnswers({ ...answers, name: e.target.value })}
                  />
                </div>
                <div className="flex justify-center">
                  <Button
                    variant="hero"
                    size="lg"
                    onClick={nextStep}
                    disabled={!answers.name || answers.name.trim() === ""}
                    className="bg-travliaq-deep-blue"
                  >
                    Continuer
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 11: Email */}
          {step === 11 && (
            <div className="space-y-8 animate-fade-up">
              <h2 className="text-2xl md:text-3xl font-bold text-center text-travliaq-deep-blue">
                Dernière étape ! Votre email ?
              </h2>
              <p className="text-center text-muted-foreground">
                Nous vous enverrons votre itinéraire personnalisé sous 48h
              </p>
              <div className="max-w-xl mx-auto space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="votre@email.com"
                    className="pl-10 h-12 text-base"
                    value={answers.email || ""}
                    onChange={(e) => setAnswers({ ...answers, email: e.target.value })}
                  />
                </div>
                <div className="flex justify-center">
                  <Button
                    variant="hero"
                    size="lg"
                    onClick={() => {
                      // Here you would submit the form
                      console.log("Form submitted:", answers);
                      alert("Merci ! Nous avons bien reçu votre demande. Vous recevrez votre itinéraire personnalisé sous 48h.");
                    }}
                    disabled={!answers.email || !answers.email.includes("@")}
                    className="bg-travliaq-golden-sand text-travliaq-deep-blue hover:bg-travliaq-golden-sand/90 font-bold"
                  >
                    Recevoir mon itinéraire 🎒
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step indicator */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          Étape {step} sur {totalSteps}
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;
