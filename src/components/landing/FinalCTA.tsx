/**
 * FinalCTA - Beautiful bottom call to action section
 */

import { motion } from "framer-motion";
import { HeroChatInput } from "./HeroChatInput";
import { Plane, MapPin, Calendar } from "lucide-react";

const floatingElements = [
  { icon: Plane, delay: 0, x: "-10%", y: "20%" },
  { icon: MapPin, delay: 0.2, x: "85%", y: "30%" },
  { icon: Calendar, delay: 0.4, x: "10%", y: "70%" },
];

export function FinalCTA() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent" />
      
      {/* Animated pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Floating decorative elements */}
      {floatingElements.map((el, index) => {
        const Icon = el.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 0.2, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: el.delay, duration: 0.5 }}
            className="absolute hidden md:block"
            style={{ left: el.x, top: el.y }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: el.delay }}
            >
              <Icon className="w-16 h-16 text-white" />
            </motion.div>
          </motion.div>
        );
      })}

      {/* Blur circles */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-accent/30 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-montserrat font-bold text-white mb-6 leading-tight">
            Dis-moi où tu veux aller
          </h2>
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-xl mx-auto">
            Je m'occupe du reste. Vol, hôtel, activités – tout sera prêt en quelques minutes.
          </p>
          
          {/* Chat input with light theme override */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/20">
            <HeroChatInput variant="light" />
          </div>
          
          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-6 text-white/60 text-sm"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              100% gratuit
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              Sans inscription
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              Résultats en 2 min
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default FinalCTA;
