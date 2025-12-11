import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useGameStore } from "@/store/gameStore";
import { useLanguage } from "@/contexts/LanguageContext";

const Terms = () => {
  const { brand } = useGameStore();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-4xl font-bold mb-6">{t('terms.title')}</h1>
            <p className="text-muted-foreground mb-8">{t('privacy.lastUpdated')}: {t('common.january')} 2024</p>

            <div className="space-y-6">
              <section className="glass rounded-xl p-6 border border-border/50">
                <h2 className="font-display text-xl font-semibold mb-4">{t('terms.acceptance')}</h2>
                <p className="text-muted-foreground">
                  By accessing or using {brand.name}'s services, you agree to be bound by these Terms 
                  of Service and all applicable laws and regulations.
                </p>
              </section>

              <section className="glass rounded-xl p-6 border border-border/50">
                <h2 className="font-display text-xl font-semibold mb-4">{t('terms.useServices')}</h2>
                <p className="text-muted-foreground">
                  You may use our services only for lawful purposes and in accordance with these Terms. 
                  You agree not to use our services for any illegal or unauthorized purpose.
                </p>
              </section>

              <section className="glass rounded-xl p-6 border border-border/50">
                <h2 className="font-display text-xl font-semibold mb-4">{t('terms.accountResponsibility')}</h2>
                <p className="text-muted-foreground">
                  You are responsible for maintaining the confidentiality of your account and password, 
                  and for restricting access to your computer. You agree to accept responsibility for 
                  all activities that occur under your account.
                </p>
              </section>

              <section className="glass rounded-xl p-6 border border-border/50">
                <h2 className="font-display text-xl font-semibold mb-4">{t('terms.serviceAvailability')}</h2>
                <p className="text-muted-foreground">
                  We strive to provide 99.9% uptime for all services. However, we do not guarantee 
                  uninterrupted access and may suspend services for maintenance or updates.
                </p>
              </section>

              <section className="glass rounded-xl p-6 border border-border/50">
                <h2 className="font-display text-xl font-semibold mb-4">{t('terms.contact')}</h2>
                <p className="text-muted-foreground">
                  For any questions regarding these Terms, please contact us at legal@example.com.
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

export default Terms;
