import type { QueryClient } from '@tanstack/react-query';

// Optimized query configuration
export const optimizedQueryConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
      retry: (failureCount: number, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
    },
  },
};

// Query key factories for better cache invalidation
export const queryKeys = {
  dashboard: ['dashboard'] as const,
  dashboardMetrics: () => [...queryKeys.dashboard, 'metrics'] as const,
  
  calendarEvents: ['calendar-events'] as const,
  calendarEventsByRange: (start: string, end: string) => 
    [...queryKeys.calendarEvents, { start, end }] as const,
  
  transferPricing: ['transfer-pricing'] as const,
  tpDocuments: () => [...queryKeys.transferPricing, 'documents'] as const,
  tpEntities: () => [...queryKeys.transferPricing, 'entities'] as const,
  tpBenchmarks: () => [...queryKeys.transferPricing, 'benchmarks'] as const,
  
  tax: ['tax'] as const,
  taxDocuments: () => [...queryKeys.tax, 'documents'] as const,
  taxCalculations: () => [...queryKeys.tax, 'calculations'] as const,
  
  audit: ['audit'] as const,
  auditReports: () => [...queryKeys.audit, 'reports'] as const,
  
  compliance: ['compliance'] as const,
  complianceItems: () => [...queryKeys.compliance, 'items'] as const,
} as const;

// Prefetch utilities
export const prefetchQueries = {
  dashboard: (queryClient: QueryClient) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.dashboardMetrics(),
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  },
  
  transferPricing: (queryClient: QueryClient) => {
    return Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.tpDocuments(),
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.tpEntities(),
        staleTime: 5 * 60 * 1000,
      }),
    ]);
  },
};