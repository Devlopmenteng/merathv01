/**
 * Awl (increase) and Radd (return) adjustments
 */
import { FractionClass } from '../fraction';
import type { HeirShareObject } from '../types';

  private applyAwl(
    shares: HeirShareObject[],
    totalFraction: FractionClass,
  ): HeirShareObject[] {
    this.specialCases.push({
      type: "awl",
      name: "الأول",
      description: "تقليل الأنصباء بنسبة متساوية عند زيادة الفروض على التركة",
    });

    return shares.map((share) => ({
      ...share,
      fraction: share.fraction.divide(totalFraction),
    }));
  }

  private applyRadd(
    shares: HeirShareObject[],
    remainder: FractionClass,
  ): HeirShareObject[] {
    if (remainder.toDecimal() <= 0.0001) {
      return shares;
    }

    const eligible = shares.filter(
      (s) =>
        s.key !== "husband" && s.key !== "wife" && !s.type.includes("تعصيب"),
    );

    if (eligible.length === 0) {
      return shares;
    }

    this.specialCases.push({
      type: "radd",
      name: "الرد",
      description: "توزيع الفائض على أصحاب الفروض",
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
          type: share.type + " + رد",
        };
      }
      return share;
    });
  }

  private distributeToBloodRelatives(
    shares: HeirShareObject[],
    remainder: FractionClass,
  ): { shares: HeirShareObject[]; bloodRelatives: HeirShareObject[] } {
    console.log(
      "distributeToBloodRelatives called with remainder:",
      remainder.toString(),
    );
    const bloodRelatives: HeirShareObject[] = [];

    if (remainder.toDecimal() <= 0.0001) {
      return { shares, bloodRelatives };
    }

    const h = this.heirs;

    const classes = [
      [
        { key: "daughter_son", name: "ابن البنت", weight: 1 },
        { key: "daughter_daughter", name: "بنت البنت", weight: 1 },
      ],
      [{ key: "sister_children", name: "أولاد الأخت", weight: 1 }],
      [
        { key: "maternal_uncle", name: "الخال", weight: 1 },
        { key: "maternal_aunt", name: "الخالة", weight: 1 },
      ],
      [{ key: "paternal_aunt", name: "العمة", weight: 1 }],
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
        console.log(
          `Found inheriting class ${classIndex + 1} with heirs:`,
          classHeirs,
        );
        this.steps.push({
          step: `ذوو الأرحام - الصنف ${classIndex + 1}`,
          description: `الوارثون من الصنف ${classIndex + 1} يرثون الباقي`,
          code: "blood_relatives_class",
          data: { class: classIndex + 1, heirs: classHeirs.length },
        });
        break;
      }
    }

    if (inheritingClass.length === 0) {
      console.log("No blood relatives found");
      return { shares, bloodRelatives };
    }

    this.specialCases.push({
      type: "blood_relatives",
      name: "ذوو الأرحام",
      description: "توزيع الباقي على ذوي الأرحام",
    });

    const totalCount = inheritingClass.reduce((sum, h) => sum + h.count, 0);
    console.log("Total count in inheriting class:", totalCount);
    inheritingClass.forEach((heir) => {
      const fraction = remainder.multiply(
        new FractionClass(heir.count, totalCount),
      );
      console.log(`Adding ${heir.name} with fraction ${fraction.toString()}`);
      bloodRelatives.push({
        key: heir.key,
        name: heir.name,
        type: "ذو رحم",
        fraction: fraction,
        count: heir.count,
        reason: `من ذوي الأرحام - الصنف ${inheritingClass[0] === heir ? "الوارث" : ""}`,
      });
    });

    return { shares: [...shares, ...bloodRelatives], bloodRelatives };
  }

