/**
 * StatsCounter - Animated counter statistics section
 */

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MessageSquare, Route, Users, Zap } from "lucide-react";

interface CounterProps {
  end: number;
  suffix?: string;
  duration?: number;
}

function useCountUp(end: number, duration: number = 2000, inView: boolean) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!inView) return;
    
    let startTime: number | null = null;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, inView]);
  
  return count;
}

const stats = [
  { 
    value: 12847, 
    suffix: "+",
    label: "Voyages planifiés",
    icon: Route,
    color: "text-primary"
  },
  { 
    value: 456789, 
    suffix: "",
    label: "Messages IA traités",
    icon: MessageSquare,
    color: "text-accent"
  },
  { 
    value: 98, 
    suffix: "%",
    label: "Satisfaction",
    icon: Users,
    color: "text-primary"
  },
  { 
    value: 45, 
    suffix: "s",
    label: "Temps moyen",
    icon: Zap,
    color: "text-accent"
  },
];

function StatCard({ stat, inView }: { stat: typeof stats[0]; inView: boolean }) {
  const count = useCountUp(stat.value, 2500, inView);
  const Icon = stat.icon;
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(0) + "K";
    return num.toLocaleString("fr-FR");
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center p-6"
    >
      <div className={`inline-flex p-3 rounded-xl bg-muted mb-4 ${stat.color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-4xl md:text-5xl font-montserrat font-bold text-foreground mb-2">
        {formatNumber(count)}{stat.suffix}
      </div>
      <div className="text-muted-foreground font-medium">{stat.label}</div>
    </motion.div>
  );
}

export function StatsCounter() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-montserrat font-bold text-foreground mb-4">
            Ton voyage en minutes,<br />
            <span className="text-primary">pas en semaines</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Des milliers de voyageurs nous font déjà confiance pour planifier leurs aventures
          </p>
        </motion.div>
        
        <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default StatsCounter;
