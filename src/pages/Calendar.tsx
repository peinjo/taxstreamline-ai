import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const Calendar = () => {
  const upcomingEvents = [
    {
      title: "Transfer Pricing Documentation Due",
      date: "March 31, 2024",
      company: "Global Corp Ltd",
    },
    {
      title: "Quarterly Tax Review",
      date: "April 15, 2024",
      company: "Tech Solutions Inc",
    },
    {
      title: "Annual Compliance Check",
      date: "April 30, 2024",
      company: "Innovation Labs",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Calendar</h1>
          <Button>
            <span className="mr-2">Add Event</span>
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Upcoming Events</h2>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="rounded-lg bg-blue-100 p-2">
                        <CalendarIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <div className="flex space-x-4">
                          <p className="text-sm text-gray-500">
                            {event.date}
                          </p>
                          <p className="text-sm text-gray-500">
                            {event.company}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button variant="link" size="sm">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Today's Schedule</h2>
              <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
                <CalendarIcon className="h-12 w-12 text-gray-400" />
                <p className="text-gray-500">No events scheduled for today</p>
                <Button variant="link" className="text-blue-600">
                  Schedule a meeting
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Calendar;