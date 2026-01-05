import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Calendar, AlertCircle, Filter, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/contexts/NotificationContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationList from "@/components/ui/notifications/NotificationList";
import Banner from "@/components/ui/notifications/Banner";

const Notifications = () => {
  const navigate = useNavigate();
  const { notifications, isLoading } = useNotifications();
  const [filter, setFilter] = useState<string>("all");

  const notificationStats = {
    all: notifications.length,
    unread: notifications.filter((n) => n.status === "unread").length,
    deadline: notifications.filter((n) => n.type === "deadline").length,
    compliance: notifications.filter((n) => n.type === "compliance").length,
  };

  const criticalUpdates = notifications.filter(
    (n) => n.type === "compliance" && n.status === "unread"
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {criticalUpdates.length > 0 && (
          <Banner
            message="You have critical tax compliance updates that require your attention."
            type="warning"
          />
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              Manage your notifications, deadlines, and compliance alerts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/settings?tab=channels")}
            >
              <Settings className="mr-2 h-4 w-4" />
              Notification Channels
            </Button>
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
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
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
            <NotificationList />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;