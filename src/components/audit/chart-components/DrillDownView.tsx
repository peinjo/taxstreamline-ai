
import React from "react";
import { Button } from "@/components/ui/button";
import { ChartRenderer } from "./ChartRenderer";
import { DrillDownItem } from "@/types/chart";

interface DrillDownViewProps {
  drillDownData: DrillDownItem[] | null;
  drillDownTitle: string;
  resetDrillDown: () => void;
  chartType: "bar" | "pie" | "line" | "area";
}

export const DrillDownView: React.FC<DrillDownViewProps> = ({
  drillDownData,
  drillDownTitle,
  resetDrillDown,
  chartType,
}) => {
  if (!drillDownData) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{drillDownTitle}</h3>
        <Button variant="outline" size="sm" onClick={resetDrillDown}>
          Reset View
        </Button>
      </div>
      <ChartRenderer
        chartData={drillDownData}
        chartType={chartType}
        title={drillDownTitle}
        onItemClick={() => {}}
      />
    </div>
  );
};
