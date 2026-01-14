/**
 * AnimatedPlaceholder - Rotating placeholder text animation
 * Shows different travel suggestions that fade in/out
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

interface AnimatedPlaceholderProps {
  isTyping: boolean;
  variant?: "dark" | "light";
}

export function AnimatedPlaceholder({ isTyping, variant = "dark" }: AnimatedPlaceholderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useTranslation();

  const placeholders = [
    t("landing.placeholders.0"),
    t("landing.placeholders.1"),
    t("landing.placeholders.2"),
    t("landing.placeholders.3"),
    t("landing.placeholders.4"),
    t("landing.placeholders.5"),
  ];

  useEffect(() => {
    if (isTyping) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % placeholders.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [isTyping, placeholders.length]);

  if (isTyping) return null;

  return (
    <div className="absolute inset-0 flex items-center pointer-events-none px-4 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
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
