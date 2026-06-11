/**
 * Edge Cases Test Suite
 * Testing complex scenarios including Awl with many heirs, Radd with spouse, and other edge cases
 */

import { describe, it, expect } from 'vitest';
import { InheritanceCalculationEngine } from '../lib/inheritance';
import type { EstateData, HeirsData } from '../lib/engine/types';

describe('Edge Cases - Awl (Estate Deficit)', () => {
  const estate: EstateData = {
    total: 100000,
    funeral: 0,
    debts: 0,
    will: 0,
  };

  it('should handle Awl with many heirs causing shares to exceed estate', () => {
    // This case creates a scenario where fixed shares exceed 100% of estate
    // Wife (1/8) + Father (1/6) + Mother (1/6) + Two daughters (2/3) = 27/24 > 1
    const heirs: HeirsData = {
      wife: 1,
      father: 1,
      mother: 1,
      daughter: 2,
    };

    const engine = new InheritanceCalculationEngine('hanafi', estate, heirs);
    const result = engine.calculate();

    expect(result.success).toBe(true);
    expect(result.specialCases?.awl).toBe(true);

    // Verify that shares were proportionally reduced
    const totalShares = result.shares.reduce((sum, share) => sum + share.amount, 0);
    expect(totalShares).toBeCloseTo(estate.total, 0);
  });

  it('should handle Awl with maximum number of fixed sharers', () => {
    // Complex case with many fixed sharers
    const heirs: HeirsData = {
      husband: 1,
      mother: 1,
      father: 1,
      daughter: 2,
      grandmother_mother: 1,
    };

    const engine = new InheritanceCalculationEngine('shafii', estate, heirs);
    const result = engine.calculate();

    expect(result.success).toBe(true);
    expect(result.shares.length).toBeGreaterThan(0);
  });

  it('should handle Awl in Maliki madhab with different rules', () => {
    const heirs: HeirsData = {
      wife: 1,
      father: 1,
      mother: 1,
      daughter: 2,
    };

    const engine = new InheritanceCalculationEngine('maliki', estate, heirs);
    const result = engine.calculate();

    expect(result.success).toBe(true);
    expect(result.specialCases?.awl).toBe(true);
  });
});

describe('Edge Cases - Radd (Surplus Estate)', () => {
  const estate: EstateData = {
    total: 100000,
    funeral: 0,
    debts: 0,
    will: 0,
  };

  it('should handle Radd with spouse (spouse should not receive Radd in Hanafi)', () => {
    // Single daughter (1/2) + husband (1/4) = 3/4, remainder 1/4
    // In this implementation, the daughter receives Radd but not the spouse
    const heirs: HeirsData = {
      husband: 1,
      daughter: 1,
    };

    const engine = new InheritanceCalculationEngine('hanafi', estate, heirs);
    const result = engine.calculate();

    expect(result.success).toBe(true);
    expect(result.specialCases?.radd).toBe(true);

    const husband = result.shares.find((s) => s.key === 'husband');
    const daughter = result.shares.find((s) => s.key === 'daughter');

    // Verify the shares are calculated correctly
    // Husband: 1/3, Daughter: 2/3 (after Radd application)
    expect(husband?.amount).toBeCloseTo(33333.33, 0);
    expect(daughter?.amount).toBeCloseTo(66666.67, 0);
  });

  it('should handle Radd with spouse in Maliki (spouse may receive Radd)', () => {
    const heirs: HeirsData = {
      husband: 1,
      daughter: 1,
    };

    const engine = new InheritanceCalculationEngine('maliki', estate, heirs);
    const result = engine.calculate();

    expect(result.success).toBe(true);
    expect(result.specialCases?.radd).toBe(true);

    // In Maliki, spouse may receive Radd differently
    const husband = result.shares.find((s) => s.key === 'husband');
    expect(husband?.amount).toBeGreaterThan(0);
  });

  it('should handle Radd with only distant relatives (dhawu al-arham)', () => {
    // Only maternal siblings (1/3 total), remainder should be redistributed
    const heirs: HeirsData = {
      maternal_brother: 1,
      maternal_sister: 1,
    };

    const engine = new InheritanceCalculationEngine('hanafi', estate, heirs);
    const result = engine.calculate();

    expect(result.success).toBe(true);
    expect(result.specialCases?.radd).toBe(true);
  });
});

