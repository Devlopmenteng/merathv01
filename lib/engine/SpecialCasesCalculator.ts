import { FractionClass } from './fraction';
import type { HeirShareObject, HeirsData, MadhhabRules, EngineState } from './types';

export class SpecialCasesCalculator {
  private memo: {
    hasDescendants?: boolean;
    hasMaleDescendants?: boolean;
    hasFemaleDescendants?: boolean;
    hasMaleAscendant?: boolean;
    fullSiblingsCount?: number;
    maternalSiblingsCount?: number;
    fullAndPaternalSiblingsCount?: number;
    allSiblingsCount?: number;
    isMusharraka?: boolean;
    isAkdariyya?: boolean;
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
      isMusharraka?: boolean;
      isAkdariyya?: boolean;
    },
    private state: EngineState,
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

  private getMaternalSiblingsCount(): number {
    if (this.memo.maternalSiblingsCount !== undefined) {
      return this.memo.maternalSiblingsCount;
    }

    const h = this.heirs;
    const value = (h.maternal_brother || 0) + (h.maternal_sister || 0);
    this.memo.maternalSiblingsCount = value;
    return value;
  }

  private getFullSiblingsCount(): number {
    if (this.memo.fullSiblingsCount !== undefined) {
      return this.memo.fullSiblingsCount;
    }

    const value = (this.heirs.full_brother || 0) + (this.heirs.full_sister || 0);
    this.memo.fullSiblingsCount = value;
    return value;
  }

  isMusharraka(): boolean {
    if (this.memo.isMusharraka !== undefined) {
      return this.memo.isMusharraka;
    }

    // Musharraka depends on madhab config flag
    const musharrakaEnabled = this.getMadhabRule('musharraka_enabled');
    if (!musharrakaEnabled) {
      this.memo.isMusharraka = false;
      return false;
    }

    const h = this.heirs;
    const hasHusband = (h.husband || 0) > 0;
    const hasMother = (h.mother || 0) > 0;
    const hasGrandmother = (h.grandmother_mother || 0) > 0;
    const hasMotherOrGrandmother = hasMother || hasGrandmother;
    const maternalCount = this.getMaternalSiblingsCount();
    const fullSiblingsExist = this.getFullSiblingsCount() > 0;
    const noDescendants = !this.hasDescendants();
    const noFather = (h.father || 0) === 0;
    const noGrandfather = (h.grandfather || 0) === 0;

    const result =
      hasHusband &&
      hasMotherOrGrandmother &&
      maternalCount >= 2 &&
      fullSiblingsExist &&
      noDescendants &&
      noFather &&
      noGrandfather;

    this.memo.isMusharraka = result;
    return result;
  }

  computeMusharraka(): HeirShareObject[] {
    const shares: HeirShareObject[] = [];
    const h = this.heirs;

    shares.push({
      key: 'husband',
      name: 'الزوج',
      type: 'فرض',
      fraction: new FractionClass(1, 2),
      count: 1,
      reason: '½ لعدم وجود فرع وارث',
    });

    if (h.mother && h.mother > 0) {
      shares.push({
        key: 'mother',
        name: 'الأم',
        type: 'فرض',
        fraction: new FractionClass(1, 6),
        count: 1,
        reason: '⅙ لوجود جمع من الإخوة',
      });
    } else if (h.grandmother_mother && h.grandmother_mother > 0) {
      shares.push({
        key: 'grandmother_mother',
        name: 'الجدة لأم',
        type: 'فرض',
        fraction: new FractionClass(1, 6),
        count: 1,
        reason: '⅙',
      });
    }

    const maternalCount = (h.maternal_brother || 0) + (h.maternal_sister || 0);
    const fullCount = (h.full_brother || 0) + (h.full_sister || 0);
    const totalSiblings = maternalCount + fullCount;

    shares.push({
      key: 'shared_siblings',
      name: 'الإخوة لأم والأشقاء',
      type: 'فرض',
      fraction: new FractionClass(1, 3),
      count: totalSiblings,
      reason: '⅓ يشتركون فيه بالتساوي (المسألة المشتركة)',
    });

    this.steps.push({
      step: 'المسألة المشتركة (الحمارية)',
      description: `تم تطبيق المشتركة: الزوج (½), الأم (⅙), الإخوة (⅓) يشتركون بالتساوي`,
      code: 'musharraka',
      data: {
        husband: '1/2',
        mother: '1/6',
        siblingsFraction: '1/3',
        maternalCount: maternalCount,
        fullCount: fullCount,
        totalSiblings: totalSiblings,
      },
    });

    return shares;
  }

  isAkdariyya(): boolean {
    if (this.memo.isAkdariyya !== undefined) {
      return this.memo.isAkdariyya;
    }

    const akdariyyaEnabled = this.getMadhabRule('akdariyya_enabled');
    if (!akdariyyaEnabled) {
      this.memo.isAkdariyya = false;
      return false;
    }

    const h = this.heirs;
    const result =
      (h.husband || 0) > 0 &&
      (h.mother || 0) > 0 &&
      (h.grandfather || 0) > 0 &&
      (h.full_sister || 0) > 0 &&
      !this.hasDescendants() &&
      (h.father || 0) === 0 &&
      (h.full_brother || 0) === 0;

    this.memo.isAkdariyya = result;
    return result;
  }

  computeAkdariyya(): HeirShareObject[] {
    const shares: HeirShareObject[] = [];

    shares.push({
      key: 'husband',
      name: 'الزوج',
      type: 'فرض',
      fraction: new FractionClass(9, 27),
      count: 1,
      reason: '½ = 9/27',
    });

    shares.push({
      key: 'mother',
      name: 'الأم',
      type: 'فرض',
      fraction: new FractionClass(6, 27),
      count: 1,
      reason: '⅓ = 6/27',
    });

    shares.push({
      key: 'grandfather',
      name: 'الجد',
      type: 'فرض + تعصيب',
      fraction: new FractionClass(8, 27),
      count: 1,
      reason: '⅙ ثم المقاسمة مع الأخت',
    });

    shares.push({
      key: 'full_sister',
      name: 'الأخت الشقيقة',
      type: 'فرض + تعصيب',
      fraction: new FractionClass(4, 27),
      count: 1,
      reason: '½ ثم المقاسمة مع الجد',
    });

    this.state.awlApplied = true;

    this.steps.push({
      step: 'الأكدرية (الغراء)',
      description: `تم تطبيق الأكدرية: الزوج (9/27), الأم (6/27), الجد (8/27), الأخت (4/27)`,
      code: 'akdariyya',
      data: {
        husband: '9/27',
        mother: '6/27',
        grandfather: '8/27',
        full_sister: '4/27',
        originalBase: 6,
        finalBase: 27,
      },
    });

    return shares;
  }
}
