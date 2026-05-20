/**
 * Special cases: Musharraka, Akdariyya
 */
import { FractionClass } from '../fraction';
import type { HeirsData } from '../types';

  private isMusharraka(): boolean {
    // Musharraka is only recognized in Shafii madhab (and maybe others, but definitely not Maliki)
    if (this.madhab !== "shafii") {
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
    console.log("isMusharraka check:", {
      hasHusband,
      hasMother,
      hasGrandmother,
      hasMotherOrGrandmother,
      maternalCount,
      fullSiblingsExist,
      noDescendants,
      noFather,
      noGrandfather,
      result:
        hasHusband &&
        hasMotherOrGrandmother &&
        maternalCount >= 2 &&
        fullSiblingsExist &&
        noDescendants &&
        noFather &&
        noGrandfather,
    });

    return (
      hasHusband &&
      hasMotherOrGrandmother &&
      maternalCount >= 2 &&
      fullSiblingsExist &&
      noDescendants &&
      noFather &&
      noGrandfather
    );
  }

  private computeMusharraka(): HeirShareObject[] {
    const shares: HeirShareObject[] = [];
    const h = this.heirs;

    shares.push({
      key: "husband",
      name: "الزوج",
      type: "فرض",
      fraction: new FractionClass(1, 2),
      count: 1,
      reason: "½ لعدم وجود فرع وارث",
    });

    if (h.mother && h.mother > 0) {
      shares.push({
        key: "mother",
        name: "الأم",
        type: "فرض",
        fraction: new FractionClass(1, 6),
        count: 1,
        reason: "⅙ لوجود جمع من الإخوة",
      });
    } else if (h.grandmother_mother && h.grandmother_mother > 0) {
      shares.push({
        key: "grandmother_mother",
        name: "الجدة لأم",
        type: "فرض",
        fraction: new FractionClass(1, 6),
        count: 1,
        reason: "⅙",
      });
    }

    const maternalCount = (h.maternal_brother || 0) + (h.maternal_sister || 0);
    const fullCount = (h.full_brother || 0) + (h.full_sister || 0);
    const totalSiblings = maternalCount + fullCount;

    shares.push({
      key: "shared_siblings",
      name: "الإخوة لأم والأشقاء",
      type: "فرض",
      fraction: new FractionClass(1, 3),
      count: totalSiblings,
      reason: "⅓ يشتركون فيه بالتساوي (المسألة المشتركة)",
    });

    this.steps.push({
      step: "المسألة المشتركة (الحمارية)",
      description: `تم تطبيق المشتركة: الزوج (½), الأم (⅙), الإخوة (⅓)`,
      code: "musharraka",
      data: { shares: shares.length },
    });

    return shares;
  }

  private isAkdariyya(): boolean {
    const h = this.heirs;
    const result =
      (h.husband || 0) > 0 &&
      (h.mother || 0) > 0 &&
      (h.grandfather || 0) > 0 &&
      (h.full_sister || 0) === 1 &&
      !this.hasDescendants() &&
      (h.father || 0) === 0 &&
      (h.full_brother || 0) === 0;
    console.log("isAkdariyya:", result, {
      husband: h.husband || 0,
      mother: h.mother || 0,
      grandfather: h.grandfather || 0,
      full_sister: h.full_sister || 0,
      hasDescendants: this.hasDescendants(),
      father: h.father || 0,
      full_brother: h.full_brother || 0,
    });
    return result;
  }

  private computeAkdariyya(): HeirShareObject[] {
    console.log("computeAkdariyya called");
    const shares: HeirShareObject[] = [];

    shares.push({
      key: "husband",
      name: "الزوج",
      type: "فرض",
      fraction: new FractionClass(9, 27),
      count: 1,
      reason: "½ = 9/27",
    });

    shares.push({
      key: "mother",
      name: "الأم",
      type: "فرض",
      fraction: new FractionClass(6, 27),
      count: 1,
      reason: "⅓ = 6/27",
    });

    shares.push({
      key: "grandfather",
      name: "الجد",
      type: "فرض + تعصيب",
      fraction: new FractionClass(8, 27),
      count: 1,
      reason: "⅙ ثم المقاسمة مع الأخت",
    });

    shares.push({
      key: "full_sister",
      name: "الأخت الشقيقة",
      type: "فرض + تعصيب",
      fraction: new FractionClass(4, 27),
      count: 1,
      reason: "½ ثم المقاسمة مع الجد",
    });

    this.state.awlApplied = true;

    this.steps.push({
      step: "الأكدرية (الغراء)",
      description: `تم تطبيق الأكدرية: الزوج (9/27), الأم (6/27), الجد (8/27), الأخت (4/27)`,
      code: "akdariyya",
      data: { shares: shares.length },
    });

    return shares;
  }

