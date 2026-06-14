/**
 * Analytics Service with Privacy Controls
 * خدمة التحليلات مع ضوابط الخصوصية
 *
 * This module provides analytics functionality with built-in privacy controls
 * and opt-out mechanisms for GDPR compliance.
 *
 * @module lib/services/AnalyticsService
 */

import { ConsentService, ConsentType } from './ConsentService';
import { SecurityAuditService, SecurityEventType, SecuritySeverity } from './SecurityAuditService';
import { sanitizeForLogging } from '../utils/validation';

/**
 * Analytics event types
 */
export enum AnalyticsEventType {
  // User engagement
  SCREEN_VIEW = 'screen_view',
  BUTTON_CLICK = 'button_click',
  FEATURE_USAGE = 'feature_usage',

  // Calculation events
  CALCULATION_STARTED = 'calculation_started',
  CALCULATION_COMPLETED = 'calculation_completed',
  TEMPLATE_USED = 'template_used',

  // Performance events
  PERFORMANCE_METRIC = 'performance_metric',
  ERROR_OCCURRED = 'error_occurred',

  // App lifecycle
  APP_OPENED = 'app_opened',
  APP_CLOSED = 'app_closed',
  SESSION_LENGTH = 'session_length',
}

/**
 * Analytics event
 */
export interface AnalyticsEvent {
  eventType: AnalyticsEventType;
  timestamp: string;
  screenName?: string | undefined;
  properties?: Record<string, unknown> | undefined;
  userId?: string;
  sessionId?: string;
}

/**
 * Analytics configuration
 */
interface AnalyticsConfig {
  enabled: boolean;
  batchSize: number;
  flushInterval: number;
  samplingRate: number;
}

/**
 * Analytics Service
 * Provides analytics functionality with privacy controls
 */
class AnalyticsServiceClass {
  private config: AnalyticsConfig = {
    enabled: true,
    batchSize: 50,
    flushInterval: 60000, // 1 minute
    samplingRate: 1.0, // 100%
  };

