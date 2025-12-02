import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Deadline {
  id: number;
  title: string;
  date: string;
  category?: string;
  priority?: string;
}

interface DeadlineCountdownProps {
  deadlines: Deadline[];
}

export function DeadlineCountdown({ deadlines }: DeadlineCountdownProps) {
  const getDaysUntil = (dateStr: string) => {
    const target = new Date(dateStr);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (daysUntil: number) => {
    if (daysUntil <= 3) return "destructive";
    if (daysUntil <= 7) return "warning";
    return "default";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <CardTitle>Upcoming Deadlines</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {deadlines && deadlines.length > 0 ? (
          <div className="space-y-3">
            {deadlines.map((deadline) => {
              const daysUntil = getDaysUntil(deadline.date);
              const urgency = getUrgencyColor(daysUntil);
              
              return (
                <div 
                  key={deadline.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className={`p-2 rounded ${
                    urgency === 'destructive' ? 'bg-destructive/10' :
                    urgency === 'warning' ? 'bg-warning/10' :
                    'bg-primary/10'
                  }`}>
                    {daysUntil <= 3 ? (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    ) : (
                      <Clock className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium truncate">{deadline.title}</div>
                      <Badge variant={urgency === 'destructive' ? 'destructive' : 'secondary'} className="shrink-0">
                        {daysUntil === 0 ? 'Today' : 
                         daysUntil === 1 ? 'Tomorrow' :
                         `${daysUntil} days`}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {new Date(deadline.date).toLocaleDateString('en-NG', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    {deadline.category && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        {deadline.category}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No upcoming deadlines</p>
            <p className="text-sm">All clear for the next 30 days</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
