import React, { Suspense, memo } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSkeleton } from '@/lib/performance/memoizedComponents';

interface LazyBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  rows?: number;
}

export const LazyBoundary = memo<LazyBoundaryProps>(({ 
  children, 
  fallback,
  errorFallback,
  rows = 5 
}) => {
  const defaultFallback = <LoadingSkeleton rows={rows} className="p-6" />;
  const defaultErrorFallback = (
    <div className="p-6 text-center">
      <p className="text-muted-foreground">Failed to load component</p>
    </div>
  );
  
  return (
    <ErrorBoundary fallback={errorFallback || defaultErrorFallback}>
      <Suspense fallback={fallback || defaultFallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
});

LazyBoundary.displayName = 'LazyBoundary';