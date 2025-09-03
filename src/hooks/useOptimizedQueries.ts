import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { logger } from '@/lib/logging/logger';

// Generic optimized query hook with error handling and performance tracking
export function useOptimizedQuery<T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const startTime = performance.now();
      const operationId = `query-${queryKey.join('-')}-${Date.now()}`;
      
      try {
        logger.startTimer(operationId, `Query: ${queryKey.join('/')}`, { queryKey });
        const result = await queryFn();
        logger.endTimer(operationId);
        return result;
      } catch (error) {
        logger.endTimer(operationId);
        logger.error(`Query failed: ${queryKey.join('/')}`, error as Error, { queryKey });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes default
    gcTime: 10 * 60 * 1000, // 10 minutes default
    retry: (failureCount: number, error: any) => {
      // Don't retry on 4xx errors
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    ...options,
  });
}

// Batch query utility for related queries
export function useBatchQueries<T extends Record<string, any>>(
  queries: Array<{
    key: readonly unknown[];
    fn: () => Promise<any>;
    options?: UseQueryOptions;
  }>
) {
  const results = queries.map(query => 
    useOptimizedQuery(query.key, query.fn, query.options)
  );

  const isLoading = results.some(r => r.isLoading);
  const isError = results.some(r => r.isError);
  const errors = results.filter(r => r.error).map(r => r.error);

  return {
    results,
    isLoading,
    isError,
    errors,
    data: results.reduce((acc, result, index) => {
      const key = queries[index].key.join('_');
      (acc as any)[key] = result.data;
      return acc;
    }, {} as T),
  };
}