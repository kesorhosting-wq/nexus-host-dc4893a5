import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutDashboard, 
  Server, 
  FileText, 
  MessageSquare, 
  User, 
  LogOut,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Zap
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  status: string;
  price: number;
  billing_cycle: string;
  next_due_date: string;
  server_details: any;
  created_at: string;
  products?: { name: string; description: string } | null;
}

interface Invoice {
  id: string;
  invoice_number: string;
  status: string;
  total: number;
  due_date: string;
  created_at: string;
}

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  department: string;
  created_at: string;
  updated_at: string;
}

const ClientArea = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate('/auth');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate('/auth');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Poll for provisioning orders every 10 seconds
  useEffect(() => {
    const hasProvisioningOrders = orders.some(order => 
      order.status === 'provisioning' || order.status === 'paid'
    );
    
    if (!hasProvisioningOrders) return;
    
    const interval = setInterval(() => {
      fetchData();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [orders]);

  const fetchData = async () => {
    const [ordersRes, invoicesRes, ticketsRes] = await Promise.all([
      supabase.from('orders').select('*, products(name, description)').order('created_at', { ascending: false }),
      supabase.from('invoices').select('*').order('created_at', { ascending: false }),
      supabase.from('tickets').select('*').order('created_at', { ascending: false })
    ]);

    if (ordersRes.data) setOrders(ordersRes.data);
    if (invoicesRes.data) setInvoices(invoicesRes.data);
    if (ticketsRes.data) setTickets(ticketsRes.data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: 'Logged out successfully' });
    navigate('/');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
      active: { variant: 'default', icon: CheckCircle2 },
      pending: { variant: 'secondary', icon: Clock },
      provisioning: { variant: 'secondary', icon: Clock },
      suspended: { variant: 'destructive', icon: AlertCircle },
      cancelled: { variant: 'outline', icon: AlertCircle },
      failed: { variant: 'destructive', icon: AlertCircle },
      paid: { variant: 'default', icon: CheckCircle2 },
      unpaid: { variant: 'destructive', icon: AlertCircle },
      open: { variant: 'default', icon: MessageSquare },
      answered: { variant: 'secondary', icon: CheckCircle2 },
      closed: { variant: 'outline', icon: CheckCircle2 },
    };

    const config = statusConfig[status] || { variant: 'outline' as const, icon: Clock };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeServices = orders.filter(o => o.status === 'active').length;
  const unpaidInvoices = invoices.filter(i => i.status === 'unpaid').length;
  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'customer-reply').length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t('billing.welcomeBack')}, {user?.email?.split('@')[0]}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your services, invoices, and support tickets
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              {t('billing.logout')}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">{t('billing.dashboard')}</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              <span className="hidden sm:inline">{t('billing.services')}</span>
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">{t('billing.invoices')}</span>
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">{t('billing.tickets')}</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{t('billing.account')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Server className="w-5 h-5 text-primary" />
                    Active Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{activeServices}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-destructive" />
                    Unpaid Invoices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-destructive">{unpaidInvoices}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-accent-foreground" />
                    Open Tickets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{openTickets}</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link to="/#pricing">
                    <Plus className="w-4 h-4 mr-2" />
                    Order New Service
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('tickets')}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {t('billing.createTicket')}
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Services</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">{t('billing.noServices')}</p>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 3).map(order => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{order.products?.name || 'Service'}</p>
                            <p className="text-sm text-muted-foreground">${order.price}/{order.billing_cycle}</p>
                          </div>
                          {getStatusBadge(order.status)}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                  {invoices.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">{t('billing.noInvoices')}</p>
                  ) : (
                    <div className="space-y-3">
                      {invoices.slice(0, 3).map(invoice => (
                        <div key={invoice.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">#{invoice.invoice_number}</p>
                            <p className="text-sm text-muted-foreground">${invoice.total}</p>
                          </div>
                          {getStatusBadge(invoice.status)}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{t('billing.services')}</h2>
              <Button asChild>
                <Link to="/#pricing">
                  <Plus className="w-4 h-4 mr-2" />
                  Order New Service
                </Link>
              </Button>
            </div>

            {orders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Server className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t('billing.noServices')}</p>
                  <Button asChild className="mt-4">
                    <Link to="/#pricing">Browse Services</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {orders.map(order => (
                  <Card key={order.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Zap className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{order.products?.name || 'Service'}</h3>
                          <p className="text-sm text-muted-foreground">
                            ${order.price}/{order.billing_cycle} • Due: {order.next_due_date ? new Date(order.next_due_date).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(order.status)}
                        <Button variant="outline" size="sm">
                          {t('billing.manageService')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <h2 className="text-2xl font-bold">{t('billing.invoices')}</h2>

            {invoices.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t('billing.noInvoices')}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {invoices.map(invoice => (
                  <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">Invoice #{invoice.invoice_number}</h3>
                        <p className="text-sm text-muted-foreground">
                          Due: {new Date(invoice.due_date).toLocaleDateString()} • Created: {new Date(invoice.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold">${invoice.total}</span>
                        {getStatusBadge(invoice.status)}
                        {invoice.status === 'unpaid' && (
                          <Button size="sm">
                            {t('billing.payNow')}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{t('billing.tickets')}</h2>
              <Button asChild>
                <Link to="/tickets/new">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('billing.createTicket')}
                </Link>
              </Button>
            </div>

            {tickets.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t('billing.noTickets')}</p>
                  <Button asChild className="mt-4">
                    <Link to="/tickets/new">{t('billing.createTicket')}</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {tickets.map(ticket => (
                  <Card key={ticket.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                        <p className="text-sm text-muted-foreground">
                          {ticket.department} • Updated: {new Date(ticket.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{ticket.priority}</Badge>
                        {getStatusBadge(ticket.status)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <h2 className="text-2xl font-bold">{t('billing.account')}</h2>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t('billing.profile')}</CardTitle>
                  <CardDescription>Your account information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-foreground">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                    <p className="text-foreground">{new Date(user?.created_at).toLocaleDateString()}</p>
                  </div>
                  <Button variant="outline" className="w-full">
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full">
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full">
                    Enable Two-Factor Auth
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default ClientArea;
