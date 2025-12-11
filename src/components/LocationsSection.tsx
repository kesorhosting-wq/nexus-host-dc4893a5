import { useGameStore } from "@/store/gameStore";
import worldMap from "@/assets/worldMap.webp";
import SeasonalDecorations from "./SeasonalDecorations";

const LocationsSection = () => {
  const { locations } = useGameStore();
  const enabledLocations = locations.filter((l) => l.enabled);

  // Location coordinates on the map (percentage based)
  const locationCoords: Record<string, { x: number; y: number }> = {
    "Singapore": { x: 72, y: 58 },
    "Cambodia": { x: 70, y: 52 },
    "Malaysia": { x: 71, y: 56 },
  };

  return (
    <section id="locations" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-secondary/10 to-background" />
      <div className="orb-neon w-[300px] h-[300px] bottom-20 -left-40 opacity-20" />
      
      {/* Seasonal decorations */}
      <SeasonalDecorations position="top-right" size="lg" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em] mb-4 block">Global Presence</span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Our <span className="text-gradient">Locations</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Strategic data centers for the best performance wherever you are.
          </p>
        </div>

        {/* World Map with Location Points */}
        <div className="relative max-w-5xl mx-auto mb-16">
          <div className="glass rounded-3xl p-4 md:p-8 overflow-hidden">
            <div className="relative">
              {/* Map Image */}
              <img 
                src={worldMap} 
                alt="World Map showing server locations" 
                className="w-full h-auto opacity-60"
              />
              
              {/* Location Points */}
              {enabledLocations.map((location) => {
                const coords = locationCoords[location.name];
                if (!coords) return null;
                
                return (
                  <div
                    key={location.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                    style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                  >
                    {/* Pulse Animation */}
                    <div className="absolute inset-0 w-8 h-8 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
                      <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping" />
                      <div className="absolute inset-1 bg-primary/40 rounded-full animate-ping animation-delay-200" />
                    </div>
                    
                    {/* Location Pin */}
                    <div className="relative z-10 w-4 h-4 bg-primary rounded-full border-2 border-primary shadow-lg shadow-primary/50 group-hover:scale-150 transition-transform duration-300" />
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="glass rounded-xl px-4 py-3 text-center whitespace-nowrap border border-primary/30">
                        <div className="text-2xl mb-1">{location.flag}</div>
                        <div className="font-display text-sm font-bold text-foreground">{location.name}</div>
                        <div className="text-xs text-muted-foreground">{location.country}</div>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-xs text-green-500 font-mono">{location.ping}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Location Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
          {enabledLocations.map((location) => (
            <div
              key={location.id}
              className="group relative glass glass-hover rounded-3xl p-6 text-center cursor-pointer"
            >
              {/* Ping Indicator */}
              <div className="absolute top-4 right-4">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-green-500 font-mono">{location.ping}</span>
                </div>
              </div>

              {/* Flag */}
              <div className="text-5xl mb-3">{location.flag}</div>

              {/* Location Info */}
              <h3 className="font-display text-xl font-bold text-foreground mb-1">
                {location.name}
              </h3>
              <p className="text-muted-foreground text-sm">{location.country}</p>

              {/* Hover Glow */}
              <div className="absolute inset-0 rounded-3xl border-2 border-primary/0 group-hover:border-primary/50 transition-all duration-300" />
            </div>
          ))}
        </div>

        {/* Network Stats */}
        <div className="flex flex-wrap justify-center gap-6">
          <div className="text-center glass rounded-2xl px-8 py-5">
            <div className="font-display text-3xl font-bold text-gradient mb-1">10 Tbps+</div>
            <div className="text-sm text-muted-foreground">Network Capacity</div>
          </div>
          <div className="text-center glass rounded-2xl px-8 py-5">
            <div className="font-display text-3xl font-bold text-gradient mb-1">&lt;1ms</div>
            <div className="text-sm text-muted-foreground">Internal Latency</div>
          </div>
          <div className="text-center glass rounded-2xl px-8 py-5">
            <div className="font-display text-3xl font-bold text-gradient mb-1">NVMe Gen4</div>
            <div className="text-sm text-muted-foreground">SSD Storage</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationsSection;