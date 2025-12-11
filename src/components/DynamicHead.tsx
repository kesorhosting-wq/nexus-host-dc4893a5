import { useEffect } from "react";
import { useGameStore } from "@/store/gameStore";

export const DynamicHead = () => {
  const { brand } = useGameStore();

  useEffect(() => {
    // Update favicon
    if (brand.faviconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = brand.faviconUrl;
    }

    // Update OG image meta tags
    if (brand.ogImageUrl) {
      let ogImage = document.querySelector("meta[property='og:image']") as HTMLMetaElement;
      if (ogImage) {
        ogImage.content = brand.ogImageUrl;
      }
      
      let twitterImage = document.querySelector("meta[name='twitter:image']") as HTMLMetaElement;
      if (twitterImage) {
        twitterImage.content = brand.ogImageUrl;
      }
    }

    // Update title
    document.title = `${brand.name} | ${brand.tagline}`;

    // Update description
    let description = document.querySelector("meta[name='description']") as HTMLMetaElement;
    if (description) {
      description.content = brand.heroSubheadline;
    }

    // Update OG title
    let ogTitle = document.querySelector("meta[property='og:title']") as HTMLMetaElement;
    if (ogTitle) {
      ogTitle.content = `${brand.name} | ${brand.tagline}`;
    }

    // Update OG description
    let ogDesc = document.querySelector("meta[property='og:description']") as HTMLMetaElement;
    if (ogDesc) {
      ogDesc.content = brand.heroSubheadline;
    }
  }, [brand]);

  useEffect(() => {
    // Apply dynamic theme colors
    if (brand.primaryColor) {
      document.documentElement.style.setProperty('--primary', brand.primaryColor);
    }
    if (brand.accentColor) {
      document.documentElement.style.setProperty('--accent', brand.accentColor);
    }
  }, [brand.primaryColor, brand.accentColor]);

  return null;
};

export default DynamicHead;
