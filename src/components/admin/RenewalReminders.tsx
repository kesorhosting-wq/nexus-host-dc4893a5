import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bell, Loader2, RefreshCw, AlertTriangle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReminderItem {
  invoiceId: string;
  invoiceNumber: string;
  userEmail: string;
  serverName: string;
  amount: number;
  dueDate: string;
  daysUntilDue: number;
  status: string;
  isOverdue: boolean;
}

const RenewalReminders = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [stats, setStats] = useState({ total: 0, overdue: 0, dueSoon: 0 });

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("renewal-reminder", {
        body: { action: "get-pending" },
      });

      if (error) throw error;

      setReminders(data.reminders || []);
      setStats({
        total: data.totalPending || 0,
        overdue: data.overdueCount || 0,
        dueSoon: data.dueSoonCount || 0,
      });
    } catch (error: any) {
      console.error("Failed to fetch reminders:", error);
      toast({ 
        title: "Failed to fetch reminders", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const runRenewalCheck = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("renewal-reminder", {
        body: { action: "check" },
      });

      if (error) throw error;

      toast({ 
        title: "Renewal check completed", 
        description: `${data.remindersGenerated} reminders generated` 
      });
      fetchReminders();
    } catch (error: any) {
      toast({ 
        title: "Failed to run check", 
        description: error.message, 
        variant: "destructive" 
      });
      setLoading(false);
    }
  };

  const generateRenewalInvoices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("invoice-generator", {
        body: { action: "generate-renewal" },
      });

      if (error) throw error;

      toast({ 
        title: "Renewal invoices generated", 
        description: `${data.generatedCount} invoices created` 
      });
      fetchReminders();
    } catch (error: any) {
      toast({ 
        title: "Failed to generate invoices", 
        description: error.message, 
        variant: "destructive" 
      });
      setLoading(false);
    }
  };

  const checkOverdue = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("invoice-generator", {
        body: { action: "check-overdue" },
      });

      if (error) throw error;

      toast({ 
        title: "Overdue check completed", 
        description: `${data.suspendedCount} services suspended` 
      });
      fetchReminders();
    } catch (error: any) {
      toast({ 
        title: "Failed to check overdue", 
        description: error.message, 
        variant: "destructive" 
      });
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-primary" />
            <div>
              <CardTitle>Renewal Reminders</CardTitle>
              <CardDescription>Manage upcoming renewals and overdue invoices</CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">{stats.total} Pending</Badge>
            {stats.overdue > 0 && (
              <Badge variant="destructive">{stats.overdue} Overdue</Badge>
            )}
            {stats.dueSoon > 0 && (
              <Badge variant="secondary">{stats.dueSoon} Due Soon</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={fetchReminders} disabled={loading} variant="outline" size="sm" className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh
          </Button>
          <Button onClick={runRenewalCheck} disabled={loading} variant="outline" size="sm" className="gap-2">
            <Clock className="w-4 h-4" />
            Check Renewals
          </Button>
          <Button onClick={generateRenewalInvoices} disabled={loading} variant="outline" size="sm" className="gap-2">
            <Bell className="w-4 h-4" />
            Generate Invoices
          </Button>
          <Button onClick={checkOverdue} disabled={loading} variant="destructive" size="sm" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Process Overdue
          </Button>
        </div>

        {reminders.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Server</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reminders.map((reminder) => (
                  <TableRow key={reminder.invoiceId}>
                    <TableCell className="font-mono text-sm">
                      {reminder.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-sm">
                      {reminder.userEmail || "N/A"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {reminder.serverName || "N/A"}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${reminder.amount?.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(reminder.dueDate)}
                      <span className="ml-2 text-muted-foreground">
                        ({reminder.daysUntilDue > 0 
                          ? `${reminder.daysUntilDue}d left` 
                          : `${Math.abs(reminder.daysUntilDue)}d overdue`})
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={reminder.isOverdue ? "destructive" : reminder.daysUntilDue <= 3 ? "secondary" : "outline"}
                      >
                        {reminder.isOverdue ? "Overdue" : reminder.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {loading ? "Loading..." : "No pending renewals"}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RenewalReminders;
