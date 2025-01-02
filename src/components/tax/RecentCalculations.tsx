import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface TaxCalculation {
  id: number;
  tax_type: string;
  income: number;
  tax_amount: number;
  created_at: string;
}

export const RecentCalculations = () => {
  const { user } = useAuth();

  const { data: calculations, isLoading } = useQuery({
    queryKey: ["recent-calculations", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tax_calculations")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as TaxCalculation[];
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!calculations?.length) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No recent calculations found
      </p>
    );
  }

  const getTaxTypeName = (type: string) => {
    const types: Record<string, string> = {
      cit: "Corporate Income Tax",
      vat: "VAT",
      paye: "PAYE",
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-4">
      {calculations.map((calc) => (
        <div
          key={calc.id}
          className="flex items-center justify-between p-4 rounded-lg border"
        >
          <div>
            <h4 className="font-medium">{getTaxTypeName(calc.tax_type)}</h4>
            <p className="text-sm text-muted-foreground">
              {format(new Date(calc.created_at), "PPP")}
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium">₦{calc.tax_amount.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">
              Income: ₦{calc.income.toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};