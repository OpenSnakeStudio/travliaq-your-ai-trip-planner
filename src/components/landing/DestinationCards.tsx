/**
 * DestinationCards - Inspirational destination grid
 */

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MapPin, Clock, Plane } from "lucide-react";
import { cn } from "@/lib/utils";

const destinations = [
  {
    id: 1,
    title: "Barcelone",
    subtitle: "City break culturel",
    duration: "3-5 jours",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&h=400&fit=crop",
    gradient: "from-orange-500/80 to-pink-500/80",
    query: "City break à Barcelone, que me recommandes-tu ?",
  },
  {
    id: 2,
    title: "Lisbonne",
    subtitle: "Charme portugais",
    duration: "4-6 jours",
    image: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=600&h=400&fit=crop",
    gradient: "from-yellow-500/80 to-orange-500/80",
    query: "Voyage à Lisbonne, aide-moi à planifier",
  },
  {
    id: 3,
    title: "Rome",
    subtitle: "Histoire & Gastronomie",
    duration: "4-7 jours",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&h=400&fit=crop",
    gradient: "from-amber-600/80 to-red-600/80",
    query: "Escapade à Rome, suggestions d'itinéraire",
  },
  {
    id: 4,
    title: "Marrakech",
    subtitle: "Évasion orientale",
    duration: "5-7 jours",
    image: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=600&h=400&fit=crop",
    gradient: "from-red-500/80 to-orange-600/80",
    query: "Voyage à Marrakech, je veux découvrir les souks et riads",
  },
  {
    id: 5,
    title: "Santorin",
    subtitle: "Îles grecques",
    duration: "5-7 jours",
    image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=600&h=400&fit=crop",
    gradient: "from-blue-400/80 to-cyan-500/80",
    query: "Santorin en amoureux, aide-moi à organiser",
  },
  {
    id: 6,
    title: "Tokyo",
    subtitle: "Immersion japonaise",
    duration: "10-14 jours",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop",
    gradient: "from-pink-500/80 to-purple-600/80",
    query: "Voyage au Japon, Tokyo et environs",
  },
];

export function DestinationCards() {
  const navigate = useNavigate();

  const handleClick = (query: string) => {
    navigate(`/planner?q=${encodeURIComponent(query)}`);
  };

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-montserrat font-bold text-foreground mb-4">
            Où partir ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Clique sur une destination et laisse-moi t'aider à planifier ton voyage idéal
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {destinations.map((dest, index) => (
            <motion.button
              key={dest.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleClick(dest.query)}
              className="group relative h-64 rounded-2xl overflow-hidden text-left"
            >
              {/* Background Image */}
              <img
                src={dest.image}
                alt={dest.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              
              {/* Gradient Overlay */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-t",
                dest.gradient,
                "opacity-60 group-hover:opacity-70 transition-opacity"
              )} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="flex items-center gap-1.5 text-white/80 text-sm mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{dest.subtitle}</span>
                </div>
                <h3 className="text-2xl font-montserrat font-bold text-white mb-2">
                  {dest.title}
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-white/80 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{dest.duration}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Planifier</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
              
              {/* Hover indicator */}
              <div className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Plane className="w-4 h-4 text-white" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default DestinationCards;
