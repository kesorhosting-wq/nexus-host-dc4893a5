import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Check, X, Loader2, RefreshCw, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PanelInfo {
  connected: boolean;
  version?: string;
  nodes?: number;
  servers?: number;
}

const PterodactylConfig = () => {
  const { toast } = useToast();
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [panelInfo, setPanelInfo] = useState<PanelInfo | null>(null);
  const [existingConfig, setExistingConfig] = useState<any>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    const { data, error } = await supabase
      .from("server_integrations")
      .select("*")
      .eq("type", "pterodactyl")
      .single();

    if (data) {
      setExistingConfig(data);
      setApiUrl(data.api_url);
      setApiKey(data.api_key);
      if (data.enabled) {
        testConnection(data.api_url, data.api_key);
      }
    }
  };

  const testConnection = async (url?: string, key?: string) => {
    const testUrl = url || apiUrl;
    const testKey = key || apiKey;

    if (!testUrl || !testKey) {
      toast({ title: "Please enter API URL and Key", variant: "destructive" });
      return;
    }

    setTesting(true);
    try {
      // Test connection via edge function
      const { data, error } = await supabase.functions.invoke("pterodactyl", {
        body: {
          action: "test",
          apiUrl: testUrl,
          apiKey: testKey,
        },
      });

      if (error) throw error;

      setPanelInfo({
        connected: true,
        version: data?.version,
        nodes: data?.nodes,
        servers: data?.servers,
      });

      toast({ title: "Connection successful!" });
    } catch (error: any) {
      console.error("Connection test failed:", error);
      setPanelInfo({ connected: false });
      toast({ title: "Connection failed", description: error.message, variant: "destructive" });
    } finally {
      setTesting(false);
    }
  };

  const saveConfig = async () => {
    if (!apiUrl || !apiKey) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      if (existingConfig) {
        const { error } = await supabase
          .from("server_integrations")
          .update({
            api_url: apiUrl,
            api_key: apiKey,
            enabled: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingConfig.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("server_integrations").insert({
          name: "Pterodactyl Panel",
          type: "pterodactyl",
          api_url: apiUrl,
          api_key: apiKey,
          enabled: true,
        });

        if (error) throw error;
      }

      toast({ title: "Configuration saved!" });
      fetchConfig();
    } catch (error: any) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Server className="w-6 h-6 text-primary" />
            <div>
              <CardTitle>Pterodactyl Panel</CardTitle>
              <CardDescription>Connect to your game server panel</CardDescription>
            </div>
          </div>
          {panelInfo && (
            <Badge variant={panelInfo.connected ? "default" : "destructive"}>
              {panelInfo.connected ? (
                <><Check className="w-3 h-3 mr-1" /> Connected</>
              ) : (
                <><X className="w-3 h-3 mr-1" /> Disconnected</>
              )}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiUrl">Panel URL</Label>
          <Input
            id="apiUrl"
            placeholder="https://panel.example.com"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Your Pterodactyl panel URL (without /api)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="apiKey">Application API Key</Label>
          <div className="relative">
            <Input
              id="apiKey"
              type={showApiKey ? "text" : "password"}
              placeholder="ptla_xxxxxxxxxxxxxxxxxxxx"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Create an Application API key in Admin → API
          </p>
        </div>

        {panelInfo?.connected && (
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <p className="text-sm font-medium">Panel Information</p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              {panelInfo.version && (
                <div>
                  <span className="text-muted-foreground">Version:</span>
                  <span className="ml-2">{panelInfo.version}</span>
                </div>
              )}
              {panelInfo.nodes !== undefined && (
                <div>
                  <span className="text-muted-foreground">Nodes:</span>
                  <span className="ml-2">{panelInfo.nodes}</span>
                </div>
              )}
              {panelInfo.servers !== undefined && (
                <div>
                  <span className="text-muted-foreground">Servers:</span>
                  <span className="ml-2">{panelInfo.servers}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={() => testConnection()} disabled={testing} variant="outline" className="gap-2">
            {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Test Connection
          </Button>
          <Button onClick={saveConfig} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PterodactylConfig;
