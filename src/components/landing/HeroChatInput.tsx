/**
 * HeroChatInput - Main chat input for the landing page hero
 * Redirects to /planner with the message as query param
 */

import { useState, useRef, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import AnimatedPlaceholder from "./AnimatedPlaceholder";

interface HeroChatInputProps {
  className?: string;
}

export function HeroChatInput({ className }: HeroChatInputProps) {
  const [value, setValue] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!value.trim()) return;
    // Navigate to planner with the message as query param
    navigate(`/planner?q=${encodeURIComponent(value.trim())}`);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className={cn("w-full max-w-2xl mx-auto", className)}
    >
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-2xl blur-lg opacity-70" />
        
        {/* Input container */}
        <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
          <div className="flex items-center p-2">
            <div className="flex-1 relative">
              <AnimatedPlaceholder isTyping={value.length > 0} />
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-white text-base md:text-lg px-4 py-3 focus:outline-none placeholder-transparent"
                aria-label="Décris ton voyage idéal"
              />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={!value.trim()}
              className={cn(
                "flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all mr-1",
                value.trim()
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-white/10 text-white/50 cursor-not-allowed"
              )}
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Planifier</span>
              <Send className="w-4 h-4 sm:hidden" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default HeroChatInput;
