import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const Privacy = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-4xl font-bold mb-6">{t('privacy.title')}</h1>
            <p className="text-muted-foreground mb-8">{t('privacy.lastUpdated')}: {t('common.january')} 2024</p>

            <div className="prose prose-invert max-w-none space-y-6">
              <section className="glass rounded-xl p-6 border border-border/50">
                <h2 className="font-display text-xl font-semibold mb-4">{t('privacy.infoCollect')}</h2>
                <p className="text-muted-foreground">
                  We collect information you provide directly to us, such as when you create an account, 
                  make a purchase, or contact us for support. This may include your name, email address, 
                  payment information, and any other information you choose to provide.
                </p>
              </section>

              <section className="glass rounded-xl p-6 border border-border/50">
                <h2 className="font-display text-xl font-semibold mb-4">{t('privacy.howUse')}</h2>
                <p className="text-muted-foreground">
                  We use the information we collect to provide, maintain, and improve our services, 
                  process transactions, send you technical notices and support messages, and respond 
                  to your comments and questions.
                </p>
              </section>

              <section className="glass rounded-xl p-6 border border-border/50">
                <h2 className="font-display text-xl font-semibold mb-4">{t('privacy.dataSecurity')}</h2>
                <p className="text-muted-foreground">
                  We take reasonable measures to help protect your personal information from loss, 
                  theft, misuse, unauthorized access, disclosure, alteration, and destruction.
                </p>
              </section>

              <section className="glass rounded-xl p-6 border border-border/50">
                <h2 className="font-display text-xl font-semibold mb-4">{t('privacy.contactUs')}</h2>
                <p className="text-muted-foreground">
                  If you have any questions about this Privacy Policy, please contact us at 
                  privacy@example.com.
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

export default Privacy;
