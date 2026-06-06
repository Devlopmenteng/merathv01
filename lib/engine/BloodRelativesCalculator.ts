import { FractionClass } from './fraction';
import type { HeirShareObject, HeirsData } from './types';

export class BloodRelativesCalculator {
  constructor(
    private heirs: HeirsData,
    private steps: Array<{
      step: string;
      description: string;
      code: string;
      data?: unknown;
    }>,
    private specialCases: Array<{ type: string; name: string; description: string }>
  ) {}

  distributeToBloodRelatives(
    shares: HeirShareObject[],
    remainder: FractionClass
  ): { shares: HeirShareObject[]; bloodRelatives: HeirShareObject[] } {
    const bloodRelatives: HeirShareObject[] = [];

    if (remainder.toDecimal() <= 0.0001) {
      return { shares, bloodRelatives };
    }

    const h = this.heirs;

    const classes = [
      [
        { key: 'daughter_son', name: 'ابن البنت', weight: 1 },
        { key: 'daughter_daughter', name: 'بنت البنت', weight: 1 },
      ],
      [{ key: 'sister_children', name: 'أولاد الأخت', weight: 1 }],
      [
        { key: 'maternal_uncle', name: 'الخال', weight: 1 },
        { key: 'maternal_aunt', name: 'الخالة', weight: 1 },
      ],
      [{ key: 'paternal_aunt', name: 'العمة', weight: 1 }],
    ];

    let inheritingClass: Array<{
      key: string;
      name: string;
      count: number;
      weight: number;
    }> = [];

    for (let classIndex = 0; classIndex < classes.length; classIndex++) {
      const currentClass = classes[classIndex];
      const classHeirs = [];

      for (const heir of currentClass) {
        const count = h[heir.key as keyof HeirsData] as number;
        if (count && count > 0) {
          classHeirs.push({ ...heir, count });
        }
      }

      if (classHeirs.length > 0) {
        inheritingClass = classHeirs;
        this.steps.push({
          step: `ذوو الأرحام - الصنف ${classIndex + 1}`,
          description: `الوارثون من الصنف ${classIndex + 1} يرثون الباقي`,
          code: 'blood_relatives_class',
          data: { class: classIndex + 1, heirs: classHeirs.length },
        });
        break;
      }
    }

    if (inheritingClass.length === 0) {
      return { shares, bloodRelatives };
    }

    this.specialCases.push({
      type: 'blood_relatives',
      name: 'ذوو الأرحام',
      description: 'توزيع الباقي على ذوي الأرحام',
    });

    const totalCount = inheritingClass.reduce((sum, h) => sum + h.count, 0);
    inheritingClass.forEach((heir) => {
      const fraction = remainder.multiply(new FractionClass(heir.count, totalCount));
      bloodRelatives.push({
        key: heir.key,
        name: heir.name,
        type: 'ذو رحم',
        fraction: fraction,
        count: heir.count,
        reason: `من ذوي الأرحام - الصنف ${inheritingClass[0] === heir ? 'الوارث' : ''}`,
      });
    });

    return { shares: [...shares, ...bloodRelatives], bloodRelatives };
  }
}
