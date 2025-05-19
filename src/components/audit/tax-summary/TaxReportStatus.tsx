
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface TaxReportStatusProps {
  status: string;
  className?: string;
}

export const TaxReportStatus: React.FC<TaxReportStatusProps> = ({ 
  status, 
  className = "" 
}) => {
  const getStatusInfo = () => {
    switch (status.toLowerCase()) {
      case "approved":
        return {
          label: "Approved",
          badge: "bg-green-100 text-green-800 border-green-200",
          icon: <CheckCircle className="h-4 w-4 mr-1" />,
        };
      case "pending":
        return {
          label: "Pending",
          badge: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: <Clock className="h-4 w-4 mr-1" />,
        };
      case "rejected":
        return {
          label: "Rejected",
          badge: "bg-red-100 text-red-800 border-red-200",
          icon: <XCircle className="h-4 w-4 mr-1" />,
        };
      default:
        return {
          label: status.charAt(0).toUpperCase() + status.slice(1),
          badge: "",
          icon: null,
        };
    }
  };

  const { label, badge, icon } = getStatusInfo();

  return (
    <Badge variant="outline" className={`${badge} ${className} flex items-center`}>
      {icon}
      {label}
    </Badge>
  );
};
