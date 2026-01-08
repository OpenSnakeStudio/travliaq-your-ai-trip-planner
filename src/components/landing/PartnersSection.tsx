/**
 * PartnersSection - Display partner logos with elegant animation
 */

import { motion } from "framer-motion";

const partners = [
  {
    name: "GetYourGuide",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/GetYourGuide_Logo.svg/320px-GetYourGuide_Logo.svg.png",
  },
  {
    name: "Skyscanner",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Skyscanner_Logo_LockupHorizontal_SkyBlue_RGB.svg/320px-Skyscanner_Logo_LockupHorizontal_SkyBlue_RGB.svg.png",
  },
  {
    name: "Viator",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Viator_2022_logo.svg/320px-Viator_2022_logo.svg.png",
  },
  {
    name: "Eventbrite",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Eventbrite_wordmark_orange.svg/320px-Eventbrite_wordmark_orange.svg.png",
  },
  {
    name: "Fever",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Fever_logo.svg/320px-Fever_logo.svg.png",
  },
  {
    name: "TheFork",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/TheFork_logo.svg/320px-TheFork_logo.svg.png",
  },
];

export function PartnersSection() {
  return (
    <section className="py-16 md:py-20 bg-background border-y border-border/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Ils nous font confiance
          </p>
          <h2 className="text-2xl md:text-3xl font-montserrat font-bold text-foreground">
            Nos partenaires
          </h2>
        </motion.div>

        {/* Partners Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-12 items-center justify-items-center">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="h-12 md:h-14 flex items-center justify-center px-4 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-full max-w-[140px] object-contain"
                  loading="lazy"
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Subtle decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 h-px bg-gradient-to-r from-transparent via-border to-transparent max-w-2xl mx-auto"
        />
      </div>
    </section>
  );
}

export default PartnersSection;
