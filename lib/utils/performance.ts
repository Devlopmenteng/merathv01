import React, { useRef, useEffect, useCallback } from 'react';

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
 * App performance metrics
 */
interface AppMetrics {
  /** Current FPS (frames per second) */
  fps?: number;
  /** Average FPS over the last minute */
  avgFps?: number;
  /** Memory usage in MB */
  memoryUsage?: number;
  /** Screen render time in ms */
  renderTime?: number;
  /** Total calculation time for last calculation */
  lastCalcTime?: number;
  /** App startup time in ms */
  startupTime?: number;
}

/**
 * Performance monitor class
 */
class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 100; // Keep last 100 metrics
  private appMetrics: AppMetrics = {};
  private fpsHistory: number[] = [];

  /**
   * Initialize performance monitoring
   */
  initialize() {
    // Record startup time
    if (!this.appMetrics.startupTime) {
      this.appMetrics.startupTime = performance.now();
    }

    // Start FPS monitoring
    this.startFpsMonitoring();
  }

  /**
   * Start FPS monitoring
   */
  private startFpsMonitoring() {
    let lastTime = performance.now();
    let frames = 0;

    const measureFps = () => {
      const currentTime = performance.now();
      frames++;

      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime));
        this.fpsHistory.push(fps);

        // Keep only last 60 seconds of FPS data
        if (this.fpsHistory.length > 60) {
          this.fpsHistory.shift();
        }

        this.appMetrics.fps = fps;
        this.appMetrics.avgFps = Math.round(
          this.fpsHistory.reduce((sum, f) => sum + f, 0) / this.fpsHistory.length
        );

        frames = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFps);
    };

    requestAnimationFrame(measureFps);
  }

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

      // Track slow operations internally (> 100ms)
      if (duration > 100) {
        this.metrics.push({ name: `SLOW: ${name}`, duration, timestamp: Date.now() });
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

    // Update app-specific metrics
    if (metric.name === 'calculation') {
      this.appMetrics.lastCalcTime = metric.duration;
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
    return this.metrics.filter((m) => m.name === name);
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
    this.metrics.forEach((m) => {
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

  /**
   * Get current app metrics
   */
  getAppMetrics(): AppMetrics {
    return { ...this.appMetrics };
  }

  /**
   * Update app metric
   */
  updateAppMetric(key: keyof AppMetrics, value: number): void {
    this.appMetrics[key] = value;
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

      performanceMonitor.updateAppMetric('renderTime', duration);

      if (duration > 16) {
        // > 1 frame at 60fps — tracked internally
        console.warn(`Slow render: ${componentName} took ${duration.toFixed(2)}ms`);
      }
    };
  }, [componentName]);
}

/**
 * React hook for monitoring app performance metrics
 */
export function usePerformanceMetrics(): AppMetrics {
  const [metrics, setMetrics] = React.useState<AppMetrics>(performanceMonitor.getAppMetrics());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    performanceMonitor.initialize();

    // Update metrics every second
    intervalRef.current = setInterval(() => {
      setMetrics(performanceMonitor.getAppMetrics());
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return metrics;
}

/**
 * React hook for measuring function execution time
 */
export function useMeasurePerformance() {
  const measure = useCallback(<T>(name: string, fn: () => T): T => {
    return measurePerformance(name, fn);
  }, []);

  const measureAsync = useCallback(async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    return measurePerformanceAsync(name, fn);
  }, []);

  return { measure, measureAsync };
}
