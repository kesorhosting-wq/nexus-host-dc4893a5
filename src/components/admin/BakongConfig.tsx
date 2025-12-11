import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, Check, X, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BakongStatus {
  connected: boolean;
  merchantId?: string;
  testQRGenerated?: boolean;
}

const BakongConfig = () => {
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<BakongStatus | null>(null);

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <QrCode className="w-6 h-6 text-primary" />
            <div>
              <CardTitle>Bakong KHQR</CardTitle>
              <CardDescription>Cambodia's national payment system</CardDescription>
            </div>
          </div>
          {status && (
            <Badge variant={status.connected ? "default" : "destructive"}>
              {status.connected ? (
                <><Check className="w-3 h-3 mr-1" /> Connected</>
              ) : (
                <><X className="w-3 h-3 mr-1" /> Not Configured</>
              )}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Bakong KHQR payment credentials are managed via environment secrets. 
          Use the secrets manager to update BAKONG_MERCHANT_ID and BAKONG_API_KEY.
        </p>

        {status?.connected && (
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <p className="text-sm font-medium">Integration Status</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Merchant ID:</span>
                <span className="ml-2">{status.merchantId}</span>
              </div>
              <div>
                <span className="text-muted-foreground">QR Generation:</span>
                <span className="ml-2">{status.testQRGenerated ? "Working" : "Failed"}</span>
              </div>
            </div>
          </div>
        )}

        <Button onClick={testConnection} disabled={testing} variant="outline" className="gap-2">
          {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Test Bakong Connection
        </Button>
      </CardContent>
    </Card>
  );
};

export default BakongConfig;
