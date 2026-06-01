import { describe, expect, it } from 'vitest';
import { calculateInheritance } from '../lib/inheritance/calculateAdapter';

describe('calculateInheritance', () => {
  it('should calculate shares successfully for a simple estate', () => {
    const result = calculateInheritance({
      madhab: 'hanafi',
      totalEstate: 120000,
      funeral: 1000,
      debts: 500,
      will: 0,
      heirs: [
        { type: 'wife', count: 1 },
        { type: 'son', count: 1 },
      ],
    });

    expect(result.success).toBe(true);
    expect(result.madhab).toBe('hanafi');
    expect(result.shares.some((share) => share.key === 'wife')).toBe(true);
    expect(result.shares.some((share) => share.key === 'son')).toBe(true);
    expect(result.netEstate).toBeGreaterThan(0);
  });
});
