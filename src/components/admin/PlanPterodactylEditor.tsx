import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Settings2, Plus, Trash2, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PterodactylLimits {
  memory: number;
  swap: number;
  disk: number;
  io: number;
  cpu: number;
}

interface PterodactylFeatureLimits {
  databases: number;
  backups: number;
  allocations: number;
}

interface EnvVar {
  key: string;
  value: string;
}

interface PlanPterodactylEditorProps {
  planId: string;
  planName: string;
  currentConfig?: {
    egg_id?: number;
    nest_id?: number;
    node_id?: number;
    docker_image?: string;
    startup?: string;
    environment?: Record<string, string>;
    limits?: PterodactylLimits;
    feature_limits?: PterodactylFeatureLimits;
  };
  onSave: () => void;
}

interface Nest {
  id: number;
  name: string;
  eggs: Egg[];
}

interface Egg {
  id: number;
  name: string;
  docker_image: string;
  startup: string;
}

interface Node {
  id: number;
  name: string;
  memory: number;
  disk: number;
}

const PlanPterodactylEditor = ({ planId, planName, currentConfig, onSave }: PlanPterodactylEditorProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const [nests, setNests] = useState<Nest[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [selectedNest, setSelectedNest] = useState<number | null>(currentConfig?.nest_id || null);
  const [selectedEgg, setSelectedEgg] = useState<number | null>(currentConfig?.egg_id || null);
  const [selectedNode, setSelectedNode] = useState<number | null>(currentConfig?.node_id || null);
  const [dockerImage, setDockerImage] = useState(currentConfig?.docker_image || "");
  const [startup, setStartup] = useState(currentConfig?.startup || "");
  const [envVars, setEnvVars] = useState<EnvVar[]>(
    currentConfig?.environment 
      ? Object.entries(currentConfig.environment).map(([key, value]) => ({ key, value }))
      : []
  );
  const [limits, setLimits] = useState<PterodactylLimits>(
    currentConfig?.limits || { memory: 1024, swap: 0, disk: 10240, io: 500, cpu: 100 }
  );
  const [featureLimits, setFeatureLimits] = useState<PterodactylFeatureLimits>(
    currentConfig?.feature_limits || { databases: 1, backups: 2, allocations: 1 }
  );

  useEffect(() => {
    if (open) {
      fetchPanelData();
    }
  }, [open]);

  const fetchPanelData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("pterodactyl", {
        body: { action: "get-panel-data" },
      });

      if (error) throw error;

      if (data?.nests) setNests(data.nests);
      if (data?.nodes) setNodes(data.nodes);
    } catch (error: any) {
      console.error("Failed to fetch panel data:", error);
      toast({ title: "Failed to load panel data", description: "Make sure Pterodactyl is connected", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleNestChange = (nestId: string) => {
    const id = parseInt(nestId);
    setSelectedNest(id);
    setSelectedEgg(null);
    setDockerImage("");
    setStartup("");
  };

  const handleEggChange = (eggId: string) => {
    const id = parseInt(eggId);
    setSelectedEgg(id);
    
    // Find the egg and populate defaults
    const nest = nests.find(n => n.id === selectedNest);
    const egg = nest?.eggs?.find(e => e.id === id);
    if (egg) {
      setDockerImage(egg.docker_image || "");
      setStartup(egg.startup || "");
    }
  };

  const addEnvVar = () => {
    setEnvVars([...envVars, { key: "", value: "" }]);
  };

  const updateEnvVar = (index: number, field: "key" | "value", value: string) => {
    const updated = [...envVars];
    updated[index][field] = value;
    setEnvVars(updated);
  };

  const removeEnvVar = (index: number) => {
    setEnvVars(envVars.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!selectedEgg || !selectedNest) {
      toast({ title: "Please select a Nest and Egg", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const environment: Record<string, string> = {};
      envVars.forEach(({ key, value }) => {
        if (key) environment[key] = value;
      });

      const { error } = await supabase
        .from("game_plans")
        .update({
          pterodactyl_egg_id: selectedEgg,
          pterodactyl_nest_id: selectedNest,
          pterodactyl_node_id: selectedNode,
          pterodactyl_docker_image: dockerImage,
          pterodactyl_startup: startup,
          pterodactyl_environment: environment as any,
          pterodactyl_limits: limits as any,
          pterodactyl_feature_limits: featureLimits as any,
        })
        .eq("id", planId);

      if (error) throw error;

      toast({ title: "Pterodactyl configuration saved!" });
      setOpen(false);
      onSave();
    } catch (error: any) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const selectedNestData = nests.find(n => n.id === selectedNest);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="w-4 h-4" />
          Pterodactyl
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pterodactyl Configuration - {planName}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Nest & Egg Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nest</Label>
                <Select value={selectedNest?.toString() || ""} onValueChange={handleNestChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Nest" />
                  </SelectTrigger>
                  <SelectContent>
                    {nests.map((nest) => (
                      <SelectItem key={nest.id} value={nest.id.toString()}>
                        {nest.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Egg</Label>
                <Select 
                  value={selectedEgg?.toString() || ""} 
                  onValueChange={handleEggChange}
                  disabled={!selectedNest}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Egg" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedNestData?.eggs?.map((egg) => (
                      <SelectItem key={egg.id} value={egg.id.toString()}>
                        {egg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Node Selection */}
            <div className="space-y-2">
              <Label>Node (Optional - leave empty for auto)</Label>
              <Select value={selectedNode?.toString() || "auto"} onValueChange={(v) => setSelectedNode(v === "auto" ? null : parseInt(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Auto-select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-select available node</SelectItem>
                  {nodes.map((node) => (
                    <SelectItem key={node.id} value={node.id.toString()}>
                      {node.name} ({node.memory}MB / {node.disk}MB)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Docker Image & Startup */}
            <div className="space-y-2">
              <Label>Docker Image</Label>
              <Input
                placeholder="ghcr.io/pterodactyl/yolks:java_17"
                value={dockerImage}
                onChange={(e) => setDockerImage(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Startup Command</Label>
              <Textarea
                placeholder="java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}"
                value={startup}
                onChange={(e) => setStartup(e.target.value)}
                rows={2}
              />
            </div>

            {/* Resource Limits */}
            <Card>
              <CardContent className="pt-4">
                <Label className="text-base font-semibold mb-4 block">Resource Limits</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Memory (MB)</Label>
                    <Input
                      type="number"
                      value={limits.memory}
                      onChange={(e) => setLimits({ ...limits, memory: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Disk (MB)</Label>
                    <Input
                      type="number"
                      value={limits.disk}
                      onChange={(e) => setLimits({ ...limits, disk: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">CPU (%)</Label>
                    <Input
                      type="number"
                      value={limits.cpu}
                      onChange={(e) => setLimits({ ...limits, cpu: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Swap (MB)</Label>
                    <Input
                      type="number"
                      value={limits.swap}
                      onChange={(e) => setLimits({ ...limits, swap: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Block IO</Label>
                    <Input
                      type="number"
                      value={limits.io}
                      onChange={(e) => setLimits({ ...limits, io: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature Limits */}
            <Card>
              <CardContent className="pt-4">
                <Label className="text-base font-semibold mb-4 block">Feature Limits</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Databases</Label>
                    <Input
                      type="number"
                      value={featureLimits.databases}
                      onChange={(e) => setFeatureLimits({ ...featureLimits, databases: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Backups</Label>
                    <Input
                      type="number"
                      value={featureLimits.backups}
                      onChange={(e) => setFeatureLimits({ ...featureLimits, backups: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Allocations</Label>
                    <Input
                      type="number"
                      value={featureLimits.allocations}
                      onChange={(e) => setFeatureLimits({ ...featureLimits, allocations: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Environment Variables */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base font-semibold">Environment Variables</Label>
                  <Button variant="outline" size="sm" onClick={addEnvVar} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Variable
                  </Button>
                </div>
                <div className="space-y-2">
                  {envVars.map((env, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="KEY"
                        value={env.key}
                        onChange={(e) => updateEnvVar(index, "key", e.target.value)}
                        className="w-1/3"
                      />
                      <Input
                        placeholder="Value"
                        value={env.value}
                        onChange={(e) => updateEnvVar(index, "value", e.target.value)}
                        className="flex-1"
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeEnvVar(index)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  {envVars.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      No environment variables configured
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Pterodactyl Configuration
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PlanPterodactylEditor;
