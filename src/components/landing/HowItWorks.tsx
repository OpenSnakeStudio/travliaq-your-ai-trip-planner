/**
 * HowItWorks - Visual step-by-step process with modern design
 */

import { motion } from "framer-motion";
import { MessageCircle, Sparkles, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LucideIcon } from "lucide-react";

interface StepConfig {
  titleKey: string;
  descKey: string;
  exampleKey: string;
  icon: LucideIcon;
  accent: string;
}

const stepConfigs: StepConfig[] = [
  {
    titleKey: "landing.howItWorks.step1.title",
    descKey: "landing.howItWorks.step1.desc",
    exampleKey: "landing.howItWorks.step1.example",
    icon: MessageCircle,
    accent: "bg-primary/10 text-primary",
  },
  {
    titleKey: "landing.howItWorks.step2.title",
    descKey: "landing.howItWorks.step2.desc",
    exampleKey: "landing.howItWorks.step2.example",
    icon: Sparkles,
    accent: "bg-accent/15 text-accent-foreground",
  },
  {
    titleKey: "landing.howItWorks.step3.title",
    descKey: "landing.howItWorks.step3.desc",
    exampleKey: "landing.howItWorks.step3.example",
    icon: Send,
    accent: "bg-secondary/10 text-secondary-foreground",
  },
];

export function HowItWorks() {
  const { t } = useTranslation();

  return (
    <section className="py-16 md:py-24 bg-muted/20 overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-montserrat font-bold text-foreground mb-4">
            {t("landing.howItWorks.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("landing.howItWorks.subtitle")}
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {stepConfigs.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.titleKey}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className={"rounded-xl p-3 " + step.accent}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-montserrat font-bold text-foreground">
                      {t(step.titleKey)}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {t(step.descKey)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{t("landing.howItWorks.examplePrefix")}</span> {t(step.exampleKey)}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
