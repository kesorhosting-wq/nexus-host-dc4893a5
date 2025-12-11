import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GamePlan {
  id: string;
  name: string;
  ram: string;
  cpu: string;
  storage: string;
  slots: string;
  price: number;
  orderLink?: string;
}

export interface Game {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  plans: GamePlan[];
}

export interface Hardware {
  id: string;
  name: string;
  description: string;
  specs: string;
}

export interface Location {
  id: string;
  name: string;
  country: string;
  flag: string;
  ping: string;
  enabled: boolean;
}

export interface SeasonalTheme {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  decorations: string[];
}

export interface HeroStat {
  value: string;
  label: string;
}

export interface BrandSettings {
  name: string;
  tagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  ctaText: string;
  ctaLink: string;
  logoUrl?: string;
  heroBackgroundUrl?: string;
  faviconUrl?: string;
  ogImageUrl?: string;
  heroBadgeText?: string;
  heroStats?: HeroStat[];
  primaryColor?: string;
  accentColor?: string;
  // Theme colors (admin configurable)
  lightThemeName?: string;
  lightThemePrimary?: string;
  lightThemeAccent?: string;
  darkThemeName?: string;
  darkThemePrimary?: string;
  darkThemeAccent?: string;
  // Social links
  socialFacebook?: string;
  socialTiktok?: string;
  socialTelegram?: string;
  socialYoutube?: string;
  footerDescription?: string;
}

interface GameStore {
  games: Game[];
  hardware: Hardware[];
  locations: Location[];
  seasonalThemes: SeasonalTheme[];
  brand: BrandSettings;
  setGames: (games: Game[]) => void;
  addGame: (game: Game) => void;
  updateGame: (id: string, game: Partial<Game>) => void;
  deleteGame: (id: string) => void;
  addHardware: (hardware: Hardware) => void;
  updateHardware: (id: string, hardware: Partial<Hardware>) => void;
  deleteHardware: (id: string) => void;
  updateLocation: (id: string, location: Partial<Location>) => void;
  updateSeasonalTheme: (id: string, theme: Partial<SeasonalTheme>) => void;
  updateBrand: (brand: Partial<BrandSettings>) => void;
}

const defaultGames: Game[] = [
  {
    id: "minecraft",
    name: "Minecraft",
    description: "Java & Bedrock servers with full mod support",
    icon: "⛏️",
    enabled: true,
    plans: [
      { id: "mc-starter", name: "Starter", ram: "2GB", cpu: "2 vCores", storage: "10GB NVMe", slots: "10 Players", price: 2.99 },
      { id: "mc-pro", name: "Pro", ram: "4GB", cpu: "3 vCores", storage: "25GB NVMe", slots: "50 Players", price: 5.99 },
      { id: "mc-premium", name: "Premium", ram: "8GB", cpu: "4 vCores", storage: "50GB NVMe", slots: "100 Players", price: 11.99 },
    ],
  },
  {
    id: "fivem",
    name: "FiveM",
    description: "High-performance GTA V multiplayer servers",
    icon: "🚗",
    enabled: true,
    plans: [
      { id: "fm-starter", name: "Starter", ram: "4GB", cpu: "3 vCores", storage: "30GB NVMe", slots: "32 Players", price: 9.99 },
      { id: "fm-pro", name: "Pro", ram: "8GB", cpu: "4 vCores", storage: "60GB NVMe", slots: "64 Players", price: 19.99 },
      { id: "fm-premium", name: "Premium", ram: "16GB", cpu: "6 vCores", storage: "120GB NVMe", slots: "128 Players", price: 39.99 },
    ],
  },
  {
    id: "rust",
    name: "Rust",
    description: "Survival game servers with oxide support",
    icon: "🔧",
    enabled: true,
    plans: [
      { id: "rust-starter", name: "Starter", ram: "8GB", cpu: "4 vCores", storage: "50GB NVMe", slots: "50 Players", price: 14.99 },
      { id: "rust-pro", name: "Pro", ram: "16GB", cpu: "6 vCores", storage: "100GB NVMe", slots: "150 Players", price: 29.99 },
      { id: "rust-premium", name: "Premium", ram: "32GB", cpu: "8 vCores", storage: "200GB NVMe", slots: "300 Players", price: 54.99 },
    ],
  },
  {
    id: "palworld",
    name: "Palworld",
    description: "Creature collection multiplayer servers",
    icon: "🐾",
    enabled: true,
    plans: [
      { id: "pal-starter", name: "Starter", ram: "8GB", cpu: "4 vCores", storage: "30GB NVMe", slots: "8 Players", price: 12.99 },
      { id: "pal-pro", name: "Pro", ram: "16GB", cpu: "6 vCores", storage: "60GB NVMe", slots: "16 Players", price: 24.99 },
      { id: "pal-premium", name: "Premium", ram: "32GB", cpu: "8 vCores", storage: "100GB NVMe", slots: "32 Players", price: 44.99 },
    ],
  },
  {
    id: "ark",
    name: "ARK: Survival",
    description: "Dinosaur survival servers with mod support",
    icon: "🦖",
    enabled: true,
    plans: [
      { id: "ark-starter", name: "Starter", ram: "8GB", cpu: "4 vCores", storage: "50GB NVMe", slots: "20 Players", price: 15.99 },
      { id: "ark-pro", name: "Pro", ram: "16GB", cpu: "6 vCores", storage: "100GB NVMe", slots: "50 Players", price: 29.99 },
      { id: "ark-premium", name: "Premium", ram: "32GB", cpu: "8 vCores", storage: "200GB NVMe", slots: "100 Players", price: 54.99 },
    ],
  },
  {
    id: "valheim",
    name: "Valheim",
    description: "Viking exploration multiplayer servers",
    icon: "⚔️",
    enabled: true,
    plans: [
      { id: "val-starter", name: "Starter", ram: "4GB", cpu: "2 vCores", storage: "20GB NVMe", slots: "10 Players", price: 6.99 },
      { id: "val-pro", name: "Pro", ram: "8GB", cpu: "4 vCores", storage: "40GB NVMe", slots: "32 Players", price: 12.99 },
      { id: "val-premium", name: "Premium", ram: "16GB", cpu: "6 vCores", storage: "80GB NVMe", slots: "64 Players", price: 24.99 },
    ],
  },
];

