import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Mic, 
  Paperclip, 
  ChevronDown, 
  Sparkles, 
  Clock, 
  DollarSign, 
  Map, 
  Shield,
  Star,
  ArrowRight,
  Play,
  Users,
  MessageSquare
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Placeholder suggestions that rotate
const placeholderSuggestions = [
  "Planifie-moi un voyage de 7 jours à Paris pour un anniversaire",
  "Aide-moi à organiser des vacances pas chères à Barcelone",
  "Crée un itinéraire romantique de 5 jours à Rome",
  "Trouve-moi un road trip inoubliable au Portugal",
  "Tokyo en 6 jours : gastronomie, culture et incontournables",
  "Meilleur itinéraire pour explorer Londres en 4 jours",
  "Vacances de 7 jours à la plage en Grèce"
];

const quickActions = [
  { label: "Créer un voyage", icon: Sparkles },
  { label: "M'inspirer", icon: Map },
  { label: "Road trip", icon: Map },
  { label: "Escapade dernière minute", icon: Clock }
];

const featuredTrips = [
  {
    title: "Road Trip dans le Sud de l'Espagne",
    image: "https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=600&q=80",
    slug: "spain-road-trip"
  },
  {
    title: "10 Jours au Vietnam : Culture & Aventure",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=600&q=80",
    slug: "vietnam-adventure"
  },
  {
    title: "Escapade Romantique sur la Côte Amalfitaine",
    image: "https://images.unsplash.com/photo-1534008897995-27a23e859048?w=600&q=80",
    slug: "amalfi-romance"
  },
  {
    title: "Évasion Estivale en Croatie",
    image: "https://images.unsplash.com/photo-1555990538-18f54b3c6e3c?w=600&q=80",
    slug: "croatia-summer"
  }
];

const features = [
  {
    icon: Sparkles,
    title: "Sur-mesure",
    description: "Des itinéraires personnalisés selon vos préférences et votre style de voyage."
  },
  {
    icon: DollarSign,
    title: "Économique",
    description: "Trouvez les meilleures offres et économisez sur vos plans de voyage."
  },
  {
    icon: Map,
    title: "Pépites cachées",
    description: "Découvrez des lieux uniques et secrets souvent ignorés des touristes."
  },
  {
    icon: Shield,
    title: "Sans surprises",
    description: "Tout est planifié, des vols aux hébergements, sans mauvaises surprises."
  }
];

const testimonials = [
  {
    quote: "Travliaq est de loin le meilleur planificateur de voyage IA que j'ai utilisé. L'itinéraire personnalisé pour nos vacances en famille a été créé en quelques minutes.",
    name: "Sophie, 42",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80"
  },
  {
    quote: "Nous avons réservé notre lune de miel de rêve grâce à Travliaq. Vols, hôtels et activités, tout était parfaitement organisé.",
    name: "Marc, 35",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80"
  },
  {
    quote: "En tant que parent occupé, j'adore que Travliaq agisse comme un agent de voyage personnel. Des heures de recherche économisées !",
    name: "Caroline, 38",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80"
  }
];

const faqs = [
  {
    question: "Qu'est-ce que Travliaq ?",
    answer: "Je suis Travliaq, votre agent de voyage IA et planificateur d'itinéraires. Je crée des itinéraires complets et personnalisés qui couvrent tout : vols, hôtels, activités et recommandations sur mesure. En quelques minutes, je peux concevoir des voyages prêts à réserver."
  },
  {
    question: "Comment fonctionne Travliaq ?",
    answer: "Partagez simplement vos dates de voyage, destinations, budget et style, et je construis instantanément un plan jour par jour. J'utilise des prix et disponibilités en temps réel pour garder votre itinéraire précis et à jour."
  },
  {
    question: "Travliaq peut-il me faire économiser de l'argent ?",
    answer: "Oui ! Je compare les prix en temps réel pour les vols, hôtels, trains et activités afin de trouver les meilleures offres. En optimisant votre itinéraire, je vous aide à éviter les coûts inutiles tout en maximisant les expériences."
  },
  {
    question: "Travliaq est-il adapté aux familles ?",
    answer: "Absolument. Mon planificateur familial équilibre visites et temps de repos, trouve des hôtels adaptés aux familles, et inclut des activités qui conviennent aux enfants comme aux adultes."
  },
  {
    question: "Travliaq gère-t-il les voyages multi-villes ?",
    answer: "Définitivement. Je me spécialise dans les itinéraires multi-villes et les road trips, optimisant les trajets entre destinations avec vols, trains ou locations de voiture, et j'ajoute les meilleures étapes en chemin."
  },
  {
    question: "Travliaq est-il gratuit ?",
    answer: "Je propose des outils de planification gratuits avec des options premium. Pour un accès illimité à toutes les fonctionnalités avancées, des formules d'abonnement sont disponibles."
  }
];

