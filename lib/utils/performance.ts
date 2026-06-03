/**
 * Performance Monitoring Utilities
* أدوات مراقبة الأداء
 *
 * This module provides utilities for monitoring and tracking performance metrics
 * in the application, including calculation times, render times, and custom metrics.
 *
 * @module lib/utils/performance
 */

/**
 * Performance metric entry
 */
interface PerformanceMetric {
  /** Name of the metric */
  name: string;
  /** Duration in milliseconds */
  duration: number;
  /** Timestamp when metric was recorded */
  timestamp: number;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Performance monitor class
 */
class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 100; // Keep last 100 metrics

  /**
   * Start measuring a named operation
   */
  startMeasurement(name: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.recordMetric({
        name,
        duration,
        timestamp: Date.now(),
      });
      
      // Log slow operations (> 100ms)
      if (duration > 100) {
        console.warn(`[Performance] ${name} took ${duration.toFixed(2)}ms`);
      }
    };
  }

  /**
   * Record a custom metric
   */
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by name
   */
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name);
  }

  /**
   * Get average duration for a specific metric
   */
  getAverageDuration(name: string): number {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) return 0;
    
    const total = metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / metrics.length;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Get performance summary
   */
  getSummary(): Record<string, { count: number; avg: number; max: number; min: number }> {
    const summary: Record<string, { count: number; avg: number; max: number; min: number }> = {};
    
    // Group by name
    const grouped: Record<string, number[]> = {};
    this.metrics.forEach(m => {
      if (!grouped[m.name]) {
        grouped[m.name] = [];
      }
      grouped[m.name].push(m.duration);
    });
    
    // Calculate stats
    Object.entries(grouped).forEach(([name, durations]) => {
      const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const max = Math.max(...durations);
      const min = Math.min(...durations);
      
      summary[name] = {
        count: durations.length,
        avg,
        max,
        min,
      };
    });
    
    return summary;
  }
}

// Singleton instance
const performanceMonitor = new PerformanceMonitor();

/**
 * Measure execution time of a function
 */
export function measurePerformance<T>(name: string, fn: () => T): T {
  const endMeasurement = performanceMonitor.startMeasurement(name);
  try {
    const result = fn();
    return result;
  } finally {
    endMeasurement();
  }
}

/**
 * Measure execution time of an async function
 */
export async function measurePerformanceAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const endMeasurement = performanceMonitor.startMeasurement(name);
  try {
    const result = await fn();
    return result;
  } finally {
    endMeasurement();
  }
}

/**
 * Get the performance monitor instance
 */
export function getPerformanceMonitor(): PerformanceMonitor {
  return performanceMonitor;
}

/**
 * React hook for measuring component render time
 */
export function useRenderTime(componentName: string): void {
  React.useEffect(() => {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      performanceMonitor.recordMetric({
        name: `render_${componentName}`,
        duration,
        timestamp: Date.now(),
      });
      
      if (duration > 16) { // > 1 frame at 60fps
        console.warn(`[Performance] ${componentName} render took ${duration.toFixed(2)}ms`);
      }
    };
  }, [componentName]);
}

// Import React for the hook (will be tree-shaken if not used)
import React from 'react';
