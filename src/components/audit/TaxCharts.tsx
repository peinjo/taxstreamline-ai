
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TaxReport } from "@/types";
import {
  ChartRenderer,
  ChartSelector,
  DrillDownView,
  ViewSelector,
  YearFilter,
  useChartData,
} from "./chart-components";
import { DrillDownItem, ChartDataPoint } from "@/types/chart";

interface Props {
  data: TaxReport[];
}

export const TaxCharts = ({ data }: Props) => {
  const [activeChart, setActiveChart] = useState<"year" | "type" | "status" | "trends">("year");
  const [chartType, setChartType] = useState<"bar" | "pie" | "line" | "area">("bar");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [drillDownData, setDrillDownData] = useState<DrillDownItem[] | null>(null);
  const [drillDownTitle, setDrillDownTitle] = useState<string>("");
  
  const {
    filteredData,
    lineChartData,
    pieChartData,
    statusChartData,
    monthlyTrendsData,
    availableYears,
  } = useChartData(data, selectedYear);

  // Handle drill down on chart click
  const handlePieClick = (data: ChartDataPoint, index: number) => {
    const clickedItem = data.name;
    const detailedData = filteredData.filter(item => 
      activeChart === "type" ? item.tax_type === String(clickedItem).toLowerCase() : 
      activeChart === "status" ? item.status === String(clickedItem).toLowerCase() : 
      true
    );
    
    const processedData = detailedData.reduce((acc: DrillDownItem[], curr) => {
      const key = activeChart === "type" ? curr.status :
                activeChart === "status" ? curr.tax_type :
                curr.tax_year.toString();
      
      const existingEntry = acc.find((entry) => entry.name === key);
      if (existingEntry) {
        existingEntry.value += Number(curr.amount || 0);
      } else {
        acc.push({ 
          name: key.charAt(0).toUpperCase() + key.slice(1), 
          value: Number(curr.amount || 0) 
        });
      }
      return acc;
    }, []);
    
    setDrillDownTitle(`Details for ${clickedItem}`);
    setDrillDownData(processedData);
  };

  // Reset drill down
  const resetDrillDown = () => {
    setDrillDownData(null);
  };

  const getChartData = () => {
    if (drillDownData) return drillDownData;
    
    switch (activeChart) {
      case "year":
        return lineChartData.map(item => ({
          name: item.year,
          value: item.amount,
        }));
      case "type":
        return pieChartData;
      case "status":
        return statusChartData;
      case "trends":
        return monthlyTrendsData;
      default:
        return [];
    }
  };

  const getChartTitle = () => {
    if (drillDownData) return drillDownTitle;
    
    switch (activeChart) {
      case "year":
        return "Year-over-Year Tax Trends";
      case "type":
        return "Tax Type Breakdown";
      case "status":
        return "Tax Status Distribution";
      case "trends":
        return "Monthly Tax Trends";
      default:
        return "Tax Data";
    }
  };

  const getChartDescription = () => {
    if (drillDownData) return "Click 'Reset View' to go back to the main chart";
    
    switch (activeChart) {
      case "year":
        return "Total tax amount reported by year";
      case "type":
        return "Distribution of taxes by type";
      case "status":
        return "Distribution of taxes by status";
      case "trends":
        return "Monthly trends in tax reporting";
      default:
        return "";
    }
  };

  if (!data.length) {
    return (
      <Card className="p-4 h-full">
        <CardHeader>
          <CardTitle>No Data Available</CardTitle>
          <CardDescription>There is no tax data available for the current selection.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">Please adjust your filters or add new tax reports</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-4 h-full">
      <CardHeader>
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div>
            <CardTitle>{getChartTitle()}</CardTitle>
            <CardDescription>{getChartDescription()}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <YearFilter
              selectedYear={selectedYear}
              availableYears={availableYears}
              onYearChange={setSelectedYear}
            />
            {drillDownData && (
              <div>
                <DrillDownView
                  drillDownData={drillDownData}
                  drillDownTitle={drillDownTitle}
                  resetDrillDown={resetDrillDown}
                  chartType={chartType}
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <ChartSelector chartType={chartType} setChartType={setChartType} />
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <ChartRenderer
          chartData={getChartData()}
          chartType={chartType}
          title={getChartTitle()}
          onItemClick={handlePieClick}
        />
      </CardContent>
      {!drillDownData && (
        <CardFooter className="flex justify-center border-t pt-4">
          <ViewSelector activeChart={activeChart} setActiveChart={setActiveChart} />
        </CardFooter>
      )}
    </Card>
  );
};
