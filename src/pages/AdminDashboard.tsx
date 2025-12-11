import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Shield, Home, LogOut, Package, FileText, MessageSquare, 
  DollarSign, Users, Server, Eye, Send, RefreshCw, Loader2,
  CheckCircle, XCircle, Clock, AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface Order {
  id: string;
  user_id: string;
  price: number;
  status: string;
  billing_cycle: string;
  server_details: any;
  server_id: string | null;
  created_at: string;
  user_email?: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  user_id: string;
  order_id: string | null;
  subtotal: number;
  total: number;
  status: string;
  due_date: string;
  created_at: string;
  user_email?: string;
}

interface Ticket {
  id: string;
  user_id: string;
  subject: string;
  status: string;
  priority: string | null;
  department: string | null;
  created_at: string;
  updated_at: string;
  user_email?: string;
  replies?: TicketReply[];
}

interface Profile {
  user_id: string;
  email: string | null;
}

interface TicketReply {
  id: string;
  message: string;
  is_staff: boolean;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-500",
  active: "bg-green-500/20 text-green-500",
  paid: "bg-green-500/20 text-green-500",
  unpaid: "bg-red-500/20 text-red-500",
  cancelled: "bg-gray-500/20 text-gray-500",
  suspended: "bg-orange-500/20 text-orange-500",
  open: "bg-blue-500/20 text-blue-500",
  closed: "bg-gray-500/20 text-gray-500",
  answered: "bg-green-500/20 text-green-500",
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading, isAdmin, signOut } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [provisioningOrder, setProvisioningOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (!authLoading && user && !isAdmin) {
      toast({ title: "Access Denied", variant: "destructive" });
      navigate("/");
      return;
    }
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, authLoading, isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, invoicesRes, ticketsRes, profilesRes] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("invoices").select("*").order("created_at", { ascending: false }),
        supabase.from("tickets").select("*, replies:ticket_replies(*)").order("updated_at", { ascending: false }),
        supabase.from("profiles").select("user_id, email"),
      ]);

      const profileMap = new Map<string, string>();
      profilesRes.data?.forEach((p: Profile) => {
        if (p.email) profileMap.set(p.user_id, p.email);
      });

      if (ordersRes.data) {
        setOrders(ordersRes.data.map((o: any) => ({ ...o, user_email: profileMap.get(o.user_id) || "N/A" })));
      }
      if (invoicesRes.data) {
        setInvoices(invoicesRes.data.map((i: any) => ({ ...i, user_email: profileMap.get(i.user_id) || "N/A" })));
      }
      if (ticketsRes.data) {
        setTickets(ticketsRes.data.map((t: any) => ({ ...t, user_email: profileMap.get(t.user_id) || "N/A" })));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProvisionServer = async (order: Order) => {
    if (order.status !== "paid" && order.status !== "active") {
      toast({ title: "Order must be paid first", variant: "destructive" });
      return;
    }

    setProvisioningOrder(order.id);
    try {
      const { data, error } = await supabase.functions.invoke("pterodactyl", {
        body: {
          action: "create",
          orderId: order.id,
          serverDetails: order.server_details,
        },
      });

      if (error) throw error;

      toast({ title: "Server provisioned successfully!" });
      fetchData();
    } catch (error: any) {
      console.error("Provisioning error:", error);
      toast({ title: "Failed to provision server", description: error.message, variant: "destructive" });
    } finally {
      setProvisioningOrder(null);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
      if (error) throw error;
      toast({ title: `Order status updated to ${status}` });
      fetchData();
    } catch (error: any) {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  const handleUpdateInvoiceStatus = async (invoiceId: string, status: string) => {
    try {
      const updates: any = { status };
      if (status === "paid") updates.paid_at = new Date().toISOString();
      
      const { error } = await supabase.from("invoices").update(updates).eq("id", invoiceId);
      if (error) throw error;
      toast({ title: `Invoice status updated to ${status}` });
      fetchData();
    } catch (error: any) {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    setSendingReply(true);
    try {
      const { error: replyError } = await supabase.from("ticket_replies").insert({
        ticket_id: selectedTicket.id,
        user_id: user!.id,
        message: replyMessage,
        is_staff: true,
      });

      if (replyError) throw replyError;

      const { error: ticketError } = await supabase
        .from("tickets")
        .update({ status: "answered", updated_at: new Date().toISOString() })
        .eq("id", selectedTicket.id);

      if (ticketError) throw ticketError;

      toast({ title: "Reply sent!" });
      setReplyMessage("");
      fetchData();
      setSelectedTicket(null);
    } catch (error: any) {
      toast({ title: "Failed to send reply", variant: "destructive" });
    } finally {
      setSendingReply(false);
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    try {
      const { error } = await supabase.from("tickets").update({ status: "closed" }).eq("id", ticketId);
      if (error) throw error;
      toast({ title: "Ticket closed" });
      fetchData();
    } catch (error) {
      toast({ title: "Failed to close ticket", variant: "destructive" });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const stats = {
    totalOrders: orders.length,
    activeOrders: orders.filter((o) => o.status === "active").length,
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    totalRevenue: invoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.total, 0),
    openTickets: tickets.filter((t) => t.status === "open").length,
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/20 border border-primary/30">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-gradient">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage orders, invoices, and support</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/admin")} className="gap-2">
              <Package className="w-4 h-4" />
              Products
            </Button>
            <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
              <Home className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={signOut} className="gap-2">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.activeOrders}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.pendingOrders}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.openTickets}</p>
                  <p className="text-xs text-muted-foreground">Open Tickets</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders">
          <TabsList className="mb-6">
            <TabsTrigger value="orders" className="gap-2">
              <Package className="w-4 h-4" />
              Orders ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="invoices" className="gap-2">
              <FileText className="w-4 h-4" />
              Invoices ({invoices.length})
            </TabsTrigger>
            <TabsTrigger value="tickets" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Tickets ({tickets.length})
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>All Orders</CardTitle>
                  <Button variant="outline" size="sm" onClick={fetchData}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Server</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
                        <TableCell>{order.user_email || "N/A"}</TableCell>
                        <TableCell>{order.server_details?.name || "N/A"}</TableCell>
                        <TableCell>${order.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[order.status] || ""}>{order.status}</Badge>
                        </TableCell>
                        <TableCell>{format(new Date(order.created_at), "PP")}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Select onValueChange={(v) => handleUpdateOrderStatus(order.id, v)}>
                              <SelectTrigger className="w-28 h-8">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            {!order.server_id && (order.status === "paid" || order.status === "active") && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleProvisionServer(order)}
                                disabled={provisioningOrder === order.id}
                              >
                                {provisioningOrder === order.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Server className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>All Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono">{invoice.invoice_number}</TableCell>
                        <TableCell>{invoice.user_email || "N/A"}</TableCell>
                        <TableCell>${invoice.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[invoice.status] || ""}>{invoice.status}</Badge>
                        </TableCell>
                        <TableCell>{format(new Date(invoice.due_date), "PP")}</TableCell>
                        <TableCell>
                          <Select onValueChange={(v) => handleUpdateInvoiceStatus(invoice.id, v)}>
                            <SelectTrigger className="w-28 h-8">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unpaid">Unpaid</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="max-w-[200px] truncate">{ticket.subject}</TableCell>
                        <TableCell>{ticket.user_email || "N/A"}</TableCell>
                        <TableCell className="capitalize">{ticket.department}</TableCell>
                        <TableCell className="capitalize">{ticket.priority}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[ticket.status] || ""}>{ticket.status}</Badge>
                        </TableCell>
                        <TableCell>{format(new Date(ticket.updated_at), "Pp")}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedTicket(ticket)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>{ticket.subject}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="text-sm text-muted-foreground">
                                    From: {ticket.user_email} | {ticket.department} | {ticket.priority}
                                  </div>
                                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                    {ticket.replies?.map((reply) => (
                                      <div
                                        key={reply.id}
                                        className={`p-3 rounded-lg ${
                                          reply.is_staff ? "bg-primary/10 ml-8" : "bg-muted mr-8"
                                        }`}
                                      >
                                        <div className="text-xs text-muted-foreground mb-1">
                                          {reply.is_staff ? "Staff" : "Customer"} •{" "}
                                          {format(new Date(reply.created_at), "Pp")}
                                        </div>
                                        <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
                                      </div>
                                    ))}
                                  </div>
                                  {ticket.status !== "closed" && (
                                    <div className="space-y-2">
                                      <Textarea
                                        placeholder="Type your reply..."
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                      />
                                      <div className="flex gap-2">
                                        <Button onClick={handleSendReply} disabled={sendingReply} className="gap-2">
                                          {sendingReply ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                          ) : (
                                            <Send className="w-4 h-4" />
                                          )}
                                          Send Reply
                                        </Button>
                                        <Button
                                          variant="outline"
                                          onClick={() => handleCloseTicket(ticket.id)}
                                        >
                                          Close Ticket
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
