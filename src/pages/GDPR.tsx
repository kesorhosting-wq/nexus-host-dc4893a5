import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useGameStore } from "@/store/gameStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { Shield, Download, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

const GDPR = () => {
  const { brand } = useGameStore();
  const { t } = useLanguage();

  const rights = [
    { icon: Download, titleKey: 'gdpr.rightAccess', descKey: 'gdpr.rightAccessDesc' },
    { icon: Edit, titleKey: 'gdpr.rightRectification', descKey: 'gdpr.rightRectificationDesc' },
    { icon: Trash2, titleKey: 'gdpr.rightErasure', descKey: 'gdpr.rightErasureDesc' },
    { icon: Shield, titleKey: 'gdpr.rightRestrict', descKey: 'gdpr.rightRestrictDesc' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-4xl font-bold mb-6">{t('gdpr.title')}</h1>
            <p className="text-muted-foreground mb-8">
              {brand.name} {t('gdpr.description')}
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {rights.map((right, i) => (
                <div key={i} className="glass rounded-xl p-6 border border-border/50">
                  <right.icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-display font-semibold mb-2">{t(right.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground">{t(right.descKey)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <section className="glass rounded-xl p-6 border border-border/50">
                <h2 className="font-display text-xl font-semibold mb-4">{t('gdpr.dataProcessing')}</h2>
                <p className="text-muted-foreground">
                  We process personal data lawfully, fairly, and transparently. Data is collected 
                  for specified, explicit, and legitimate purposes and not processed in a manner 
                  incompatible with those purposes.
                </p>
              </section>

              <section className="glass rounded-xl p-6 border border-border/50">
                <h2 className="font-display text-xl font-semibold mb-4">{t('gdpr.dpo')}</h2>
                <p className="text-muted-foreground mb-4">
                  For any GDPR-related inquiries, please contact our Data Protection Officer:
                </p>
                <p className="text-primary">dpo@example.com</p>
              </section>

              <section className="glass rounded-xl p-6 border border-border/50">
                <h2 className="font-display text-xl font-semibold mb-4">{t('gdpr.exerciseRights')}</h2>
                <p className="text-muted-foreground mb-4">
                  To exercise any of your GDPR rights, please submit a request through our 
                  contact form or email us directly.
                </p>
                <Button>{t('gdpr.submitRequest')}</Button>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GDPR;
