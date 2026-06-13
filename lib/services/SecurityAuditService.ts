/**
 * Security Audit Service
 * خدمة تدقيق الأمان
 *
 * This module provides security event logging and monitoring.
 * Tracks security-relevant events for compliance and monitoring purposes.
 *
 * @module lib/services/SecurityAuditService
 */

import { SecureStorageService } from './SecureStorageService';

/**
 * Security event types
 */
export enum SecurityEventType {
  // Authentication & Session
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  SESSION_EXPIRED = 'session_expired',

  // Data Access
  DATA_ACCESS = 'data_access',
  DATA_EXPORT = 'data_export',
  DATA_DELETE = 'data_delete',

  // Configuration Changes
  SETTINGS_CHANGE = 'settings_change',
  PRIVACY_CONSENT_CHANGE = 'privacy_consent_change',
  BIOMETRIC_ENABLE = 'biometric_enable',
  BIOMETRIC_DISABLE = 'biometric_disable',

  // Security Events
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  VALIDATION_FAILURE = 'validation_failure',

  // System Events
  STORAGE_ENCRYPTION = 'storage_encryption',
  STORAGE_DECRYPTION = 'storage_decryption',
}

/**
 * Security event severity
 */
export enum SecuritySeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Security audit event
 */
export interface SecurityAuditEvent {
  id: string;
  timestamp: string;
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  userId?: string;
  description: string;
  metadata?: Record<string, unknown> | undefined;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Security Audit Service
 * Provides security event logging and monitoring
 */
class SecurityAuditServiceClass {
  private static readonly MAX_EVENTS = 1000;
  private static readonly RETENTION_DAYS = 90;
  private readonly STORAGE_KEY = 'security_audit_log';

  /**
   * Log a security event
   */
  async logEvent(
    eventType: SecurityEventType,
    description: string,
    severity: SecuritySeverity = SecuritySeverity.INFO,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    try {
      const event: SecurityAuditEvent = {
        id: this.generateEventId(),
        timestamp: new Date().toISOString(),
        eventType,
        severity,
        description,
        metadata,
      };

      // Store in secure storage
      await this.addEventToLog(event);

      // Also log to console for development (sanitized)
      if (__DEV__) {
        console.log(`[Security Audit] [${severity.toUpperCase()}] ${eventType}: ${description}`);
      }
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  /**
   * Get security audit events with optional filtering
   */
  async getEvents(filter?: {
    eventType?: SecurityEventType;
    severity?: SecuritySeverity;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<SecurityAuditEvent[]> {
    try {
      const events = await SecureStorageService.getItem<SecurityAuditEvent[]>(this.STORAGE_KEY);

      if (!events) {
        return [];
      }

      let filteredEvents = [...events];

      // Apply filters
      if (filter?.eventType) {
        filteredEvents = filteredEvents.filter((e) => e.eventType === filter.eventType);
      }

      if (filter?.severity) {
        filteredEvents = filteredEvents.filter((e) => e.severity === filter.severity);
      }

      if (filter?.startDate) {
        filteredEvents = filteredEvents.filter((e) => new Date(e.timestamp) >= filter.startDate!);
      }

      if (filter?.endDate) {
        filteredEvents = filteredEvents.filter((e) => new Date(e.timestamp) <= filter.endDate!);
      }

      // Sort by timestamp (newest first)
      filteredEvents.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Apply limit
      if (filter?.limit) {
        filteredEvents = filteredEvents.slice(0, filter.limit);
      }

      return filteredEvents;
    } catch (error) {
      console.error('Error retrieving security events:', error);
      return [];
    }
  }

  /**
   * Clear old audit events based on retention policy
   */
  async clearOldEvents(): Promise<void> {
    try {
      const events = await SecureStorageService.getItem<SecurityAuditEvent[]>(this.STORAGE_KEY);

      if (!events) {
        return;
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - SecurityAuditServiceClass.RETENTION_DAYS);

      const recentEvents = events.filter((e) => new Date(e.timestamp) >= cutoffDate);

      // Trim to max events if needed
      const trimmedEvents =
        recentEvents.length > SecurityAuditServiceClass.MAX_EVENTS
          ? recentEvents.slice(-SecurityAuditServiceClass.MAX_EVENTS)
          : recentEvents;

      await SecureStorageService.setItem(this.STORAGE_KEY, trimmedEvents);
    } catch (error) {
      console.error('Error clearing old security events:', error);
    }
  }

  /**
   * Get security statistics
   */
  async getStatistics(): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    recentActivity: {
      last24Hours: number;
      last7Days: number;
      last30Days: number;
    };
  }> {
    try {
      const events = await this.getEvents();
      const now = new Date();

      const last24Hours = events.filter(
        (e) => now.getTime() - new Date(e.timestamp).getTime() < 24 * 60 * 60 * 1000
      ).length;

      const last7Days = events.filter(
        (e) => now.getTime() - new Date(e.timestamp).getTime() < 7 * 24 * 60 * 60 * 1000
      ).length;

      const last30Days = events.filter(
        (e) => now.getTime() - new Date(e.timestamp).getTime() < 30 * 24 * 60 * 60 * 1000
      ).length;

      const eventsByType: Record<string, number> = {};
      const eventsBySeverity: Record<string, number> = {};

      for (const event of events) {
        eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
        eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
      }

      return {
        totalEvents: events.length,
        eventsByType,
        eventsBySeverity,
        recentActivity: {
          last24Hours,
          last7Days,
          last30Days,
        },
      };
    } catch (error) {
      console.error('Error getting security statistics:', error);
      return {
        totalEvents: 0,
        eventsByType: {},
        eventsBySeverity: {},
        recentActivity: {
          last24Hours: 0,
          last7Days: 0,
          last30Days: 0,
        },
      };
    }
  }

  /**
   * Clear all security audit events
   */
  async clearAll(): Promise<void> {
    try {
      await SecureStorageService.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing security audit log:', error);
      throw new Error('Failed to clear security audit log');
    }
  }

  /**
   * Add event to audit log
   */
  private async addEventToLog(event: SecurityAuditEvent): Promise<void> {
    const events =
      (await SecureStorageService.getItem<SecurityAuditEvent[]>(this.STORAGE_KEY)) || [];
    events.push(event);

    // Trim to max events
    if (events.length > SecurityAuditServiceClass.MAX_EVENTS) {
      events.shift(); // Remove oldest event
    }

    await SecureStorageService.setItem(this.STORAGE_KEY, events);

    // Clean up old events periodically
    if (events.length % 100 === 0) {
      await this.clearOldEvents();
    }
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const SecurityAuditService = new SecurityAuditServiceClass();
