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

class AuditLogger {
  private eventQueue: AuditEvent[] = [];
  private isOnline = navigator.onLine;

  constructor() {
    // Listen for network status changes
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Flush queue periodically
    setInterval(() => {
      if (this.isOnline && this.eventQueue.length > 0) {
        this.flushQueue();
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Log a security audit event
   */
  async logEvent(event: Omit<AuditEvent, 'ip_address' | 'user_agent'>): Promise<void> {
    try {
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
    this.eventQueue.push(event);
    
    // Keep queue size manageable
    if (this.eventQueue.length > 100) {
      this.eventQueue = this.eventQueue.slice(-50); // Keep last 50 events
    }
  }

  private async flushQueue(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      for (const event of events) {
        await this.sendToServer(event);
      }
    } catch (error) {
      console.error('Failed to flush audit queue:', error);
      // Re-queue failed events
      this.eventQueue.unshift(...events);
    }
  }

  private async sendToServer(event: AuditEvent): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('audit-logger', {
        body: { event }
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      // Fallback: store in local storage temporarily
      const stored = localStorage.getItem('audit_events');
      const events = stored ? JSON.parse(stored) : [];
      events.push(event);
      
      // Keep only last 50 events in localStorage
      if (events.length > 50) {
        events.splice(0, events.length - 50);
      }
      
      localStorage.setItem('audit_events', JSON.stringify(events));
      throw error;
    }
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
