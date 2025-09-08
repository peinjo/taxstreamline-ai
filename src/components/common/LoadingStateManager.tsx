import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface LoadingStateProps {
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  children: React.ReactNode;
  onRetry?: () => void;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  skeletonRows?: number;
}

export const LoadingStateManager: React.FC<LoadingStateProps> = ({
  isLoading,
  isError,
  error,
  isEmpty = false,
  children,
  onRetry,
  loadingComponent,
  errorComponent,
  emptyComponent,
  skeletonRows = 3
}) => {
  if (isLoading) {
    return loadingComponent || <DefaultLoadingSkeleton rows={skeletonRows} />;
  }

  if (isError) {
    return errorComponent || (
      <DefaultErrorState 
        error={error} 
        onRetry={onRetry} 
      />
    );
  }

  if (isEmpty) {
    return emptyComponent || <DefaultEmptyState />;
  }

  return <>{children}</>;
};

interface DefaultLoadingSkeletonProps {
  rows: number;
}

const DefaultLoadingSkeleton: React.FC<DefaultLoadingSkeletonProps> = ({ rows }) => (
  <div 
    className="space-y-4" 
    role="status" 
    aria-label="Loading content"
    aria-live="polite"
  >
    <div className="sr-only">Loading, please wait...</div>
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    ))}
  </div>
);

interface DefaultErrorStateProps {
  error?: Error | null;
  onRetry?: () => void;
}

const DefaultErrorState: React.FC<DefaultErrorStateProps> = ({ error, onRetry }) => (
  <Alert variant="destructive" role="alert" aria-live="assertive">
    <AlertTriangle className="h-4 w-4" aria-hidden="true" />
    <AlertDescription className="flex items-center justify-between">
      <div>
        <p className="font-medium">Something went wrong</p>
        <p className="text-sm mt-1">
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </p>
      </div>
      {onRetry && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          aria-label="Retry loading content"
        >
          <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
          Retry
        </Button>
      )}
    </AlertDescription>
  </Alert>
);

const DefaultEmptyState: React.FC = () => (
  <div 
    className="text-center py-12"
    role="status"
    aria-label="No data available"
  >
    <p className="text-muted-foreground text-lg">No data available</p>
    <p className="text-muted-foreground text-sm mt-2">
      There's nothing to display at the moment.
    </p>
  </div>
);

// Specialized loading components for common use cases
export const TableLoadingSkeleton: React.FC<{ columns: number; rows?: number }> = ({ 
  columns, 
  rows = 5 
}) => (
  <div className="space-y-3" role="status" aria-label="Loading table data">
    <div className="sr-only">Loading table data, please wait...</div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex gap-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton 
            key={colIndex} 
            className="h-4 flex-1" 
            style={{ minWidth: '100px' }}
          />
        ))}
      </div>
    ))}
  </div>
);

export const MetricsLoadingSkeleton: React.FC = () => (
  <div 
    className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
    role="status" 
    aria-label="Loading metrics"
  >
    <div className="sr-only">Loading metrics, please wait...</div>
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="border rounded-lg p-6 space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    ))}
  </div>
);