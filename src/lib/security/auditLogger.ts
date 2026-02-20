/**
 * Security audit logging system
 * Tracks critical security events and user actions
 */

import { supabase } from "@/integrations/supabase/client";

export interface AuditEvent {
  event_type: 'auth_login' | 'auth_logout' | 'auth_failed' | 'data_access' | 'data_export' | 'permission_denied' | 'suspicious_activity';
  user_id?: string;
  email?: string;
  ip_address?: string;
  user_agent?: string;
  resource?: string;
  action?: string;
  details?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface QueuedEvent extends AuditEvent {
  _retries?: number;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_RETRIES = 3;

class AuditLogger {
  private eventQueue: QueuedEvent[] = [];
  private isOnline = navigator.onLine;
  private flushIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Clean stale localStorage on startup
    this.cleanStaleStorage();

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    this.flushIntervalId = setInterval(() => {
      if (this.isOnline && this.eventQueue.length > 0) {
        this.flushQueue();
      }
    }, 30000);
  }

  private cleanStaleStorage(): void {
    try {
      const stored = localStorage.getItem('audit_events');
      if (stored) {
        const events = JSON.parse(stored) as QueuedEvent[];
        const clean = events.filter(e => {
          if (e.user_id && !UUID_REGEX.test(e.user_id)) return false;
          if ((e._retries || 0) >= MAX_RETRIES) return false;
          return true;
        });
        if (clean.length === 0) {
          localStorage.removeItem('audit_events');
        } else {
          localStorage.setItem('audit_events', JSON.stringify(clean));
        }
      }
    } catch {
      localStorage.removeItem('audit_events');
    }
  }

  /**
   * Cleanup method to clear the interval when no longer needed
   */
  destroy(): void {
    if (this.flushIntervalId) {
      clearInterval(this.flushIntervalId);
      this.flushIntervalId = null;
    }
  }

  /**
   * Log a security audit event
   */
  async logEvent(event: Omit<AuditEvent, 'ip_address' | 'user_agent'>): Promise<void> {
    try {
      // Validate user_id is a proper UUID before sending
      if (event.user_id && !UUID_REGEX.test(event.user_id)) {
        // Try to get the actual user ID from the current session
        const { data: { user } } = await supabase.auth.getUser();
        event.user_id = user?.id || undefined;
      }

      const fullEvent: AuditEvent = {
        ...event,
        user_agent: navigator.userAgent,
        ip_address: await this.getClientIP()
      };

      if (this.isOnline) {
        await this.sendToServer(fullEvent);
      } else {
        this.queueEvent(fullEvent);
      }
    } catch (error) {
      console.error('Failed to log audit event:', error);
      this.queueEvent(event as AuditEvent);
    }
  }

  /**
   * Log authentication success
   */
  async logAuthSuccess(userId: string, email: string): Promise<void> {
    await this.logEvent({
      event_type: 'auth_login',
      user_id: userId,
      email,
      severity: 'medium',
      details: { timestamp: new Date().toISOString() }
    });
  }

  /**
   * Log authentication failure
   */
  async logAuthFailure(email: string, reason: string): Promise<void> {
    await this.logEvent({
      event_type: 'auth_failed',
      email,
      severity: 'high',
      details: { reason, timestamp: new Date().toISOString() }
    });
  }

  /**
   * Log logout
   */
  async logLogout(userId: string): Promise<void> {
    await this.logEvent({
      event_type: 'auth_logout',
      user_id: userId,
      severity: 'low',
      details: { timestamp: new Date().toISOString() }
    });
  }

  /**
   * Log data access
   */
  async logDataAccess(userId: string, resource: string, action: string): Promise<void> {
    await this.logEvent({
      event_type: 'data_access',
      user_id: userId,
      resource,
      action,
      severity: 'low',
      details: { timestamp: new Date().toISOString() }
    });
  }

  /**
   * Log permission denied
   */
  async logPermissionDenied(userId: string, resource: string, action: string): Promise<void> {
    await this.logEvent({
      event_type: 'permission_denied',
      user_id: userId,
      resource,
      action,
      severity: 'high',
      details: { timestamp: new Date().toISOString() }
    });
  }

  /**
   * Log suspicious activity
   */
  async logSuspiciousActivity(details: Record<string, any>): Promise<void> {
    await this.logEvent({
      event_type: 'suspicious_activity',
      severity: 'critical',
      details: { ...details, timestamp: new Date().toISOString() }
    });
  }

  private queueEvent(event: AuditEvent): void {
    const queued: QueuedEvent = { ...event, _retries: 0 };
    this.eventQueue.push(queued);
    
    if (this.eventQueue.length > 100) {
      this.eventQueue = this.eventQueue.slice(-50);
    }
  }

  private async flushQueue(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    // Remove invalid and over-retried events
    this.eventQueue = this.eventQueue.filter(event => {
      if (event.user_id && !UUID_REGEX.test(event.user_id)) return false;
      if ((event._retries || 0) >= MAX_RETRIES) return false;
      return true;
    });

    const events = [...this.eventQueue];
    this.eventQueue = [];
    const failed: QueuedEvent[] = [];

    for (const event of events) {
      try {
        await this.sendToServer(event);
      } catch {
        event._retries = (event._retries || 0) + 1;
        if (event._retries < MAX_RETRIES) {
          failed.push(event);
        }
      }
    }

    this.eventQueue.unshift(...failed);
    this.cleanStaleStorage();
  }

  private async sendToServer(event: AuditEvent): Promise<void> {
    const { _retries, ...cleanEvent } = event as QueuedEvent;
    const { error } = await supabase.functions.invoke('audit-logger', {
      body: { event: cleanEvent }
    });
    if (error) throw error;
  }

  private async getClientIP(): Promise<string> {
    try {
      // Note: This is a simplified approach. In production, you'd get IP from server
      return 'client'; // Placeholder
    } catch {
      return 'unknown';
    }
  }
}

// Global audit logger instance
export const auditLogger = new AuditLogger();

// Helper functions for common audit events
export const logAuthEvent = auditLogger.logAuthSuccess.bind(auditLogger);
export const logAuthFailure = auditLogger.logAuthFailure.bind(auditLogger);
export const logDataAccess = auditLogger.logDataAccess.bind(auditLogger);
export const logSuspiciousActivity = auditLogger.logSuspiciousActivity.bind(auditLogger);
