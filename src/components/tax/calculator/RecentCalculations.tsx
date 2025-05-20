
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";

export const RecentCalculations = () => {
  const { data: recentCalculations } = useQuery({
    queryKey: ["recentCalculations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tax_calculations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  if (!recentCalculations?.length) return null;

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Recent Calculations</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Tax</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentCalculations.map((calc) => (
            <TableRow key={calc.id}>
              <TableCell className="capitalize">{calc.tax_type.replace(/_/g, ' ')}</TableCell>
              <TableCell>₦{calc.income.toFixed(2)}</TableCell>
              <TableCell>₦{calc.tax_amount.toFixed(2)}</TableCell>
              <TableCell>{new Date(calc.created_at).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
