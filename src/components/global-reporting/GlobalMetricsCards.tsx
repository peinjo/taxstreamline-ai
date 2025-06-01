
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, AlertTriangle, Globe, CheckCircle } from "lucide-react";

interface GlobalMetricsCardsProps {
  metrics: {
    totalDeadlines: number;
    urgentDeadlines: number;
    countriesActive: number;
    complianceItems: number;
  };
}

export function GlobalMetricsCards({ metrics }: GlobalMetricsCardsProps) {
  const cards = [
    {
      title: "Total Deadlines",
      value: metrics.totalDeadlines,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Urgent Deadlines",
      value: metrics.urgentDeadlines,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Active Countries",
      value: metrics.countriesActive,
      icon: Globe,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Compliance Items",
      value: metrics.complianceItems,
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
