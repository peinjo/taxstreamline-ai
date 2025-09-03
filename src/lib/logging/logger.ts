// Enhanced logging system with structured logging and performance tracking
import React from 'react';

interface LogContext {
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  timestamp?: string;
  [key: string]: any;
}

interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  operation: string;
  context?: Record<string, any>;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private performanceMetrics: Map<string, PerformanceMetrics> = new Map();

  // Structured logging methods
  info(message: string, context?: LogContext) {
    this.log('INFO', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('WARN', message, context);
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.log('ERROR', message, { ...context, error: error?.message, stack: error?.stack });
    
    // In production, you could send to external logging service
    if (!this.isDevelopment && error) {
      this.sendToExternalService('error', message, error, context);
    }
  }

  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      this.log('DEBUG', message, context);
    }
  }

  // Performance tracking
  startTimer(operationId: string, operation: string, context?: Record<string, any>) {
    this.performanceMetrics.set(operationId, {
      startTime: performance.now(),
      operation,
      context,
    });
  }

  endTimer(operationId: string): number | null {
    const metric = this.performanceMetrics.get(operationId);
    if (!metric) {
      this.warn(`Timer not found for operation: ${operationId}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    this.performanceMetrics.set(operationId, {
      ...metric,
      endTime,
      duration,
    });

    this.info(`Performance: ${metric.operation} completed in ${duration.toFixed(2)}ms`, {
      operation: metric.operation,
      duration,
      context: metric.context,
    });

    // Clean up completed metrics
    this.performanceMetrics.delete(operationId);

    return duration;
  }

  // Track component render performance
  trackComponentRender(componentName: string, props?: Record<string, any>) {
    if (this.isDevelopment) {
      this.debug(`Rendering component: ${componentName}`, { component: componentName, props });
    }
  }

  // Track API call performance
  trackApiCall(endpoint: string, method: string, startTime: number) {
    const duration = performance.now() - startTime;
    this.info(`API Call: ${method} ${endpoint} completed in ${duration.toFixed(2)}ms`, {
      endpoint,
      method,
      duration,
    });

    // Log slow API calls
    if (duration > 2000) {
      this.warn(`Slow API call detected: ${method} ${endpoint}`, {
        endpoint,
        method,
        duration,
      });
    }
  }

  private log(level: string, message: string, context?: LogContext) {
    const logEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...context,
    };

    if (this.isDevelopment) {
      const style = this.getConsoleStyle(level);
      console.log(`%c[${level}] ${message}`, style, context || '');
    }

    // In production, you could buffer logs and send in batches
    if (!this.isDevelopment) {
      this.bufferLog(logEntry);
    }
  }

  private getConsoleStyle(level: string): string {
    const styles = {
      INFO: 'color: #2563eb; font-weight: bold',
      WARN: 'color: #d97706; font-weight: bold',
      ERROR: 'color: #dc2626; font-weight: bold',
      DEBUG: 'color: #6b7280; font-style: italic',
    };
    return styles[level as keyof typeof styles] || '';
  }

  private bufferLog(logEntry: any) {
    // Implementation for production log buffering
    // Could send to services like LogRocket, Sentry, etc.
  }

  private sendToExternalService(level: string, message: string, error: Error, context?: LogContext) {
    // Implementation for external error reporting
    // Could integrate with Sentry, Bugsnag, etc.
  }

  // Utility for measuring function execution time
  async measureAsync<T>(operation: string, fn: () => Promise<T>, context?: Record<string, any>): Promise<T> {
    const operationId = `${operation}-${Date.now()}`;
    this.startTimer(operationId, operation, context);
    
    try {
      const result = await fn();
      this.endTimer(operationId);
      return result;
    } catch (error) {
      this.endTimer(operationId);
      this.error(`Operation failed: ${operation}`, error as Error, context);
      throw error;
    }
  }

  measure<T>(operation: string, fn: () => T, context?: Record<string, any>): T {
    const operationId = `${operation}-${Date.now()}`;
    this.startTimer(operationId, operation, context);
    
    try {
      const result = fn();
      this.endTimer(operationId);
      return result;
    } catch (error) {
      this.endTimer(operationId);
      this.error(`Operation failed: ${operation}`, error as Error, context);
      throw error;
    }
  }
}

export const logger = new Logger();

// HOC for tracking component performance
export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const name = componentName || WrappedComponent.displayName || WrappedComponent.name;
  
  const Component = React.memo((props: P) => {
    React.useEffect(() => {
      logger.trackComponentRender(name, props);
    });

    return React.createElement(WrappedComponent, props);
  });

  Component.displayName = `withPerformanceTracking(${name})`;
  return Component;
}