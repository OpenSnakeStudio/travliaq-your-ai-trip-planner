/**
 * QuickActionChips - Quick action buttons below the hero input
 */

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, Sun, Plane, Heart, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { LucideIcon } from "lucide-react";

interface ChipConfig {
  labelKey: string;
  icon: LucideIcon;
  messageKey: string;
}

const chipConfigs: ChipConfig[] = [
  { labelKey: "landing.quickActions.inspireme", icon: Sparkles, messageKey: "landing.quickActions.inspiremeMsg" },
  { labelKey: "landing.quickActions.weekend", icon: Sun, messageKey: "landing.quickActions.weekendMsg" },
  { labelKey: "landing.quickActions.citybreak", icon: MapPin, messageKey: "landing.quickActions.citybreakMsg" },
  { labelKey: "landing.quickActions.romantic", icon: Heart, messageKey: "landing.quickActions.romanticMsg" },
  { labelKey: "landing.quickActions.cheapflight", icon: Plane, messageKey: "landing.quickActions.cheapflightMsg" },
];

interface QuickActionChipsProps {
  className?: string;
}

export function QuickActionChips({ className }: QuickActionChipsProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleClick = (message: string) => {
    // Add new=1 to force a new session when coming from home page
    navigate(`/planner?q=${encodeURIComponent(message)}&new=1`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className={cn("flex flex-wrap justify-center gap-2 md:gap-3", className)}
    >
      {chipConfigs.map((chip, index) => {
        const Icon = chip.icon;
        const label = t(chip.labelKey);
        const message = t(chip.messageKey);
        return (
          <motion.button
            key={chip.labelKey}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + index * 0.08 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleClick(message)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 md:px-4 md:py-2",
              "rounded-full text-xs md:text-sm font-medium",
              "bg-white/10 backdrop-blur-sm text-white/90",
              "border border-white/20 hover:bg-white/20",
              "transition-colors duration-200"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}

export default QuickActionChips;
