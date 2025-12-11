import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useGameStore } from "@/store/gameStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { Users, Target, Award, Heart } from "lucide-react";

const About = () => {
  const { brand } = useGameStore();
  const { t } = useLanguage();

  const values = [
    { icon: Users, titleKey: 'about.communityFirst', descKey: 'about.communityDesc' },
    { icon: Target, titleKey: 'about.performance', descKey: 'about.performanceDesc' },
    { icon: Award, titleKey: 'about.quality', descKey: 'about.qualityDesc' },
    { icon: Heart, titleKey: 'about.support', descKey: 'about.supportDesc' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              {t('about.title')} <span className="text-gradient">{brand.name}</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('about.description')}
            </p>
          </div>

          {/* Values */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {values.map((item, i) => (
              <div key={i} className="glass rounded-xl p-6 text-center border border-border/50">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold mb-2">{t(item.titleKey)}</h3>
                <p className="text-sm text-muted-foreground">{t(item.descKey)}</p>
              </div>
            ))}
          </div>

          {/* Story */}
          <div className="glass rounded-2xl p-8 md:p-12 border border-border/50 max-w-4xl mx-auto">
            <h2 className="font-display text-2xl font-bold mb-6">{t('about.ourStory')}</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                {brand.name} was founded with a simple mission: to provide gamers with reliable, 
                high-performance server hosting that doesn't break the bank.
              </p>
              <p>
                Today, we serve thousands of customers worldwide, hosting game servers across 
                multiple continents with 99.9% uptime guarantee.
              </p>
              <p>
                Our team of gaming enthusiasts and server experts work around the clock to ensure 
                your gaming experience is always smooth and uninterrupted.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