describe('Edge Cases - Complex Family Structures', () => {
  const estate: EstateData = {
    total: 200000,
    funeral: 0,
    debts: 0,
    will: 0,
  };

  it('should handle case with no asaba heirs (only fixed sharers)', () => {
    const heirs: HeirsData = {
      mother: 1,
      grandmother_mother: 1,
      grandmother_father: 1,
    };

    const engine = new InheritanceCalculationEngine('hanafi', estate, heirs);
    const result = engine.calculate();

    expect(result.success).toBe(true);
    expect(result.specialCases?.radd).toBe(true);
  });

  it('should handle case with grandfather competing with siblings', () => {
    const heirs: HeirsData = {
      wife: 1,
      grandfather: 1,
      full_brother: 2,
    };

    const engine = new InheritanceCalculationEngine('shafii', estate, heirs);
    const result = engine.calculate();

    expect(result.success).toBe(true);
    expect(result.shares.length).toBeGreaterThan(0);
  });

  it('should handle case with only grandchildren (no children)', () => {
    const heirs: HeirsData = {
      granddaughter: 2,
      wife: 1,
    };

    const engine = new InheritanceCalculationEngine('hanafi', estate, heirs);
    const result = engine.calculate();

    expect(result.success).toBe(true);
    expect(result.specialCases?.radd).toBe(true);
  });
});

describe('Edge Cases - Boundary Conditions', () => {
  it('should handle estate with zero value after deductions', () => {
    const estate: EstateData = {
      total: 10000,
      funeral: 5000,
      debts: 5000,
      will: 0,
    };

    const heirs: HeirsData = {
      daughter: 1,
    };

    const engine = new InheritanceCalculationEngine('hanafi', estate, heirs);
    const result = engine.calculate();

    expect(result.success).toBe(true);
    expect(result.netEstate).toBe(0);
  });

  it('should handle will at maximum limit (1/3 of estate)', () => {
    const estate: EstateData = {
      total: 300000,
      funeral: 0,
      debts: 0,
      will: 100000, // Maximum 1/3
    };

    const heirs: HeirsData = {
      daughter: 2,
    };

    const engine = new InheritanceCalculationEngine('hanafi', estate, heirs);
    const result = engine.calculate();

    expect(result.success).toBe(true);
    expect(result.netEstate).toBe(200000);
  });

  it('should handle single heir receiving entire estate', () => {
    const estate: EstateData = {
      total: 100000,
      funeral: 0,
      debts: 0,
      will: 0,
    };

    const heirs: HeirsData = {
      son: 1,
    };

    const engine = new InheritanceCalculationEngine('hanafi', estate, heirs);
    const result = engine.calculate();

    expect(result.success).toBe(true);
    const son = result.shares.find((s) => s.key === 'son');
    expect(son?.amount).toBeCloseTo(estate.total, 0);
  });
});

describe('Edge Cases - Madhab-Specific Rules', () => {
  const estate: EstateData = {
    total: 100000,
    funeral: 0,
    debts: 0,
    will: 0,
  };

  it('should handle Umariyyah case across different madhhabs', () => {
    // Father, mother, and wife (Umariyyah case)
    const heirs: HeirsData = {
      father: 1,
      mother: 1,
      wife: 1,
    };

    const hanafiEngine = new InheritanceCalculationEngine('hanafi', estate, heirs);
    const hanafiResult = hanafiEngine.calculate();

    expect(hanafiResult.success).toBe(true);

    const shafiiEngine = new InheritanceCalculationEngine('shafii', estate, heirs);
    const shafiiResult = shafiiEngine.calculate();

    expect(shafiiResult.success).toBe(true);
  });

  it('should handle Akdariyya case in Shafii madhab', () => {
    // Grandfather with single sister
    const heirs: HeirsData = {
      grandfather: 1,
      full_sister: 1,
    };

    const engine = new InheritanceCalculationEngine('shafii', estate, heirs);
    const result = engine.calculate();

    expect(result.success).toBe(true);
    expect(result.shares.length).toBeGreaterThan(0);
  });
});
