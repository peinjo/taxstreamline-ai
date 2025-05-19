
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge, Calendar, Filter, TrendingUp } from "lucide-react";

interface ViewSelectorProps {
  activeChart: "year" | "type" | "status" | "trends";
  setActiveChart: (chart: "year" | "type" | "status" | "trends") => void;
}

export const ViewSelector: React.FC<ViewSelectorProps> = ({
  activeChart,
  setActiveChart,
}) => {
  return (
    <div className="flex gap-2">
      <Button
        variant={activeChart === "year" ? "default" : "outline"}
        size="sm"
        onClick={() => setActiveChart("year")}
      >
        <TrendingUp className="h-4 w-4 mr-1" />
        Year Trends
      </Button>
      <Button
        variant={activeChart === "type" ? "default" : "outline"}
        size="sm"
        onClick={() => setActiveChart("type")}
      >
        <Filter className="h-4 w-4 mr-1" />
        By Type
      </Button>
      <Button
        variant={activeChart === "status" ? "default" : "outline"}
        size="sm"
        onClick={() => setActiveChart("status")}
      >
        <Badge className="h-4 w-4 mr-1" />
        By Status
      </Button>
      <Button
        variant={activeChart === "trends" ? "default" : "outline"}
        size="sm"
        onClick={() => setActiveChart("trends")}
      >
        <Calendar className="h-4 w-4 mr-1" />
        Monthly
      </Button>
    </div>
  );
};
