import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Zap, User } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { ThemeToggle } from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { brand } = useGameStore();
  const { t } = useLanguage();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navLinks = [
    { name: t('nav.services'), href: "#games" },
    { name: "Products", href: "/products", isRoute: true },
    { name: t('nav.pricing'), href: "#pricing" },
    { name: t('nav.features'), href: "#features" },
    { name: t('nav.locations'), href: "#locations" },
  ];

  return (
    <nav className="fixed top-6 left-0 right-0 z-40">
      <div className="container mx-auto px-4">
        <div className="glass rounded-2xl">
          <div className="flex items-center justify-between h-16 px-6">
            {/* Logo */}
            <a href="/" className="flex items-center gap-3 group">
              {brand.logoUrl ? (
                <img 
                  src={brand.logoUrl} 
                  alt={brand.name} 
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-display text-xl font-bold text-gradient">
                      {brand.name}
                    </span>
                  </div>
                </>
              )}
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                link.isRoute ? (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="font-medium text-muted-foreground hover:text-primary transition-colors duration-300 relative group"
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                  </Link>
                ) : (
                  <a
                    key={link.name}
                    href={link.href}
                    className="font-medium text-muted-foreground hover:text-primary transition-colors duration-300 relative group"
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                  </a>
                )
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <LanguageSwitcher />
              <ThemeToggle />
              {user ? (
                <Link to="/client">
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    {t('billing.dashboard')}
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    {t('billing.login')}
                  </Button>
                </Link>
              )}
              <a href={brand.ctaLink}>
                <Button variant="default" size="sm" className="gap-2">
                  {brand.ctaText}
                </Button>
              </a>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
              <button
                className="text-foreground"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden py-4 px-6 border-t border-border animate-fade-up">
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
                <div className="pt-4">
                  <a href={brand.ctaLink}>
                    <Button variant="default" size="sm" className="w-full">
                      {brand.ctaText}
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;