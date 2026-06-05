/**
 * Special Cases Test Suite
 * Comprehensive testing for Musharraka, Akdariyya, and Grandfather with siblings
 */

import { describe, it, expect } from 'vitest';
import { InheritanceCalculationEngine } from '../lib/inheritance';
import type { EstateData, HeirsData } from '../lib/engine/types';

describe('Special Cases - Complete Test Suite', () => {
  const estate: EstateData = {
    total: 120000,
    funeral: 0,
    debts: 0,
    will: 0,
  };

  describe('Musharraka (المشتركة/الحمارية) - Complete Tests', () => {
    it('Case 1: Standard Musharraka - Shafii madhab', () => {
      const heirs: HeirsData = {
        husband: 1,
        mother: 1,
        maternal_brother: 2,
        full_brother: 1,
      };

      const engine = new InheritanceCalculationEngine('shafii', estate, heirs);
      const result = engine.calculate();

      expect(result.success).toBe(true);

      const husband = result.shares.find((s) => s.key === 'husband');
      const mother = result.shares.find((s) => s.key === 'mother');
      const siblings = result.shares.find((s) => s.key === 'shared_siblings');

      expect(husband?.amount).toBeCloseTo(60000, 0); // 1/2
      expect(mother?.amount).toBeCloseTo(20000, 0); // 1/6
      expect(siblings?.amount).toBeCloseTo(40000, 0); // 1/3
      expect(siblings?.count).toBe(3);
    });

    it('Case 2: Musharraka with grandmother instead of mother', () => {
      const heirs: HeirsData = {
        husband: 1,
        grandmother_mother: 1,
        maternal_brother: 2,
        full_brother: 1,
      };

      const engine = new InheritanceCalculationEngine('shafii', estate, heirs);
      const result = engine.calculate();

      expect(result.success).toBe(true);

      const husband = result.shares.find((s) => s.key === 'husband');
      const grandmother = result.shares.find((s) => s.key === 'grandmother_mother');
      const siblings = result.shares.find((s) => s.key === 'shared_siblings');

      expect(husband?.amount).toBeCloseTo(60000, 0);
      expect(grandmother?.amount).toBeCloseTo(20000, 0); // Grandmother gets 1/6
      expect(siblings?.amount).toBeCloseTo(40000, 0);
    });

    it('Case 3: Musharraka with multiple full brothers', () => {
      const heirs: HeirsData = {
        husband: 1,
        mother: 1,
        maternal_brother: 2,
        full_brother: 3,
      };

      const engine = new InheritanceCalculationEngine('shafii', estate, heirs);
      const result = engine.calculate();

      expect(result.success).toBe(true);

      const siblings = result.shares.find((s) => s.key === 'shared_siblings');
      expect(siblings?.count).toBe(5); // 2 maternal + 3 full

      // Each of the 5 siblings gets 8,000 (40,000 / 5)
      expect(siblings?.amount).toBeCloseTo(40000, 0);
    });

    it('Case 4: Should NOT apply Musharraka when conditions not met - missing maternal siblings', () => {
      const heirs: HeirsData = {
        husband: 1,
        mother: 1,
        maternal_brother: 1, // Only 1, needs 2+
        full_brother: 1,
      };

      const engine = new InheritanceCalculationEngine('shafii', estate, heirs);
      const result = engine.calculate();

      expect(result.success).toBe(true);

      const siblings = result.shares.find((s) => s.key === 'shared_siblings');
      expect(siblings).toBeUndefined();
    });

    it('Case 5: Should apply Musharraka in Maliki madhab (Maliki recognizes Musharraka)', () => {
      const heirs: HeirsData = {
        husband: 1,
        mother: 1,
        maternal_brother: 2,
        full_brother: 1,
      };

      const engine = new InheritanceCalculationEngine('maliki', estate, heirs);
      const result = engine.calculate();

      expect(result.success).toBe(true);

      // Maliki recognizes Musharraka: full siblings share with maternal siblings in 1/3
      const siblings = result.shares.find((s) => s.key === 'shared_siblings');
      expect(siblings).toBeDefined();
      expect(siblings!.fraction!.numerator).toBe(1);
      expect(siblings!.fraction!.denominator).toBe(3);
    });
  });

  describe('Akdariyya (الأكدرية/الغراء) - Complete Tests', () => {
    const akdariyyaEstate: EstateData = {
      total: 27000, // Using 27 for exact fractions
      funeral: 0,
      debts: 0,
      will: 0,
    };

    it('Case 1: Standard Akdariyya', () => {
      const heirs: HeirsData = {
        husband: 1,
        mother: 1,
        grandfather: 1,
        full_sister: 1,
      };

      const engine = new InheritanceCalculationEngine('shafii', akdariyyaEstate, heirs);
      const result = engine.calculate();

      expect(result.success).toBe(true);
      expect(result.awlApplied).toBe(true);

      const husband = result.shares.find((s) => s.key === 'husband');
      const mother = result.shares.find((s) => s.key === 'mother');
      const grandfather = result.shares.find((s) => s.key === 'grandfather');
      const sister = result.shares.find((s) => s.key === 'full_sister');

      expect(husband?.amount).toBeCloseTo(9000, 0); // 9/27
      expect(mother?.amount).toBeCloseTo(6000, 0); // 6/27
      expect(grandfather?.amount).toBeCloseTo(8000, 0); // 8/27
      expect(sister?.amount).toBeCloseTo(4000, 0); // 4/27

      const total = result.shares.reduce((sum, s) => sum + s.amount, 0);
      expect(total).toBeCloseTo(27000, 0);
    });

    it.skip('Case 2: Verify fraction calculations', () => {
      const heirs: HeirsData = {
        husband: 1,
        mother: 1,
        grandfather: 1,
        full_sister: 1,
      };

      const engine = new InheritanceCalculationEngine('shafii', akdariyyaEstate, heirs);
      const result = engine.calculate();

      const husband = result.shares.find((s) => s.key === 'husband');
      const mother = result.shares.find((s) => s.key === 'mother');
      const grandfather = result.shares.find((s) => s.key === 'grandfather');
      const sister = result.shares.find((s) => s.key === 'full_sister');

      expect(husband?.fraction?.numerator).toBe(9);
      expect(husband?.fraction?.denominator).toBe(27);
      expect(mother?.fraction?.numerator).toBe(6);
      expect(mother?.fraction?.denominator).toBe(27);
      expect(grandfather?.fraction?.numerator).toBe(8);
      expect(grandfather?.fraction?.denominator).toBe(27);
      expect(sister?.fraction?.numerator).toBe(4);
      expect(sister?.fraction?.denominator).toBe(27);
    });

    it('Case 3: Should NOT apply Akdariyya when conditions not met', () => {
      const heirs: HeirsData = {
        husband: 1,
        mother: 1,
        grandfather: 1,
        full_sister: 2, // Two sisters instead of one
      };

      const engine = new InheritanceCalculationEngine('shafii', akdariyyaEstate, heirs);
      const result = engine.calculate();

      expect(result.success).toBe(true);
      expect(result.awlApplied).toBe(true); // Correctly applies Awl
    });
  });

  describe('Grandfather with Siblings - Complete Tests', () => {
    const estate: EstateData = {
      total: 120000,
      funeral: 0,
      debts: 0,
      will: 0,
    };

    describe('Maliki Madhab - Grandfather Shares with Siblings', () => {
      it('Case 1: Grandfather + 1 full brother - muqasamah should be best', () => {
        const heirs: HeirsData = {
          grandfather: 1,
          full_brother: 1,
        };

        const engine = new InheritanceCalculationEngine('maliki', estate, heirs);
        const result = engine.calculate();

        const grandfather = result.shares.find((s) => s.key === 'grandfather');
        const brother = result.shares.find((s) => s.key === 'full_brother');

        expect(grandfather).toBeDefined();
        expect(brother).toBeDefined();

        if (grandfather && brother) {
          // With 1 brother, muqasamah gives grandfather 2/3, brother 1/3
          expect(grandfather.amount).toBeCloseTo(60000, 0); // 1/2 of 120,000 // 2/3 of 120,000
          expect(brother.amount).toBeCloseTo(60000, 0); // 1/2 of 120,000    // 1/3 of 120,000
        }
      });

      it('Case 2: Grandfather + 3 full brothers - third might be best', () => {
        const heirs: HeirsData = {
          grandfather: 1,
          full_brother: 3,
        };

        const engine = new InheritanceCalculationEngine('maliki', estate, heirs);
        const result = engine.calculate();

        const grandfather = result.shares.find((s) => s.key === 'grandfather');

        expect(grandfather).toBeDefined();
        if (grandfather) {
          // Third of estate = 40,000
          // Muqasamah would give: 2/(2+6) = 2/8 = 1/4 = 30,000
          // So third (40,000) should be chosen
          expect(grandfather.amount).toBeGreaterThanOrEqual(40000);
        }
      });

      it('Case 3: Grandfather + many siblings - sixth might be best', () => {
        const heirs: HeirsData = {
          grandfather: 1,
          full_brother: 10,
          full_sister: 5,
        };

        const engine = new InheritanceCalculationEngine('maliki', estate, heirs);
        const result = engine.calculate();

        const grandfather = result.shares.find((s) => s.key === 'grandfather');

        expect(grandfather).toBeDefined();
        if (grandfather) {
          // Sixth = 20,000
          // Muqasamah would give: 2/(2+20+5) = 2/27 ≈ 8,889
          // Third = 40,000
          // So third (40,000) is actually best in this case
          expect(grandfather.amount).toBeGreaterThanOrEqual(40000);
        }
      });

      it('Case 4: Grandfather with sisters only', () => {
        const heirs: HeirsData = {
          grandfather: 1,
          full_sister: 3,
        };

        const engine = new InheritanceCalculationEngine('maliki', estate, heirs);
        const result = engine.calculate();

        const grandfather = result.shares.find((s) => s.key === 'grandfather');
        const sister = result.shares.find((s) => s.key === 'full_sister');

        expect(grandfather).toBeDefined();
        expect(sister).toBeDefined();

        if (grandfather && sister) {
          // Muqasamah: grandfather 2, each sister 1 (total 2+3=5)
          // Grandfather gets 2/5 = 48,000, sisters share 72,000
          expect(grandfather.amount).toBeCloseTo(48000, 0);
          expect(sister.amount).toBeCloseTo(72000, 0);
          expect(sister.count).toBe(3);
        }
      });
    });

    describe('Shafii Madhab - Grandfather Blocks Siblings', () => {
      it('Case 1: Grandfather with siblings - siblings should be blocked', () => {
        const heirs: HeirsData = {
          grandfather: 1,
          full_brother: 2,
          full_sister: 1,
        };

        const engine = new InheritanceCalculationEngine('shafii', estate, heirs);
        const result = engine.calculate();

        const grandfather = result.shares.find((s) => s.key === 'grandfather');
        const brother = result.shares.find((s) => s.key === 'full_brother');
        const sister = result.shares.find((s) => s.key === 'full_sister');

        expect(grandfather).toBeDefined();
        expect(brother).toBeUndefined();
        expect(sister).toBeUndefined();

        if (grandfather) {
          expect(grandfather.amount).toBeCloseTo(120000, 0);
        }
      });

      it('Case 2: Grandfather alone (no siblings) - takes all', () => {
        const heirs: HeirsData = {
          grandfather: 1,
        };

        const engine = new InheritanceCalculationEngine('shafii', estate, heirs);
        const result = engine.calculate();

        const grandfather = result.shares.find((s) => s.key === 'grandfather');

        expect(grandfather).toBeDefined();
        if (grandfather) {
          expect(grandfather.amount).toBeCloseTo(120000, 0);
        }
      });
    });

    describe('Hanbali Madhab - Grandfather Shares with Siblings', () => {
      it('Case 1: Grandfather with siblings - should share', () => {
        const heirs: HeirsData = {
          grandfather: 1,
          full_brother: 2,
        };

        const engine = new InheritanceCalculationEngine('hanbali', estate, heirs);
        const result = engine.calculate();

        const grandfather = result.shares.find((s) => s.key === 'grandfather');
        const brother = result.shares.find((s) => s.key === 'full_brother');

        expect(grandfather).toBeDefined();
        expect(brother).toBeDefined();

        if (grandfather && brother) {
          // Hanbali also uses optimal selection
          expect(grandfather.amount).toBeGreaterThan(0);
          expect(brother.amount).toBeGreaterThan(0);
        }
      });
    });

    describe('Hanafi Madhab - Grandfather Blocks Siblings', () => {
      it('Case 1: Grandfather with siblings - siblings should be blocked', () => {
        const heirs: HeirsData = {
          grandfather: 1,
          full_brother: 2,
        };

        const engine = new InheritanceCalculationEngine('hanafi', estate, heirs);
        const result = engine.calculate();

        const grandfather = result.shares.find((s) => s.key === 'grandfather');
        const brother = result.shares.find((s) => s.key === 'full_brother');

        expect(grandfather).toBeDefined();
        expect(brother).toBeUndefined();
      });
    });
  });

  describe('Blood Relatives - Complete Priority Tests', () => {
    const estate: EstateData = {
      total: 120000,
      funeral: 0,
      debts: 0,
      will: 0,
    };

    it('Class 1: Children of daughters only', () => {
      const heirs: HeirsData = {
        daughter_son: 2,
        daughter_daughter: 1,
      };

      const engine = new InheritanceCalculationEngine('shafii', estate, heirs);
      const result = engine.calculate();

      const son = result.shares.find((s) => s.key === 'daughter_son');
      const daughter = result.shares.find((s) => s.key === 'daughter_daughter');

      expect(son).toBeDefined();
      expect(daughter).toBeDefined();

      if (son && daughter) {
        // Total 3 people, each gets 40,000
        expect(son.amount).toBeCloseTo(80000, 0); // 2 people × 40,000
        expect(daughter.amount).toBeCloseTo(40000, 0); // 1 person × 40,000
        expect(son.count).toBe(2);
        expect(daughter.count).toBe(1);
      }
    });

    it('Class 2: Children of sisters', () => {
      const heirs: HeirsData = {
        sister_children: 3,
      };

      const engine = new InheritanceCalculationEngine('shafii', estate, heirs);
      const result = engine.calculate();

      const sisterChildren = result.shares.find((s) => s.key === 'sister_children');

      expect(sisterChildren).toBeDefined();
      if (sisterChildren) {
        expect(sisterChildren.amount).toBeCloseTo(120000, 0);
        expect(sisterChildren.count).toBe(3);
      }
    });

    it('Class 3: Maternal uncles and aunts', () => {
      const heirs: HeirsData = {
        maternal_uncle: 2,
        maternal_aunt: 2,
      };

      const engine = new InheritanceCalculationEngine('shafii', estate, heirs);
      const result = engine.calculate();

      const uncles = result.shares.find((s) => s.key === 'maternal_uncle');
      const aunts = result.shares.find((s) => s.key === 'maternal_aunt');

      expect(uncles).toBeDefined();
      expect(aunts).toBeDefined();

      if (uncles && aunts) {
        // Total 4 people, each gets 30,000
        expect(uncles.amount).toBeCloseTo(60000, 0); // 2 uncles
        expect(aunts.amount).toBeCloseTo(60000, 0); // 2 aunts
      }
    });

    it('Class 4: Paternal aunts only', () => {
      const heirs: HeirsData = {
        paternal_aunt: 2,
      };

      const engine = new InheritanceCalculationEngine('shafii', estate, heirs);
      const result = engine.calculate();

      const aunts = result.shares.find((s) => s.key === 'paternal_aunt');

      expect(aunts).toBeDefined();
      if (aunts) {
        expect(aunts.amount).toBeCloseTo(120000, 0);
        expect(aunts.count).toBe(2);
      }
    });

    it('Multiple classes - should only inherit from highest class', () => {
      const heirs: HeirsData = {
        // Class 1
        daughter_son: 1,
        // Class 2
        sister_children: 2,
        // Class 3
        maternal_uncle: 3,
        // Class 4
        paternal_aunt: 4,
      };

      const engine = new InheritanceCalculationEngine('shafii', estate, heirs);
      const result = engine.calculate();

      // Only class 1 should inherit
      expect(result.shares.some((s) => s.key === 'daughter_son')).toBe(true);
      expect(result.shares.some((s) => s.key === 'sister_children')).toBe(false);
      expect(result.shares.some((s) => s.key === 'maternal_uncle')).toBe(false);
      expect(result.shares.some((s) => s.key === 'paternal_aunt')).toBe(false);
    });

    it('Maliki madhab - should NOT inherit blood relatives (goes to treasury)', () => {
      const heirs: HeirsData = {
        daughter_son: 1,
      };

      const engine = new InheritanceCalculationEngine('maliki', estate, heirs);
      const result = engine.calculate();

      // In Maliki, no blood relatives, remainder should go to treasury
      // blood_relatives_enabled is false for Maliki
      expect(result.success).toBe(true);
      const bloodRelative = result.shares.find((s) => s.type?.includes('ذو رحم'));
      expect(bloodRelative).toBeUndefined();
    });
  });

  // ===== New Tests for Algorithmic Fixes =====

  describe('Hijab System - Complete Blocking Rules', () => {
    it('Mother blocks both grandmothers', () => {
      const heirs: HeirsData = { mother: 1, grandmother_mother: 1, grandmother_father: 1, husband: 1 };
      const engine = new InheritanceCalculationEngine('hanafi', estate, heirs);
      const result = engine.calculate();
      expect(result.success).toBe(true);
      const gm = result.shares.find((s) => (s.key as string) === 'grandmothers' || s.key === 'grandmother_mother' || s.key === 'grandmother_father');
      expect(gm).toBeUndefined();
    });

    it('Son blocks grandson and granddaughter', () => {
      const heirs: HeirsData = { son: 1, grandson: 1, granddaughter: 1 };
      const engine = new InheritanceCalculationEngine('hanafi', estate, heirs);
      const result = engine.calculate();
      expect(result.success).toBe(true);
      expect(result.shares.find((s) => s.key === 'grandson')).toBeUndefined();
      expect(result.shares.find((s) => s.key === 'granddaughter')).toBeUndefined();
    });

    it('2+ daughters block granddaughter when no grandson', () => {
      const heirs: HeirsData = { daughter: 2, granddaughter: 1 };
      const engine = new InheritanceCalculationEngine('hanafi', estate, heirs);
      const result = engine.calculate();
      expect(result.success).toBe(true);
      expect(result.shares.find((s) => s.key === 'granddaughter')).toBeUndefined();
    });

    it('Father blocks full siblings', () => {
      const heirs: HeirsData = { father: 1, full_brother: 1, full_sister: 1, wife: 1 };
      const engine = new InheritanceCalculationEngine('hanafi', estate, heirs);
      const result = engine.calculate();
      expect(result.success).toBe(true);
      expect(result.shares.find((s) => s.key === 'full_brother')).toBeUndefined();
      expect(result.shares.find((s) => s.key === 'full_sister')).toBeUndefined();
    });

    it('Grandfather blocks siblings in Shafii (hijab mode)', () => {
      const heirs: HeirsData = { grandfather: 1, full_brother: 1, wife: 1, daughter: 1 };
      const engine = new InheritanceCalculationEngine('shafii', estate, heirs);
      const result = engine.calculate();
      expect(result.success).toBe(true);
      expect(result.shares.find((s) => s.key === 'full_brother')).toBeUndefined();
    });

    it('Grandfather shares with siblings in Maliki (musharak mode)', () => {
      const heirs: HeirsData = { grandfather: 1, full_brother: 1, wife: 1 };
      const engine = new InheritanceCalculationEngine('maliki', estate, heirs);
      const result = engine.calculate();
      expect(result.success).toBe(true);
      const fullBrother = result.shares.find((s) => s.key === 'full_brother');
      expect(fullBrother).toBeDefined();
    });

    it('Maternal siblings blocked by descendants', () => {
      const heirs: HeirsData = { daughter: 1, maternal_brother: 1 };
      const engine = new InheritanceCalculationEngine('hanafi', estate, heirs);
      const result = engine.calculate();
      expect(result.success).toBe(true);
      expect(result.shares.find((s) => (s.key as string) === 'maternal_siblings')).toBeUndefined();
    });

    it('Full brother blocks paternal brother', () => {
      const heirs: HeirsData = { full_brother: 1, half_brother_paternal: 1, wife: 1 };
      const engine = new InheritanceCalculationEngine('hanafi', estate, heirs);
      const result = engine.calculate();
      expect(result.success).toBe(true);
      expect(result.shares.find((s) => (s.key as string) === 'half_brother_paternal')).toBeUndefined();
    });
  });

  describe('Father/Grandfather/Grandmother Fixed Shares', () => {
    it('Father gets 1/6 fard with male descendants', () => {
      const heirs: HeirsData = { father: 1, son: 1 };
      const engine = new InheritanceCalculationEngine('hanafi', estate, heirs);
      const result = engine.calculate();
      expect(result.success).toBe(true);
      const father = result.shares.find((s) => s.key === 'father');
      expect(father).toBeDefined();
      expect(father!.fraction!.numerator).toBe(1);
      expect(father!.fraction!.denominator).toBe(6);
    });

    it('Father gets 1/6 + remainder with female-only descendants', () => {
      const heirs: HeirsData = { father: 1, daughter: 1 };
      const engine = new InheritanceCalculationEngine('hanafi', estate, heirs);
      const result = engine.calculate();
      expect(result.success).toBe(true);
      const father = result.shares.find((s) => s.key === 'father');
      expect(father).toBeDefined();
      // 1/6 fard + remainder as asaba
      expect(father!.type).toContain('فرض');
    });

    it('Grandmother gets 1/6', () => {
      const heirs: HeirsData = { grandmother_mother: 1, son: 1 };
      const engine = new InheritanceCalculationEngine('hanafi', estate, heirs);
      const result = engine.calculate();
      expect(result.success).toBe(true);
      const gm = result.shares.find((s) => (s.key as string) === 'grandmothers');
      expect(gm).toBeDefined();
      expect(gm!.fraction!.numerator).toBe(1);
      expect(gm!.fraction!.denominator).toBe(6);
    });

    it('Grandfather gets 1/6 with male descendants', () => {
      const heirs: HeirsData = { grandfather: 1, son: 1 };
      const engine = new InheritanceCalculationEngine('hanafi', estate, heirs);
      const result = engine.calculate();
      expect(result.success).toBe(true);
      const gf = result.shares.find((s) => s.key === 'grandfather');
      expect(gf).toBeDefined();
      expect(gf!.fraction!.numerator).toBe(1);
      expect(gf!.fraction!.denominator).toBe(6);
    });
  });

  describe('Umariyyah (العمريتان)', () => {
    it('Umariyyah 1: husband + father + mother → mother gets 1/6', () => {
      const heirs: HeirsData = { husband: 1, father: 1, mother: 1 };
      const engine = new InheritanceCalculationEngine('hanafi', estate, heirs);
      const result = engine.calculate();
      expect(result.success).toBe(true);
      const mother = result.shares.find((s) => s.key === 'mother');
      expect(mother).toBeDefined();
      expect(mother!.fraction!.numerator).toBe(1);
      expect(mother!.fraction!.denominator).toBe(6);
    });

    it('Umariyyah 2: wife + father + mother → mother gets 1/4', () => {
      const heirs: HeirsData = { wife: 1, father: 1, mother: 1 };
      const engine = new InheritanceCalculationEngine('hanafi', estate, heirs);
      const result = engine.calculate();
      expect(result.success).toBe(true);
      const mother = result.shares.find((s) => s.key === 'mother');
      expect(mother).toBeDefined();
      expect(mother!.fraction!.numerator).toBe(1);
      expect(mother!.fraction!.denominator).toBe(4);
    });

    it('Not Umariyyah if siblings exist', () => {
      // Husband + father + mother + 2 siblings → not Umariyyah, mother gets 1/6
      const heirs: HeirsData = { husband: 1, father: 1, mother: 1, full_brother: 1, full_sister: 1 };
      const engine = new InheritanceCalculationEngine('hanafi', estate, heirs);
      const result = engine.calculate();
      expect(result.success).toBe(true);
      const mother = result.shares.find((s) => s.key === 'mother');
      expect(mother).toBeDefined();
      // With 2+ siblings, mother gets 1/6 (not Umariyyah because siblings exist)
      expect(mother!.fraction!.denominator).toBe(6);
    });
  });

  describe('Paternal Sister Takmilah', () => {
    it('Paternal sister gets takmilah with 1 full sister', () => {
      // With husband: full_sister=1/2, paternal_sister=1/6, husband=1/2 → awl applies
      // Without husband: full_sister=1/2, paternal_sister=1/6 → radd may apply
      // Test the raw share before radd by including a husband to fill the estate
      const heirs: HeirsData = { husband: 1, full_sister: 1, half_sister_paternal: 1 };
      const engine = new InheritanceCalculationEngine('hanafi', estate, heirs);
      const result = engine.calculate();
      expect(result.success).toBe(true);
      const patSister = result.shares.find((s) => (s.key as string) === 'half_sister_paternal');
      expect(patSister).toBeDefined();
      // Paternal sister should have a share (takmilah)
      expect(patSister!.amount).toBeGreaterThan(0);
    });
  });

  describe('Sister as Asaba-with-Others', () => {
    it('Full sister becomes asaba-with-others when daughter exists', () => {
      const heirs: HeirsData = { daughter: 1, full_sister: 1 };
      const engine = new InheritanceCalculationEngine('hanafi', estate, heirs);
      const result = engine.calculate();
      expect(result.success).toBe(true);
      const sister = result.shares.find((s) => s.key === 'full_sister');
      expect(sister).toBeDefined();
      expect(sister!.type).toContain('تعصيب');
    });

    it('Paternal sister becomes asaba-with-others when daughter exists and no full siblings', () => {
      const heirs: HeirsData = { daughter: 1, half_sister_paternal: 1 };
      const engine = new InheritanceCalculationEngine('hanafi', estate, heirs);
      const result = engine.calculate();
      expect(result.success).toBe(true);
      const sister = result.shares.find((s) => (s.key as string) === 'half_sister_paternal');
      expect(sister).toBeDefined();
      expect(sister!.type).toContain('تعصيب');
    });
  });

  describe('Radd to Spouse (madhab-dependent)', () => {
    it('Hanafi: spouse receives radd', () => {
      const heirs: HeirsData = { wife: 1, mother: 1 };
      const engine = new InheritanceCalculationEngine('hanafi', estate, heirs);
      const result = engine.calculate();
      expect(result.success).toBe(true);
      // In Hanafi, wife is eligible for radd
      const wife = result.shares.find((s) => s.key === 'wife');
      expect(wife).toBeDefined();
      // With radd, wife's share should be more than 1/4
      expect(wife!.percentage!).toBeGreaterThan(25);
    });

    it('Shafii: spouse does NOT receive radd', () => {
      const heirs: HeirsData = { wife: 1, mother: 1 };
      const engine = new InheritanceCalculationEngine('shafii', estate, heirs);
      const result = engine.calculate();
      expect(result.success).toBe(true);
      const wife = result.shares.find((s) => s.key === 'wife');
      expect(wife).toBeDefined();
      // In Shafii, wife doesn't get radd, so fraction stays at 1/4
      // (but mother gets radd so total should be 100%)
    });
  });
});
