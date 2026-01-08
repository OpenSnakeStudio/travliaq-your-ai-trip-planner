/**
 * IndexV2 - Landing page inspired by Layla.ai
 * Features: Hero with integrated chat, quick action chips, stats, destinations, testimonials
 */

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import logo from "@/assets/logo-travliaq.png";
import { NavBar } from "@/components/navigation";
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
  DestinationCards,
  HowItWorks,
  FeatureCards,
  FinalCTA,
  VideoPlaceholder,
  PartnersSection,
} from "@/components/landing";
import { useRef } from "react";

const IndexV2 = () => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLDivElement>(null);

  const scrollToVideo = () => {
    if (videoRef.current) {
      videoRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      // Trigger video autoplay after scroll
      setTimeout(() => {
        const playButton = videoRef.current?.querySelector('button');
        if (playButton) {
          playButton.click();
        }
      }, 800);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <NavBar />

      {/* Hero Section - Full screen with chat */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background Image - Travel themed */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80"
            alt="Plage paradisiaque"
            className="w-full h-full object-cover"
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 via-transparent to-teal-900/30" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            {/* Main question - Simple and direct */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl sm:text-4xl md:text-6xl font-montserrat font-bold text-white mb-8 leading-tight"
            >
              Où veux-tu partir ?
            </motion.h1>

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
          onClick={scrollToVideo}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium">Voir comment ça marche</span>
            <ChevronDown className="w-6 h-6 animate-bounce" />
          </div>
        </motion.button>
      </section>

      {/* Video Section */}
      <div id="video-section" ref={videoRef}>
        <VideoPlaceholder />
      </div>

      {/* Destination Cards */}
      <DestinationCards />

      {/* How It Works */}
      <HowItWorks />

      {/* Feature Cards */}
      <FeatureCards />

      {/* Partners Section */}
      <PartnersSection />

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
                  Oui, la planification de base est gratuite ! Tu peux créer des itinéraires 
                  et obtenir des recommandations sans frais. Des options premium sont disponibles 
                  pour plus de fonctionnalités comme le téléchargement PDF ou la personnalisation 
                  avancée.
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

              <AccordionItem
                value="item-6"
                className="bg-muted/30 rounded-xl px-6 border-0"
              >
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline py-5">
                  Quelles destinations sont disponibles ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  Travliaq couvre le monde entier ! Que tu rêves de Tokyo, New York, 
                  Marrakech, Bali ou d'un road trip en Patagonie, notre IA trouve les 
                  meilleures options pour n'importe quelle destination.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-7"
                className="bg-muted/30 rounded-xl px-6 border-0"
              >
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline py-5">
                  Combien de temps faut-il pour recevoir mon itinéraire ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  En général, tu reçois ta première proposition dans les 24 heures 
                  suivant ta demande. Pour les demandes urgentes, nous pouvons 
                  accélérer le processus.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-8"
                className="bg-muted/30 rounded-xl px-6 border-0"
              >
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline py-5">
                  Puis-je voyager en groupe ou en famille ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  Bien sûr ! Travliaq s'adapte à tous les types de voyageurs : 
                  solo, duo, groupe d'amis ou famille avec enfants. L'itinéraire 
                  sera personnalisé en fonction du nombre de participants et de 
                  leurs besoins spécifiques.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-9"
                className="bg-muted/30 rounded-xl px-6 border-0"
              >
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline py-5">
                  Comment mes données sont-elles protégées ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  Tes données sont sécurisées et ne sont jamais partagées avec 
                  des tiers sans ton consentement. Nous utilisons les meilleures 
                  pratiques de sécurité et respectons le RGPD.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-10"
                className="bg-muted/30 rounded-xl px-6 border-0"
              >
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline py-5">
                  Comment contacter le support ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  Tu peux nous contacter à tout moment via contact@travliaq.com. 
                  Notre équipe répond généralement sous 24h. Tu peux aussi 
                  utiliser le chat intégré pour des questions rapides.
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
                    Conditions Générales de Vente
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
                <li>
                  <a
                    href="/cgv"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Mentions légales
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
              <div className="mt-6">
                <h4 className="text-sm font-semibold mb-3">Suivez-nous</h4>
                <div className="flex gap-4">
                  <a
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                    aria-label="Instagram"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                    aria-label="Twitter"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                    aria-label="LinkedIn"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>
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
