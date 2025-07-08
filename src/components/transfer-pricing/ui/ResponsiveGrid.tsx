import React from 'react';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export function ResponsiveGrid({ 
  children, 
  className = "", 
  cols = { default: 1, md: 2, lg: 3 } 
}: ResponsiveGridProps) {
  const getGridCols = () => {
    const classes = [`grid-cols-${cols.default}`];
    
    if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
    
    return classes.join(' ');
  };

  return (
    <div className={`grid gap-4 ${getGridCols()} ${className}`}>
      {children}
    </div>
  );
}