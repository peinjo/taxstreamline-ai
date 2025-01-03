import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Globe } from "lucide-react";

interface Deadline {
  country: string;
  date: string;
}

interface UpcomingDeadlinesProps {
  deadlines: Deadline[];
}

export const UpcomingDeadlines = ({ deadlines }: UpcomingDeadlinesProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="mb-4 text-xl font-semibold">Upcoming Deadlines</h2>
        <div className="space-y-4">
          {deadlines.map((deadline, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-b pb-4 last:border-0"
            >
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">{deadline.country}</p>
                  <p className="text-sm text-gray-500">Due: {deadline.date}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Start Report
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};