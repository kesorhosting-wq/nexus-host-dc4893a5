import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, Check, X, Loader2, RefreshCw, Eye, EyeOff, Save, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BakongStatus {
  connected: boolean;
  merchantId?: string;
  testQRGenerated?: boolean;
}

interface BakongSettings {
  merchantId: string;
  merchantName: string;
  merchantCity: string;
  currency: string;
  accountNumber: string;
}

const BakongConfig = () => {
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<BakongStatus | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  
  const [settings, setSettings] = useState<BakongSettings>({
    merchantId: "",
    merchantName: "GameHost",
    merchantCity: "Phnom Penh",
    currency: "USD",
    accountNumber: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from("payment_gateways")
      .select("*")
      .eq("slug", "bakong")
      .single();

    if (data?.config) {
      const config = data.config as any;
      setSettings({
        merchantId: config.merchantId || "",
        merchantName: config.merchantName || "GameHost",
        merchantCity: config.merchantCity || "Phnom Penh",
        currency: config.currency || "USD",
        accountNumber: config.accountNumber || "",
      });
    }
  };

  const testConnection = async () => {
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("bakong-test");

      if (error) throw error;

      if (data.success) {
        setStatus({
          connected: true,
          merchantId: data.merchantId,
          testQRGenerated: data.testQRGenerated,
        });
        toast({ title: "Bakong connection successful!" });
      } else {
        setStatus({ connected: false });
        toast({ 
          title: "Bakong test failed", 
          description: data.error || "Please check your credentials",
          variant: "destructive" 
        });
      }
    } catch (error: any) {
      console.error("Bakong test failed:", error);
      setStatus({ connected: false });
      toast({ 
        title: "Connection failed", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setTesting(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const configJson = {
        merchantId: settings.merchantId,
        merchantName: settings.merchantName,
        merchantCity: settings.merchantCity,
        currency: settings.currency,
        accountNumber: settings.accountNumber,
      };

      // Check if gateway exists
      const { data: existing } = await supabase
        .from("payment_gateways")
        .select("id")
        .eq("slug", "bakong")
        .single();

      if (existing) {
        await supabase
          .from("payment_gateways")
          .update({
            config: configJson,
            enabled: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("payment_gateways")
          .insert({
            name: "BakongKHQR",
            slug: "bakong",
            description: "Cambodia's National Payment System",
            icon: "qr-code",
            enabled: true,
            config: configJson,
          });
      }

      toast({ title: "Settings saved!" });
    } catch (error: any) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-[#e31837] to-[#c41230] text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-white">BakongKHQR</CardTitle>
              <CardDescription className="text-white/80">Cambodia's National Payment System</CardDescription>
            </div>
          </div>
          {status && (
            <Badge className={status.connected ? "bg-white/20 text-white border-0" : "bg-red-500 text-white border-0"}>
              {status.connected ? (
                <><Check className="w-3 h-3 mr-1" /> Connected</>
              ) : (
                <><X className="w-3 h-3 mr-1" /> Not Configured</>
              )}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="test" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Test
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="merchantId">Bakong Merchant ID</Label>
                <Input
                  id="merchantId"
                  placeholder="your_merchant_id@wing"
                  value={settings.merchantId}
                  onChange={(e) => setSettings({ ...settings, merchantId: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Your Bakong account ID</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number (Optional)</Label>
                <Input
                  id="accountNumber"
                  placeholder="Enter account number"
                  value={settings.accountNumber}
                  onChange={(e) => setSettings({ ...settings, accountNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="merchantName">Merchant Name</Label>
                <Input
                  id="merchantName"
                  placeholder="Your Business Name"
                  value={settings.merchantName}
                  onChange={(e) => setSettings({ ...settings, merchantName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="merchantCity">Merchant City</Label>
                <Input
                  id="merchantCity"
                  placeholder="Phnom Penh"
                  value={settings.merchantCity}
                  onChange={(e) => setSettings({ ...settings, merchantCity: e.target.value })}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Default Currency</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={settings.currency === "USD" ? "default" : "outline"}
                    onClick={() => setSettings({ ...settings, currency: "USD" })}
                    className="flex-1"
                  >
                    <span className="mr-2">$</span> USD
                  </Button>
                  <Button
                    type="button"
                    variant={settings.currency === "KHR" ? "default" : "outline"}
                    onClick={() => setSettings({ ...settings, currency: "KHR" })}
                    className="flex-1"
                  >
                    <span className="mr-2">៛</span> KHR
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Developer Token</p>
              <p className="text-xs text-muted-foreground">
                BAKONG_TOKEN is stored as a secure environment secret. Get your token from{" "}
                <a 
                  href="https://api-bakong.nbc.gov.kh/register" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  api-bakong.nbc.gov.kh
                </a>
                . Token expires every 90 days.
              </p>
            </div>

            <Button onClick={saveSettings} disabled={saving} className="w-full gap-2 bg-[#e31837] hover:bg-[#c41230]">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Settings
            </Button>
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            {status?.connected && (
              <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg space-y-2">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Integration Active</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Merchant ID:</span>
                    <span className="ml-2 font-mono">{status.merchantId}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">QR Generation:</span>
                    <span className="ml-2">{status.testQRGenerated ? "✓ Working" : "✗ Failed"}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 bg-muted rounded-lg space-y-3">
              <p className="text-sm font-medium">Webhook URL</p>
              <code className="block p-3 bg-background rounded text-xs break-all">
                {`https://cebhteyhrcdsfhiwozfp.supabase.co/functions/v1/bakong-webhook`}
              </code>
              <p className="text-xs text-muted-foreground">
                Configure this URL in your Bakong merchant dashboard to receive real-time payment notifications.
              </p>
            </div>

            <Button onClick={testConnection} disabled={testing} variant="outline" className="w-full gap-2">
              {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Test Connection
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BakongConfig;
