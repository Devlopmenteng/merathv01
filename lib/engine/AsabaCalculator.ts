import { FractionClass } from './fraction';
import type { HeirShareObject, HeirsData, MadhhabRules } from './types';

export class AsabaCalculator {
  private memo: {
    hasDescendants?: boolean;
    hasMaleDescendants?: boolean;
    hasFemaleDescendants?: boolean;
    hasMaleAscendant?: boolean;
    fullSiblingsCount?: number;
    maternalSiblingsCount?: number;
    fullAndPaternalSiblingsCount?: number;
    allSiblingsCount?: number;
  };

  constructor(
    private heirs: HeirsData,
    memo: {
      hasDescendants?: boolean;
      hasMaleDescendants?: boolean;
      hasFemaleDescendants?: boolean;
      hasMaleAscendant?: boolean;
      fullSiblingsCount?: number;
      maternalSiblingsCount?: number;
      fullAndPaternalSiblingsCount?: number;
      allSiblingsCount?: number;
    },
    private steps: Array<{
      step: string;
      description: string;
      code: string;
      data?: unknown;
    }>,
    private getMadhabRule: <K extends keyof MadhhabRules>(key: K) => MadhhabRules[K] | undefined
  ) {
    this.memo = memo;
  }

  private hasMaleDescendants(): boolean {
    if (this.memo.hasMaleDescendants !== undefined) {
      return this.memo.hasMaleDescendants;
    }
    const result = (this.heirs.son || 0) > 0 || (this.heirs.grandson || 0) > 0;
    this.memo.hasMaleDescendants = result;
    return result;
  }

  private hasFemaleDescendants(): boolean {
    if (this.memo.hasFemaleDescendants !== undefined) {
      return this.memo.hasFemaleDescendants;
    }
    const result = (this.heirs.daughter || 0) > 0 || (this.heirs.granddaughter || 0) > 0;
    this.memo.hasFemaleDescendants = result;
    return result;
  }

  private getFullAndPaternalSiblingsCount(): number {
    if (this.memo.fullAndPaternalSiblingsCount !== undefined) {
      return this.memo.fullAndPaternalSiblingsCount;
    }

    const value =
      (this.heirs.full_brother || 0) +
      (this.heirs.full_sister || 0) +
      (this.heirs.half_brother_paternal || 0) +
      (this.heirs.half_sister_paternal || 0);

    this.memo.fullAndPaternalSiblingsCount = value;
    return value;
  }

