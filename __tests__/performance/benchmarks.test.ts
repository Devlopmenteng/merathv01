/**
 * Performance Benchmarks for Calculation Engine
 * Tests to ensure calculation performance meets acceptable thresholds
 */

import { describe, expect, it } from 'vitest';
import { InheritanceCalculationEngine } from '../../lib/inheritance';
import type { EstateData, HeirsData } from '../../lib/engine/types';

describe('Performance Benchmarks', () => {
  const simpleEstate: EstateData = {
    total: 100000,
    funeral: 5000,
    debts: 0,
    will: 0,
  };

  const simpleHeirs: HeirsData = {
    wife: 1,
    son: 2,
  };

  const complexEstate: EstateData = {
    total: 500000,
    funeral: 10000,
    debts: 5000,
    will: 10000,
  };

  const complexHeirs: HeirsData = {
    wife: 1,
    father: 1,
    mother: 1,
    daughter: 2,
    son: 1,
    full_brother: 2,
    full_sister: 1,
    maternal_brother: 1,
    maternal_sister: 1,
  };

  it('should complete simple calculation in under 50ms', () => {
    const startTime = performance.now();

    const engine = new InheritanceCalculationEngine('hanafi', simpleEstate, simpleHeirs);
    const result = engine.calculate();

    const endTime = performance.now();
    const calculationTime = endTime - startTime;

    expect(result.success).toBe(true);
    expect(calculationTime).toBeLessThan(50); // 50ms threshold
  });

  it('should complete complex calculation in under 100ms', () => {
    const startTime = performance.now();

    const engine = new InheritanceCalculationEngine('hanafi', complexEstate, complexHeirs);
    const result = engine.calculate();

    const endTime = performance.now();
    const calculationTime = endTime - startTime;

    expect(result.success).toBe(true);
    expect(calculationTime).toBeLessThan(100); // 100ms threshold
  });

  it.skip('should handle consecutive calculations without performance degradation', () => {
    const calculationTimes: number[] = [];
    const iterations = 10;

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();

      const engine = new InheritanceCalculationEngine('hanafi', simpleEstate, simpleHeirs);
      engine.calculate();

      const endTime = performance.now();
      calculationTimes.push(endTime - startTime);
    }

    // Check that no calculation takes significantly longer than the average
    const averageTime =
      calculationTimes.reduce((sum, time) => sum + time, 0) / calculationTimes.length;
    const maxTime = Math.max(...calculationTimes);

    expect(maxTime).toBeLessThan(averageTime * 2); // Max should not be more than 2x average
  });

  it.skip('should perform consistently across different madhabs', () => {
    const madhhabs = ['hanafi', 'maliki', 'shafii', 'hanbali'] as const;
    const calculationTimes: number[] = [];

    madhhabs.forEach((madhab) => {
      const startTime = performance.now();

      const engine = new InheritanceCalculationEngine(madhab, complexEstate, complexHeirs);
      engine.calculate();

      const endTime = performance.now();
      calculationTimes.push(endTime - startTime);
    });

    // Check that performance is consistent (within 5x difference)
    // Performance variance is expected due to different rule implementations
    const minTime = Math.min(...calculationTimes);
    const maxTime = Math.max(...calculationTimes);

    expect(maxTime).toBeLessThan(minTime * 5);
  });

  it('should handle fraction operations efficiently', () => {
    const startTime = performance.now();

    // Test with a case that requires awl (عول)
    const awlHeirs: HeirsData = {
      wife: 1,
      father: 1,
      mother: 1,
      daughter: 2,
    };

    const engine = new InheritanceCalculationEngine('hanafi', simpleEstate, awlHeirs);
    const result = engine.calculate();

    const endTime = performance.now();
    const calculationTime = endTime - startTime;

    expect(result.success).toBe(true);
    expect(calculationTime).toBeLessThan(100); // Even complex operations should be fast
  });

  it('should handle special cases without significant performance impact', () => {
    const specialCases = [
      {
        name: 'Musharraka',
        heirs: { husband: 1, mother: 1, maternal_brother: 2, full_sister: 1 } as HeirsData,
      },
      {
        name: 'Akdariyya',
        heirs: { husband: 1, mother: 1, grandfather: 1, full_sister: 1 } as HeirsData,
      },
    ];

    specialCases.forEach(({ name: _name, heirs }) => {
      const startTime = performance.now();

      const engine = new InheritanceCalculationEngine('shafii', simpleEstate, heirs);
      engine.calculate();

      const endTime = performance.now();
      const calculationTime = endTime - startTime;

      expect(calculationTime).toBeLessThan(100); // Special cases should still be fast
    });
  });

  it('should maintain performance with large numbers', () => {
    const largeEstate: EstateData = {
      total: 1000000000, // 1 billion
      funeral: 50000,
      debts: 0,
      will: 0,
    };

    const startTime = performance.now();

    const engine = new InheritanceCalculationEngine('hanafi', largeEstate, simpleHeirs);
    const result = engine.calculate();

    const endTime = performance.now();
    const calculationTime = endTime - startTime;

    expect(result.success).toBe(true);
    expect(calculationTime).toBeLessThan(100); // Large numbers should not significantly impact performance
  });
});
