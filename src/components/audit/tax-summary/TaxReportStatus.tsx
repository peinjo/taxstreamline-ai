
import React from "react";
import { Badge } from "@/components/ui/badge";

interface TaxReportStatusProps {
  status: string;
}

export const TaxReportStatus: React.FC<TaxReportStatusProps> = ({ status }) => {
  if (status === "paid") {
    return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">{status}</Badge>;
  } else {
    return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">{status}</Badge>;
  }
};
