import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { checkDeadlines } from "@/services/notificationService";

export const useDeadlineChecker = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const checkForDeadlines = async () => {
      try {
        await checkDeadlines(user.id);
      } catch (error) {
        console.error("Error checking deadlines:", error);
      }
    };

    // Check deadlines immediately and then every hour
    checkForDeadlines();
    const interval = setInterval(checkForDeadlines, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);
};