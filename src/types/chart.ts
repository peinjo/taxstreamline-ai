export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
  fill?: string;
}

export interface DrillDownItem {
  name: string;
  value: number;
  details?: Record<string, unknown>;
}

export interface MonthlyTrendData {
  month: string;
  value: number;
  year: number;
}

export interface ChartFilters {
  year: string;
  taxType?: string;
  status?: string;
}

export interface ChartMetrics {
  total: number;
  change: number;
  changePercentage: number;
}

export interface PieChartSegment {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface LineChartPoint {
  x: string | number;
  y: number;
  label?: string;
}

export interface BarChartData {
  category: string;
  value: number;
  target?: number;
  variance?: number;
}