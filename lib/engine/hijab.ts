import type { HeirEntry, HeirType, MadhhabRules } from './types';

export interface BlockedHeir {
  heir: string;
  by: string;
  reason: string;
}

export class HijabSystem {
  constructor() {
    // Preserved constructor shape for backward compatibility.
  }

  /**
   * Apply all 12 hijab rules matching the HTML reference engine.
   * Rules are madhab-aware via the optional `rules` parameter.
   */
  applyHijab(
    heirs: Record<string, number | undefined>,
    rules?: MadhhabRules
  ): {
    heirs: Record<string, number | undefined>;
    blocked: BlockedHeir[];
  } {
    const h = { ...heirs };
    const blocked: BlockedHeir[] = [];

    const val = (key: string): number => (h[key] as number) || 0;
    const block = (heir: string, by: string, reason: string) => {
      if (val(heir) > 0) {
        blocked.push({ heir, by, reason });
        h[heir] = 0;
      }
    };

    // 1. Father blocks grandfather
    if (val('father') > 0) {
      block('grandfather', 'father', 'الجد محجوب بالأب حجب حرمان');
    }

    // 2. Mother blocks both grandmothers
    if (val('mother') > 0) {
      block('grandmother_mother', 'mother', 'الجدة لأم محجوبة بالأم');
      block('grandmother_father', 'mother', 'الجدة لأب محجوبة بالأم');
    }

    // 3. Father blocks grandmother_father
    if (val('father') > 0) {
      block('grandmother_father', 'father', 'الجدة لأب محجوبة بالأب');
    }

    // 4. Son blocks grandson & granddaughter
    if (val('son') > 0) {
      block('grandson', 'son', 'ابن الابن محجوب بالابن الأقرب');
      block('granddaughter', 'son', 'بنت الابن محجوبة بالابن');
    }

    // 5. 2+ daughters block granddaughter (unless grandson exists as mu'asib)
    if (val('daughter') >= 2 && val('granddaughter') > 0 && val('grandson') === 0) {
      block(
        'granddaughter',
        'daughter',
        'بنت الابن محجوبة ببنتين فأكثر لاستيفاء الثلثين ولا معصب لها'
      );
    }

    // 6. Male descendants or father block full & paternal siblings
    const blockedByMaleFuruOrFather = val('son') > 0 || val('grandson') > 0 || val('father') > 0;
    if (blockedByMaleFuruOrFather) {
      const blocker = val('father') > 0 ? 'الأب' : 'الابن/ابن الابن';
      const siblingsToBlock = [
        'full_brother',
        'full_sister',
        'paternal_brother',
        'paternal_sister',
        'half_brother_paternal',
        'half_sister_paternal',
      ];
      for (const heir of siblingsToBlock) {
        block(heir, blocker, `محجوب بـ${blocker}`);
      }
    }

    // 7. Grandfather blocks siblings in Hanafi/Shafi'i (grandfatherWithSiblings === 'hijab')
    if (val('grandfather') > 0 && rules?.grandfather_with_siblings === 'hijab') {
      const siblingsToBlock = [
        'full_brother',
        'full_sister',
        'paternal_brother',
        'paternal_sister',
        'half_brother_paternal',
        'half_sister_paternal',
      ];
      for (const heir of siblingsToBlock) {
        block(heir, 'grandfather', `محجوب بالجد`);
      }
    }

    // 8. Maternal siblings blocked by any descendant or male ascendant
    const hasDescendants =
      val('son') > 0 || val('daughter') > 0 || val('grandson') > 0 || val('granddaughter') > 0;
    const hasMaleAscendant = val('father') > 0 || val('grandfather') > 0;
    if (hasDescendants || hasMaleAscendant) {
      const blocker = hasDescendants ? 'الفرع الوارث' : 'الأصل الذكر';
      block('maternal_brother', blocker, `محجوب بـ${blocker}`);
      block('maternal_sister', blocker, `محجوب بـ${blocker}`);
    }

    // 9. Full brother blocks paternal brother
    if (val('full_brother') > 0) {
      block('paternal_brother', 'full_brother', 'الأخ لأب محجوب بالأخ الشقيق لقوة القرابة');
      block('half_brother_paternal', 'full_brother', 'الأخ لأب محجوب بالأخ الشقيق لقوة القرابة');
    }

    // 10. Full sister as asaba-with-others blocks paternal siblings
    //     (handled in computeAsaba in calculator — noted here for documentation)

    // 11. 2+ full sisters block paternal sister (unless paternal brother exists as mu'asib)
    if (
      val('full_sister') >= 2 &&
      val('paternal_sister') > 0 &&
      val('paternal_brother') === 0 &&
      val('half_brother_paternal') === 0
    ) {
      // Exception: if full sister became asaba-with-others (female descendants), don't block
      const hasFemaleDesc = val('daughter') > 0 || val('granddaughter') > 0;
      if (!hasFemaleDesc) {
        block(
          'paternal_sister',
          'full_sister',
          'الأخت لأب محجوبة بأختين شقيقتين فأكثر لاستيفاء الثلثين ولا معصب لها'
        );
        block(
          'half_sister_paternal',
          'full_sister',
          'الأخت لأب محجوبة بأختين شقيقتين فأكثر لاستيفاء الثلثين ولا معصب لها'
        );
      }
    }

    // 12. Distant asaba hierarchy: closer blocks more distant
    const hasCloserAsaba =
      val('full_brother') > 0 ||
      val('paternal_brother') > 0 ||
      val('half_brother_paternal') > 0 ||
      (val('grandfather') > 0 && rules?.grandfather_with_siblings === 'musharak');

    if (hasCloserAsaba || val('father') > 0 || val('son') > 0 || val('grandson') > 0) {
      const distantAsaba = [
        'full_nephew',
        'paternal_nephew',
        'full_uncle',
        'paternal_uncle',
        'full_cousin',
        'paternal_cousin',
      ];
      for (const heir of distantAsaba) {
        block(heir, 'عاصب أقرب', `محجوب بعاصب أقرب منه`);
      }
    }

    // Within distant asaba: ordering by priority
    if (val('full_nephew') > 0) {
      for (const heir of [
        'paternal_nephew',
        'full_uncle',
        'paternal_uncle',
        'full_cousin',
        'paternal_cousin',
      ]) {
        block(heir, 'full_nephew', 'محجوب بابن الأخ الشقيق');
      }
    } else if (val('paternal_nephew') > 0) {
      for (const heir of ['full_uncle', 'paternal_uncle', 'full_cousin', 'paternal_cousin']) {
        block(heir, 'paternal_nephew', 'محجوب بابن الأخ لأب');
      }
    } else if (val('full_uncle') > 0) {
      for (const heir of ['paternal_uncle', 'full_cousin', 'paternal_cousin']) {
        block(heir, 'full_uncle', 'محجوب بالعم الشقيق');
      }
    } else if (val('paternal_uncle') > 0) {
      for (const heir of ['full_cousin', 'paternal_cousin']) {
        block(heir, 'paternal_uncle', 'محجوب بالعم لأب');
      }
    } else if (val('full_cousin') > 0) {
      block('paternal_cousin', 'full_cousin', 'محجوب بابن العم الشقيق');
    }

    return { heirs: h, blocked };
  }

