/**
 * IndexV2 - Landing page inspired by Layla.ai
 * Features: Hero with integrated chat, quick action chips, stats, destinations, testimonials
 */

import { motion } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-travliaq.jpg";
import logo from "@/assets/logo-travliaq.png";
import Navigation from "@/components/Navigation";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HeroChatInput,
  QuickActionChips,
  StatsCounter,
  DestinationCards,
  HowItWorks,
  FeatureCards,
  TestimonialSection,
  FinalCTA,
} from "@/components/landing";

const IndexV2 = () => {
  const { t } = useTranslation();

  const scrollToContent = () => {
    const element = document.getElementById("stats");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section - Full screen with chat */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Voyage aventure"
            className="w-full h-full object-cover"
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-travliaq-deep-blue/50 via-transparent to-travliaq-deep-blue/30" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-8 border border-white/20"
            >
              <Sparkles className="w-4 h-4 text-accent" />
              <span>Planificateur de voyage IA</span>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-7xl font-montserrat font-bold text-white mb-6 leading-tight"
            >
              Salut, je suis{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                Travliaq
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Dis-moi ton style et ton budget, je crée ton voyage sur-mesure en
              quelques minutes.
            </motion.p>

            {/* Hero Chat Input */}
            <HeroChatInput className="mb-8" />

            {/* Quick action chips */}
            <QuickActionChips className="mb-12" />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium">Voir comment ça marche</span>
            <ChevronDown className="w-6 h-6 animate-bounce" />
          </div>
        </motion.button>
      </section>

      {/* Stats Section */}
      <div id="stats">
        <StatsCounter />
      </div>

      {/* Destination Cards */}
      <DestinationCards />

      {/* How It Works */}
      <HowItWorks />

      {/* Feature Cards */}
      <FeatureCards />

      {/* Testimonials */}
      <TestimonialSection />

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-montserrat font-bold text-foreground mb-4">
              Questions fréquentes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tout ce que tu dois savoir avant de commencer
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-3">
              <AccordionItem
                value="item-1"
                className="bg-muted/30 rounded-xl px-6 border-0"
              >
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline py-5">
                  C'est quoi Travliaq exactement ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  Travliaq est ton assistant voyage IA personnel. Tu lui dis où
                  tu veux aller, ton budget, tes dates, et il te crée un
                  itinéraire sur-mesure avec vols, hôtels et activités. Tout ça
                  en quelques minutes au lieu de plusieurs heures.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-2"
                className="bg-muted/30 rounded-xl px-6 border-0"
              >
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline py-5">
                  C'est gratuit ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  Oui, la planification est 100% gratuite ! Tu paies uniquement
                  tes réservations directement auprès des compagnies aériennes
                  et hôtels. Je te donne tous les liens pour réserver au
                  meilleur prix.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-3"
                className="bg-muted/30 rounded-xl px-6 border-0"
              >
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline py-5">
                  Comment ça marche concrètement ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  Tu discutes avec moi comme avec un ami. Tu me dis tes envies
                  (destination, dates, budget, style de voyage) et je te propose
                  un itinéraire complet. Tu peux affiner, modifier, et quand tu
                  es satisfait, tu reçois tout par email.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-4"
                className="bg-muted/30 rounded-xl px-6 border-0"
              >
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline py-5">
                  Je peux modifier mon itinéraire après ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  Absolument ! Tu peux revenir dessus à tout moment. Change les
                  dates, ajoute des activités, modifie l'hôtel... Je m'adapte en
                  temps réel à tes demandes.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-5"
                className="bg-muted/30 rounded-xl px-6 border-0"
              >
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline py-5">
                  Les prix sont-ils fiables ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  Je compare les prix en temps réel avec les principales
                  plateformes de réservation. Les prix affichés sont ceux que tu
                  retrouveras au moment de la réservation (aux variations
                  normales près).
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <FinalCTA />

      {/* Footer */}
      <footer className="py-16 bg-secondary text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <img src={logo} alt="Travliaq" className="w-32 mb-4" />
              <p className="text-white/70 text-sm leading-relaxed">
                Ton assistant voyage IA personnel. De l'inspiration au départ,
                je t'accompagne.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-montserrat font-bold mb-4">
                Navigation
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="/"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Accueil
                  </a>
                </li>
                <li>
                  <a
                    href="/planner"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Planifier
                  </a>
                </li>
                <li>
                  <a
                    href="/blog"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="/discover"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Découvrir
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-montserrat font-bold mb-4">Légal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="/cgv"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    CGV
                  </a>
                </li>
                <li>
                  <a
                    href="/cgv"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Politique de confidentialité
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-montserrat font-bold mb-4">
                Contact
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="mailto:contact@travliaq.com"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    contact@travliaq.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center text-sm text-white/50">
            <p>© {new Date().getFullYear()} Travliaq. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default IndexV2;
