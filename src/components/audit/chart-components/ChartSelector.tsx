
import React from "react";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  BarChart,
  LineChart,
  AreaChart
} from "lucide-react";

interface ChartSelectorProps {
  chartType: "bar" | "pie" | "line" | "area";
  setChartType: (type: "bar" | "pie" | "line" | "area") => void;
}

export const ChartSelector: React.FC<ChartSelectorProps> = ({
  chartType,
  setChartType,
}) => {
  return (
    <div className="flex gap-2">
      <Button
        variant={chartType === "bar" ? "default" : "outline"}
        size="sm"
        onClick={() => setChartType("bar")}
      >
        <BarChart className="h-4 w-4 mr-1" />
        Bar
      </Button>
      <Button
        variant={chartType === "pie" ? "default" : "outline"}
        size="sm"
        onClick={() => setChartType("pie")}
      >
        <PieChart className="h-4 w-4 mr-1" />
        Pie
      </Button>
      <Button
        variant={chartType === "line" ? "default" : "outline"}
        size="sm"
        onClick={() => setChartType("line")}
      >
        <LineChart className="h-4 w-4 mr-1" />
        Line
      </Button>
      <Button
        variant={chartType === "area" ? "default" : "outline"}
        size="sm"
        onClick={() => setChartType("area")}
      >
        <AreaChart className="h-4 w-4 mr-1" />
        Area
      </Button>
    </div>
  );
};