  hasDescendants(heirs: Record<string, number>): boolean {
    return !!(heirs.son || heirs.daughter || heirs.grandson || heirs.granddaughter);
  }

  countMales(heirs: Record<string, number>): number {
    const maleHeirs = [
      'son',
      'father',
      'full_brother',
      'half_brother_paternal',
      'paternal_grandfather',
      'grandfather',
      'grandson',
    ];
    return maleHeirs.reduce((sum, key) => sum + (heirs[key] || 0), 0);
  }

  countFemales(heirs: Record<string, number>): number {
    const femaleHeirs = [
      'daughter',
      'mother',
      'full_sister',
      'half_sister_paternal',
      'maternal_grandmother',
      'granddaughter',
    ];
    return femaleHeirs.reduce((sum, key) => sum + (heirs[key] || 0), 0);
  }

  checkInheritanceRights(heirType: string): boolean {
    const validTypes = [
      'husband',
      'wife',
      'son',
      'daughter',
      'father',
      'mother',
      'full_brother',
      'full_sister',
      'paternal_grandfather',
      'grandfather',
      'maternal_grandmother',
      'grandson',
      'granddaughter',
      'half_brother_paternal',
      'half_sister_paternal',
    ];
    return validTypes.includes(heirType);
  }
}

export function applyHijab(heirs: HeirEntry[], rules?: MadhhabRules) {
  const system = new HijabSystem();
  const heirsRecord: Record<string, number | undefined> = {};
  heirs.forEach((h: HeirEntry) => {
    if (h.count > 0) heirsRecord[h.type] = h.count;
  });
  const { heirs: resultHeirs } = system.applyHijab(heirsRecord, rules);
  return Object.entries(resultHeirs)
    .filter(([_, count]) => count !== undefined && count > 0)
    .map(([type, count]) => ({ type: type as HeirType, count }));
}
