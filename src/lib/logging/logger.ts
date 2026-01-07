// Enhanced logging system with structured logging and performance tracking
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { addBreadcrumb, captureMessage, captureException } from '@/lib/monitoring/sentry';

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
  private logBuffer: any[] = [];
  private bufferFlushInterval: number = 5000; // Flush every 5 seconds
  private persistToDatabase: boolean = !import.meta.env.DEV; // Only persist in production

  constructor() {
    // Start buffer flushing in production
    if (this.persistToDatabase) {
      setInterval(() => this.flushLogBuffer(), this.bufferFlushInterval);
    }
  }

  // Structured logging methods
  info(message: string, context?: LogContext) {
    this.log('INFO', message, context);
    // Add Sentry breadcrumb for info logs
    addBreadcrumb(message, 'log', 'info', context);
  }

  warn(message: string, context?: LogContext) {
    this.log('WARN', message, context);
    // Add Sentry breadcrumb for warnings
    addBreadcrumb(message, 'log', 'warning', context);
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.log('ERROR', message, { 
      ...context, 
      error_message: error?.message, 
      error_stack: error?.stack 
    });
    // Send error to Sentry
    if (error) {
      captureException(error, { message, ...context });
    } else {
      captureMessage(message, 'error', context);
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
    if (this.persistToDatabase) {
      this.logBuffer.push(logEntry);
      
      // If buffer gets too large, flush immediately
      if (this.logBuffer.length >= 50) {
        this.flushLogBuffer();
      }
    }
  }

  private async flushLogBuffer() {
    if (this.logBuffer.length === 0) return;

    const logsToFlush = [...this.logBuffer];
    this.logBuffer = [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const formattedLogs = logsToFlush.map(log => ({
        user_id: user?.id || null,
        level: log.level,
        message: log.message,
        component: log.component || null,
        action: log.action || null,
        error_message: log.error_message || null,
        error_stack: log.error_stack || null,
        context: log,
        duration: log.duration || null,
        endpoint: log.endpoint || null,
        method: log.method || null,
        created_at: log.timestamp
      }));

      await supabase.from('application_logs').insert(formattedLogs);
    } catch (error) {
      // Silently fail - don't want logging to break the app
      if (this.isDevelopment) {
        console.error('Failed to flush logs:', error);
      }
    }
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
    // Using empty dependency array for mount-only effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
    React.useEffect(() => {
      logger.trackComponentRender(name, props);
    }, []);

    return React.createElement(WrappedComponent, props);
  });

  Component.displayName = `withPerformanceTracking(${name})`;
  return Component;
}