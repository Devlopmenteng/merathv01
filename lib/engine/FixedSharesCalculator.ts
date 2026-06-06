import { FractionClass } from './fraction';
import type { HeirShareObject, HeirsData, MadhhabRules } from './types';

export class FixedSharesCalculator {
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
    private getMadhabRule: <K extends keyof MadhhabRules>(key: K) => MadhhabRules[K] | undefined
  ) {
    this.memo = memo;
  }

  private hasDescendants(): boolean {
    if (this.memo.hasDescendants !== undefined) {
      return this.memo.hasDescendants;
    }

    const result =
      (this.heirs.son || 0) > 0 ||
      (this.heirs.daughter || 0) > 0 ||
      (this.heirs.grandson || 0) > 0 ||
      (this.heirs.granddaughter || 0) > 0;

    this.memo.hasDescendants = result;
    return result;
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

  private getSiblingsCount(heirs: HeirsData): number {
    return (
      (heirs.full_brother || 0) +
      (heirs.full_sister || 0) +
      (heirs.half_brother_paternal || 0) +
      (heirs.half_sister_paternal || 0) +
      (heirs.half_brother_maternal || 0) +
      (heirs.half_sister_maternal || 0)
    );
  }

  private getAllSiblingsCount(): number {
    if (this.memo.allSiblingsCount !== undefined) {
      return this.memo.allSiblingsCount;
    }
    const value = this.getSiblingsCount(this.heirs);
    this.memo.allSiblingsCount = value;
    return value;
  }

  private isUmariyyah(heirs: HeirsData): boolean {
    const hasSpouse = (heirs.husband || 0) > 0 || (heirs.wife || 0) > 0;
    const hasParents = (heirs.father || 0) > 0 && (heirs.mother || 0) > 0;
    const noDescendants = !this.hasDescendants();
    const noSiblings = this.getAllSiblingsCount() === 0;
    const noGrandfather = (heirs.grandfather || 0) === 0;

    return hasSpouse && hasParents && noDescendants && noSiblings && noGrandfather;
  }

  computeFixedShares(heirs: HeirsData): HeirShareObject[] {
    const shares: HeirShareObject[] = [];
    const hasDescendants = this.hasDescendants();
    const isUmariyyah = this.isUmariyyah(heirs);

    if (heirs.husband && heirs.husband > 0) {
      const fraction = hasDescendants ? new FractionClass(1, 4) : new FractionClass(1, 2);
      shares.push({
        key: 'husband',
        name: 'الزوج',
        type: 'فرض',
        fraction,
        count: 1,
        reason: hasDescendants ? '¼ مع وجود الفرع الوارث' : '½ بدون فرع وارث',
      });
    }

    if (heirs.wife && heirs.wife > 0) {
      const fraction = hasDescendants ? new FractionClass(1, 8) : new FractionClass(1, 4);
      shares.push({
        key: 'wife',
        name: heirs.wife > 1 ? 'الزوجات' : 'الزوجة',
        type: 'فرض',
        fraction,
        count: heirs.wife || 0,
        reason: hasDescendants ? '⅛ مع الفرع الوارث' : '¼ بدون فرع',
      });
    }

    if (heirs.mother && heirs.mother > 0) {
      let fraction: FractionClass;
      let reason: string;

      if (isUmariyyah) {
        if ((heirs.husband || 0) > 0) {
          // Umariyyah 1: husband + father + mother → mother gets 1/6 (third of remainder after 1/2)
          fraction = new FractionClass(1, 6);
          reason = 'ثلث الباقي بعد نصيب الزوج (العُمَريَّة الأولى)';
        } else {
          // Umariyyah 2: wife + father + mother → mother gets 1/4 (third of remainder after 1/4)
          fraction = new FractionClass(1, 4);
          reason = 'ثلث الباقي بعد نصيب الزوجة (العُمَريَّة الثانية)';
        }
      } else if (hasDescendants) {
        fraction = new FractionClass(1, 6);
        reason = '⅙ مع وجود فرع';
      } else if (this.getSiblingsCount(this.heirs) >= 2) {
        // Use original heirs (not post-hijab) because blocked siblings
        // still reduce mother's share (حجب نقصان)
        fraction = new FractionClass(1, 6);
        reason = '⅙ مع جمع إخوة';
      } else {
        fraction = new FractionClass(1, 3);
        reason = '⅓ بدون فرع أو إخوة';
      }

      shares.push({
        key: 'mother',
        name: 'الأم',
        type: 'فرض',
        fraction,
        count: 1,
        reason,
      });
    }

    // ===== الأب =====
    if ((heirs.father || 0) > 0) {
      if (this.hasMaleDescendants()) {
        // With male descendants: 1/6 fard only
        shares.push({
          key: 'father',
          name: 'الأب',
          type: 'فرض',
          fraction: new FractionClass(1, 6),
          count: 1,
          reason: '⅙ فرضاً لوجود الفرع الوارث الذكر',
        });
      } else if (this.hasFemaleDescendants()) {
        // With female-only descendants: 1/6 fard + remainder as ta'sib
        shares.push({
          key: 'father',
          name: 'الأب',
          type: 'فرض + تعصيب',
          fraction: new FractionClass(1, 6),
          count: 1,
          reason: '⅙ فرضاً + الباقي تعصيباً لوجود فرع وارث أنثى فقط',
        });
      }
      // Without descendants: pure asaba (handled in computeAsaba)
    }

    // ===== الجد =====
    if ((heirs.grandfather || 0) > 0 && (heirs.father || 0) === 0) {
      const siblingsExist = this.getFullAndPaternalSiblingsCount() > 0;
      const grandfatherShares = this.getMadhabRule('grandfather_with_siblings') === 'musharak';

      if (this.hasMaleDescendants()) {
        shares.push({
          key: 'grandfather',
          name: 'الجد',
          type: 'فرض',
          fraction: new FractionClass(1, 6),
          count: 1,
          reason: '⅙ فرضاً لوجود الفرع الوارث الذكر',
        });
      } else if (this.hasFemaleDescendants()) {
        shares.push({
          key: 'grandfather',
          name: 'الجد',
          type: 'فرض + تعصيب',
          fraction: new FractionClass(1, 6),
          count: 1,
          reason: '⅙ فرضاً + الباقي تعصيباً لوجود فرع وارث أنثى فقط',
        });
      } else if (siblingsExist && grandfatherShares) {
        // Grandfather with siblings in Maliki/Hanbali: handled in computeAsaba
      }
      // Without descendants and without siblings: pure asaba (handled in computeAsaba)
    }

    // ===== الجدات =====
    const grandmothersCount = (heirs.grandmother_mother || 0) + (heirs.grandmother_father || 0);
    if (grandmothersCount > 0) {
      const names = [];
      if ((heirs.grandmother_mother || 0) > 0) names.push('الجدة لأم');
      if ((heirs.grandmother_father || 0) > 0) names.push('الجدة لأب');

      shares.push({
        key: 'grandmothers',
        name: grandmothersCount > 1 ? 'الجدات' : names[0],
        type: 'فرض',
        fraction: new FractionClass(1, 6),
        count: grandmothersCount,
        reason: grandmothersCount > 1 ? '⅙ يشتركن فيه' : '⅙',
      });
    }

    // ===== البنات =====
    if (heirs.daughter && heirs.daughter > 0 && (!heirs.son || heirs.son === 0)) {
      const fraction = heirs.daughter === 1 ? new FractionClass(1, 2) : new FractionClass(2, 3);
      shares.push({
        key: 'daughter',
        name: heirs.daughter > 1 ? 'البنات' : 'البنت',
        type: 'فرض',
        fraction,
        count: heirs.daughter || 0,
        reason: heirs.daughter === 1 ? '½' : '⅔',
      });
    }

    if (
      heirs.granddaughter &&
      heirs.granddaughter > 0 &&
      (!heirs.grandson || heirs.grandson === 0) &&
      (!heirs.son || heirs.son === 0)
    ) {
      if (heirs.daughter === 0) {
        const fraction =
          heirs.granddaughter === 1 ? new FractionClass(1, 2) : new FractionClass(2, 3);
        shares.push({
          key: 'granddaughter',
          name: heirs.granddaughter > 1 ? 'بنات الابن' : 'بنت الابن',
          type: 'فرض',
          fraction,
          count: heirs.granddaughter || 0,
          reason: heirs.granddaughter === 1 ? '½' : '⅔',
        });
      } else if (heirs.daughter === 1) {
        shares.push({
          key: 'granddaughter',
          name: heirs.granddaughter > 1 ? 'بنات الابن' : 'بنت الابن',
          type: 'فرض',
          fraction: new FractionClass(1, 6),
          count: heirs.granddaughter || 0,
          reason: '⅙ تكملة للثلثين',
        });
      }
    }

    // Full sister gets fard only if NOT acting as asaba-with-others (with female descendants)
    if ((heirs.full_sister || 0) > 0 && (!heirs.full_brother || heirs.full_brother === 0)) {
      if (!hasDescendants && !heirs.father && !heirs.grandfather) {
        // No descendants, no father, no grandfather → pure fard
        const fraction =
          heirs.full_sister === 1 ? new FractionClass(1, 2) : new FractionClass(2, 3);
        shares.push({
          key: 'full_sister',
          name: (heirs.full_sister || 0) > 1 ? 'الأخوات الشقيقات' : 'الأخت الشقيقة',
          type: 'فرض',
          fraction,
          count: heirs.full_sister || 0,
          reason: heirs.full_sister === 1 ? '½' : '⅔',
        });
      }
      // If female descendants exist, sister becomes asaba-with-others (handled in computeAsaba)
    }

    if (
      (heirs.half_sister_paternal || 0) > 0 &&
      (!heirs.full_brother || heirs.full_brother === 0) &&
      (!heirs.half_brother_paternal || heirs.half_brother_paternal === 0)
    ) {
      if (!hasDescendants && !(heirs.father || 0) && !(heirs.grandfather || 0)) {
        if (!(heirs.full_sister || 0)) {
          // No full sister → paternal sister gets her own fard
          const fraction =
            heirs.half_sister_paternal === 1 ? new FractionClass(1, 2) : new FractionClass(2, 3);
          shares.push({
            key: 'half_sister_paternal',
            name: (heirs.half_sister_paternal || 0) > 1 ? 'الأخوات لأب' : 'الأخت لأب',
            type: 'فرض',
            fraction,
            count: heirs.half_sister_paternal || 0,
            reason: heirs.half_sister_paternal === 1 ? '½' : '⅔',
          });
        } else if ((heirs.full_sister || 0) === 1) {
          // Takmilah: 1/6 to complete 2/3 with the one full sister
          shares.push({
            key: 'half_sister_paternal',
            name: (heirs.half_sister_paternal || 0) > 1 ? 'الأخوات لأب' : 'الأخت لأب',
            type: 'فرض',
            fraction: new FractionClass(1, 6),
            count: heirs.half_sister_paternal || 0,
            reason: '⅙ تكملة للثلثين مع الأخت الشقيقة',
          });
        }
        // 2+ full sisters: paternal sister blocked (handled in hijab)
      }
    }

    const maternalCount = (heirs.maternal_brother || 0) + (heirs.maternal_sister || 0);
    if (maternalCount > 0 && !hasDescendants && !heirs.father && !heirs.grandfather) {
      const fraction = maternalCount === 1 ? new FractionClass(1, 6) : new FractionClass(1, 3);
      shares.push({
        key: 'maternal_siblings',
        name: 'الإخوة لأم',
        type: 'فرض',
        fraction: fraction,
        count: maternalCount,
        reason: maternalCount === 1 ? '⅙' : '⅓',
      });
    }

    return shares;
  }
}
