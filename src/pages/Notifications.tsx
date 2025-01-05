import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Calendar, AlertCircle, CheckCircle2, Filter } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/contexts/NotificationContext";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Notifications = () => {
  const { notifications, markAsRead, deleteNotification, isLoading } = useNotifications();
  const [filter, setFilter] = useState<string>("all");

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "deadline":
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case "compliance":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return notification.status === "unread";
    return notification.type === filter;
  });

  const notificationStats = {
    all: notifications.length,
    unread: notifications.filter((n) => n.status === "unread").length,
    deadline: notifications.filter((n) => n.type === "deadline").length,
    compliance: notifications.filter((n) => n.type === "compliance").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              Manage your notifications, deadlines, and compliance alerts
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilter("all")}>
                  All ({notificationStats.all})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("unread")}>
                  Unread ({notificationStats.unread})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("deadline")}>
                  Deadlines ({notificationStats.deadline})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("compliance")}>
                  Compliance ({notificationStats.compliance})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              onClick={() => notifications.forEach((n) => markAsRead(n.id))}
            >
              Mark all as read
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notificationStats.all}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
              <Badge variant="secondary">{notificationStats.unread}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notificationStats.unread}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deadlines</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notificationStats.deadline}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notificationStats.compliance}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {isLoading ? (
                  <p className="text-center text-gray-500">Loading notifications...</p>
                ) : filteredNotifications.length === 0 ? (
                  <p className="text-center text-gray-500">No notifications found</p>
                ) : (
                  filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start space-x-4 rounded-lg border p-4 ${
                        notification.status === "unread"
                          ? "bg-blue-50 border-blue-100"
                          : "bg-white"
                      }`}
                    >
                      <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{notification.title}</h3>
                          <span className="text-sm text-gray-500">
                            {format(new Date(notification.created_at), "MMM d, yyyy")}
                          </span>
                        </div>
                        <p className="mt-1 text-gray-600">{notification.message}</p>
                        {notification.due_date && (
                          <p className="mt-2 text-sm text-gray-500">
                            Due: {format(new Date(notification.due_date), "MMM d, yyyy")}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {notification.status === "unread" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;