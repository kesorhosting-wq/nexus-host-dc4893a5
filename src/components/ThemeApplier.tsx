import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

const ThemeApplier = () => {
  const { brand } = useGameStore();

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply light theme colors
    if (brand.lightThemePrimary) {
      root.style.setProperty('--primary-light', brand.lightThemePrimary);
    }
    if (brand.lightThemeAccent) {
      root.style.setProperty('--accent-light', brand.lightThemeAccent);
    }
    
    // Apply dark theme colors
    if (brand.darkThemePrimary) {
      root.style.setProperty('--primary-dark', brand.darkThemePrimary);
    }
    if (brand.darkThemeAccent) {
      root.style.setProperty('--accent-dark', brand.darkThemeAccent);
    }

    // Apply based on current theme
    const isDark = root.classList.contains('dark');
    
    if (isDark) {
      if (brand.darkThemePrimary) {
        root.style.setProperty('--primary', brand.darkThemePrimary);
        root.style.setProperty('--ring', brand.darkThemePrimary);
        root.style.setProperty('--neon', brand.darkThemePrimary);
      }
      if (brand.darkThemeAccent) {
        root.style.setProperty('--accent', brand.darkThemeAccent);
        root.style.setProperty('--cyber-purple', brand.darkThemeAccent);
      }
    } else {
      if (brand.lightThemePrimary) {
        root.style.setProperty('--primary', brand.lightThemePrimary);
        root.style.setProperty('--ring', brand.lightThemePrimary);
        root.style.setProperty('--neon', brand.lightThemePrimary);
      }
      if (brand.lightThemeAccent) {
        root.style.setProperty('--accent', brand.lightThemeAccent);
        root.style.setProperty('--cyber-purple', brand.lightThemeAccent);
      }
    }
  }, [brand.lightThemePrimary, brand.lightThemeAccent, brand.darkThemePrimary, brand.darkThemeAccent]);

  // Also listen for theme changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const root = document.documentElement;
          const isDark = root.classList.contains('dark');
          
          if (isDark) {
            if (brand.darkThemePrimary) {
              root.style.setProperty('--primary', brand.darkThemePrimary);
              root.style.setProperty('--ring', brand.darkThemePrimary);
              root.style.setProperty('--neon', brand.darkThemePrimary);
            }
            if (brand.darkThemeAccent) {
              root.style.setProperty('--accent', brand.darkThemeAccent);
              root.style.setProperty('--cyber-purple', brand.darkThemeAccent);
            }
          } else {
            if (brand.lightThemePrimary) {
              root.style.setProperty('--primary', brand.lightThemePrimary);
              root.style.setProperty('--ring', brand.lightThemePrimary);
              root.style.setProperty('--neon', brand.lightThemePrimary);
            }
            if (brand.lightThemeAccent) {
              root.style.setProperty('--accent', brand.lightThemeAccent);
              root.style.setProperty('--cyber-purple', brand.lightThemeAccent);
            }
          }
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, [brand]);

  return null;
};

export default ThemeApplier;
