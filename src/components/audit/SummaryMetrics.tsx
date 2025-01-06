import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
}

const MetricCard = ({ title, value, description }: MetricCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

interface SummaryMetricsProps {
  metrics: {
    totalLiability: number;
    filingCount: number;
    pendingPayments: number;
    complianceRate: number;
  };
}

export const SummaryMetrics = ({ metrics }: SummaryMetricsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Tax Liability"
        value={`₦${metrics.totalLiability.toLocaleString()}`}
        description="Total amount across all tax types"
      />
      <MetricCard
        title="Total Filings"
        value={metrics.filingCount}
        description="Number of tax filings submitted"
      />
      <MetricCard
        title="Pending Payments"
        value={metrics.pendingPayments}
        description="Payments awaiting processing"
      />
      <MetricCard
        title="Compliance Rate"
        value={`${metrics.complianceRate}%`}
        description="Overall tax compliance rate"
      />
    </div>
  );
};