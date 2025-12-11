import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BrandSettings } from "@/store/gameStore";

interface ThemeEditorProps {
  editBrand: BrandSettings;
  setEditBrand: (brand: BrandSettings) => void;
}

const presetThemes = {
  light: [
    { name: 'Premium Silver', primary: '220 15% 45%', accent: '220 20% 60%' },
    { name: 'Ocean Blue', primary: '210 80% 50%', accent: '200 70% 60%' },
    { name: 'Forest Green', primary: '150 60% 40%', accent: '140 50% 50%' },
    { name: 'Royal Purple', primary: '270 60% 50%', accent: '280 50% 60%' },
    { name: 'Warm Orange', primary: '25 90% 50%', accent: '35 80% 55%' },
  ],
  dark: [
    { name: 'Premium Gold', primary: '45 80% 50%', accent: '35 70% 45%' },
    { name: 'Neon Cyan', primary: '180 100% 50%', accent: '170 80% 55%' },
    { name: 'Electric Purple', primary: '280 80% 60%', accent: '290 70% 55%' },
    { name: 'Emerald', primary: '155 80% 45%', accent: '145 70% 50%' },
    { name: 'Rose Gold', primary: '350 70% 60%', accent: '340 60% 55%' },
  ],
};

const ThemeEditor = ({ editBrand, setEditBrand }: ThemeEditorProps) => {
  const hslToHex = (hsl: string): string => {
    const parts = hsl.split(' ').map(p => parseFloat(p));
    if (parts.length !== 3) return '#888888';
    const [h, s, l] = parts;
    const sNorm = s / 100;
    const lNorm = l / 100;
    const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = lNorm - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const hexToHsl = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '220 15% 45%';
    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
        case g: h = ((b - r) / d + 2); break;
        case b: h = ((r - g) / d + 4); break;
      }
      h *= 60;
    }
    return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Light Theme */}
      <div className="space-y-4">
        <h4 className="font-semibold text-foreground">Light Theme (Premium Silver)</h4>
        <div className="flex flex-wrap gap-2 mb-4">
          {presetThemes.light.map((preset) => (
            <button
              key={preset.name}
              onClick={() => setEditBrand({
                ...editBrand,
                lightThemeName: preset.name,
                lightThemePrimary: preset.primary,
                lightThemeAccent: preset.accent,
              })}
              className={`px-3 py-2 rounded-lg text-sm transition-all border ${
                editBrand.lightThemeName === preset.name 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: hslToHex(preset.primary) }}
                />
                {preset.name}
              </div>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Primary Color</Label>
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                value={hslToHex(editBrand.lightThemePrimary || '220 15% 45%')}
                onChange={(e) => setEditBrand({
                  ...editBrand,
                  lightThemePrimary: hexToHsl(e.target.value),
                })}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <Input
                value={editBrand.lightThemePrimary || ''}
                onChange={(e) => setEditBrand({ ...editBrand, lightThemePrimary: e.target.value })}
                placeholder="220 15% 45%"
              />
            </div>
          </div>
          <div>
            <Label>Accent Color</Label>
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                value={hslToHex(editBrand.lightThemeAccent || '220 20% 60%')}
                onChange={(e) => setEditBrand({
                  ...editBrand,
                  lightThemeAccent: hexToHsl(e.target.value),
                })}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <Input
                value={editBrand.lightThemeAccent || ''}
                onChange={(e) => setEditBrand({ ...editBrand, lightThemeAccent: e.target.value })}
                placeholder="220 20% 60%"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dark Theme */}
      <div className="space-y-4">
        <h4 className="font-semibold text-foreground">Dark Theme (Premium Gold)</h4>
        <div className="flex flex-wrap gap-2 mb-4">
          {presetThemes.dark.map((preset) => (
            <button
              key={preset.name}
              onClick={() => setEditBrand({
                ...editBrand,
                darkThemeName: preset.name,
                darkThemePrimary: preset.primary,
                darkThemeAccent: preset.accent,
              })}
              className={`px-3 py-2 rounded-lg text-sm transition-all border ${
                editBrand.darkThemeName === preset.name 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: hslToHex(preset.primary) }}
                />
                {preset.name}
              </div>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Primary Color</Label>
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                value={hslToHex(editBrand.darkThemePrimary || '45 80% 50%')}
                onChange={(e) => setEditBrand({
                  ...editBrand,
                  darkThemePrimary: hexToHsl(e.target.value),
                })}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <Input
                value={editBrand.darkThemePrimary || ''}
                onChange={(e) => setEditBrand({ ...editBrand, darkThemePrimary: e.target.value })}
                placeholder="45 80% 50%"
              />
            </div>
          </div>
          <div>
            <Label>Accent Color</Label>
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                value={hslToHex(editBrand.darkThemeAccent || '35 70% 45%')}
                onChange={(e) => setEditBrand({
                  ...editBrand,
                  darkThemeAccent: hexToHsl(e.target.value),
                })}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <Input
                value={editBrand.darkThemeAccent || ''}
                onChange={(e) => setEditBrand({ ...editBrand, darkThemeAccent: e.target.value })}
                placeholder="35 70% 45%"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <Label>Theme Preview</Label>
        <div className="grid grid-cols-2 gap-4">
          <div 
            className="p-4 rounded-lg border"
            style={{ backgroundColor: '#f5f5f5' }}
          >
            <p className="text-sm font-medium mb-2" style={{ color: '#333' }}>Light Mode</p>
            <div className="flex gap-2">
              <div 
                className="w-8 h-8 rounded-full" 
                style={{ backgroundColor: hslToHex(editBrand.lightThemePrimary || '220 15% 45%') }}
              />
              <div 
                className="w-8 h-8 rounded-full" 
                style={{ backgroundColor: hslToHex(editBrand.lightThemeAccent || '220 20% 60%') }}
              />
            </div>
          </div>
          <div 
            className="p-4 rounded-lg border"
            style={{ backgroundColor: '#1a1a1a' }}
          >
            <p className="text-sm font-medium mb-2" style={{ color: '#fff' }}>Dark Mode</p>
            <div className="flex gap-2">
              <div 
                className="w-8 h-8 rounded-full" 
                style={{ backgroundColor: hslToHex(editBrand.darkThemePrimary || '45 80% 50%') }}
              />
              <div 
                className="w-8 h-8 rounded-full" 
                style={{ backgroundColor: hslToHex(editBrand.darkThemeAccent || '35 70% 45%') }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeEditor;
