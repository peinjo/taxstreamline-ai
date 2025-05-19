
import { TaxReport } from "@/types";

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(value);
};

export const CHART_COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", 
  "#82CA9D", "#a569bd", "#45b7d1", "#2ecc71"
];
