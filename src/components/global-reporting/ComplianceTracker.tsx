
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface ComplianceItem {
  id: number;
  country: string;
  requirement_type: string;
  title: string;
  description?: string;
  frequency: string;
  next_due_date?: string;
  status: string;
}

interface ComplianceTrackerProps {
  compliance: ComplianceItem[];
  isLoading: boolean;
}

export function ComplianceTracker({ compliance, isLoading }: ComplianceTrackerProps) {
  const getStatusIcon = (status: string, dueDate?: string) => {
    if (status === "completed") {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    
    if (dueDate) {
      const due = new Date(dueDate);
      const now = new Date();
      const daysUntil = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntil < 0) {
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      } else if (daysUntil <= 7) {
        return <Clock className="h-4 w-4 text-yellow-600" />;
      }
    }
    
    return <Clock className="h-4 w-4 text-blue-600" />;
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency.toLowerCase()) {
      case "daily":
        return "bg-red-100 text-red-800";
      case "weekly":
        return "bg-orange-100 text-orange-800";
      case "monthly":
        return "bg-yellow-100 text-yellow-800";
      case "quarterly":
        return "bg-blue-100 text-blue-800";
      case "annual":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compliance Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 border rounded animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Tracker ({compliance.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {compliance.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No compliance items found
            </div>
          ) : (
            compliance.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start space-x-3">
                  {getStatusIcon(item.status, item.next_due_date)}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{item.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {item.country}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.description || item.requirement_type}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${getFrequencyColor(item.frequency)}`}>
                        {item.frequency}
                      </Badge>
                      {item.next_due_date && (
                        <span className="text-xs text-muted-foreground">
                          Next due: {format(new Date(item.next_due_date), "MMM dd, yyyy")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
