import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTripData } from "@/hooks/useTripData";
import Navigation from "@/components/Navigation";
import { ArrowLeft, Users, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const travelerSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères").max(50),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(50),
  email: z.string().email("Email invalide"),
  passportNumber: z.string().min(6, "Le numéro de passeport doit contenir au moins 6 caractères").max(20),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)"),
});

const Booking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const travelers = parseInt(searchParams.get("travelers") || "1");
  const { trip, loading } = useTripData(code);
  const { toast } = useToast();

  const [currentTraveler, setCurrentTraveler] = useState(0);
  const [travelersData, setTravelersData] = useState<any[]>([]);

  const formSchema = travelerSchema;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      passportNumber: "",
      dateOfBirth: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const updatedData = [...travelersData];
    updatedData[currentTraveler] = values;
    setTravelersData(updatedData);

    if (currentTraveler < travelers - 1) {
      // Passer au voyageur suivant
      setCurrentTraveler(currentTraveler + 1);
      form.reset();
      toast({
        title: "Informations enregistrées",
        description: `Voyageur ${currentTraveler + 1} enregistré. Veuillez remplir les informations du voyageur ${currentTraveler + 2}.`,
      });
    } else {
      // Tous les voyageurs sont remplis
      toast({
        title: "Formulaire complet",
        description: "Toutes les informations ont été enregistrées. Le paiement sera disponible prochainement.",
      });
    }
  };

  const handlePrevious = () => {
    if (currentTraveler > 0) {
      setCurrentTraveler(currentTraveler - 1);
      const prevData = travelersData[currentTraveler - 1];
      if (prevData) {
        form.reset(prevData);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-travliaq-deep-blue to-travliaq-deep-blue/80">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-travliaq-turquoise"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-travliaq-deep-blue to-travliaq-deep-blue/80">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Voyage introuvable</h1>
          <Button onClick={() => navigate("/")}>Retour à l'accueil</Button>
        </div>
      </div>
    );
  }

  const allTravelersFilled = travelersData.length === travelers && currentTraveler === travelers - 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-travliaq-deep-blue to-travliaq-deep-blue/80">
      <Navigation language="fr" />
      
      <div className="container mx-auto px-4 py-24">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-8 text-white hover:text-travliaq-turquoise"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-montserrat text-4xl md:text-5xl font-bold text-white mb-4">
              Réservation de votre voyage
            </h1>
            <p className="text-travliaq-turquoise text-xl font-inter">
              {trip.destination}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Formulaire principal */}
            <div className="md:col-span-2">
              <Card className="bg-white/10 backdrop-blur-md border-travliaq-turquoise/30 p-8">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="h-6 w-6 text-travliaq-turquoise" />
                    <h2 className="text-2xl font-bold text-white font-montserrat">
                      Voyageur {currentTraveler + 1} sur {travelers}
                    </h2>
                  </div>
                  
                  {/* Barre de progression */}
                  <div className="w-full bg-white/20 rounded-full h-2 mb-4">
                    <div
                      className="bg-travliaq-turquoise h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentTraveler + 1) / travelers) * 100}%` }}
                    />
                  </div>

                  <p className="text-white/80 font-inter">
                    {currentTraveler === 0 
                      ? "Veuillez remplir vos informations personnelles"
                      : `Informations du voyageur ${currentTraveler + 1}`
                    }
                  </p>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Prénom</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Jean"
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Nom</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Dupont"
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Adresse email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="jean.dupont@example.com"
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="passportNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Numéro de passeport</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="12AB34567"
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Date de naissance</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-4 pt-4">
                      {currentTraveler > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevious}
                          className="flex-1 border-travliaq-turquoise/50 text-white hover:bg-travliaq-turquoise/20"
                        >
                          Précédent
                        </Button>
                      )}
                      <Button
                        type="submit"
                        className="flex-1 bg-travliaq-turquoise hover:bg-travliaq-turquoise/80 text-travliaq-deep-blue font-semibold"
                      >
                        {currentTraveler < travelers - 1 ? "Suivant" : "Terminer"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </Card>
            </div>

            {/* Récapitulatif */}
            <div className="md:col-span-1">
              <Card className="bg-white/10 backdrop-blur-md border-travliaq-turquoise/30 p-6 sticky top-24">
                <h3 className="text-xl font-bold text-white font-montserrat mb-4">
                  Récapitulatif
                </h3>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-white/60 text-sm">Destination</p>
                    <p className="text-white font-semibold">{trip.destination}</p>
                  </div>
                  
                  <Separator className="bg-white/20" />
                  
                  <div>
                    <p className="text-white/60 text-sm">Durée</p>
                    <p className="text-white font-semibold">{trip.total_days} jours</p>
                  </div>
                  
                  <Separator className="bg-white/20" />
                  
                  <div>
                    <p className="text-white/60 text-sm">Nombre de voyageurs</p>
                    <p className="text-white font-semibold">{travelers}</p>
                  </div>
                  
                  {trip.total_price && (
                    <>
                      <Separator className="bg-white/20" />
                      <div>
                        <p className="text-white/60 text-sm">Prix total</p>
                        <p className="text-travliaq-golden-sand font-bold text-2xl">
                          {trip.total_price}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <Button
                  disabled={!allTravelersFilled}
                  className="w-full bg-travliaq-golden-sand hover:bg-travliaq-golden-sand/80 text-travliaq-deep-blue font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payer avec Stripe
                </Button>
                
                {!allTravelersFilled && (
                  <p className="text-white/60 text-xs text-center mt-2">
                    Remplissez les informations de tous les voyageurs
                  </p>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
