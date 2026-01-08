/**
 * HowItWorks - Visual step-by-step process with modern design
 */

import { motion } from "framer-motion";
import { MessageCircle, Sparkles, Send } from "lucide-react";

const steps = [
  {
    title: "Tu me dis ce que tu veux",
    description:
      "Destination, dates, budget… en une phrase. Pas de formulaire interminable.",
    icon: MessageCircle,
    accent: "bg-primary/10 text-primary",
    example: '"Barcelone, 4 jours, 700€, en couple"',
  },
  {
    title: "Je te propose un plan clair",
    description:
      "Vols, hôtels, activités — une première version cohérente, facile à lire.",
    icon: Sparkles,
    accent: "bg-accent/15 text-accent-foreground",
    example: "3 options + recommandations",
  },
  {
    title: "Tu ajustes, puis tu reçois tout",
    description:
      "Tu modifies ce que tu veux, puis tu récupères ton itinéraire prêt à réserver.",
    icon: Send,
    accent: "bg-secondary/10 text-secondary-foreground",
    example: "Liens + récapitulatif (PDF en Pro)",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 md:py-24 bg-muted/20 overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-montserrat font-bold text-foreground mb-4">
            Comment ça marche (vraiment)
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            3 étapes. Une conversation. Un voyage prêt.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className={"rounded-xl p-3 " + step.accent}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-montserrat font-bold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Ex :</span> {step.example}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
