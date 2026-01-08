/**
 * QuickActionChips - Quick action buttons below the hero input
 */

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, Sun, Plane, Heart, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const chips = [
  { label: "Inspire-moi", icon: Sparkles, message: "Inspire-moi pour mon prochain voyage" },
  { label: "Weekend au soleil", icon: Sun, message: "Je veux partir en weekend au soleil" },
  { label: "City break Europe", icon: MapPin, message: "City break en Europe, quelle ville me recommandes-tu ?" },
  { label: "Escapade romantique", icon: Heart, message: "Je cherche une destination romantique pour 2" },
  { label: "Vol pas cher", icon: Plane, message: "Trouve-moi les vols les moins chers depuis Paris" },
];

interface QuickActionChipsProps {
  className?: string;
}

export function QuickActionChips({ className }: QuickActionChipsProps) {
  const navigate = useNavigate();

  const handleClick = (message: string) => {
    navigate(`/planner?q=${encodeURIComponent(message)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className={cn("flex flex-wrap justify-center gap-2 md:gap-3", className)}
    >
      {chips.map((chip, index) => {
        const Icon = chip.icon;
        return (
          <motion.button
            key={chip.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + index * 0.08 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleClick(chip.message)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 md:px-4 md:py-2",
              "rounded-full text-xs md:text-sm font-medium",
              "bg-white/10 backdrop-blur-sm text-white/90",
              "border border-white/20 hover:bg-white/20",
              "transition-colors duration-200"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{chip.label}</span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}

export default QuickActionChips;
