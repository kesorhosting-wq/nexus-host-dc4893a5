import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Server, HardDrive, Cpu, Database, Check, ShoppingCart } from "lucide-react";
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
  order_link: string | null;
}

interface Game {
  game_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  enabled: boolean;
}

const Products = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [plans, setPlans] = useState<GamePlan[]>([]);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [gamesRes, plansRes] = await Promise.all([
        supabase.from("games").select("*").eq("enabled", true).order("sort_order"),
        supabase.from("game_plans").select("*").order("sort_order"),
      ]);

      if (gamesRes.data) {
        setGames(gamesRes.data);
        if (gamesRes.data.length > 0) {
          setSelectedGame(gamesRes.data[0].game_id);
        }
      }
      if (plansRes.data) setPlans(plansRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async (plan: GamePlan) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to order a server.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    navigate(`/checkout/${plan.id}`);
  };

  const filteredPlans = plans.filter((p) => p.game_id === selectedGame);
  const selectedGameData = games.find((g) => g.game_id === selectedGame);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Game Server Hosting Plans</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose from our selection of high-performance game servers. All plans include DDoS protection, instant setup, and 24/7 support.
          </p>
        </div>

        {games.length > 0 && (
          <Tabs value={selectedGame || ""} onValueChange={setSelectedGame} className="w-full">
            <TabsList className="flex flex-wrap justify-center gap-2 h-auto bg-transparent mb-8">
              {games.map((game) => (
                <TabsTrigger
                  key={game.game_id}
                  value={game.game_id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6 py-3 rounded-lg border border-border"
                >
                  <span className="mr-2">{game.icon}</span>
                  {game.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {games.map((game) => (
              <TabsContent key={game.game_id} value={game.game_id}>
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-bold mb-2">
                    <span className="mr-2">{game.icon}</span>
                    {game.name} Hosting
                  </h2>
                  <p className="text-muted-foreground">{game.description}</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPlans.map((plan, index) => (
                    <Card
                      key={plan.id}
                      className={`relative overflow-hidden transition-all hover:border-primary/50 ${
                        index === 1 ? "border-primary shadow-lg shadow-primary/20" : ""
                      }`}
                    >
                      {index === 1 && (
                        <Badge className="absolute top-4 right-4 bg-primary">Popular</Badge>
                      )}
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Server className="w-5 h-5 text-primary" />
                          {plan.name}
                        </CardTitle>
                        <CardDescription>
                          Perfect for {plan.slots || "any"} players
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center py-4">
                          <span className="text-4xl font-bold text-primary">
                            ${plan.price?.toFixed(2) || "0.00"}
                          </span>
                          <span className="text-muted-foreground">/month</span>
                        </div>

                        <div className="space-y-3">
                          {plan.ram && (
                            <div className="flex items-center gap-3 text-sm">
                              <Database className="w-4 h-4 text-primary" />
                              <span>{plan.ram} RAM</span>
                            </div>
                          )}
                          {plan.cpu && (
                            <div className="flex items-center gap-3 text-sm">
                              <Cpu className="w-4 h-4 text-primary" />
                              <span>{plan.cpu}</span>
                            </div>
                          )}
                          {plan.storage && (
                            <div className="flex items-center gap-3 text-sm">
                              <HardDrive className="w-4 h-4 text-primary" />
                              <span>{plan.storage} Storage</span>
                            </div>
                          )}
                          <div className="flex items-center gap-3 text-sm">
                            <Check className="w-4 h-4 text-green-500" />
                            <span>DDoS Protection</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <Check className="w-4 h-4 text-green-500" />
                            <span>Instant Setup</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <Check className="w-4 h-4 text-green-500" />
                            <span>24/7 Support</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full gap-2"
                          variant={index === 1 ? "default" : "outline"}
                          onClick={() => handleOrder(plan)}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Order Now
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                {filteredPlans.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No plans available for this game yet.
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}

        {games.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No games available at the moment. Please check back later.
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Products;
