/**
 * FeatureCards - Key features grid
 */

import { motion } from "framer-motion";
import { Sparkles, PiggyBank, Compass, Shield, Clock, Heart } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "100% Sur-mesure",
    description: "Itinéraire personnalisé selon tes goûts, pas de voyage générique",
    gradient: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
  },
  {
    icon: PiggyBank,
    title: "Économique",
    description: "Comparaison des prix en temps réel pour optimiser ton budget",
    gradient: "from-accent/20 to-accent/5",
    iconColor: "text-accent",
  },
  {
    icon: Compass,
    title: "Pépites cachées",
    description: "Spots hors des sentiers battus recommandés par l'IA",
    gradient: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
  },
  {
    icon: Shield,
    title: "Sans surprises",
    description: "Tout est vérifié et à jour, tu pars l'esprit tranquille",
    gradient: "from-accent/20 to-accent/5",
    iconColor: "text-accent",
  },
  {
    icon: Clock,
    title: "Gain de temps",
    description: "Plus besoin de passer des heures à tout comparer",
    gradient: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
  },
  {
    icon: Heart,
    title: "Adapté à toi",
    description: "Je m'adapte à ton rythme, tes contraintes, tes envies",
    gradient: "from-accent/20 to-accent/5",
    iconColor: "text-accent",
  },
];

export function FeatureCards() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-montserrat font-bold text-foreground mb-4">
            Je t'accompagne à chaque étape
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Une IA qui comprend vraiment tes besoins de voyageur
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className={`
                  relative p-6 rounded-2xl
                  bg-gradient-to-br ${feature.gradient}
                  border border-border/50
                  transition-shadow duration-300
                  hover:shadow-lg
                `}
              >
                <div className={`${feature.iconColor} mb-4`}>
                  <Icon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-montserrat font-bold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeatureCards;
