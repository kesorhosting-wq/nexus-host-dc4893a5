import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, MessageCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Contact = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              {t('contact.title')} <span className="text-gradient">{t('contact.us')}</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('contact.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="glass rounded-xl p-6 border border-border/50">
                <Mail className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-display font-semibold mb-2">{t('contact.email')}</h3>
                <p className="text-muted-foreground">support@example.com</p>
              </div>
              <div className="glass rounded-xl p-6 border border-border/50">
                <MessageCircle className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-display font-semibold mb-2">{t('contact.liveChat')}</h3>
                <p className="text-muted-foreground">{t('contact.liveChatDesc')}</p>
              </div>
              <div className="glass rounded-xl p-6 border border-border/50">
                <MapPin className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-display font-semibold mb-2">{t('contact.office')}</h3>
                <p className="text-muted-foreground">{t('contact.remoteFirst')}</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="glass rounded-xl p-8 border border-border/50">
              <h2 className="font-display text-xl font-bold mb-6">{t('contact.sendMessage')}</h2>
              <form className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('contact.name')}</label>
                  <Input placeholder={t('contact.yourName')} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('contact.email')}</label>
                  <Input type="email" placeholder={t('contact.yourEmail')} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('contact.message')}</label>
                  <textarea 
                    placeholder={t('contact.yourMessage')}
                    className="w-full min-h-[120px] px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button className="w-full">{t('contact.send')}</Button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
