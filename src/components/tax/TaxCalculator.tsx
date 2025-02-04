import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PAYECalculator } from "./PAYECalculator";
import { VATCalculator } from "./VATCalculator";
import { WithholdingTaxCalculator } from "./WithholdingTaxCalculator";
import { TaxSummaryTable } from "../audit/TaxSummaryTable";

interface TaxCalculation {
  id: number;
  tax_type: string;
  income: number;
  tax_amount: number;
  created_at: string;
  input_data: Record<string, any> | null;
  calculation_details: Record<string, any> | null;
  user_id: string | null;
}

export const TaxCalculator = () => {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const [realtimeData, setRealtimeData] = useState<TaxCalculation[]>([]);

  const { data: calculations, refetch } = useQuery<TaxCalculation[]>({
    queryKey: ["tax-calculations"],
    queryFn: async () => {
      const query = supabase
        .from("tax_calculations")
        .select("*")
        .order("created_at", { ascending: false });

      if (userRole !== "admin") {
        query.eq("user_id", user?.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    const channel = supabase
      .channel("tax-calculations-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tax_calculations",
        },
        (payload) => {
          console.log("Real-time update:", payload);
          toast({
            title: "Tax Calculation Updated",
            description: "A new tax calculation has been processed.",
          });
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch, toast]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <PAYECalculator />
        <VATCalculator />
        <WithholdingTaxCalculator />
      </div>

      {calculations && calculations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Calculations</CardTitle>
          </CardHeader>
          <CardContent>
            <TaxSummaryTable data={calculations} isLoading={false} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};