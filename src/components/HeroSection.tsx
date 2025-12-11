import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Cpu, HardDrive, Wifi, Sparkles } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { useLanguage } from "@/contexts/LanguageContext";
import SeasonalDecorations from "./SeasonalDecorations";

// Game background images for slideshow
const gameBackgrounds = [
  { id: 'minecraft', url: '/backgrounds/minecraft-bg.png', name: 'Minecraft' },
  { id: 'fivem', url: '/backgrounds/fivem-bg.png', name: 'FiveM' },
  { id: 'ark', url: '/backgrounds/ark-bg.png', name: 'ARK' },
  { id: 'discord', url: '/backgrounds/discord-bg.png', name: 'Discord Bot' },
  { id: 'samp', url: '/backgrounds/samp-bg.png', name: 'SA-MP' },
  { id: 'limbo', url: '/backgrounds/limbo-bg.png', name: 'Limbo' },
];

const HeroSection = () => {
  const { hardware, brand } = useGameStore();
  const { t } = useLanguage();
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto slideshow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentBgIndex((prev) => (prev + 1) % gameBackgrounds.length);
        setIsTransitioning(false);
      }, 500);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const currentBg = gameBackgrounds[currentBgIndex];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32">
      {/* Slideshow Background */}
      <div className="absolute inset-0">
        {/* Current Background */}
        <div 
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
          style={{ backgroundImage: `url(${currentBg.url})` }}
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
      </div>

      {/* Slideshow Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {gameBackgrounds.map((bg, index) => (
          <button
            key={bg.id}
            onClick={() => {
              setIsTransitioning(true);
              setTimeout(() => {
                setCurrentBgIndex(index);
                setIsTransitioning(false);
              }, 300);
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentBgIndex 
                ? 'w-8 bg-primary' 
                : 'bg-muted-foreground/50 hover:bg-muted-foreground'
            }`}
            aria-label={`Go to ${bg.name}`}
          />
        ))}
      </div>
      
      {/* Seasonal decorations */}
      <SeasonalDecorations position="corners" size="lg" />
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-left">
            {/* Badge */}
            <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full glass cyber-border mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                {brand.heroBadgeText || t('hero.badge')}
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="animate-fade-up-delay-1 font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1]">
              {brand.heroHeadline.split(" ").slice(0, -2).join(" ")}{" "}
              <span className="text-gradient">{brand.heroHeadline.split(" ").slice(-2).join(" ")}</span>
            </h1>

            {/* Subheading */}
            <p className="animate-fade-up-delay-2 text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
              {brand.heroSubheadline}
            </p>

            {/* CTA Buttons */}
            <div className="animate-fade-up-delay-3 flex flex-col sm:flex-row items-start gap-4 mb-10">
              <a href={brand.ctaLink}>
                <Button variant="hero" size="xl" className="group glow-neon">
                  {brand.ctaText}
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
              <Button variant="glass" size="xl">
                {t('hero.learnMore')}
              </Button>
            </div>

            {/* Stats */}
            <div className="animate-fade-up-delay-3 flex flex-wrap gap-8">
              {(brand.heroStats || [
                { value: "1000+", label: "Happy Customers" },
                { value: "99.9%", label: "Satisfaction Rate" },
                { value: "24/7", label: "Support Available" },
              ]).map((stat, index) => (
                <div key={index}>
                  <div className="font-display text-3xl font-bold text-gradient">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Feature Cards */}
          <div className="animate-fade-up-delay-2 space-y-4">
            {hardware.map((hw, index) => {
              const icons: Record<string, React.ReactNode> = {
                cpu: <Cpu className="w-5 h-5 text-primary" />,
                ram: <HardDrive className="w-5 h-5 text-primary" />,
                storage: <HardDrive className="w-5 h-5 text-primary" />,
                network: <Wifi className="w-5 h-5 text-primary" />,
              };
              return (
                <div
                  key={hw.id}
                  className="glass glass-hover rounded-2xl p-5 flex items-center gap-4 animate-slide-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    {icons[hw.id] || <Cpu className="w-5 h-5 text-primary" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{hw.name}</h3>
                    <p className="text-sm text-muted-foreground">{hw.specs}</p>
                  </div>
                </div>
              );
            })}
            
            {/* Trust Badge */}
            <div className="glass rounded-2xl p-5 border-primary/30 cyber-border">
              <div className="flex items-center gap-2 text-primary font-semibold mb-1">
                <Shield className="w-5 h-5" />
                {t('hero.satisfactionGuaranteed')}
              </div>
              <p className="text-sm text-muted-foreground">{t('hero.tryRiskFree')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
