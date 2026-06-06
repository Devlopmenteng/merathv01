import { FractionClass } from './fraction';
import type { HeirShareObject } from './types';

export class AwlCalculator {
  private specialCases: Array<{ type: string; name: string; description: string }>;

  constructor(
    specialCases: Array<{ type: string; name: string; description: string }>
  ) {
    this.specialCases = specialCases;
  }

  applyAwl(shares: HeirShareObject[], totalFraction: FractionClass): HeirShareObject[] {
    this.specialCases.push({
      type: 'awl',
      name: 'الأول',
      description: 'تقليل الأنصباء بنسبة متساوية عند زيادة الفروض على التركة',
    });

    return shares.map((share) => ({
      ...share,
      fraction: share.fraction.divide(totalFraction),
    }));
  }
}
