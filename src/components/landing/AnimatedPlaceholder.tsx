/**
 * AnimatedPlaceholder - Rotating placeholder text animation
 * Shows different travel suggestions that fade in/out
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const placeholders = [
  "Trouve-moi un vol pas cher pour Barcelone...",
  "Week-end romantique à Rome en février...",
  "Road trip en Espagne pour 2 semaines...",
  "Aide-moi à planifier une semaine en Italie...",
  "Voyage en famille au Portugal cet été...",
  "City break à Lisbonne ce week-end...",
];

interface AnimatedPlaceholderProps {
  isTyping: boolean;
  variant?: "dark" | "light";
}

export function AnimatedPlaceholder({ isTyping, variant = "dark" }: AnimatedPlaceholderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isTyping) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % placeholders.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [isTyping]);

  if (isTyping) return null;

  return (
    <div className="absolute inset-0 flex items-center pointer-events-none px-4">
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.5, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className={variant === "light" ? "text-muted-foreground/70 text-base md:text-lg truncate" : "text-white/50 text-base md:text-lg truncate"}
        >
          {placeholders[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export default AnimatedPlaceholder;
