/**
 * PartnersSection - Display partner logos with elegant animation
 */

import { motion } from "framer-motion";

const partners = [
  {
    name: "Airbnb",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Airbnb_Logo_B%C3%A9lo.svg/512px-Airbnb_Logo_B%C3%A9lo.svg.png",
  },
  {
    name: "Booking.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Booking.com_logo.svg/512px-Booking.com_logo.svg.png",
  },
  {
    name: "Skyscanner",
    logo: "https://logos-world.net/wp-content/uploads/2021/02/Skyscanner-Logo.png",
  },
  {
    name: "GetYourGuide",
    logo: "https://cdn.worldvectorlogo.com/logos/getyourguide.svg",
  },
  {
    name: "Viator",
    logo: "https://logos-world.net/wp-content/uploads/2022/01/Viator-Logo.png",
  },
  {
    name: "TripAdvisor",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Tripadvisor_logo.svg/512px-Tripadvisor_logo.svg.png",
  },
];

export function PartnersSection() {
  return (
    <section className="py-16 md:py-20 bg-background border-y border-border/50 overflow-hidden">
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8 items-center justify-items-center">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative w-full flex justify-center"
            >
              <div className="h-10 md:h-12 w-full max-w-[120px] flex items-center justify-center grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-full max-w-full object-contain"
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
