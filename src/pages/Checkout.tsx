import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Server, CreditCard, QrCode, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface GamePlan {
  id: string;
  name: string;
  plan_id: string;
  game_id: string;
  price: number;
  ram: string | null;
  cpu: string | null;
  storage: string | null;
  slots: string | null;
}

interface Game {
  game_id: string;
  name: string;
  icon: string | null;
}

const Checkout = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const [plan, setPlan] = useState<GamePlan | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("bakong");
  const [serverName, setServerName] = useState("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (planId) fetchPlanData();
  }, [planId, user, authLoading]);

  const fetchPlanData = async () => {
    try {
      const { data: planData, error } = await supabase
        .from("game_plans")
        .select("*")
        .eq("id", planId)
        .single();

      if (error || !planData) {
        toast({ title: "Plan not found", variant: "destructive" });
        navigate("/products");
        return;
      }

      setPlan(planData);

      const { data: gameData } = await supabase
        .from("games")
        .select("game_id, name, icon")
        .eq("game_id", planData.game_id)
        .single();

      if (gameData) setGame(gameData);
    } catch (error) {
      console.error("Error fetching plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!user || !plan) return;

    if (!serverName.trim()) {
      toast({ title: "Please enter a server name", variant: "destructive" });
      return;
    }

    setProcessing(true);

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          price: plan.price,
          status: "pending",
          billing_cycle: "monthly",
          server_details: {
            name: serverName,
            game_id: plan.game_id,
            plan_id: plan.plan_id,
            plan_name: plan.name,
            ram: plan.ram,
            cpu: plan.cpu,
            storage: plan.storage,
          },
        })
        .select()
        .single();

      if (orderError) throw orderError;

      setOrderId(order.id);

      // Create invoice
      const invoiceNumber = `INV-${Date.now()}`;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          user_id: user.id,
          order_id: order.id,
          invoice_number: invoiceNumber,
          subtotal: plan.price,
          total: plan.price,
          due_date: dueDate.toISOString(),
          status: "unpaid",
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Generate BakongKHQR
      const { data: qrData, error: qrError } = await supabase.functions.invoke(
        "bakong-qr",
        {
          body: {
            amount: plan.price,
            currency: "USD",
            orderId: order.id,
            invoiceId: invoice.id,
            description: `${game?.name || "Game"} Server - ${plan.name}`,
          },
        }
      );

      if (qrError) throw qrError;

      setQrCode(qrData.qrCode);
      toast({ title: "Order created! Scan QR to pay." });
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => navigate("/products")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-primary" />
                Order Summary
              </CardTitle>
              <CardDescription>Review your server configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <span className="text-3xl">{game?.icon || "🎮"}</span>
                <div>
                  <h3 className="font-semibold">{game?.name} Server</h3>
                  <p className="text-sm text-muted-foreground">{plan.name}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {plan.ram && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">RAM</span>
                    <span>{plan.ram}</span>
                  </div>
                )}
                {plan.cpu && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CPU</span>
                    <span>{plan.cpu}</span>
                  </div>
                )}
                {plan.storage && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Storage</span>
                    <span>{plan.storage}</span>
                  </div>
                )}
                {plan.slots && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Player Slots</span>
                    <span>{plan.slots}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-primary">${plan.price.toFixed(2)}/month</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment
              </CardTitle>
              <CardDescription>
                {qrCode ? "Scan QR code to complete payment" : "Configure your server and pay"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!qrCode ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="serverName">Server Name</Label>
                    <Input
                      id="serverName"
                      placeholder="My Awesome Server"
                      value={serverName}
                      onChange={(e) => setServerName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Payment Method</Label>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:border-primary">
                        <RadioGroupItem value="bakong" id="bakong" />
                        <Label htmlFor="bakong" className="flex items-center gap-2 cursor-pointer">
                          <QrCode className="w-5 h-5 text-primary" />
                          BakongKHQR
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Proceed to Payment"
                    )}
                  </Button>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div className="p-4 bg-white rounded-lg inline-block">
                    <img
                      src={`data:image/png;base64,${qrCode}`}
                      alt="Payment QR Code"
                      className="w-64 h-64"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Scan with your Bakong app to pay ${plan.price.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Order ID: {orderId}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/client")}
                  >
                    View My Orders
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
