import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { usePricingContext } from "@/contexts/PricingContext";

const GamesSection = () => {
  const { games } = useGameStore();
  const { setSelectedGameId } = usePricingContext();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const enabledGames = games.filter((g) => g.enabled);

  const handleViewPlans = (gameId: string) => {
    setSelectedGameId(gameId);
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="games" className="py-24 relative">
      {/* Background Elements */}
      <div className="orb-purple w-[300px] h-[300px] top-0 left-1/4 opacity-20" />
      
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-4">
          <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em]">Our Services</span>
        </div>
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            What We <span className="text-gradient">Offer</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Customize this section with your own services or products. 
            Each card can be easily edited from the admin panel.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enabledGames.map((game, index) => (
            <div
              key={game.id}
              className="group relative glass rounded-3xl p-8 cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:border-primary/50"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br from-primary via-accent to-cyber-blue" />

              <div className="relative z-10">
                {/* Service Icon/Image */}
                <div className="w-20 h-20 mb-6 transition-transform duration-300 group-hover:scale-110">
                  {game.icon.startsWith('/') || game.icon.startsWith('http') ? (
                    <img 
                      src={game.icon} 
                      alt={game.name} 
                      className="w-full h-full object-contain rounded-xl"
                    />
                  ) : (
                    <span className="text-6xl">{game.icon}</span>
                  )}
                </div>

                {/* Service Info */}
                <h3 className="font-display text-2xl font-bold text-foreground mb-3 group-hover:text-gradient transition-all">
                  {game.name}
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">{game.description}</p>

                {/* Pricing Preview */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-primary font-bold text-lg">
                    From ${game.plans[0]?.price.toFixed(2)}/mo
                  </span>
                  <span className="text-sm text-muted-foreground px-3 py-1 rounded-full bg-muted">
                    {game.plans.length} plans
                  </span>
                </div>

                {/* CTA */}
                <Button
                  variant="outline"
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300"
                  onClick={() => handleViewPlans(game.id)}
                >
                  View Plans
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            Can't find what you're looking for?
          </p>
          <Button variant="ghost" className="text-primary hover:text-primary">
            Contact Us for Custom Solutions
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default GamesSection;