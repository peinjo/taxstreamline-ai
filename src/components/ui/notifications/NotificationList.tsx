import React from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

const NotificationList = () => {
  const { notifications, markAsRead, deleteNotification, isLoading } = useNotifications();

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

  if (isLoading) {
    return <div className="text-center p-4">Loading notifications...</div>;
  }

  if (notifications.length === 0) {
    return <div className="text-center p-4 text-gray-500">No notifications</div>;
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4 p-4">
        {notifications.map((notification) => (
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
        ))}
      </div>
    </ScrollArea>
  );
};

export default NotificationList;