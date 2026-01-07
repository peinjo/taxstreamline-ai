import * as Sentry from '@sentry/react';

// Sentry configuration - hardcoded for Lovable compatibility
const SENTRY_DSN = 'https://c1dd4511181101f2f296239122e9f83a@o4510669613694976.ingest.de.sentry.io/4510669632766032';

let isInitialized = false;

export const initSentry = () => {
  if (isInitialized) {
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE,
    
    // Performance monitoring
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
    
    // Session replay (only in production)
    replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 0,
    replaysOnErrorSampleRate: 1.0,
    
    // Release tracking
    release: 'taxflow-1.0.0',
    
    // Error filtering
    beforeSend(event, hint) {
      // Filter out known non-critical errors
      const error = hint.originalException;
      
      if (error instanceof Error) {
        // Don't report network timeouts as errors
        if (error.message.includes('Network request failed')) {
          return null;
        }
        
        // Don't report user cancellation
        if (error.message.includes('AbortError')) {
          return null;
        }
      }
      
      return event;
    },
    
    // Integrations
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
  });

  isInitialized = true;
  
  if (import.meta.env.DEV) {
    console.log('[Sentry] Initialized successfully');
  }
};

export const setUser = (userId: string, email?: string, username?: string) => {
  if (!isInitialized) return;
  
  Sentry.setUser({
    id: userId,
    email,
    username,
  });
};

export const clearUser = () => {
  if (!isInitialized) return;
  
  Sentry.setUser(null);
};

export const captureException = (error: Error, context?: Record<string, unknown>) => {
  if (!isInitialized) {
    if (import.meta.env.DEV) {
      console.error('[Sentry] Exception (dev mode):', error, context);
    }
    return;
  }
  
  Sentry.captureException(error, {
    extra: context,
  });
};

export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, unknown>) => {
  if (!isInitialized) {
    if (import.meta.env.DEV) {
      console.log('[Sentry] Message (dev mode):', message, level, context);
    }
    return;
  }
  
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
};

export const addBreadcrumb = (
  message: string,
  category?: string,
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, unknown>
) => {
  if (!isInitialized) return;
  
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
  });
};

export const setContext = (name: string, context: Record<string, unknown>) => {
  if (!isInitialized) return;
  
  Sentry.setContext(name, context);
};

export const setTag = (key: string, value: string) => {
  if (!isInitialized) return;
  
  Sentry.setTag(key, value);
};

// Transaction for performance monitoring
export const startTransaction = (name: string, op: string) => {
  if (!isInitialized) return null;
  
  return Sentry.startInactiveSpan({ name, op });
};

// Export Sentry for direct access if needed
export { Sentry };