const defaultHardware: Hardware[] = [
  { id: "cpu", name: "AMD EPYC 9654", description: "96-Core Processor", specs: "Up to 3.7GHz Boost" },
  { id: "ram", name: "DDR5 ECC RAM", description: "Error Correcting Memory", specs: "4800MHz Speed" },
  { id: "storage", name: "NVMe Gen4 SSD", description: "Ultra-fast Storage", specs: "7000MB/s Read" },
  { id: "network", name: "10Gbps Network", description: "Enterprise Connectivity", specs: "DDoS Protected" },
];

const defaultLocations: Location[] = [
  { id: "sg", name: "Singapore", country: "Singapore", flag: "🇸🇬", ping: "5ms", enabled: true },
  { id: "kh", name: "Phnom Penh", country: "Cambodia", flag: "🇰🇭", ping: "12ms", enabled: true },
  { id: "my", name: "Kuala Lumpur", country: "Malaysia", flag: "🇲🇾", ping: "8ms", enabled: true },
];

const defaultSeasonalThemes: SeasonalTheme[] = [
  { 
    id: "christmas", 
    name: "Christmas", 
    icon: "🎄", 
    enabled: false, 
    decorations: ["🎄", "🎅", "🦌", "❄️", "🎁", "⛄"]
  },
  { 
    id: "halloween", 
    name: "Halloween", 
    icon: "🎃", 
    enabled: false, 
    decorations: ["🎃", "👻", "🦇", "🕷️", "💀", "🕸️"]
  },
  { 
    id: "newyear", 
    name: "New Year", 
    icon: "🎆", 
    enabled: false, 
    decorations: ["🎆", "🎇", "🥳", "🎉", "✨", "🍾"]
  },
  { 
    id: "valentine", 
    name: "Valentine", 
    icon: "💝", 
    enabled: false, 
    decorations: ["💝", "💕", "❤️", "🌹", "💘", "💖"]
  },
  { 
    id: "easter", 
    name: "Easter", 
    icon: "🐰", 
    enabled: false, 
    decorations: ["🐰", "🥚", "🐣", "🌷", "🦋", "🌸"]
  },
];

const defaultBrand: BrandSettings = {
  name: "Your Brand",
  tagline: "Premium Services",
  heroHeadline: "Your Headline Goes Here",
  heroSubheadline: "Add your compelling description here. Explain what makes your service unique and why customers should choose you.",
  ctaText: "Get Started Now",
  ctaLink: "#pricing",
  logoUrl: "",
  heroBackgroundUrl: "",
  faviconUrl: "",
  ogImageUrl: "",
  heroBadgeText: "Your Brand • Your Message • Your Values",
  heroStats: [
    { value: "1000+", label: "Happy Customers" },
    { value: "99.9%", label: "Satisfaction Rate" },
    { value: "24/7", label: "Support Available" },
  ],
  primaryColor: "220 15% 45%",
  accentColor: "220 20% 60%",
  lightThemeName: "Premium Silver",
  lightThemePrimary: "220 15% 45%",
  lightThemeAccent: "220 20% 60%",
  darkThemeName: "Premium Gold",
  darkThemePrimary: "45 80% 50%",
  darkThemeAccent: "35 70% 45%",
};

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      games: defaultGames,
      hardware: defaultHardware,
      locations: defaultLocations,
      seasonalThemes: defaultSeasonalThemes,
      brand: defaultBrand,
      setGames: (games) => set({ games }),
      addGame: (game) => set((state) => ({ games: [...state.games, game] })),
      updateGame: (id, updatedGame) =>
        set((state) => ({
          games: state.games.map((g) => (g.id === id ? { ...g, ...updatedGame } : g)),
        })),
      deleteGame: (id) => set((state) => ({ games: state.games.filter((g) => g.id !== id) })),
      addHardware: (hardware) => set((state) => ({ hardware: [...state.hardware, hardware] })),
      updateHardware: (id, updatedHardware) =>
        set((state) => ({
          hardware: state.hardware.map((h) => (h.id === id ? { ...h, ...updatedHardware } : h)),
        })),
      deleteHardware: (id) => set((state) => ({ hardware: state.hardware.filter((h) => h.id !== id) })),
      updateLocation: (id, updatedLocation) =>
        set((state) => ({
          locations: state.locations.map((l) => (l.id === id ? { ...l, ...updatedLocation } : l)),
        })),
      updateSeasonalTheme: (id, updatedTheme) =>
        set((state) => ({
          seasonalThemes: state.seasonalThemes.map((t) => (t.id === id ? { ...t, ...updatedTheme } : t)),
        })),
      updateBrand: (updatedBrand) =>
        set((state) => ({
          brand: { ...state.brand, ...updatedBrand },
        })),
    }),
    { name: 'game-hosting-store' }
  )
);