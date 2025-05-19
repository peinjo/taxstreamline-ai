
import React, { useState } from "react";
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
import { formatCurrency, CHART_COLORS } from "./utils";

interface ChartRendererProps {
  chartData: any[];
  chartType: "bar" | "pie" | "line" | "area";
  title: string;
  onItemClick: (data: any, index: number) => void;
}

export const ChartRenderer: React.FC<ChartRendererProps> = ({
  chartData,
  chartType,
  title,
  onItemClick,
}) => {
  const [activePieIndex, setActivePieIndex] = useState<number | undefined>(undefined);

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
              onClick={(data, index) => {
                setActivePieIndex(index);
                onItemClick(data, index);
              }}
              onMouseEnter={(_, index) => setActivePieIndex(index)}
              animationDuration={1000}
            >
              {chartData.map((entry: any, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
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
              onClick={(data, index) => onItemClick(data, index)}
            />
          </BarChart>
        </ResponsiveContainer>
      );
  }
};
