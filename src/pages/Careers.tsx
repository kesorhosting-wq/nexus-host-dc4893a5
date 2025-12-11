import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useGameStore } from "@/store/gameStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { MapPin, Briefcase, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const Careers = () => {
  const { brand } = useGameStore();
  const { t } = useLanguage();

  const jobs = [
    { title: "Senior DevOps Engineer", location: t('careers.remote'), type: t('careers.fullTime'), dept: "Engineering" },
    { title: "Customer Support Specialist", location: t('careers.remote'), type: t('careers.fullTime'), dept: "Support" },
    { title: "Frontend Developer", location: t('careers.remote'), type: t('careers.fullTime'), dept: "Engineering" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              {t('careers.title')} <span className="text-gradient">{brand.name}</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('careers.description')}
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {jobs.map((job, i) => (
              <div key={i} className="glass rounded-xl p-6 border border-border/50 hover:border-primary/50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-primary font-medium">{job.dept}</span>
                    <h2 className="font-display text-xl font-semibold mt-1">{job.title}</h2>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{job.type}</span>
                    </div>
                  </div>
                  <Button>{t('careers.applyNow')}</Button>
                </div>
              </div>
            ))}
          </div>

          {jobs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t('careers.noPositions')}</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Careers;