  computeAsaba(
    _fixedShares: HeirShareObject[],
    remainder: FractionClass,
    heirs: HeirsData
  ): HeirShareObject[] {
    void _fixedShares;
    if (remainder.toDecimal() <= 0.0001) {
      return [];
    }

    const asabaShares: HeirShareObject[] = [];

    if (heirs.son && heirs.son > 0) {
      const totalHeads = heirs.son * 2 + (heirs.daughter || 0);
      const sonWeight = heirs.son * 2;
      const daughterWeight = heirs.daughter || 0;

      if (sonWeight > 0) {
        asabaShares.push({
          key: 'son',
          name: 'الابن',
          type: 'تعصيب',
          fraction: remainder.multiply(new FractionClass(sonWeight, totalHeads)),
          count: heirs.son || 0,
          reason: `${heirs.son} ابن(ة) يرثون الباقي`,
        });
      }

      if (daughterWeight > 0) {
        asabaShares.push({
          key: 'daughter',
          name: 'البنت',
          type: 'تعصيب',
          fraction: remainder.multiply(new FractionClass(daughterWeight, totalHeads)),
          count: heirs.daughter || 0,
          reason: 'البنات مع الابن',
        });
      }

      return asabaShares;
    }

    if (heirs.grandson && heirs.grandson > 0) {
      const totalHeads = heirs.grandson * 2 + (heirs.granddaughter || 0);

      asabaShares.push({
        key: 'grandson',
        name: 'ابن الابن',
        type: 'تعصيب',
        fraction: remainder.multiply(new FractionClass(heirs.grandson * 2, totalHeads)),
        count: heirs.grandson || 0,
        reason: 'ابن الابن يرث الباقي',
      });

      if (heirs.granddaughter && heirs.granddaughter > 0) {
        asabaShares.push({
          key: 'granddaughter',
          name: 'بنت الابن',
          type: 'تعصيب',
          fraction: remainder.multiply(new FractionClass(heirs.granddaughter, totalHeads)),
          count: heirs.granddaughter || 0,
          reason: 'بنات الابن مع الابن',
        });
      }

      return asabaShares;
    }

    if (heirs.father && heirs.father > 0) {
      // If father already has a fixed share, add remainder
      const fatherHasFixed = _fixedShares.some((s) => s.key === 'father');
      if (fatherHasFixed) {
        asabaShares.push({
          key: 'father',
          name: 'الأب',
          type: 'تعصيب',
          fraction: remainder,
          count: 1,
          reason: 'الأب يرث الباقي تعصيباً',
          addToExisting: true,
        });
      } else {
        asabaShares.push({
          key: 'father',
          name: 'الأب',
          type: 'تعصيب',
          fraction: remainder,
          count: 1,
          reason: 'الأب يرث الباقي',
        });
      }
      return asabaShares;
    }

    if (heirs.grandfather && heirs.grandfather > 0 && !heirs.father) {
      const siblingsCount = this.getFullAndPaternalSiblingsCount();
      const shouldShare = this.getMadhabRule('grandfather_with_siblings') === 'musharak';
      const grandfatherHasFixed = _fixedShares.some((s) => s.key === 'grandfather');

      if (this.hasMaleDescendants()) {
        // With male descendants: grandfather gets 1/6 as fard (already in fixed shares)
        return asabaShares;
      }

      if (this.hasFemaleDescendants()) {
        // With female descendants: grandfather gets 1/6 fard + remainder
        if (grandfatherHasFixed) {
          asabaShares.push({
            key: 'grandfather',
            name: 'الجد',
            type: 'تعصيب',
            fraction: remainder,
            count: 1,
            reason: 'الجد يرث الباقي تعصيباً',
            addToExisting: true,
          });
          return asabaShares;
        }
      }

      if (siblingsCount > 0 && shouldShare) {
        const totalHeads =
          2 +
          (heirs.full_brother || 0) * 2 +
          (heirs.full_sister || 0) +
          (heirs.half_brother_paternal || 0) * 2 +
          (heirs.half_sister_paternal || 0);

        // Muqasamah: grandfather's share OF remainder
        const byMuqasamah = remainder.multiply(new FractionClass(2, totalHeads));
        const byThird = remainder.multiply(new FractionClass(1, 3));
        const bySixth = new FractionClass(1, 6);

        let bestOption = byMuqasamah;
        let bestReason = 'muqasamah';
        let bestValue = byMuqasamah.toDecimal();

        const thirdValue = byThird.toDecimal();
        if (thirdValue > bestValue) {
          bestOption = byThird;
          bestReason = 'third';
          bestValue = thirdValue;
        }

        const sixthValue = bySixth.toDecimal();
        if (sixthValue > bestValue) {
          bestOption = bySixth;
          bestReason = 'sixth';
          bestValue = sixthValue;
        }

        this.steps.push({
          step: 'اختيار الأفضل للجد مع الإخوة',
          description: `تم اختيار ${bestReason === 'muqasamah' ? 'المقاسمة' : bestReason === 'third' ? 'الثلث' : 'السدس'} (${bestOption.toString()}) للجد مع ${siblingsCount} من الإخوة`,
          code: 'grandfather_optimal',
          data: {
            siblingsCount: siblingsCount,
            muqasamah: byMuqasamah.toString(),
            third: byThird.toString(),
            sixth: bySixth.toString(),
            chosen: bestOption.toString(),
            reason: bestReason,
          },
        });

        asabaShares.push({
          key: 'grandfather',
          name: 'الجد',
          type: 'تعصيب',
          fraction: bestOption,
          count: 1,
          reason: `${
            bestReason === 'muqasamah'
              ? 'المقاسمة مع الإخوة'
              : bestReason === 'third'
                ? 'ثلث الباقي'
                : 'سدس المال'
          } (الأفضل)`,
          addToExisting: grandfatherHasFixed,
        });

        // Distribute remainder to siblings
        const siblingRemainder = remainder.subtract(bestOption);

        if (siblingRemainder.toDecimal() > 0.0001) {
          const fullBrothers = heirs.full_brother || 0;
          const fullSisters = heirs.full_sister || 0;
          const patBrothers = heirs.half_brother_paternal || 0;
          const patSisters = heirs.half_sister_paternal || 0;
          const siblingHeads = fullBrothers * 2 + fullSisters + patBrothers * 2 + patSisters;

          if (siblingHeads > 0) {
            if (fullBrothers > 0) {
              asabaShares.push({
                key: 'full_brother',
                name: 'الأخ الشقيق',
                type: 'تعصيب',
                fraction: siblingRemainder.multiply(
                  new FractionClass(fullBrothers * 2, siblingHeads)
                ),
                count: fullBrothers,
                reason: 'مع الجد بالمقاسمة',
              });
            }
            if (fullSisters > 0) {
              asabaShares.push({
                key: 'full_sister',
                name: 'الأخت الشقيقة',
                type: 'تعصيب',
                fraction: siblingRemainder.multiply(new FractionClass(fullSisters, siblingHeads)),
                count: fullSisters,
                reason: 'مع الجد بالمقاسمة',
              });
            }
            if (patBrothers > 0) {
              asabaShares.push({
                key: 'half_brother_paternal',
                name: 'الأخ لأب',
                type: 'تعصيب',
                fraction: siblingRemainder.multiply(
                  new FractionClass(patBrothers * 2, siblingHeads)
                ),
                count: patBrothers,
                reason: 'مع الجد بالمقاسمة',
              });
            }
            if (patSisters > 0) {
              asabaShares.push({
                key: 'half_sister_paternal',
                name: 'الأخت لأب',
                type: 'تعصيب',
                fraction: siblingRemainder.multiply(new FractionClass(patSisters, siblingHeads)),
                count: patSisters,
                reason: 'مع الجد بالمقاسمة',
              });
            }
          }
        }

        return asabaShares;
      } else if (siblingsCount > 0 && !shouldShare) {
        asabaShares.push({
          key: 'grandfather',
          name: 'الجد',
          type: 'تعصيب',
          fraction: remainder,
          count: 1,
          reason: 'الجد يرث الباقي (يَحجب الإخوة)',
          addToExisting: grandfatherHasFixed,
        });
        return asabaShares;
      } else {
        asabaShares.push({
          key: 'grandfather',
          name: 'الجد',
          type: 'تعصيب',
          fraction: remainder,
          count: 1,
          reason: 'الجد يرث الباقي',
          addToExisting: grandfatherHasFixed,
        });
        return asabaShares;
      }
    }

    if (heirs.full_brother && heirs.full_brother > 0) {
      const totalHeads = heirs.full_brother * 2 + (heirs.full_sister || 0);

      asabaShares.push({
        key: 'full_brother',
        name: 'الأخ الشقيق',
        type: 'تعصيب',
        fraction: remainder.multiply(new FractionClass(heirs.full_brother * 2, totalHeads)),
        count: heirs.full_brother || 0,
        reason: 'الأخ الشقيق يعصب الأخت',
      });

      if (heirs.full_sister && heirs.full_sister > 0) {
        asabaShares.push({
          key: 'full_sister',
          name: 'الأخت الشقيقة',
          type: 'تعصيب',
          fraction: remainder.multiply(new FractionClass(heirs.full_sister, totalHeads)),
          count: heirs.full_sister || 0,
          reason: 'الأخت الشقيقة مع الأخ',
        });
      }

      return asabaShares;
    }

    if (heirs.half_brother_paternal && heirs.half_brother_paternal > 0) {
      const totalHeads = heirs.half_brother_paternal * 2 + (heirs.half_sister_paternal || 0);

      asabaShares.push({
        key: 'half_brother_paternal',
        name: 'الأخ لأب',
        type: 'تعصيب',
        fraction: remainder.multiply(
          new FractionClass(heirs.half_brother_paternal * 2, totalHeads)
        ),
        count: heirs.half_brother_paternal || 0,
        reason: 'الأخ لأب يعصب الأخت',
      });

      if (heirs.half_sister_paternal && heirs.half_sister_paternal > 0) {
        asabaShares.push({
          key: 'half_sister_paternal',
          name: 'الأخت لأب',
          type: 'تعصيب',
          fraction: remainder.multiply(new FractionClass(heirs.half_sister_paternal, totalHeads)),
          count: heirs.half_sister_paternal || 0,
          reason: 'الأخت لأب مع الأخ',
        });
      }

      return asabaShares;
    }

    // ===== Sister as asaba-with-others (H8) =====
    // Full sister becomes asaba-with-others when there are female descendants
    if (
      (heirs.full_sister || 0) > 0 &&
      !(heirs.full_brother || 0) &&
      this.hasFemaleDescendants() &&
      !(heirs.father || 0)
    ) {
      asabaShares.push({
        key: 'full_sister',
        name: (heirs.full_sister || 0) > 1 ? 'الأخوات الشقيقات' : 'الأخت الشقيقة',
        type: 'تعصيب مع الغير',
        fraction: remainder,
        count: heirs.full_sister || 0,
        reason: 'عاصبة مع الغير لوجود فرع وارث أنثى',
      });
      return asabaShares;
    }

    // Paternal sister as asaba-with-others when female descendants and no full siblings
    if (
      (heirs.half_sister_paternal || 0) > 0 &&
      !(heirs.half_brother_paternal || 0) &&
      !(heirs.full_brother || 0) &&
      !(heirs.full_sister || 0) &&
      this.hasFemaleDescendants() &&
      !(heirs.father || 0)
    ) {
      asabaShares.push({
        key: 'half_sister_paternal',
        name: (heirs.half_sister_paternal || 0) > 1 ? 'الأخوات لأب' : 'الأخت لأب',
        type: 'تعصيب مع الغير',
        fraction: remainder,
        count: heirs.half_sister_paternal || 0,
        reason: 'عاصبة مع الغير لوجود فرع وارث أنثى',
      });
      return asabaShares;
    }

    // ===== Distant asaba hierarchy (M4) - 6 levels =====
    const distantAsabaOrder: Array<{ key: keyof HeirsData; name: string }> = [
      { key: 'nephew_from_brother', name: 'ابن الأخ الشقيق' },
      { key: 'full_nephew' as keyof HeirsData, name: 'ابن الأخ الشقيق' },
      { key: 'paternal_nephew' as keyof HeirsData, name: 'ابن الأخ لأب' },
      { key: 'uncle_paternal', name: 'العم الشقيق' },
      { key: 'full_uncle' as keyof HeirsData, name: 'العم الشقيق' },
      { key: 'paternal_uncle' as keyof HeirsData, name: 'العم لأب' },
      { key: 'full_cousin' as keyof HeirsData, name: 'ابن العم الشقيق' },
      { key: 'paternal_cousin' as keyof HeirsData, name: 'ابن العم لأب' },
    ];

    for (const { key, name } of distantAsabaOrder) {
      const count = (heirs[key] as number) || 0;
      if (count > 0) {
        asabaShares.push({
          key: key as string,
          name,
          type: 'تعصيب',
          fraction: remainder,
          count,
          reason: `${name} يرث الباقي`,
        });
        return asabaShares;
      }
    }

    return asabaShares;
  }
}
