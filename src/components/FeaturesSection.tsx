import { Zap, Shield, Globe, Clock, Headphones, Settings } from "lucide-react";
import SeasonalDecorations from "./SeasonalDecorations";

const features = [
  {
    icon: Zap,
    title: "Instant Setup",
    description: "Get started in under 60 seconds. No technical knowledge required.",
  },
  {
    icon: Shield,
    title: "Secure & Protected",
    description: "Enterprise-grade security keeps your data safe at all times.",
  },
  {
    icon: Globe,
    title: "Global Network",
    description: "Multiple data centers for the lowest latency experience worldwide.",
  },
  {
    icon: Clock,
    title: "99.99% Uptime",
    description: "Guaranteed reliability backed by our industry-leading SLA.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Expert support team available around the clock when you need help.",
  },
  {
    icon: Settings,
    title: "Full Control",
    description: "Intuitive control panel with all the tools you need to succeed.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      <div className="orb-purple w-[400px] h-[400px] -top-40 -right-40 opacity-20" />
      
      {/* Seasonal decorations */}
      <SeasonalDecorations position="top-left" size="lg" />
      <SeasonalDecorations position="bottom-right" size="lg" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em] mb-4 block">Why Choose Us</span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Built for <span className="text-gradient">Success</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Every feature designed to give you the competitive edge you need.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative p-8 rounded-3xl glass glass-hover animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br from-primary via-accent to-cyber-blue" />

              {/* Icon */}
              <div className="relative mb-6 z-10">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="absolute inset-0 blur-xl bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Content */}
              <h3 className="font-display text-xl font-bold text-foreground mb-3 group-hover:text-gradient transition-all">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;