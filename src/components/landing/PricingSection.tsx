/**
 * PricingSection - 3-tier subscription preview (no payments yet)
 */

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, FileDown, Wand2 } from "lucide-react";

type Tier = {
  name: string;
  priceMonthly: string;
  priceYearly: string;
  highlight?: boolean;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
};

const tiers: Tier[] = [
  {
    name: "Gratuit",
    priceMonthly: "0€",
    priceYearly: "0€",
    badge: "Par défaut",
    icon: Sparkles,
    features: [
      "X crédits / mois",
      "Recommandations de base",
      "Accès au blog",
    ],
  },
  {
    name: "Pro",
    priceMonthly: "9€ / mois",
    priceYearly: "90€ / an",
    highlight: true,
    badge: "Le plus choisi",
    icon: FileDown,
    features: [
      "Tout du Gratuit",
      "Téléchargement PDF",
      "Plus de crédits / mois",
    ],
  },
  {
    name: "Premium",
    priceMonthly: "19€ / mois",
    priceYearly: "190€ / an",
    icon: Wand2,
    features: [
      "Tout du Pro",
      "Personnalisation avancée (plus de temps)",
      "Priorité sur les meilleures options",
    ],
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-montserrat font-bold text-foreground mb-4">
            Des offres simples
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Mensuel ou annuel (remise incluse). Tu gardes la main, tu peux changer quand tu veux.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {tiers.map((tier, idx) => {
            const Icon = tier.icon;
            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className={
                  "relative rounded-2xl border p-6 bg-card shadow-sm " +
                  (tier.highlight ? "ring-2 ring-primary/40" : "")
                }
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-montserrat font-bold text-foreground">
                        {tier.name}
                      </h3>
                      {tier.badge ? (
                        <Badge variant={tier.highlight ? "default" : "secondary"}>
                          {tier.badge}
                        </Badge>
                      ) : null}
                    </div>
                    <div className="mt-3">
                      <div className="text-3xl font-montserrat font-bold text-foreground">
                        {tier.priceMonthly}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ou {tier.priceYearly}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 rounded-xl bg-primary/10 p-3 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>

                <ul className="mt-6 space-y-3 text-sm">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-muted-foreground">
                      <Check className="h-4 w-4 mt-0.5 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <a
                    href="#"
                    className={
                      "inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors " +
                      (tier.highlight
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-muted text-foreground hover:bg-muted/80")
                    }
                    onClick={(e) => e.preventDefault()}
                  >
                    Choisir {tier.name}
                  </a>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Paiement Stripe bientôt. (Pour l’instant : vitrine.)
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default PricingSection;
