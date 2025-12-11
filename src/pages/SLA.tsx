import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Check } from "lucide-react";

const SLA = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-4xl font-bold mb-6">{t('sla.title')}</h1>
            <p className="text-muted-foreground mb-8">{t('privacy.lastUpdated')}: {t('common.january')} 2024</p>

            <div className="space-y-6">
              <section className="glass rounded-xl p-6 border border-border/50">
                <h2 className="font-display text-xl font-semibold mb-4">{t('sla.uptimeGuarantee')}</h2>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl font-bold text-gradient">99.9%</div>
                  <span className="text-muted-foreground">{t('sla.monthlyUptime')}</span>
                </div>
                <p className="text-muted-foreground">
                  We guarantee 99.9% network and infrastructure uptime for all game servers hosted 
                  on our platform, excluding scheduled maintenance windows.
                </p>
              </section>

              <section className="glass rounded-xl p-6 border border-border/50">
                <h2 className="font-display text-xl font-semibold mb-4">{t('sla.serviceCredits')}</h2>
                <p className="text-muted-foreground mb-4">
                  If we fail to meet our uptime commitment, you may be eligible for service credits:
                </p>
                <ul className="space-y-2">
                  {[
                    "99.0% - 99.9% uptime: 10% credit",
                    "95.0% - 99.0% uptime: 25% credit",
                    "Below 95.0% uptime: 50% credit",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-muted-foreground">
                      <Check className="w-4 h-4 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="glass rounded-xl p-6 border border-border/50">
                <h2 className="font-display text-xl font-semibold mb-4">{t('sla.responseTime')}</h2>
                <ul className="space-y-2">
                  {[
                    "Critical issues: 15 minutes",
                    "High priority: 1 hour",
                    "Normal priority: 4 hours",
                    "Low priority: 24 hours",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-muted-foreground">
                      <Check className="w-4 h-4 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="glass rounded-xl p-6 border border-border/50">
                <h2 className="font-display text-xl font-semibold mb-4">{t('sla.exclusions')}</h2>
                <p className="text-muted-foreground">
                  This SLA does not apply to: scheduled maintenance, force majeure events, 
                  issues caused by customer actions, third-party service outages, or DDoS attacks.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SLA;
