/**
 * HowItWorks - Visual step-by-step process with modern design
 */

import { motion } from "framer-motion";
import { MessageCircle, Search, Sparkles, Send, CheckCircle2 } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Parle-moi de ton voyage",
    description: "Dis-moi simplement où tu veux aller, quand, avec qui et ton budget. Je comprends le français naturel !",
    icon: MessageCircle,
    gradient: "from-blue-500 to-cyan-400",
    example: '"Je veux partir à Rome en avril, 5 jours, max 800€"',
  },
  {
    number: "02",
    title: "Je compare tout pour toi",
    description: "En quelques secondes, je scanne des milliers de vols, hôtels et activités pour trouver les meilleures options.",
    icon: Search,
    gradient: "from-violet-500 to-purple-400",
    example: "Vols, hôtels, activités... tout comparé en temps réel",
  },
  {
    number: "03",
    title: "Tu personnalises",
    description: "Affine ton itinéraire en discutant avec moi. Change d'hôtel, ajoute une activité, modifie les dates... je m'adapte !",
    icon: Sparkles,
    gradient: "from-amber-500 to-orange-400",
    example: '"Plutôt un hôtel avec piscine" → Je mets à jour',
  },
  {
    number: "04",
    title: "Tu reçois tout",
    description: "Ton itinéraire complet avec tous les liens de réservation, directement dans ta boîte mail. Prêt à partir !",
    icon: Send,
    gradient: "from-emerald-500 to-green-400",
    example: "Vols + Hôtels + Activités = Voyage prêt",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/20 overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 md:mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Simple comme bonjour</span>
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-montserrat font-bold text-foreground mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            De ton idée à ton départ, en 4 étapes ultra simples
          </p>
        </motion.div>

        {/* Steps - Vertical timeline on mobile, horizontal on desktop */}
        <div className="max-w-6xl mx-auto">
          {/* Desktop Layout */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-4 gap-6 relative">
              {/* Connection line */}
              <div className="absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 opacity-30" />
              
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 }}
                    className="relative"
                  >
                    {/* Step card */}
                    <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-lg transition-shadow h-full">
                      {/* Icon with gradient background */}
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-5 shadow-lg`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      
                      {/* Step number */}
                      <div className="text-4xl font-bold text-muted-foreground/20 font-montserrat mb-2">
                        {step.number}
                      </div>
                      
                      <h3 className="text-xl font-montserrat font-bold text-foreground mb-3">
                        {step.title}
                      </h3>
                      
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                        {step.description}
                      </p>
                      
                      {/* Example bubble */}
                      <div className="bg-muted/50 rounded-lg px-3 py-2 text-xs text-muted-foreground italic">
                        {step.example}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Mobile Layout - Vertical */}
          <div className="lg:hidden space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  {/* Left: Icon and line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shrink-0 shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-0.5 flex-1 mt-2 bg-gradient-to-b from-border to-transparent" />
                    )}
                  </div>
                  
                  {/* Right: Content */}
                  <div className="flex-1 pb-6">
                    <div className="text-xs font-bold text-primary/60 uppercase tracking-wider mb-1">
                      Étape {step.number}
                    </div>
                    <h3 className="text-lg font-montserrat font-bold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                      {step.description}
                    </p>
                    <div className="bg-muted/50 rounded-lg px-3 py-2 text-xs text-muted-foreground italic">
                      {step.example}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
