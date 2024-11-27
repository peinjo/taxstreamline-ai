import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface Activity {
  id: number;
  action: string;
  documentTitle: string;
  documentType: string;
  timestamp: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  company: string;
}

const Notifications = () => {
  const { data: activities } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .order("timestamp", { ascending: false });
      
      if (error) throw error;
      return data as Activity[];
    },
  });

  const { data: events } = useQuery({
    queryKey: ["calendar-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .order("date", { ascending: true });
      
      if (error) throw error;
      return data as CalendarEvent[];
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {activities?.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 text-sm"
                    >
                      <div className="mt-0.5">
                        <FileText className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-gray-900">
                          {activity.action} {activity.documentTitle} ({activity.documentType})
                        </p>
                        <p className="text-gray-500 text-xs">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!activities || activities.length === 0) && (
                    <p className="text-gray-500 text-center">No recent activities</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {events?.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start space-x-3 text-sm"
                    >
                      <div className="mt-0.5">
                        <Calendar className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-gray-900">{event.title}</p>
                        <p className="text-gray-500 text-xs">
                          {format(new Date(event.date), "MMMM dd, yyyy")} - {event.company}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!events || events.length === 0) && (
                    <p className="text-gray-500 text-center">No upcoming events</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;