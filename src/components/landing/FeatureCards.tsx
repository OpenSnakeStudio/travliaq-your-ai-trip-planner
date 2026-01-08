/**
 * FeatureCards - Key features with clean, simple design
 */

import { motion } from "framer-motion";
import { Sparkles, Clock, CreditCard, Check } from "lucide-react";

export function FeatureCards() {
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
            Pourquoi Travliaq ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple, rapide, gratuit.
          </p>
        </motion.div>

        {/* 3 key benefits in clean cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-center p-8 rounded-2xl bg-muted/30 border border-border/50"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-montserrat font-bold text-foreground mb-3">
              100% Gratuit
            </h3>
            <p className="text-muted-foreground">
              Pas de carte bancaire requise, pas d'inscription obligatoire.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center p-8 rounded-2xl bg-muted/30 border border-border/50"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent/20 flex items-center justify-center">
              <Clock className="w-8 h-8 text-accent-foreground" />
            </div>
            <h3 className="text-xl font-montserrat font-bold text-foreground mb-3">
              Résultat en 2 min
            </h3>
            <p className="text-muted-foreground">
              Dis-nous tes envies, on s'occupe du reste.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center p-8 rounded-2xl bg-muted/30 border border-border/50"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-montserrat font-bold text-foreground mb-3">
              100% Sur-mesure
            </h3>
            <p className="text-muted-foreground">
              Un itinéraire personnalisé selon tes goûts.
            </p>
          </motion.div>
        </div>

        {/* Simple list of additional benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex flex-wrap justify-center gap-6 text-muted-foreground"
        >
          {["Comparaison des prix", "Spots cachés", "Adapté à ton rythme", "Sans surprises"].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>{item}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default FeatureCards;
