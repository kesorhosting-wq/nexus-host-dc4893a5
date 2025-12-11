import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HeroStat } from "@/store/gameStore";

interface HeroStatsEditorProps {
  stats: HeroStat[];
  badgeText: string;
  onStatsChange: (stats: HeroStat[]) => void;
  onBadgeChange: (text: string) => void;
}

export const HeroStatsEditor = ({
  stats,
  badgeText,
  onStatsChange,
  onBadgeChange,
}: HeroStatsEditorProps) => {
  const handleStatChange = (index: number, field: keyof HeroStat, value: string) => {
    const newStats = [...stats];
    newStats[index] = { ...newStats[index], [field]: value };
    onStatsChange(newStats);
  };

  const handleAddStat = () => {
    if (stats.length < 5) {
      onStatsChange([...stats, { value: "100+", label: "New Stat" }]);
    }
  };

  const handleRemoveStat = (index: number) => {
    onStatsChange(stats.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Badge Text */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Hero Badge Text</label>
        <Input
          placeholder="Your Brand • Your Message • Your Values"
          value={badgeText}
          onChange={(e) => onBadgeChange(e.target.value)}
          className="bg-background/50 border-border"
        />
        <p className="text-xs text-muted-foreground mt-1">
          This appears as the badge above your main headline
        </p>
      </div>

      {/* Stats Editor */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-foreground">Hero Stats</label>
          {stats.length < 5 && (
            <Button variant="outline" size="sm" onClick={handleAddStat} className="gap-1">
              <Plus className="w-3 h-3" />
              Add Stat
            </Button>
          )}
        </div>
        
        <div className="space-y-3">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <Input
                  placeholder="1000+"
                  value={stat.value}
                  onChange={(e) => handleStatChange(index, "value", e.target.value)}
                  className="bg-background/50 border-border"
                />
                <Input
                  placeholder="Happy Customers"
                  value={stat.label}
                  onChange={(e) => handleStatChange(index, "label", e.target.value)}
                  className="bg-background/50 border-border"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveStat(index)}
                className="flex-shrink-0"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
        
        {stats.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No stats added. Click "Add Stat" to create one.
          </p>
        )}
      </div>
    </div>
  );
};

export default HeroStatsEditor;
