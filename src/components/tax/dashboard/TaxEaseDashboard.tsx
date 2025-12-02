import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  FileText, 
  Upload, 
  Calculator, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DeadlineCountdown } from "./DeadlineCountdown";
import { LiabilitySummary } from "./LiabilitySummary";

interface TaxEaseDashboardProps {
  onNavigate: (tab: string) => void;
}

export function TaxEaseDashboard({ onNavigate }: TaxEaseDashboardProps) {
  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: upcomingDeadlines } = useQuery({
    queryKey: ["upcoming-deadlines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", user?.id)
        .gte("date", new Date().toISOString())
        .lte("date", new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
        .order("date", { ascending: true })
        .limit(3);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: recentFilingPacks } = useQuery({
    queryKey: ["recent-filing-packs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("filing_packs")
        .select("*")
        .eq("user_id", user?.id)
        .order("generated_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: pendingDocuments } = useQuery({
    queryKey: ["pending-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("filing_packs")
        .select("*")
        .eq("user_id", user?.id)
        .eq("status", "generated")
        .order("generated_at", { ascending: false });

      if (error) throw error;
      return data?.length || 0;
    },
    enabled: !!user,
  });

  return (
    <div className="space-y-6">
      {/* Hero Alert */}
      <Alert className="border-primary bg-primary/5">
        <AlertCircle className="h-5 w-5 text-primary" />
        <AlertDescription className="text-base">
          <strong>Welcome to TaxEase!</strong> We prepare your tax filing packs — you file directly with FIRS.
          Your filing pack includes calculations, supporting documents, and step-by-step filing instructions.
        </AlertDescription>
      </Alert>

      {/* Upcoming Deadlines & Liabilities */}
      <div className="grid gap-6 md:grid-cols-2">
        <DeadlineCountdown deadlines={upcomingDeadlines || []} />
        <LiabilitySummary />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to manage your tax compliance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button 
              variant="outline" 
              className="h-auto flex-col gap-2 p-4"
              onClick={() => onNavigate("calculator")}
            >
              <Calculator className="h-6 w-6 text-primary" />
              <div className="text-center">
                <div className="font-semibold">Calculate Taxes</div>
                <div className="text-xs text-muted-foreground">VAT, CIT, PIT, WHT</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto flex-col gap-2 p-4"
              onClick={() => onNavigate("transactions")}
            >
              <TrendingUp className="h-6 w-6 text-primary" />
              <div className="text-center">
                <div className="font-semibold">Track Transactions</div>
                <div className="text-xs text-muted-foreground">Income & expenses</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto flex-col gap-2 p-4"
              onClick={() => onNavigate("filing-pack")}
            >
              <FileText className="h-6 w-6 text-primary" />
              <div className="text-center">
                <div className="font-semibold">Generate Filing Pack</div>
                <div className="text-xs text-muted-foreground">Ready-to-file package</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto flex-col gap-2 p-4"
              onClick={() => onNavigate("documents")}
            >
              <Upload className="h-6 w-6 text-primary" />
              <div className="text-center">
                <div className="font-semibold">Upload Proof</div>
                <div className="text-xs text-muted-foreground">Payment receipts</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Filing Packs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Filing Packs</CardTitle>
              <CardDescription>Your generated tax filing packages</CardDescription>
            </div>
            {pendingDocuments && pendingDocuments > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-warning" />
                <span className="text-warning font-medium">{pendingDocuments} pending submission</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {recentFilingPacks && recentFilingPacks.length > 0 ? (
            <div className="space-y-3">
              {recentFilingPacks.map((pack) => (
                <div 
                  key={pack.id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded ${
                      pack.status === 'submitted' ? 'bg-success/10' : 
                      pack.status === 'completed' ? 'bg-primary/10' : 
                      'bg-muted'
                    }`}>
                      {pack.status === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{pack.tax_type.toUpperCase()} Filing Pack</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(pack.period_start).toLocaleDateString()} - {new Date(pack.period_end).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium capitalize ${
                      pack.status === 'submitted' ? 'text-success' :
                      pack.status === 'completed' ? 'text-primary' :
                      'text-muted-foreground'
                    }`}>
                      {pack.status}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(pack.generated_at || '').toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No filing packs yet</p>
              <Button 
                variant="link" 
                className="mt-2"
                onClick={() => onNavigate("filing-pack")}
              >
                Generate your first filing pack
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
