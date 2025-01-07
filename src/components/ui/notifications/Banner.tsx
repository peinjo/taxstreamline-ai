import React, { useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BannerProps {
  message: string;
  type?: "info" | "warning" | "error";
}

const Banner = ({ message, type = "info" }: BannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const getAlertVariant = () => {
    switch (type) {
      case "warning":
        return "warning";
      case "error":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <Alert variant={getAlertVariant()} className="relative">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </Alert>
  );
};

export default Banner;