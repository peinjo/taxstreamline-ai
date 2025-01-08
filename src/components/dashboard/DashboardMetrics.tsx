import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, FileText, AlertOctagon } from "lucide-react";

interface DashboardMetricsProps {
  metrics: {
    upcoming_deadlines: number;
    active_clients: number;
    documents_pending: number;
    compliance_alerts: number;
  };
}

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  const metricCards = [
    {
      title: "Upcoming Deadlines",
      value: metrics?.upcoming_deadlines || "0",
      icon: Calendar,
      className: "bg-blue-500",
    },
    {
      title: "Active Clients",
      value: metrics?.active_clients || "0",
      icon: Users,
      className: "bg-green-500",
    },
    {
      title: "Documents Pending",
      value: metrics?.documents_pending || "0",
      icon: FileText,
      className: "bg-yellow-500",
    },
    {
      title: "Compliance Alerts",
      value: metrics?.compliance_alerts || "0",
      icon: AlertOctagon,
      className: "bg-red-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metricCards.map((metric) => (
        <Card key={metric.title}>
          <CardContent className="flex items-center p-6">
            <div className={`mr-4 rounded-full p-2 text-white ${metric.className}`}>
              <metric.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </p>
              <h2 className="text-3xl font-bold">{metric.value}</h2>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}