
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChartBar, Wallet, FileText, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MetricProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  loading?: boolean;
  action?: () => void;
}

const Metric = ({ title, value, icon: Icon, color, loading, action }: MetricProps) => (
  <Card 
    className="hover:shadow-md transition-shadow cursor-pointer" 
    onClick={action}
  >
    <CardContent className="p-4 flex items-center">
      <div className={`p-2 rounded-full mr-4 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        {loading ? (
          <Skeleton className="h-6 w-8" />
        ) : (
          <p className="text-xl font-bold">{value}</p>
        )}
      </div>
    </CardContent>
  </Card>
);

export const TaxMetrics = ({ onNavigate }: { onNavigate: (tab: string) => void }) => {
  const { data: recentCalculations, isLoading: isCalcLoading } = useQuery({
    queryKey: ["recent-tax-calculations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tax_calculations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: recentPayments, isLoading: isPaymentsLoading } = useQuery({
    queryKey: ["recent-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: recentFilings, isLoading: isFilingsLoading } = useQuery({
    queryKey: ["recent-filings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tax_filings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data || [];
    },
  });

  const metrics = [
    {
      title: "Recent Calculations",
      value: recentCalculations?.length || 0,
      icon: ChartBar,
      color: "text-blue-500 bg-blue-100",
      loading: isCalcLoading,
    },
    {
      title: "Recent Payments",
      value: recentPayments?.length || 0, 
      icon: Wallet,
      color: "text-green-500 bg-green-100",
      loading: isPaymentsLoading,
    },
    {
      title: "Documents",
      value: "View", 
      icon: FileText,
      color: "text-purple-500 bg-purple-100",
      action: () => onNavigate("documents"),
      loading: false,
    },
    {
      title: "Recent Filings",
      value: recentFilings?.length || 0,
      icon: Calendar,
      color: "text-orange-500 bg-orange-100", 
      loading: isFilingsLoading,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, index) => (
        <Metric key={index} {...metric} />
      ))}
    </div>
  );
};
