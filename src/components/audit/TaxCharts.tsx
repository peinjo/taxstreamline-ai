
import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  Sector,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  TrendingUp,
  Calendar,
  Filter
} from "lucide-react";
import { TaxReport } from "@/types";

interface Props {
  data: TaxReport[];
}

export const TaxCharts = ({ data }: Props) => {
  const [activeChart, setActiveChart] = useState<"year" | "type" | "status" | "trends">("year");
  const [chartType, setChartType] = useState<"bar" | "pie" | "line" | "area">("bar");
  const [activePieIndex, setActivePieIndex] = useState<number | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [drillDownData, setDrillDownData] = useState<any[] | null>(null);
  const [drillDownTitle, setDrillDownTitle] = useState<string>("");
  
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(data.map(item => item.tax_year)));
    return ["all", ...years.sort((a, b) => b - a).map(String)];
  }, [data]);

  const filteredData = useMemo(() => {
    if (selectedYear === "all") return data;
    return data.filter(item => item.tax_year.toString() === selectedYear);
  }, [data, selectedYear]);
  
  // Process data for year-over-year trends
  const lineChartData = useMemo(() => {
    return filteredData.reduce((acc: any[], curr) => {
      const year = curr.tax_year;
      const existingEntry = acc.find((entry) => entry.year === year);
      if (existingEntry) {
        existingEntry.amount += Number(curr.amount || 0);
      } else {
        acc.push({ year, amount: Number(curr.amount || 0) });
      }
      return acc.sort((a, b) => a.year - b.year);
    }, []);
  }, [filteredData]);

  // Process data for tax type breakdown
  const pieChartData = useMemo(() => {
    return filteredData.reduce((acc: any[], curr) => {
      const existingEntry = acc.find((entry) => entry.name === curr.tax_type);
      if (existingEntry) {
        existingEntry.value += Number(curr.amount || 0);
      } else if (curr.tax_type) {
        acc.push({ 
          name: curr.tax_type.charAt(0).toUpperCase() + curr.tax_type.slice(1), 
          value: Number(curr.amount || 0) 
        });
      }
      return acc;
    }, []);
  }, [filteredData]);

  // Process data for status breakdown chart
  const statusChartData = useMemo(() => {
    return filteredData.reduce((acc: any[], curr) => {
      const existingEntry = acc.find((entry) => entry.name === curr.status);
      if (existingEntry) {
        existingEntry.value += Number(curr.amount || 0);
      } else if (curr.status) {
        acc.push({ 
          name: curr.status.charAt(0).toUpperCase() + curr.status.slice(1), 
          value: Number(curr.amount || 0) 
        });
      }
      return acc;
    }, []);
  }, [filteredData]);

  // Process data for monthly trends
  const monthlyTrendsData = useMemo(() => {
    const monthsData = filteredData.reduce((acc: any, curr) => {
      if (!curr.created_at) return acc;
      
      const date = new Date(curr.created_at);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = { 
          month: new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          value: 0 
        };
      }
      
      acc[monthYear].value += Number(curr.amount || 0);
      return acc;
    }, {});
    
    return Object.values(monthsData).sort((a: any, b: any) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });
  }, [filteredData]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#a569bd", "#45b7d1", "#2ecc71"];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Handle pie chart active sector
  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${formatCurrency(value)}`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
          {`(${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };

  // Handle drill down on chart click
  const handlePieClick = (data: any, index: number) => {
    setActivePieIndex(index);
    
    const clickedItem = data.name;
    const detailedData = filteredData.filter(item => 
      activeChart === "type" ? item.tax_type === clickedItem.toLowerCase() : 
      activeChart === "status" ? item.status === clickedItem.toLowerCase() : 
      true
    );
    
    const processedData = detailedData.reduce((acc: any[], curr) => {
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
    setActivePieIndex(undefined);
  };

  const renderChartByType = (chartData: any[], title: string) => {
    switch (chartType) {
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                activeIndex={activePieIndex}
                activeShape={renderActiveShape}
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                onClick={handlePieClick}
                onMouseEnter={(_, index) => setActivePieIndex(index)}
                animationDuration={1000}
              >
                {chartData.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `₦${value.toLocaleString()}`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                name={title} 
                stroke="#1e40af"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case "area":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `₦${value.toLocaleString()}`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="value" 
                name={title}
                stroke="#1e40af"
                fill="#1e40af33"
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
        
      case "bar":
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `₦${value.toLocaleString()}`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar 
                dataKey="value" 
                name={title} 
                fill="#1e40af"
                animationDuration={1000}
                onClick={handlePieClick}
              />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  const renderYearTrendChart = () => {
    const chartData = lineChartData.map(item => ({
      name: item.year,
      value: item.amount,
    }));

    return renderChartByType(chartData, "Annual Tax Amount");
  };

  const renderTaxTypeChart = () => {
    return renderChartByType(pieChartData, "Tax Distribution by Type");
  };

  const renderStatusChart = () => {
    return renderChartByType(statusChartData, "Tax Distribution by Status");
  };

  const renderMonthlyTrendsChart = () => {
    return renderChartByType(monthlyTrendsData, "Monthly Trends");
  };

  const renderCurrentChart = () => {
    if (drillDownData) {
      return renderChartByType(drillDownData, drillDownTitle);
    }
    
    switch (activeChart) {
      case "year":
        return renderYearTrendChart();
      case "type":
        return renderTaxTypeChart();
      case "status":
        return renderStatusChart();
      case "trends":
        return renderMonthlyTrendsChart();
      default:
        return null;
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
            <div className="flex items-center">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="h-8 w-[120px]">
                  <SelectValue placeholder="Filter by year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year === "all" ? "All Years" : year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {drillDownData && (
              <Button variant="outline" size="sm" onClick={resetDrillDown}>
                Reset View
              </Button>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <Button
            variant={chartType === "bar" ? "default" : "outline"}
            size="sm"
            onClick={() => setChartType("bar")}
          >
            <BarChartIcon className="h-4 w-4 mr-1" />
            Bar
          </Button>
          <Button
            variant={chartType === "pie" ? "default" : "outline"}
            size="sm"
            onClick={() => setChartType("pie")}
          >
            <PieChartIcon className="h-4 w-4 mr-1" />
            Pie
          </Button>
          <Button
            variant={chartType === "line" ? "default" : "outline"}
            size="sm"
            onClick={() => setChartType("line")}
          >
            <LineChartIcon className="h-4 w-4 mr-1" />
            Line
          </Button>
          <Button
            variant={chartType === "area" ? "default" : "outline"}
            size="sm"
            onClick={() => setChartType("area")}
          >
            <AreaChartIcon className="h-4 w-4 mr-1" />
            Area
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {renderCurrentChart()}
      </CardContent>
      {!drillDownData && (
        <CardFooter className="flex justify-center border-t pt-4">
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
        </CardFooter>
      )}
    </Card>
  );
};
