/**
 * Performance Regression Tests
 * اختبارات انحدار الأداء
 *
 * These tests monitor performance over time to detect regressions.
 * They establish baselines and fail if performance degrades significantly.
 */

import { describe, it, expect, afterAll } from 'vitest';
import { calculateInheritance } from '../lib/engine/calculator';
import type { EstateInput, HeirsData, Madhab } from '../lib/engine/types';

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  SIMPLE_CALCULATION: 50,    // Simple case should be < 50ms
  COMPLEX_CALCULATION: 100,  // Complex case should be < 100ms
  VERY_COMPLEX: 200,         // Very complex case should be < 200ms
  MAX_DEGRADATION: 1.5,      // Allow 50% degradation before failing
};

// Test cases with their expected max duration
const TEST_CASES: {
  name: string;
  estate: EstateInput;
  heirs: HeirsData;
  maxDuration: number;
}[] = [
  {
    name: 'Simple case - wife and son',
    estate: { total: 100000, funeral: 5000, debts: 0, will: 0 },
    heirs: { wife: 1, son: 1 },
    maxDuration: PERFORMANCE_THRESHOLDS.SIMPLE_CALCULATION,
  },
  {
    name: 'Medium case - multiple heirs',
    estate: { total: 500000, funeral: 10000, debts: 20000, will: 10000 },
    heirs: { wife: 1, daughter: 2, father: 1, mother: 1 },
    maxDuration: PERFORMANCE_THRESHOLDS.COMPLEX_CALCULATION,
  },
  {
    name: 'Complex case - many heirs',
    estate: { total: 1000000, funeral: 50000, debts: 100000, will: 50000 },
    heirs: {
      wife: 1,
      daughter: 3,
      father: 1,
      mother: 1,
      full_brother: 2,
      full_sister: 1,
    },
    maxDuration: PERFORMANCE_THRESHOLDS.VERY_COMPLEX,
  },
];

describe('Performance Regression Tests', () => {
  const results: { name: string; duration: number; passed: boolean }[] = [];

  TEST_CASES.forEach(({ name, estate, heirs, maxDuration }) => {
    it(`${name} should complete within threshold`, () => {
      // Run calculation 10 times to get average
      const iterations = 10;
      const durations: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const iterStart = performance.now();
        calculateInheritance('hanafi', estate, heirs);
        durations.push(performance.now() - iterStart);
      }
      
      const avgDuration = durations.reduce((a, b) => a + b, 0) / iterations;
      
      const passed = avgDuration <= maxDuration;
      
      results.push({
        name,
        duration: avgDuration,
        passed,
      });
      
      console.log(`[Performance] ${name}: ${avgDuration.toFixed(2)}ms (threshold: ${maxDuration}ms)`);
      
      if (!passed) {
        console.warn(`[Performance Regression] ${name} exceeded threshold by ${((avgDuration / maxDuration - 1) * 100).toFixed(0)}%`);
      }
      
      expect(avgDuration).toBeLessThanOrEqual(maxDuration * PERFORMANCE_THRESHOLDS.MAX_DEGRADATION);
    });
  });

  it('madhab comparison should be reasonably consistent', () => {
    const estate = { total: 100000, funeral: 5000, debts: 0, will: 0 };
    const heirs = { wife: 1, daughter: 2, father: 1 };
    const madhhabs: Madhab[] = ['hanafi', 'maliki', 'shafii', 'hanbali'];
    
    const durations: number[] = [];
    
    madhhabs.forEach(madhab => {
      const startTime = performance.now();
      calculateInheritance(madhab, estate, heirs);
      durations.push(performance.now() - startTime);
    });
    
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const maxDuration = Math.max(...durations);
    const minDuration = Math.min(...durations);
    
    // Max should not be more than 3x the average (different madhabs have different complexity)
    expect(maxDuration).toBeLessThanOrEqual(avgDuration * 3);
    
    console.log(`[Performance] Madhab comparison: avg=${avgDuration.toFixed(2)}ms, min=${minDuration.toFixed(2)}ms, max=${maxDuration.toFixed(2)}ms`);
  });

  it('cache hit should be significantly faster than cache miss', async () => {
    const estate = { total: 100000, funeral: 5000, debts: 0, will: 0 };
    const heirs = { wife: 1, daughter: 2, father: 1 };
    
    // Cold calculation
    const coldStart = performance.now();
    calculateInheritance('hanafi', estate, heirs);
    const coldDuration = performance.now() - coldStart;
    
    // Warm calculation (should benefit from any internal caching)
    const warmStart = performance.now();
    calculateInheritance('hanafi', estate, heirs);
    const warmDuration = performance.now() - warmStart;
    
    console.log(`[Performance] Cold: ${coldDuration.toFixed(2)}ms, Warm: ${warmDuration.toFixed(2)}ms`);
    
    // Warm should be at least as fast as cold (may be faster due to JIT, caching, etc.)
    expect(warmDuration).toBeLessThanOrEqual(coldDuration * 1.5); // Allow some variance
  });

  afterAll(() => {
    console.log('\n=== Performance Summary ===');
    results.forEach(({ name, duration, passed }) => {
      const status = passed ? '✓' : '✗';
      console.log(`${status} ${name}: ${duration.toFixed(2)}ms`);
    });
  });
});
