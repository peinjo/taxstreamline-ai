import { useCallback } from 'react';
import { logger } from '@/lib/logging/logger';
import { toast } from 'sonner';

export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
}

export function useErrorBoundary() {
  const captureError = useCallback((error: Error, errorInfo?: ErrorInfo) => {
    // Log the error with context
    logger.error('Component error caught by boundary', error, {
      componentStack: errorInfo?.componentStack,
      errorBoundary: errorInfo?.errorBoundary,
    });

    // Show user-friendly message
    toast.error('Something went wrong. Please try again.');

    // In production, you might want to send to external service
    if (import.meta.env.PROD) {
      // Send to error reporting service
    }
  }, []);

  const resetError = useCallback(() => {
    logger.info('Error boundary reset');
  }, []);

  return {
    captureError,
    resetError,
  };
}

// Hook for manual error reporting
export function useErrorReporting() {
  const reportError = useCallback((error: Error, context?: Record<string, any>) => {
    logger.error('Manual error report', error, context);
    
    // Show user feedback
    toast.error('An error occurred. It has been reported.');
  }, []);

  const reportWarning = useCallback((message: string, context?: Record<string, any>) => {
    logger.warn(message, context);
  }, []);

  return {
    reportError,
    reportWarning,
  };
}