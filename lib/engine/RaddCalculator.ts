import { FractionClass } from './fraction';
import type { HeirShareObject, MadhhabRules } from './types';

export class RaddCalculator {
  constructor(
    private getMadhabRule: <K extends keyof MadhhabRules>(key: K) => MadhhabRules[K] | undefined,
    private specialCases: Array<{ type: string; name: string; description: string }>,
    private sumFractions: (fractions: FractionClass[]) => FractionClass
  ) {}

  applyRadd(shares: HeirShareObject[], remainder: FractionClass): HeirShareObject[] {
    if (remainder.toDecimal() <= 0.0001) {
      return shares;
    }

    const spouseRaddEnabled = this.getMadhabRule('spouse_radd') === true;

    const eligible = shares.filter((s) => {
      if (s.type.includes('تعصيب')) return false;
      if (s.key === 'husband' || s.key === 'wife') {
        return spouseRaddEnabled;
      }
      return true;
    });

    if (eligible.length === 0) {
      return shares;
    }

    this.specialCases.push({
      type: 'radd',
      name: 'الرد',
      description: spouseRaddEnabled
        ? 'توزيع الفائض على أصحاب الفروض بما فيهم الزوج/الزوجة'
        : 'توزيع الفائض على أصحاب الفروض ما عدا الزوج/الزوجة',
    });

    const totalEligible = this.sumFractions(eligible.map((s) => s.fraction));

    if (totalEligible.toDecimal() <= 0) {
      return shares;
    }

    return shares.map((share) => {
      if (eligible.includes(share)) {
        const proportion = share.fraction.divide(totalEligible);
        const additionalShare = remainder.multiply(proportion);
        return {
          ...share,
          fraction: share.fraction.add(additionalShare),
          type: share.type + ' + رد',
        };
      }
      return share;
    });
  }
}
