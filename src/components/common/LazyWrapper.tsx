import React, { Suspense } from 'react';
import { LoadingSkeleton } from '@/lib/performance/memoizedComponents';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rows?: number;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({ 
  children, 
  fallback,
  rows = 5 
}) => {
  const defaultFallback = <LoadingSkeleton rows={rows} className="p-6" />;
  
  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};