
import React from "react";
import { Card } from "@/components/ui/card";

export const NoDataDisplay: React.FC = () => {
  return (
    <Card className="p-8 text-center">
      <p className="text-muted-foreground">No data available for the selected filters.</p>
      <p className="text-sm text-muted-foreground mt-2">
        Try changing your filters or adding new tax reports.
      </p>
    </Card>
  );
};
