/**
 * FinalCTA - Bottom call to action section
 */

import { motion } from "framer-motion";
import { HeroChatInput } from "./HeroChatInput";
import { Sparkles } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-primary/10 via-background to-accent/10 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Prêt à essayer ?</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-montserrat font-bold text-foreground mb-4">
            Dis-moi où tu veux aller
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Je m'occupe du reste. Vol, hôtel, activités – tout sera prêt en quelques minutes.
          </p>
          
          {/* Chat input */}
          <HeroChatInput />
        </motion.div>
      </div>
    </section>
  );
}

export default FinalCTA;