const IndexV2 = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Rotate placeholder suggestions
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholderSuggestions.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    if (!message.trim()) return;
    // Navigate to planner with the message
    navigate(`/planner?prompt=${encodeURIComponent(message)}`);
  };

  const handleQuickAction = (action: string) => {
    setMessage(action);
    navigate(`/planner?prompt=${encodeURIComponent(action)}`);
  };

  const scrollToContent = () => {
    const element = document.getElementById('features');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section - Full Screen with Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&q=80" 
            alt="Voyage" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 pt-20 pb-12 flex flex-col items-center justify-center min-h-screen">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
              Salut, je suis <span className="text-primary">Travliaq</span>,
              <br />
              <span className="text-white/90">ton planificateur de voyage IA</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              Dis-moi ton style et ton budget, et je te crée un voyage sur-mesure.
            </p>
          </motion.div>

          {/* Chat Input Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-2xl"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6">
              {/* Textarea */}
              <div className="relative mb-4">
                <Textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    setIsTyping(e.target.value.length > 0);
                  }}
                  placeholder={placeholderSuggestions[placeholderIndex]}
                  className="min-h-[60px] max-h-[120px] resize-none border-0 focus-visible:ring-0 text-base md:text-lg placeholder:text-muted-foreground/60 pr-4"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-muted-foreground gap-2">
                    <Paperclip className="w-4 h-4" />
                    <span className="hidden sm:inline">Joindre</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <Mic className="w-4 h-4" />
                  </Button>
                </div>
                
                <Button 
                  onClick={handleSubmit}
                  disabled={!message.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-full px-6"
                >
                  <Send className="w-4 h-4" />
                  Planifier mon voyage
                </Button>
              </div>
            </div>

            {/* Quick Action Chips */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  onClick={() => handleQuickAction(action.label)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/90 hover:bg-white text-foreground rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all border border-white/20"
                >
                  <action.icon className="w-4 h-4" />
                  {action.label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            onClick={scrollToContent}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span className="text-sm">Découvrir comment ça marche</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </motion.button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Ton voyage en <span className="text-primary">minutes</span>, pas en semaines.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Planifie ton prochain voyage avec moi et économise des heures de recherche.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-card rounded-2xl shadow-sm">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">10K+</div>
              <div className="text-sm text-muted-foreground">Voyages planifiés</div>
            </div>
            <div className="text-center p-6 bg-card rounded-2xl shadow-sm">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">50K+</div>
              <div className="text-sm text-muted-foreground">Messages traités</div>
            </div>
            <div className="text-center p-6 bg-card rounded-2xl shadow-sm">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">4.9</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> Note moyenne
              </div>
            </div>
            <div className="text-center p-6 bg-card rounded-2xl shadow-sm">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">2min</div>
              <div className="text-sm text-muted-foreground">Temps moyen</div>
            </div>
          </div>

          <div className="text-center mt-10">
            <Button 
              size="lg" 
              className="rounded-full gap-2"
              onClick={() => navigate('/planner')}
            >
              Planifier mon voyage
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Arrête de perdre du temps. <span className="text-primary">Regarde-moi planifier.</span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative aspect-video bg-muted rounded-2xl overflow-hidden shadow-2xl group cursor-pointer">
              <img 
                src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80" 
                alt="Demo" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-primary-foreground ml-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Trips */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Où partir <span className="text-primary">prochainement</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredTrips.map((trip, index) => (
              <motion.div
                key={trip.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
                onClick={() => navigate('/planner')}
              >
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-lg">
                  <img 
                    src={trip.image} 
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-lg font-semibold text-white mb-2">{trip.title}</h3>
                    <span className="inline-flex items-center gap-1 text-sm text-white/80 group-hover:text-primary transition-colors">
                      Commencer à planifier
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Planificateur <span className="text-primary">tout-en-un</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Que tu cherches des vacances en famille, une escapade romantique, un voyage d'anniversaire ou un séjour solo, 
              je m'occupe de tout. Des destinations de rêve aux vols, en passant par les hébergements et les activités.
            </p>
          </div>

          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-semibold mb-8">
              Je t'accompagne à chaque étape
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Ce que disent les <span className="text-primary">voyageurs</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card rounded-2xl p-6 shadow-sm border"
              >
                <p className="text-muted-foreground mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <span className="font-medium">{testimonial.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Questions <span className="text-primary">fréquentes</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-card rounded-xl border px-6"
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Prêt à essayer ?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Découvre comment Travliaq peut transformer n'importe quelle idée en voyage en moins d'une minute.
          </p>
          <Button 
            size="lg"
            variant="secondary"
            className="rounded-full gap-2 text-lg px-8"
            onClick={() => navigate('/planner')}
          >
            <MessageSquare className="w-5 h-5" />
            Commencer maintenant
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted/50 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg">Travliaq</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="/cgv" className="hover:text-foreground transition-colors">CGV</a>
              <a href="/blog" className="hover:text-foreground transition-colors">Blog</a>
              <a href="mailto:contact@travliaq.com" className="hover:text-foreground transition-colors">Contact</a>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 Travliaq. Tous droits réservés.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default IndexV2;
