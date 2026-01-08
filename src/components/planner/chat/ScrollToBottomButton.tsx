/**
 * ScrollToBottomButton - Floating button to scroll back to bottom
 * 
 * Appears when user scrolls up, shows new message count badge
 */

import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrollToBottomButtonProps {
  show: boolean;
  newMessageCount: number;
  onClick: () => void;
}

export function ScrollToBottomButton({
  show,
  newMessageCount,
  onClick,
}: ScrollToBottomButtonProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={onClick}
          className={cn(
            "absolute bottom-24 left-1/2 -translate-x-1/2 z-10",
            "flex items-center gap-2 px-4 py-2 rounded-full",
            "bg-primary text-primary-foreground shadow-lg",
            "hover:bg-primary/90 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary/50"
          )}
        >
          <ArrowDown className="h-4 w-4" />
          {newMessageCount > 0 ? (
            <span className="text-sm font-medium">
              {newMessageCount} nouveau{newMessageCount > 1 ? "x" : ""} message{newMessageCount > 1 ? "s" : ""}
            </span>
          ) : (
            <span className="text-sm font-medium">Retour en bas</span>
          )}
          
          {/* Pulse animation for new messages */}
          {newMessageCount > 0 && (
            <motion.span
              className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