  private eventBuffer: AnalyticsEvent[] = [];
  private sessionId: string;
  private sessionStartTime: number;
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.startFlushTimer();
  }

  /**
   * Initialize analytics service
   */
  async initialize(): Promise<void> {
    try {
      // Check user consent for analytics
      const analyticsConsent = await ConsentService.getConsent(ConsentType.ANALYTICS);

      this.config.enabled = analyticsConsent === 'granted';

      if (this.config.enabled) {
        // Log app opened event
        await this.trackEvent(AnalyticsEventType.APP_OPENED);
      }
    } catch (error) {
      console.error('Error initializing analytics:', error);
      this.config.enabled = false;
    }
  }

  /**
   * Track an analytics event
   */
  async trackEvent(
    eventType: AnalyticsEventType,
    properties?: Record<string, unknown>,
    screenName?: string
  ): Promise<void> {
    try {
      // Check if analytics is enabled and user has consented
      if (!this.config.enabled) {
        return;
      }

      // Check consent again to be safe
      const analyticsConsent = await ConsentService.getConsent(ConsentType.ANALYTICS);
      if (analyticsConsent !== 'granted') {
        return;
      }

      // Apply sampling
      if (Math.random() > this.config.samplingRate) {
        return;
      }

      // Sanitize properties to remove sensitive data
      const sanitizedProperties = this.sanitizeProperties(properties);

      const event: AnalyticsEvent = {
        eventType,
        timestamp: new Date().toISOString(),
        screenName,
        properties: sanitizedProperties,
        sessionId: this.sessionId,
      };

      this.eventBuffer.push(event);

      // Flush buffer if it reaches batch size
      if (this.eventBuffer.length >= this.config.batchSize) {
        await this.flushEvents();
      }
    } catch (error) {
      console.error('Error tracking analytics event:', error);
    }
  }

  /**
   * Track screen view
   */
  async trackScreenView(screenName: string, properties?: Record<string, unknown>): Promise<void> {
    await this.trackEvent(AnalyticsEventType.SCREEN_VIEW, properties, screenName);
  }

  /**
   * Track button click
   */
  async trackButtonClick(buttonName: string, properties?: Record<string, unknown>): Promise<void> {
    await this.trackEvent(AnalyticsEventType.BUTTON_CLICK, {
      buttonName,
      ...properties,
    });
  }

  /**
   * Track error
   */
  async trackError(error: Error, context?: Record<string, unknown>): Promise<void> {
    await this.trackEvent(AnalyticsEventType.ERROR_OCCURRED, {
      errorMessage: error.message,
      errorStack: error.stack,
      ...context,
    });
  }

  /**
   * Track performance metric
   */
  async trackPerformanceMetric(
    metricName: string,
    value: number,
    unit: string = 'ms'
  ): Promise<void> {
    await this.trackEvent(AnalyticsEventType.PERFORMANCE_METRIC, {
      metricName,
      value,
      unit,
    });
  }

  /**
   * Enable analytics (with consent)
   */
  async enable(): Promise<void> {
    await ConsentService.grantConsent(ConsentType.ANALYTICS);
    this.config.enabled = true;

    await SecurityAuditService.logEvent(
      SecurityEventType.SETTINGS_CHANGE,
      'Analytics enabled',
      SecuritySeverity.INFO
    );
  }

  /**
   * Disable analytics (opt-out)
   */
  async disable(): Promise<void> {
    await ConsentService.revokeConsent(ConsentType.ANALYTICS);
    this.config.enabled = false;

    // Flush any remaining events
    await this.flushEvents();

    await SecurityAuditService.logEvent(
      SecurityEventType.SETTINGS_CHANGE,
      'Analytics disabled',
      SecuritySeverity.INFO
    );
  }

  /**
   * Check if analytics is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Flush all buffered events
   */
  async flushEvents(): Promise<void> {
    if (this.eventBuffer.length === 0) {
      return;
    }

    try {
      // In a real implementation, this would send events to an analytics service
      // For now, we'll just log them and clear the buffer
      const eventsToFlush = [...this.eventBuffer];
      this.eventBuffer = [];

      // Log to security audit (sanitized)
      await SecurityAuditService.logEvent(
        SecurityEventType.DATA_ACCESS,
        `Analytics events flushed: ${eventsToFlush.length} events`,
        SecuritySeverity.INFO,
        { eventCount: eventsToFlush.length }
      );

      // In development, log events for debugging
      if (__DEV__) {
        console.log(
          '[Analytics] Flushed events:',
          eventsToFlush.map((e) => ({
            type: e.eventType,
            screen: e.screenName,
            properties: e.properties,
          }))
        );
      }
    } catch (error) {
      console.error('Error flushing analytics events:', error);
    }
  }

  /**
   * Get current session information
   */
  getSessionInfo(): {
    sessionId: string;
    sessionLength: number;
    eventsTracked: number;
  } {
    return {
      sessionId: this.sessionId,
      sessionLength: Date.now() - this.sessionStartTime,
      eventsTracked: this.eventBuffer.length,
    };
  }

  /**
   * Clear all buffered events
   */
  clearBuffer(): void {
    this.eventBuffer = [];
  }

  /**
   * Sanitize event properties to remove sensitive data
   */
  private sanitizeProperties(
    properties?: Record<string, unknown>
  ): Record<string, unknown> | undefined {
    if (!properties) {
      return undefined;
    }

    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(properties)) {
      if (typeof value === 'string') {
        // Use the sanitization function from validation utils
        sanitized[key] = sanitizeForLogging(value);
      } else if (typeof value === 'number') {
        // Don't log exact monetary values
        if (value > 1000) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = value;
        }
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Start automatic flush timer
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, this.config.flushInterval);
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Destroy the analytics service
   */
  destroy(): void {
    // Flush any remaining events
    this.flushEvents();

    // Clear timer
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    this.clearBuffer();
  }
}

// Export singleton instance
export const AnalyticsService = new AnalyticsServiceClass();
