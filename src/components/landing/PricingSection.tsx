/**
 * PricingSection - 3-tier subscription preview (no payments yet)
 */

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, FileDown, Wand2 } from "lucide-react";
import { useTranslation } from "react-i18next";

type Tier = {
  nameKey: string;
  priceMonthly: string;
  priceYearly: string;
  highlight?: boolean;
  badgeKey?: string;
  icon: React.ComponentType<{ className?: string }>;
  featureKeys: string[];
};

const tiers: Tier[] = [
  {
    nameKey: "landing.pricing.free.name",
    priceMonthly: "0€",
    priceYearly: "0€",
    badgeKey: "landing.pricing.free.badge",
    icon: Sparkles,
    featureKeys: [
      "landing.pricing.free.feature1",
      "landing.pricing.free.feature2",
      "landing.pricing.free.feature3",
    ],
  },
  {
    nameKey: "landing.pricing.pro.name",
    priceMonthly: "9€ / mois",
    priceYearly: "90€ / an",
    highlight: true,
    badgeKey: "landing.pricing.pro.badge",
    icon: FileDown,
    featureKeys: [
      "landing.pricing.pro.feature1",
      "landing.pricing.pro.feature2",
      "landing.pricing.pro.feature3",
    ],
  },
  {
    nameKey: "landing.pricing.premium.name",
    priceMonthly: "19€ / mois",
    priceYearly: "190€ / an",
    icon: Wand2,
    featureKeys: [
      "landing.pricing.premium.feature1",
      "landing.pricing.premium.feature2",
      "landing.pricing.premium.feature3",
    ],
  },
];

export function PricingSection() {
  const { t } = useTranslation();

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
            {t("landing.pricing.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("landing.pricing.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {tiers.map((tier, idx) => {
            const Icon = tier.icon;
            const tierName = t(tier.nameKey);
            return (
              <motion.div
                key={tier.nameKey}
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
                        {tierName}
                      </h3>
                      {tier.badgeKey ? (
                        <Badge variant={tier.highlight ? "default" : "secondary"}>
                          {t(tier.badgeKey)}
                        </Badge>
                      ) : null}
                    </div>
                    <div className="mt-3">
                      <div className="text-3xl font-montserrat font-bold text-foreground">
                        {tier.priceMonthly}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t("landing.pricing.or")} {tier.priceYearly}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 rounded-xl bg-primary/10 p-3 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>

                <ul className="mt-6 space-y-3 text-sm">
                  {tier.featureKeys.map((featureKey) => (
                    <li key={featureKey} className="flex items-start gap-2 text-muted-foreground">
                      <Check className="h-4 w-4 mt-0.5 text-primary" />
                      <span>{t(featureKey)}</span>
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
                    {t("landing.pricing.choose")} {tierName}
                  </a>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t("landing.pricing.comingSoon")}
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
