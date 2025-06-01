
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Globe, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface Deadline {
  id: number;
  country: string;
  title: string;
  description?: string;
  due_date: string;
  tax_type: string;
  priority: string;
  status: string;
}

interface UpcomingDeadlinesTableProps {
  deadlines: Deadline[];
  isLoading: boolean;
}

export function UpcomingDeadlinesTable({ deadlines, isLoading }: UpcomingDeadlinesTableProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
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
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Deadlines ({deadlines.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deadlines.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No upcoming deadlines found
            </div>
          ) : (
            deadlines.map((deadline) => {
              const daysUntil = getDaysUntilDue(deadline.due_date);
              const isOverdue = daysUntil < 0;
              const isUrgent = daysUntil <= 7 && daysUntil >= 0;
              
              return (
                <div
                  key={deadline.id}
                  className={`flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow ${
                    isOverdue ? "border-red-200 bg-red-50" : 
                    isUrgent ? "border-yellow-200 bg-yellow-50" : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Globe className="h-5 w-5 text-blue-600 mt-1" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{deadline.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {deadline.country}
                        </Badge>
                        <Badge className={`text-xs ${getPriorityColor(deadline.priority)}`}>
                          {deadline.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {deadline.description || deadline.tax_type}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Due: {format(new Date(deadline.due_date), "MMM dd, yyyy")}</span>
                        <span className={`flex items-center gap-1 ${
                          isOverdue ? "text-red-600" : isUrgent ? "text-yellow-600" : "text-green-600"
                        }`}>
                          {isOverdue && <AlertTriangle className="h-3 w-3" />}
                          {isOverdue ? `${Math.abs(daysUntil)} days overdue` : 
                           daysUntil === 0 ? "Due today" :
                           `${daysUntil} days remaining`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Start Report
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
