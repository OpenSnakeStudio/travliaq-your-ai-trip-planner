/**
 * HowItWorks - Visual step-by-step process
 */

import { motion } from "framer-motion";
import { MessageCircle, Brain, Map, Plane, ArrowRight } from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Dis-moi tes envies",
    description: "Destination, dates, budget, style... Je comprends tout en langage naturel",
    icon: MessageCircle,
    color: "bg-primary",
  },
  {
    number: 2,
    title: "Je trouve les meilleures options",
    description: "Vols, hôtels, activités – je compare des milliers d'options en temps réel",
    icon: Brain,
    color: "bg-accent",
  },
  {
    number: 3,
    title: "Personnalise ton itinéraire",
    description: "Affine chaque détail selon tes goûts, je m'adapte instantanément",
    icon: Map,
    color: "bg-primary",
  },
  {
    number: 4,
    title: "Pars l'esprit tranquille",
    description: "Reçois ton itinéraire complet avec tous les liens de réservation",
    icon: Plane,
    color: "bg-accent",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-montserrat font-bold text-foreground mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            De l'idée au départ en 4 étapes simples
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {/* Desktop: Horizontal flow */}
          <div className="hidden md:flex items-start justify-between relative">
            {/* Connection line */}
            <div className="absolute top-12 left-[10%] right-[10%] h-0.5 bg-border" />
            
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="flex-1 flex flex-col items-center text-center relative z-10"
                >
                  {/* Icon */}
                  <div className={`${step.color} w-24 h-24 rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  
                  {/* Number badge */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center text-sm font-bold">
                    {step.number}
                  </div>
                  
                  <h3 className="text-xl font-montserrat font-bold text-foreground mb-3 px-4">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm px-4 leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Mobile: Vertical stack */}
          <div className="md:hidden space-y-8">
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
                  <div className={`${step.color} w-16 h-16 rounded-xl flex items-center justify-center shrink-0`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-muted-foreground">
                        ÉTAPE {step.number}
                      </span>
                    </div>
                    <h3 className="text-lg font-montserrat font-bold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
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
