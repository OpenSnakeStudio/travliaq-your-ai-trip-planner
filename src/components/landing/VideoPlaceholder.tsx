/**
 * VideoPlaceholder - Section with video placeholder (currently shows planner screenshot)
 * No autoplay, nice animation on scroll
 */

import { motion } from "framer-motion";
import { Play, Sparkles } from "lucide-react";
import { useState } from "react";

// Placeholder image - will be replaced with actual planner screenshot
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=675&fit=crop";

interface VideoPlaceholderProps {
  className?: string;
}

export function VideoPlaceholder({ className = "" }: VideoPlaceholderProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className={`py-16 md:py-24 bg-muted/30 ${className}`}>
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Découvre Travliaq en action</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-montserrat font-bold text-foreground mb-4">
            Regarde comment ça marche
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            En 2 minutes, tu comprendras pourquoi des milliers de voyageurs nous font confiance
          </p>
        </motion.div>

        {/* Video Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-secondary group">
            {/* Aspect ratio container for 16:9 video */}
            <div className="aspect-video relative">
              {!isPlaying ? (
                <>
                  {/* Thumbnail/Placeholder */}
                  <img
                    src={PLACEHOLDER_IMAGE}
                    alt="Aperçu du planner Travliaq"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
                  {/* Play Button */}
                  <motion.button
                    onClick={() => setIsPlaying(true)}
                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="relative">
                      {/* Pulse animation */}
                      <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping" />
                      <div className="relative w-20 h-20 md:w-24 md:h-24 bg-primary rounded-full flex items-center justify-center shadow-lg group-hover:bg-primary/90 transition-colors">
                        <Play className="w-8 h-8 md:w-10 md:h-10 text-white ml-1" fill="white" />
                      </div>
                    </div>
                  </motion.button>

                  {/* Coming soon badge */}
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 text-white/90 text-sm font-medium">
                    Vidéo bientôt disponible
                  </div>
                </>
              ) : (
                /* Video embed placeholder - replace with actual video */
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <p className="text-white text-lg">Vidéo en cours de chargement...</p>
                </div>
              )}
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 blur-3xl rounded-full" />
        </motion.div>
      </div>
    </section>
  );
}

export default VideoPlaceholder;
