import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGameStore, BrandSettings, HeroStat } from '@/store/gameStore';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

const BRANDING_ID = '00000000-0000-0000-0000-000000000001';

export const useBranding = () => {
  const { brand, updateBrand } = useGameStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Fetch branding from database on mount
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const { data, error } = await supabase
          .from('branding_settings')
          .select('*')
          .eq('id', BRANDING_ID)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const heroStats = Array.isArray(data.hero_stats) 
            ? (data.hero_stats as unknown as HeroStat[])
            : [];
          updateBrand({
            name: data.site_name,
            tagline: data.tagline || '',
            logoUrl: data.logo_url || '',
            heroBackgroundUrl: data.hero_background_url || '',
            faviconUrl: data.favicon_url || '',
            ogImageUrl: data.og_image_url || '',
            primaryColor: data.primary_color || '',
            accentColor: data.accent_color || '',
            heroHeadline: data.hero_title || '',
            heroSubheadline: data.hero_subtitle || '',
            heroStats,
            lightThemeName: data.light_theme_name || 'Premium Silver',
            lightThemePrimary: data.light_theme_primary || '220 15% 45%',
            lightThemeAccent: data.light_theme_accent || '220 20% 60%',
            darkThemeName: data.dark_theme_name || 'Premium Gold',
            darkThemePrimary: data.dark_theme_primary || '45 80% 50%',
            darkThemeAccent: data.dark_theme_accent || '35 70% 45%',
            socialFacebook: (data as any).social_facebook || '',
            socialTiktok: (data as any).social_tiktok || '',
            socialTelegram: (data as any).social_telegram || '',
            socialYoutube: (data as any).social_youtube || '',
            footerDescription: (data as any).footer_description || '',
          });
        }
      } catch (error) {
        console.error('Error fetching branding:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBranding();
  }, []);

  // Save branding to database
  const saveBranding = async (brandData: Partial<BrandSettings>) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('branding_settings')
        .update({
          site_name: brandData.name ?? brand.name,
          tagline: brandData.tagline ?? brand.tagline,
          logo_url: brandData.logoUrl ?? brand.logoUrl,
          hero_background_url: brandData.heroBackgroundUrl ?? brand.heroBackgroundUrl,
          favicon_url: brandData.faviconUrl ?? brand.faviconUrl,
          og_image_url: brandData.ogImageUrl ?? brand.ogImageUrl,
          primary_color: brandData.primaryColor ?? brand.primaryColor,
          accent_color: brandData.accentColor ?? brand.accentColor,
          hero_title: brandData.heroHeadline ?? brand.heroHeadline,
          hero_subtitle: brandData.heroSubheadline ?? brand.heroSubheadline,
          hero_stats: (brandData.heroStats ?? brand.heroStats) as unknown as Json,
          light_theme_name: brandData.lightThemeName ?? brand.lightThemeName,
          light_theme_primary: brandData.lightThemePrimary ?? brand.lightThemePrimary,
          light_theme_accent: brandData.lightThemeAccent ?? brand.lightThemeAccent,
          dark_theme_name: brandData.darkThemeName ?? brand.darkThemeName,
          dark_theme_primary: brandData.darkThemePrimary ?? brand.darkThemePrimary,
          dark_theme_accent: brandData.darkThemeAccent ?? brand.darkThemeAccent,
          social_facebook: brandData.socialFacebook ?? brand.socialFacebook,
          social_tiktok: brandData.socialTiktok ?? brand.socialTiktok,
          social_telegram: brandData.socialTelegram ?? brand.socialTelegram,
          social_youtube: brandData.socialYoutube ?? brand.socialYoutube,
          footer_description: brandData.footerDescription ?? brand.footerDescription,
        })
        .eq('id', BRANDING_ID);

      if (error) throw error;

      updateBrand(brandData);
      toast({
        title: 'Success',
        description: 'Branding settings saved to all devices',
      });
    } catch (error) {
      console.error('Error saving branding:', error);
      toast({
        title: 'Error',
        description: 'Failed to save branding settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return { brand, loading, saving, saveBranding, updateBrand };
};
