import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGameStore, Game, GamePlan, Hardware, HeroStat } from "@/store/gameStore";
import { Plus, Trash2, Save, Gamepad2, HardDrive, MapPin, X, LogOut, Shield, Palette, Sparkles, Home, Server, CreditCard, Loader2, Image, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useBranding } from "@/hooks/useBranding";
import { useDataSync } from "@/hooks/useDataSync";
import { LogoUpload } from "@/components/admin/LogoUpload";
import HeroBackgroundUpload from "@/components/admin/HeroBackgroundUpload";
import FaviconOgUpload from "@/components/admin/FaviconOgUpload";
import ColorThemePicker from "@/components/admin/ColorThemePicker";
import HeroStatsEditor from "@/components/admin/HeroStatsEditor";
import ThemeEditor from "@/components/admin/ThemeEditor";
import PterodactylConfig from "@/components/admin/PterodactylConfig";
import PlanPterodactylEditor from "@/components/admin/PlanPterodactylEditor";
import BakongConfig from "@/components/admin/BakongConfig";
import RenewalReminders from "@/components/admin/RenewalReminders";

const Admin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading, isAdmin, signOut } = useAuth();
  const { saveBranding, saving } = useBranding();
  const { saveGame, deleteGame: deleteGameFromDb, saveLocation, saveSeasonalTheme, syncing } = useDataSync();
  const { 
    games, hardware, locations, seasonalThemes, brand,
    updateGame, addGame, deleteGame, updateHardware, addHardware, deleteHardware, 
    updateLocation, updateSeasonalTheme, updateBrand 
  } = useGameStore();
  
  const [activeTab, setActiveTab] = useState<"games" | "hardware" | "locations" | "themes" | "brand" | "pterodactyl" | "billing">("games");
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [newGame, setNewGame] = useState<Partial<Game>>({ name: "", description: "", icon: "/games/minecraft-icon.png", enabled: true, plans: [] });
  const [newPlan, setNewPlan] = useState<Partial<GamePlan>>({ name: "", ram: "", cpu: "", storage: "", slots: "", price: 0 });
  const [newHardware, setNewHardware] = useState<Partial<Hardware>>({ name: "", description: "", specs: "" });
  const [editBrand, setEditBrand] = useState(brand);

  useEffect(() => {
    setEditBrand(brand);
  }, [brand]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!loading && user && !isAdmin) {
      toast({ 
        title: "Access Denied", 
        description: "You don't have admin privileges.",
        variant: "destructive" 
      });
      navigate("/");
    }
  }, [user, loading, isAdmin, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const handleSaveGame = async () => {
    if (editingGame) {
      await saveGame(editingGame);
      setEditingGame(null);
    }
  };

  const handleAddGame = async () => {
    if (newGame.name && newGame.description) {
      const game: Game = {
        id: newGame.name.toLowerCase().replace(/\s+/g, "-"),
        name: newGame.name,
        description: newGame.description,
        icon: newGame.icon || "/games/minecraft-icon.png",
        enabled: true,
        plans: [],
      };
      await saveGame(game);
      setNewGame({ name: "", description: "", icon: "/games/minecraft-icon.png", enabled: true, plans: [] });
    }
  };

  const handleAddPlan = () => {
    if (editingGame && newPlan.name && newPlan.ram) {
      const plan: GamePlan = {
        id: `${editingGame.id}-${newPlan.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: newPlan.name,
        ram: newPlan.ram,
        cpu: newPlan.cpu || "",
        storage: newPlan.storage || "",
        slots: newPlan.slots || "",
        price: Number(newPlan.price) || 0,
      };
      setEditingGame({
        ...editingGame,
        plans: [...editingGame.plans, plan],
      });
      setNewPlan({ name: "", ram: "", cpu: "", storage: "", slots: "", price: 0 });
    }
  };

  const handleRemovePlan = (planId: string) => {
    if (editingGame) {
      setEditingGame({
        ...editingGame,
        plans: editingGame.plans.filter((p) => p.id !== planId),
      });
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    await deleteGameFromDb(gameId);
  };

  const handleAddHardware = () => {
    if (newHardware.name && newHardware.description) {
      const hw: Hardware = {
        id: newHardware.name.toLowerCase().replace(/\s+/g, "-"),
        name: newHardware.name,
        description: newHardware.description,
        specs: newHardware.specs || "",
      };
      addHardware(hw);
      setNewHardware({ name: "", description: "", specs: "" });
      toast({ title: "Hardware added successfully!" });
    }
  };

  const handleSaveBrand = async () => {
    await saveBranding(editBrand);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleLocationToggle = async (loc: any) => {
    const updated = { ...loc, enabled: !loc.enabled };
    await saveLocation(updated);
  };

  const handleThemeToggle = async (theme: any) => {
    // Disable all other themes
    for (const t of seasonalThemes) {
      if (t.id !== theme.id && t.enabled) {
        await saveSeasonalTheme({ ...t, enabled: false });
      }
    }
    await saveSeasonalTheme({ ...theme, enabled: !theme.enabled });
    toast({ 
      title: theme.enabled ? `${theme.name} theme disabled` : `${theme.name} theme enabled!` 
    });
  };

  return (
    <div className="min-h-screen bg-background p-8 relative">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/20 border border-primary/30">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-gradient">Admin Panel</h1>
              <p className="text-muted-foreground">Manage services, pricing, themes, and branding</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-end">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
            <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="gap-2">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Tabs - Scrollable on mobile */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 mb-8">
          <div className="flex gap-2 min-w-max pb-2">
            <Button
              variant={activeTab === "games" ? "default" : "outline"}
              onClick={() => setActiveTab("games")}
              className="gap-2 whitespace-nowrap"
            >
              <Gamepad2 className="w-4 h-4" />
              Services
            </Button>
            <Button
              variant={activeTab === "hardware" ? "default" : "outline"}
              onClick={() => setActiveTab("hardware")}
              className="gap-2 whitespace-nowrap"
            >
              <HardDrive className="w-4 h-4" />
              Hardware
            </Button>
            <Button
              variant={activeTab === "locations" ? "default" : "outline"}
              onClick={() => setActiveTab("locations")}
              className="gap-2 whitespace-nowrap"
            >
              <MapPin className="w-4 h-4" />
              Locations
            </Button>
            <Button
              variant={activeTab === "themes" ? "default" : "outline"}
              onClick={() => setActiveTab("themes")}
              className="gap-2 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              Seasonal
            </Button>
            <Button
              variant={activeTab === "brand" ? "default" : "outline"}
              onClick={() => setActiveTab("brand")}
              className="gap-2 whitespace-nowrap"
            >
              <Palette className="w-4 h-4" />
              Branding
            </Button>
            <Button
              variant={activeTab === "pterodactyl" ? "default" : "outline"}
              onClick={() => setActiveTab("pterodactyl")}
              className="gap-2 whitespace-nowrap"
            >
              <Server className="w-4 h-4" />
              Pterodactyl
            </Button>
            <Button
              variant={activeTab === "billing" ? "default" : "outline"}
              onClick={() => setActiveTab("billing")}
              className="gap-2 whitespace-nowrap"
            >
              <CreditCard className="w-4 h-4" />
              Billing
            </Button>
          </div>
        </div>

        {/* Games Tab */}
        {activeTab === "games" && (
          <div className="space-y-6">
            {/* Add New Game */}
            <div className="glass rounded-xl p-6 border border-primary/20">
              <h2 className="font-display text-xl font-bold mb-4">Add New Service</h2>
              <div className="grid md:grid-cols-4 gap-4">
                <Input
                  placeholder="Service Name"
                  value={newGame.name}
                  onChange={(e) => setNewGame({ ...newGame, name: e.target.value })}
                  className="bg-background/50 border-border"
                />
                <Input
                  placeholder="Description"
                  value={newGame.description}
                  onChange={(e) => setNewGame({ ...newGame, description: e.target.value })}
                  className="bg-background/50 border-border"
                />
                <div className="relative">
                  <Input
                    placeholder="Icon URL (e.g. /games/icon.png)"
                    value={newGame.icon}
                    onChange={(e) => setNewGame({ ...newGame, icon: e.target.value })}
                    className="bg-background/50 border-border pl-10"
                  />
                  <Image className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
                <Button onClick={handleAddGame} className="gap-2" disabled={syncing}>
                  {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add Service
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Icon should be URL path like /games/minecraft-icon.png or full URL
              </p>
            </div>

            {/* Game List */}
            <div className="grid md:grid-cols-2 gap-6">
              {games.map((game) => (
                <div key={game.id} className="glass rounded-xl p-6 border border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {game.icon.startsWith('/') || game.icon.startsWith('http') ? (
                        <img src={game.icon} alt={game.name} className="w-12 h-12 object-contain rounded-lg" />
                      ) : (
                        <span className="text-4xl">{game.icon}</span>
                      )}
                      <div>
                        <h3 className="font-display text-xl font-bold">{game.name}</h3>
                        <p className="text-sm text-muted-foreground">{game.plans.length} plans</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingGame(game)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          await saveGame({ ...game, enabled: !game.enabled });
                        }}
                        disabled={syncing}
                      >
                        {game.enabled ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteGame(game.id)}
                        disabled={syncing}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {game.plans.map((plan) => (
                      <div key={plan.id} className="flex items-center justify-between text-sm p-2 bg-muted rounded border border-border">
                        <div className="flex items-center gap-2">
                          <span>{plan.name}</span>
                        </div>
                        <span className="text-primary font-semibold">${plan.price.toFixed(2)}/mo</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Edit Game Modal */}
            {editingGame && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="glass rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-primary/30">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-2xl font-bold">Edit {editingGame.name}</h2>
                    <Button variant="ghost" size="icon" onClick={() => setEditingGame(null)}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="space-y-4 mb-6">
                    <Input
                      placeholder="Service Name"
                      value={editingGame.name}
                      onChange={(e) => setEditingGame({ ...editingGame, name: e.target.value })}
                      className="bg-background/50 border-border"
                    />
                    <Input
                      placeholder="Description"
                      value={editingGame.description}
                      onChange={(e) => setEditingGame({ ...editingGame, description: e.target.value })}
                      className="bg-background/50 border-border"
                    />
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Icon URL</label>
                      <div className="flex gap-3 items-center">
                        {editingGame.icon.startsWith('/') || editingGame.icon.startsWith('http') ? (
                          <img src={editingGame.icon} alt="Preview" className="w-12 h-12 object-contain rounded-lg bg-muted" />
                        ) : (
                          <span className="text-4xl">{editingGame.icon}</span>
                        )}
                        <Input
                          placeholder="Icon URL (e.g. /games/icon.png)"
                          value={editingGame.icon}
                          onChange={(e) => setEditingGame({ ...editingGame, icon: e.target.value })}
                          className="bg-background/50 border-border flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <h3 className="font-display text-lg font-bold mb-4">Pricing Plans</h3>
                  <DragDropContext onDragEnd={(result: DropResult) => {
                    if (!result.destination || !editingGame) return;
                    const reordered = Array.from(editingGame.plans);
                    const [removed] = reordered.splice(result.source.index, 1);
                    reordered.splice(result.destination.index, 0, removed);
                    setEditingGame({ ...editingGame, plans: reordered });
                  }}>
                    <Droppable droppableId="plans">
                      {(provided) => (
                        <div 
                          {...provided.droppableProps} 
                          ref={provided.innerRef}
                          className="space-y-3 mb-6"
                        >
                          {editingGame.plans.map((plan, index) => (
                            <Draggable key={plan.id} draggableId={plan.id} index={index}>
                              {(provided, snapshot) => (
                                <div 
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`p-3 bg-muted rounded-lg border border-border ${snapshot.isDragging ? 'ring-2 ring-primary' : ''}`}
                                >
                                  <div className="grid grid-cols-8 gap-2 items-center">
                                    <div {...provided.dragHandleProps} className="flex justify-center cursor-grab">
                                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <Input
                                      placeholder="Plan Name"
                                      value={plan.name}
                                      onChange={(e) => {
                                        const updatedPlans = [...editingGame.plans];
                                        updatedPlans[index] = { ...plan, name: e.target.value };
                                        setEditingGame({ ...editingGame, plans: updatedPlans });
                                      }}
                                      className="bg-background/50 border-border"
                                    />
                                    <Input
                                      placeholder="RAM"
                                      value={plan.ram}
                                      onChange={(e) => {
                                        const updatedPlans = [...editingGame.plans];
                                        updatedPlans[index] = { ...plan, ram: e.target.value };
                                        setEditingGame({ ...editingGame, plans: updatedPlans });
                                      }}
                                      className="bg-background/50 border-border"
                                    />
                                    <Input
                                      placeholder="CPU"
                                      value={plan.cpu}
                                      onChange={(e) => {
                                        const updatedPlans = [...editingGame.plans];
                                        updatedPlans[index] = { ...plan, cpu: e.target.value };
                                        setEditingGame({ ...editingGame, plans: updatedPlans });
                                      }}
                                      className="bg-background/50 border-border"
                                    />
                                    <Input
                                      placeholder="Storage"
                                      value={plan.storage}
                                      onChange={(e) => {
                                        const updatedPlans = [...editingGame.plans];
                                        updatedPlans[index] = { ...plan, storage: e.target.value };
                                        setEditingGame({ ...editingGame, plans: updatedPlans });
                                      }}
                                      className="bg-background/50 border-border"
                                    />
                                    <Input
                                      placeholder="Slots"
                                      value={plan.slots || ''}
                                      onChange={(e) => {
                                        const updatedPlans = [...editingGame.plans];
                                        updatedPlans[index] = { ...plan, slots: e.target.value };
                                        setEditingGame({ ...editingGame, plans: updatedPlans });
                                      }}
                                      className="bg-background/50 border-border"
                                    />
                                    <Input
                                      type="number"
                                      placeholder="Price"
                                      value={plan.price}
                                      onChange={(e) => {
                                        const updatedPlans = [...editingGame.plans];
                                        updatedPlans[index] = { ...plan, price: Number(e.target.value) };
                                        setEditingGame({ ...editingGame, plans: updatedPlans });
                                      }}
                                      className="bg-background/50 border-border"
                                    />
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleRemovePlan(plan.id)}
                                    >
                                      <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>

                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <Input
                      placeholder="Plan Name"
                      value={newPlan.name}
                      onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                      className="bg-background/50 border-border"
                    />
                    <Input
                      placeholder="RAM (e.g. 4GB)"
                      value={newPlan.ram}
                      onChange={(e) => setNewPlan({ ...newPlan, ram: e.target.value })}
                      className="bg-background/50 border-border"
                    />
                    <Input
                      placeholder="CPU (e.g. 2 vCores)"
                      value={newPlan.cpu}
                      onChange={(e) => setNewPlan({ ...newPlan, cpu: e.target.value })}
                      className="bg-background/50 border-border"
                    />
                    <Input
                      placeholder="Storage"
                      value={newPlan.storage}
                      onChange={(e) => setNewPlan({ ...newPlan, storage: e.target.value })}
                      className="bg-background/50 border-border"
                    />
                    <Input
                      placeholder="Slots"
                      value={newPlan.slots}
                      onChange={(e) => setNewPlan({ ...newPlan, slots: e.target.value })}
                      className="bg-background/50 border-border"
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      value={newPlan.price}
                      onChange={(e) => setNewPlan({ ...newPlan, price: Number(e.target.value) })}
                      className="bg-background/50 border-border"
                    />
                  </div>
                  <Button onClick={handleAddPlan} className="w-full mb-6 gap-2" variant="outline">
                    <Plus className="w-4 h-4" />
                    Add Plan
                  </Button>

                  <Button onClick={handleSaveGame} className="w-full gap-2" disabled={syncing}>
                    {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hardware Tab */}
        {activeTab === "hardware" && (
          <div className="space-y-6">
            <div className="glass rounded-xl p-6 border border-primary/20">
              <h2 className="font-display text-xl font-bold mb-4">Add New Hardware</h2>
              <div className="grid md:grid-cols-4 gap-4">
                <Input
                  placeholder="Hardware Name"
                  value={newHardware.name}
                  onChange={(e) => setNewHardware({ ...newHardware, name: e.target.value })}
                  className="bg-background/50 border-border"
                />
                <Input
                  placeholder="Description"
                  value={newHardware.description}
                  onChange={(e) => setNewHardware({ ...newHardware, description: e.target.value })}
                  className="bg-background/50 border-border"
                />
                <Input
                  placeholder="Specs"
                  value={newHardware.specs}
                  onChange={(e) => setNewHardware({ ...newHardware, specs: e.target.value })}
                  className="bg-background/50 border-border"
                />
                <Button onClick={handleAddHardware} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Hardware
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {hardware.map((hw) => (
                <div key={hw.id} className="glass rounded-xl p-6 border border-border">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-lg font-bold">{hw.name}</h3>
                      <p className="text-sm text-muted-foreground">{hw.description}</p>
                      <p className="text-sm text-primary mt-1">{hw.specs}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteHardware(hw.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locations Tab */}
        {activeTab === "locations" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {locations.map((loc) => (
                <div key={loc.id} className="glass rounded-xl p-6 border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{loc.flag}</span>
                    <div>
                      <h3 className="font-display text-lg font-bold">{loc.name}</h3>
                      <p className="text-sm text-muted-foreground">{loc.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-primary">{loc.ping} ping</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleLocationToggle(loc)}
                      disabled={syncing}
                    >
                      {loc.enabled ? "Disable" : "Enable"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seasonal Themes Tab */}
        {activeTab === "themes" && (
          <div className="space-y-6">
            <div className="glass rounded-xl p-6 border border-primary/20">
              <h2 className="font-display text-xl font-bold mb-2">Seasonal Themes</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Enable a seasonal theme to add festive decorations and falling animations across your site.
                Only one theme can be active at a time.
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {seasonalThemes.map((theme) => (
                  <div 
                    key={theme.id} 
                    className={`rounded-xl p-6 border transition-all cursor-pointer ${
                      theme.enabled 
                        ? "bg-primary/20 border-primary glow-neon" 
                        : "glass border-border hover:border-primary/50"
                    }`}
                    onClick={() => handleThemeToggle(theme)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-4xl">{theme.icon}</span>
                      <div>
                        <h3 className="font-display text-lg font-bold">{theme.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {theme.enabled ? "Active" : "Click to enable"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {theme.decorations.map((deco, idx) => (
                        <span key={idx} className="text-xl">{deco}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Brand Tab */}
        {activeTab === "brand" && (
          <div className="space-y-6">
            <div className="glass rounded-xl p-6 border border-primary/20">
              <h2 className="font-display text-xl font-bold mb-2">Brand Settings</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Customize your logo, brand name, tagline, colors, and hero content.
              </p>
              
              {/* Logo Upload Section */}
              <div className="mb-6 pb-6 border-b border-border">
                <LogoUpload
                  currentLogoUrl={editBrand.logoUrl}
                  onLogoChange={(url) => setEditBrand({ ...editBrand, logoUrl: url })}
                />
              </div>

              {/* Hero Background Upload Section */}
              <div className="mb-6 pb-6 border-b border-border">
                <HeroBackgroundUpload />
              </div>

              {/* Favicon & OG Image Upload */}
              <div className="mb-6 pb-6 border-b border-border">
                <FaviconOgUpload
                  faviconUrl={editBrand.faviconUrl}
                  ogImageUrl={editBrand.ogImageUrl}
                  onFaviconChange={(url) => setEditBrand({ ...editBrand, faviconUrl: url })}
                  onOgImageChange={(url) => setEditBrand({ ...editBrand, ogImageUrl: url })}
                />
              </div>

              {/* Color Theme Picker */}
              <div className="mb-6 pb-6 border-b border-border">
                <ColorThemePicker
                  primaryColor={editBrand.primaryColor}
                  accentColor={editBrand.accentColor}
                  onPrimaryChange={(color) => setEditBrand({ ...editBrand, primaryColor: color })}
                  onAccentChange={(color) => setEditBrand({ ...editBrand, accentColor: color })}
                />
              </div>

              {/* Light/Dark Theme Editor */}
              <div className="mb-6 pb-6 border-b border-border">
                <h3 className="text-lg font-semibold mb-4">Light & Dark Theme Colors</h3>
                <ThemeEditor editBrand={editBrand} setEditBrand={setEditBrand} />
              </div>

              {/* Hero Stats Editor */}
              <div className="mb-6 pb-6 border-b border-border">
                <HeroStatsEditor
                  stats={editBrand.heroStats || [
                    { value: "1000+", label: "Happy Customers" },
                    { value: "99.9%", label: "Satisfaction Rate" },
                    { value: "24/7", label: "Support Available" },
                  ]}
                  badgeText={editBrand.heroBadgeText || "Your Brand • Your Message • Your Values"}
                  onStatsChange={(stats) => setEditBrand({ ...editBrand, heroStats: stats })}
                  onBadgeChange={(text) => setEditBrand({ ...editBrand, heroBadgeText: text })}
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Brand Name</label>
                    <Input
                      placeholder="Your Brand Name"
                      value={editBrand.name}
                      onChange={(e) => setEditBrand({ ...editBrand, name: e.target.value })}
                      className="bg-background/50 border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Tagline</label>
                    <Input
                      placeholder="Premium Services"
                      value={editBrand.tagline}
                      onChange={(e) => setEditBrand({ ...editBrand, tagline: e.target.value })}
                      className="bg-background/50 border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">CTA Button Text</label>
                    <Input
                      placeholder="Get Started"
                      value={editBrand.ctaText}
                      onChange={(e) => setEditBrand({ ...editBrand, ctaText: e.target.value })}
                      className="bg-background/50 border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">CTA Button Link</label>
                    <Input
                      placeholder="#pricing or https://..."
                      value={editBrand.ctaLink}
                      onChange={(e) => setEditBrand({ ...editBrand, ctaLink: e.target.value })}
                      className="bg-background/50 border-border"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Hero Headline</label>
                    <Input
                      placeholder="Your Headline Goes Here"
                      value={editBrand.heroHeadline}
                      onChange={(e) => setEditBrand({ ...editBrand, heroHeadline: e.target.value })}
                      className="bg-background/50 border-border"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Last 2 words will be highlighted with gradient</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Hero Subheadline</label>
                    <textarea
                      placeholder="Add your compelling description here..."
                      value={editBrand.heroSubheadline}
                      onChange={(e) => setEditBrand({ ...editBrand, heroSubheadline: e.target.value })}
                      className="w-full min-h-[100px] px-3 py-2 rounded-lg bg-background/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Footer & Social Links */}
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-lg font-semibold mb-4">Footer & Social Links</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Footer Description</label>
                    <Input
                      placeholder="Premium game server hosting with enterprise-grade infrastructure."
                      value={editBrand.footerDescription || ''}
                      onChange={(e) => setEditBrand({ ...editBrand, footerDescription: e.target.value })}
                      className="bg-background/50 border-border"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Facebook URL</label>
                      <Input
                        placeholder="https://facebook.com/yourpage"
                        value={editBrand.socialFacebook || ''}
                        onChange={(e) => setEditBrand({ ...editBrand, socialFacebook: e.target.value })}
                        className="bg-background/50 border-border"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">TikTok URL</label>
                      <Input
                        placeholder="https://tiktok.com/@yourpage"
                        value={editBrand.socialTiktok || ''}
                        onChange={(e) => setEditBrand({ ...editBrand, socialTiktok: e.target.value })}
                        className="bg-background/50 border-border"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Telegram URL</label>
                      <Input
                        placeholder="https://t.me/yourchannel"
                        value={editBrand.socialTelegram || ''}
                        onChange={(e) => setEditBrand({ ...editBrand, socialTelegram: e.target.value })}
                        className="bg-background/50 border-border"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">YouTube URL</label>
                      <Input
                        placeholder="https://youtube.com/@yourchannel"
                        value={editBrand.socialYoutube || ''}
                        onChange={(e) => setEditBrand({ ...editBrand, socialYoutube: e.target.value })}
                        className="bg-background/50 border-border"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <Button onClick={handleSaveBrand} className="mt-6 gap-2" disabled={saving}>
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Brand Settings"}
              </Button>
            </div>
          </div>
        )}

        {/* Pterodactyl Tab */}
        {activeTab === "pterodactyl" && (
          <div className="space-y-6">
            <PterodactylConfig />
            
            <div className="glass rounded-xl p-6 border border-primary/20">
              <h2 className="font-display text-xl font-bold mb-4">Plan Pterodactyl Configuration</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Configure Pterodactyl settings for each game plan.
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {games.map((game) => (
                  <div key={game.id} className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      {game.icon.startsWith('/') || game.icon.startsWith('http') ? (
                        <img src={game.icon} alt={game.name} className="w-8 h-8 object-contain rounded" />
                      ) : (
                        <span className="text-2xl">{game.icon}</span>
                      )}
                      <h3 className="font-semibold">{game.name}</h3>
                    </div>
                    <div className="space-y-2">
                      {game.plans.map((plan) => (
                        <PlanPterodactylEditor
                          key={plan.id}
                          planId={plan.id}
                          planName={plan.name}
                          onSave={() => {}}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === "billing" && (
          <div className="space-y-6">
            <BakongConfig />
            <RenewalReminders />
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
