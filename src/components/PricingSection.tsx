import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, Zap } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { usePricingContext } from "@/contexts/PricingContext";
import { useLanguage } from "@/contexts/LanguageContext";

// Plan images mapping
const planImages: Record<string, string> = {
  minecraft: '/plans/minecraft-plan.png',
  fivem: '/plans/fivem-plan.png',
  ark: '/plans/ark-plan.png',
  'discord-bot': '/plans/discord-plan.png',
  samp: '/plans/samp-plan.png',
  limbo: '/plans/limbo-plan.png',
};

const PricingSection = () => {
  const { games } = useGameStore();
  const { selectedGameId, setSelectedGameId } = usePricingContext();
  const { t } = useLanguage();
  const [localSelectedGame, setLocalSelectedGame] = useState(games[0]?.id || "minecraft");

  const enabledGames = games.filter((g) => g.enabled);
  
  // Update local state when context changes
  useEffect(() => {
    if (selectedGameId) {
      setLocalSelectedGame(selectedGameId);
      setSelectedGameId(null); // Reset after using
    }
  }, [selectedGameId, setSelectedGameId]);

  const currentGame = enabledGames.find((g) => g.id === localSelectedGame) || enabledGames[0];
  const currentPlanImage = planImages[localSelectedGame] || planImages.minecraft;

  return (
    <section id="pricing" className="py-24 relative">
      <div className="orb-neon w-[400px] h-[400px] top-20 -right-40" />
      <div className="orb-blue w-[300px] h-[300px] bottom-20 -left-40" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8">
          <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em] mb-4 block">
            {t('pricing.subtitle')}
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            {t('pricing.title')} <span className="text-gradient">{t('pricing.titleHighlight')}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('pricing.description')}
          </p>
        </div>

        {/* Category Selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {enabledGames.map((game) => (
            <button
              key={game.id}
              onClick={() => setLocalSelectedGame(game.id)}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                localSelectedGame === game.id
                  ? "bg-primary text-primary-foreground glow-neon"
                  : "glass hover:bg-card/80"
              }`}
            >
              {game.icon.startsWith('/') || game.icon.startsWith('http') ? (
                <img src={game.icon} alt={game.name} className="w-6 h-6 mr-2 inline-block object-contain rounded" />
              ) : (
                <span className="mr-2">{game.icon}</span>
              )}
              {game.name}
            </button>
          ))}
        </div>

        {/* Pricing Cards */}
        {currentGame && (
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {currentGame.plans.map((plan, index) => {
              const isPopular = index === 1;
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl p-8 transition-all duration-500 hover:scale-[1.02] ${
                    isPopular
                      ? "glass border-primary/50 glow-neon"
                      : "glass glass-hover"
                  }`}
                >
                  {/* Popular Badge */}
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                        <Zap className="w-4 h-4" />
                        {t('pricing.mostPopular')}
                      </div>
                    </div>
                  )}

                  {/* Plan Image */}
                  <div className="flex justify-center mb-4">
                    <img 
                      src={currentPlanImage} 
                      alt={plan.name}
                      className="w-20 h-20 object-contain rounded-xl"
                    />
                  </div>

                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-end justify-center gap-1">
                      <span className="text-5xl font-display font-bold text-gradient">
                        ${plan.price.toFixed(2)}
                      </span>
                      <span className="text-muted-foreground mb-2">{t('pricing.month')}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-foreground">{plan.ram} {t('pricing.ram')}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-foreground">{plan.cpu}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-foreground">{plan.storage}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-foreground">{plan.slots}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-foreground">DDoS Protection</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-foreground">24/7 Support</span>
                    </li>
                  </ul>

                  {/* CTA */}
                  {plan.orderLink ? (
                    <a href={plan.orderLink} target="_blank" rel="noopener noreferrer">
                      <Button
                        variant={isPopular ? "hero" : "outline"}
                        className={`w-full ${isPopular ? "glow-neon" : ""}`}
                        size="lg"
                      >
                        {t('pricing.orderNow')}
                      </Button>
                    </a>
                  ) : (
                    <Button
                      variant={isPopular ? "hero" : "outline"}
                      className="w-full"
                      size="lg"
                      disabled
                    >
                      {t('pricing.comingSoon')}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Money Back Guarantee */}
        <p className="text-center mt-12 text-muted-foreground">
          {t('pricing.guarantee')}
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
