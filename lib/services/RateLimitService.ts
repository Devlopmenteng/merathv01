/**
 * Rate Limiting Service
 * خدمة الحد المعدل
 *
 * This module provides rate limiting functionality to prevent API abuse,
 * protect against brute force attacks, and ensure fair usage.
 *
 * @module lib/services/RateLimitService
 */

import { SecurityAuditService, SecurityEventType, SecuritySeverity } from './SecurityAuditService';

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs: number;
}

/**
 * Default rate limit configurations
 */
export const DEFAULT_RATE_LIMITS = {
  // Strict limits for sensitive operations
  strict: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 15 * 60 * 1000, // 15 minutes
  },
  
  // Normal limits for regular operations
  normal: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 5 * 60 * 1000, // 5 minutes
  },
  
  // Lenient limits for read operations
  lenient: {
    maxRequests: 1000,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 1 * 60 * 1000, // 1 minute
  },
} as const;

/**
 * Rate limit status
 */
export interface RateLimitStatus {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  blockedUntil?: Date;
}

/**
 * Rate limit entry
 */
interface RateLimitEntry {
  requests: number[];
  blockedUntil?: number;
}

/**
 * Rate Limiting Service
 * Provides rate limiting functionality to prevent abuse
 */
class RateLimitServiceClass {
  private readonly limits: Map<string, RateLimitEntry> = new Map();
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up old entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  /**
   * Check if a request is allowed under rate limits
   */
  async checkLimit(
    identifier: string,
    config: RateLimitConfig = DEFAULT_RATE_LIMITS.normal
  ): Promise<RateLimitStatus> {
    const now = Date.now();
    const entry = this.limits.get(identifier) || { requests: [] };

    // Check if currently blocked
    if (entry.blockedUntil && entry.blockedUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(entry.blockedUntil),
        blockedUntil: new Date(entry.blockedUntil),
      };
    }

    // Remove expired requests from the window
    const windowStart = now - config.windowMs;
    entry.requests = entry.requests.filter(timestamp => timestamp > windowStart);

    // Check if limit exceeded
    if (entry.requests.length >= config.maxRequests) {
      // Block the identifier
      entry.blockedUntil = now + config.blockDurationMs;
      this.limits.set(identifier, entry);

      // Log security event
      await SecurityAuditService.logEvent(
        SecurityEventType.RATE_LIMIT_EXCEEDED,
        `Rate limit exceeded for ${identifier}`,
        SecuritySeverity.WARNING,
        { identifier, requestCount: entry.requests.length }
      );

      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(now + config.blockDurationMs),
        blockedUntil: new Date(entry.blockedUntil),
      };
    }

    // Add current request
    entry.requests.push(now);
    this.limits.set(identifier, entry);

    // Calculate remaining requests and reset time
    const remaining = config.maxRequests - entry.requests.length;
    const oldestRequest = entry.requests[0];
    const resetTime = oldestRequest ? new Date(oldestRequest + config.windowMs) : new Date(now + config.windowMs);

    return {
      allowed: true,
      remaining,
      resetTime,
    };
  }

  /**
   * Reset rate limit for a specific identifier
   */
  resetLimit(identifier: string): void {
    this.limits.delete(identifier);
  }

  /**
   * Get current rate limit status without incrementing
   */
  async getStatus(
    identifier: string,
    config: RateLimitConfig = DEFAULT_RATE_LIMITS.normal
  ): Promise<RateLimitStatus> {
    const now = Date.now();
    const entry = this.limits.get(identifier) || { requests: [] };

    // Check if currently blocked
    if (entry.blockedUntil && entry.blockedUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(entry.blockedUntil),
        blockedUntil: new Date(entry.blockedUntil),
      };
    }

    // Remove expired requests
    const windowStart = now - config.windowMs;
    entry.requests = entry.requests.filter(timestamp => timestamp > windowStart);

    const remaining = Math.max(0, config.maxRequests - entry.requests.length);
    const oldestRequest = entry.requests[0];
    const resetTime = oldestRequest ? new Date(oldestRequest + config.windowMs) : new Date(now + config.windowMs);

    return {
      allowed: remaining > 0,
      remaining,
      resetTime,
    };
  }

  /**
   * Clean up old entries
   */
  private cleanup(): void {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    for (const [identifier, entry] of this.limits.entries()) {
      // Remove entries with no recent requests and not blocked
      if (
        entry.requests.length === 0 &&
        (!entry.blockedUntil || entry.blockedUntil < oneHourAgo)
      ) {
        this.limits.delete(identifier);
      }
    }
  }

  /**
   * Get rate limit statistics
   */
  getStatistics(): {
    totalEntries: number;
    blockedEntries: number;
    activeEntries: number;
  } {
    const now = Date.now();
    let blockedCount = 0;
    let activeCount = 0;

    for (const entry of this.limits.values()) {
      if (entry.blockedUntil && entry.blockedUntil > now) {
        blockedCount++;
      } else if (entry.requests.length > 0) {
        activeCount++;
      }
    }

    return {
      totalEntries: this.limits.size,
      blockedEntries: blockedCount,
      activeEntries: activeCount,
    };
  }

  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.limits.clear();
  }

  /**
   * Destroy the service and clean up resources
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clearAll();
  }
}

// Export singleton instance
export const RateLimitService = new RateLimitServiceClass();