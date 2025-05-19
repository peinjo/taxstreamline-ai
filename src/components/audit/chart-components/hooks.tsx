
import { useMemo } from "react";
import { TaxReport } from "@/types";

export const useChartData = (data: TaxReport[], selectedYear: string) => {
  // Filter data based on selected year
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

  // Available years for filtering
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(data.map(item => item.tax_year)));
    return ["all", ...years.sort((a, b) => b - a).map(String)];
  }, [data]);

  return {
    filteredData,
    lineChartData,
    pieChartData,
    statusChartData,
    monthlyTrendsData,
    availableYears,
  };
};
