import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingDown, AlertCircle } from "lucide-react";

export function LiabilitySummary() {
  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: calculations } = useQuery({
    queryKey: ["recent-calculations", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tax_calculations")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const calculateTotalLiability = () => {
    if (!calculations || calculations.length === 0) return 0;
    
    // Get most recent calculation per tax type
    const latestByType = calculations.reduce((acc, calc) => {
      if (!acc[calc.tax_type] || new Date(calc.created_at) > new Date(acc[calc.tax_type].created_at)) {
        acc[calc.tax_type] = calc;
      }
      return acc;
    }, {} as Record<string, typeof calculations[0]>);

    return Object.values(latestByType).reduce((sum, calc) => sum + calc.tax_amount, 0);
  };

  const totalLiability = calculateTotalLiability();

  const getTaxTypeBreakdown = () => {
    if (!calculations || calculations.length === 0) return [];

    const latestByType = calculations.reduce((acc, calc) => {
      if (!acc[calc.tax_type] || new Date(calc.created_at) > new Date(acc[calc.tax_type].created_at)) {
        acc[calc.tax_type] = calc;
      }
      return acc;
    }, {} as Record<string, typeof calculations[0]>);

    return Object.entries(latestByType).map(([type, calc]) => ({
      type: type.toUpperCase(),
      amount: calc.tax_amount,
      date: new Date(calc.created_at).toLocaleDateString(),
    }));
  };

  const breakdown = getTaxTypeBreakdown();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <CardTitle>Tax Liability Summary</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Estimated Total Liability</div>
            <div className="text-3xl font-bold text-primary">
              ₦{totalLiability.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Based on recent calculations
            </div>
          </div>

          {breakdown.length > 0 ? (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Breakdown by Tax Type</div>
              {breakdown.map((item) => (
                <div 
                  key={item.type}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.type}</Badge>
                    <span className="text-sm text-muted-foreground">{item.date}</span>
                  </div>
                  <div className="font-medium">
                    ₦{item.amount.toLocaleString('en-NG', { maximumFractionDigits: 0 })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <TrendingDown className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No tax calculations yet</p>
              <p className="text-xs">Calculate your taxes to see liability summary</p>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              This is an estimate based on your calculations. Actual liability may differ.
              Always verify with FIRS or a tax professional.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
