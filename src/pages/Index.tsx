import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import GamesSection from "@/components/GamesSection";
import FeaturesSection from "@/components/FeaturesSection";
import PricingSection from "@/components/PricingSection";
import LocationsSection from "@/components/LocationsSection";
import Footer from "@/components/Footer";
import SeasonalEffects from "@/components/SeasonalEffects";
import { PricingProvider } from "@/contexts/PricingContext";
import { useDataSync } from "@/hooks/useDataSync";
import { useBranding } from "@/hooks/useBranding";

const Index = () => {
  // Load data from database
  const { loading: dataLoading } = useDataSync();
  const { loading: brandLoading } = useBranding();

  if (dataLoading || brandLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <PricingProvider>
      <div className="min-h-screen bg-background">
        <SeasonalEffects />
        <Navbar />
        <main>
          <HeroSection />
          <GamesSection />
          <FeaturesSection />
          <PricingSection />
          <LocationsSection />
        </main>
        <Footer />
      </div>
    </PricingProvider>
  );
};

export default Index;