/**
 * Fixed shares (provisions) calculation module
 */
import { FractionClass } from '../fraction';
import type { HeirsData } from '../types';

  private computeFixedShares(heirs: HeirsData): HeirShareObject[] {
    const shares: HeirShareObject[] = [];
    const hasDescendants = this.hasDescendants();
    const isUmariyyah = this.isUmariyyah(heirs);

    if (heirs.husband && heirs.husband > 0) {
      const fraction = hasDescendants
        ? new FractionClass(1, 4)
        : new FractionClass(1, 2);
      shares.push({
        key: "husband",
        name: "الزوج",
        type: "فرض",
        fraction,
        count: 1,
        reason: hasDescendants ? "¼ مع وجود الفرع الوارث" : "½ بدون فرع وارث",
      });
    }

    if (heirs.wife && heirs.wife > 0) {
      const fraction = hasDescendants
        ? new FractionClass(1, 8)
        : new FractionClass(1, 4);
      shares.push({
        key: "wife",
        name: heirs.wife > 1 ? "الزوجات" : "الزوجة",
        type: "فرض",
        fraction,
        count: heirs.wife || 0,
        reason: hasDescendants ? "⅛ مع الفرع الوارث" : "¼ بدون فرع",
      });
    }

    if (heirs.mother && heirs.mother > 0) {
      let fraction: FractionClass;
      let reason: string;

      if (isUmariyyah) {
        fraction = new FractionClass(1, 6);
        reason = "ثلث الباقي (العمرية)";
      } else if (hasDescendants) {
        fraction = new FractionClass(1, 6);
        reason = "⅙ مع وجود فرع";
      } else if (this.getSiblingsCount(heirs) >= 2) {
        fraction = new FractionClass(1, 6);
        reason = "⅙ مع جمع إخوة";
      } else {
        fraction = new FractionClass(1, 3);
        reason = "⅓ بدون فرع أو إخوة";
      }

      shares.push({
        key: "mother",
        name: "الأم",
        type: "فرض",
        fraction,
        count: 1,
        reason,
      });
    }

    if (
      heirs.daughter &&
      heirs.daughter > 0 &&
      (!heirs.son || heirs.son === 0)
    ) {
      const fraction =
        heirs.daughter === 1
          ? new FractionClass(1, 2)
          : new FractionClass(2, 3);
      shares.push({
        key: "daughter",
        name: heirs.daughter > 1 ? "البنات" : "البنت",
        type: "فرض",
        fraction,
        count: heirs.daughter || 0,
        reason: heirs.daughter === 1 ? "½" : "⅔",
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
          heirs.granddaughter === 1
            ? new FractionClass(1, 2)
            : new FractionClass(2, 3);
        shares.push({
          key: "granddaughter",
          name: heirs.granddaughter > 1 ? "بنات الابن" : "بنت الابن",
          type: "فرض",
          fraction,
          count: heirs.granddaughter || 0,
          reason: heirs.granddaughter === 1 ? "½" : "⅔",
        });
      } else if (heirs.daughter === 1) {
        shares.push({
          key: "granddaughter",
          name: heirs.granddaughter > 1 ? "بنات الابن" : "بنت الابن",
          type: "فرض",
          fraction: new FractionClass(1, 6),
          count: heirs.granddaughter || 0,
          reason: "⅙ تكملة للثلثين",
        });
      }
    }

    if (
      (heirs.full_sister || 0) > 0 &&
      (!heirs.full_brother || heirs.full_brother === 0)
    ) {
      if (!hasDescendants && !heirs.father && !heirs.grandfather) {
        const fraction =
          heirs.full_sister === 1
            ? new FractionClass(1, 2)
            : new FractionClass(2, 3);
        shares.push({
          key: "full_sister",
          name:
            (heirs.full_sister || 0) > 1 ? "الأخوات الشقيقات" : "الأخت الشقيقة",
          type: "فرض",
          fraction,
          count: heirs.full_sister || 0,
          reason: heirs.full_sister === 1 ? "½" : "⅔",
        });
      }
    }

    if (
      (heirs.half_sister_paternal || 0) > 0 &&
      (!heirs.full_brother || heirs.full_brother === 0) &&
      (!heirs.half_brother_paternal || heirs.half_brother_paternal === 0)
    ) {
      if (
        !hasDescendants &&
        !heirs.father &&
        !heirs.grandfather &&
        !heirs.full_sister
      ) {
        const fraction =
          heirs.half_sister_paternal === 1
            ? new FractionClass(1, 2)
            : new FractionClass(2, 3);
        shares.push({
          key: "half_sister_paternal",
          name:
            (heirs.half_sister_paternal || 0) > 1 ? "الأخوات لأب" : "الأخت لأب",
          type: "فرض",
          fraction,
          count: heirs.half_sister_paternal || 0,
          reason: heirs.half_sister_paternal === 1 ? "½" : "⅔",
        });
      }
    }

    const maternalCount =
      (heirs.maternal_brother || 0) + (heirs.maternal_sister || 0);
    if (
      maternalCount > 0 &&
      !hasDescendants &&
      !heirs.father &&
      !heirs.grandfather
    ) {
      const fraction =
        maternalCount === 1 ? new FractionClass(1, 6) : new FractionClass(1, 3);
      shares.push({
        key: "maternal_siblings",
        name: "الإخوة لأم",
        type: "فرض",
        fraction: fraction,
        count: maternalCount,
        reason: maternalCount === 1 ? "⅙" : "⅓",
      });
    }

    return shares;
  }

  private isUmariyyah(heirs: HeirsData): boolean {
    const hasSpouse = (heirs.husband || 0) > 0 || (heirs.wife || 0) > 0;
    const hasParents = (heirs.father || 0) > 0 && (heirs.mother || 0) > 0;
    const hasDescendants = this.hasDescendants();

    return hasSpouse && hasParents && !hasDescendants;
  }

  private getMaternalSiblingsCount(): number {
    const h = this.heirs;
    return (h.maternal_brother || 0) + (h.maternal_sister || 0);
  }

  private getFullSiblingsCount(): number {
    return (this.heirs.full_brother || 0) + (this.heirs.full_sister || 0);
  }

