import React, { createContext, useContext, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { useDeadlineChecker } from "@/hooks/useDeadlineChecker";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  status: string;
  due_date: string | null;
  created_at: string;
}

interface NotificationContextType {
  notifications: Notification[];
  markAsRead: (id: number) => void;
  deleteNotification: (id: number) => void;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Use the deadline checker hook
  useDeadlineChecker();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user?.id,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("notifications")
        .update({ status: "read" })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification deleted");
    },
  });

  const markAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  const deleteNotification = (id: number) => {
    deleteNotificationMutation.mutate(id);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        markAsRead,
        deleteNotification,
        isLoading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
