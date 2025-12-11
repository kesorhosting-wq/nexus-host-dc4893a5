import { useState, useEffect } from "react";
import { Palette } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ColorThemePickerProps {
  primaryColor?: string;
  accentColor?: string;
  onPrimaryChange: (color: string) => void;
  onAccentChange: (color: string) => void;
}

const presetThemes = [
  { name: "Emerald", primary: "142 70% 45%", accent: "280 100% 70%" },
  { name: "Ocean", primary: "200 100% 50%", accent: "180 100% 50%" },
  { name: "Sunset", primary: "25 100% 55%", accent: "340 100% 60%" },
  { name: "Royal", primary: "270 70% 55%", accent: "330 100% 65%" },
  { name: "Rose", primary: "350 80% 55%", accent: "280 80% 60%" },
  { name: "Golden", primary: "45 100% 50%", accent: "35 100% 55%" },
];

const hslToHex = (hsl: string): string => {
  const [h, s, l] = hsl.split(' ').map(v => parseFloat(v));
  const sNorm = s / 100;
  const lNorm = l / 100;
  
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = lNorm - c / 2;
  
  let r = 0, g = 0, b = 0;
  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  
  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const hexToHsl = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "142 70% 45%";
  
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }
  
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

export const ColorThemePicker = ({
  primaryColor = "142 70% 45%",
  accentColor = "280 100% 70%",
  onPrimaryChange,
  onAccentChange,
}: ColorThemePickerProps) => {
  const [primaryHex, setPrimaryHex] = useState(hslToHex(primaryColor));
  const [accentHex, setAccentHex] = useState(hslToHex(accentColor));

  useEffect(() => {
    setPrimaryHex(hslToHex(primaryColor));
  }, [primaryColor]);

  useEffect(() => {
    setAccentHex(hslToHex(accentColor));
  }, [accentColor]);

  const handlePrimaryHexChange = (hex: string) => {
    setPrimaryHex(hex);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      onPrimaryChange(hexToHsl(hex));
    }
  };

  const handleAccentHexChange = (hex: string) => {
    setAccentHex(hex);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      onAccentChange(hexToHsl(hex));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-3">
        <Palette className="w-5 h-5 text-primary" />
        <h3 className="font-display text-lg font-semibold">Color Theme</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Customize your site's primary and accent colors. Changes apply after saving.
      </p>

      {/* Preset Themes */}
      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">Quick Presets</label>
        <div className="flex flex-wrap gap-2">
          {presetThemes.map((theme) => (
            <Button
              key={theme.name}
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                onPrimaryChange(theme.primary);
                onAccentChange(theme.accent);
              }}
            >
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ background: `linear-gradient(135deg, hsl(${theme.primary}), hsl(${theme.accent}))` }}
              />
              {theme.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Primary Color</label>
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-lg border border-border flex-shrink-0"
              style={{ backgroundColor: `hsl(${primaryColor})` }}
            />
            <div className="flex-1 space-y-2">
              <Input
                type="color"
                value={primaryHex}
                onChange={(e) => handlePrimaryHexChange(e.target.value)}
                className="h-10 w-full cursor-pointer"
              />
              <Input
                type="text"
                value={primaryHex}
                onChange={(e) => handlePrimaryHexChange(e.target.value)}
                placeholder="#22c55e"
                className="bg-background/50 border-border text-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Accent Color</label>
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-lg border border-border flex-shrink-0"
              style={{ backgroundColor: `hsl(${accentColor})` }}
            />
            <div className="flex-1 space-y-2">
              <Input
                type="color"
                value={accentHex}
                onChange={(e) => handleAccentHexChange(e.target.value)}
                className="h-10 w-full cursor-pointer"
              />
              <Input
                type="text"
                value={accentHex}
                onChange={(e) => handleAccentHexChange(e.target.value)}
                placeholder="#a855f7"
                className="bg-background/50 border-border text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="p-4 rounded-xl border border-border bg-muted/30">
        <label className="text-sm font-medium text-foreground mb-3 block">Preview</label>
        <div 
          className="h-16 rounded-lg flex items-center justify-center text-white font-bold"
          style={{ 
            background: `linear-gradient(135deg, hsl(${primaryColor}), hsl(${accentColor}))` 
          }}
        >
          Your Brand Gradient
        </div>
      </div>
    </div>
  );
};

export default ColorThemePicker;
