/**
 * Enhanced Inheritance Calculation Engine - Complete Islamic Law Implementation
 * Full implementation of all features from original Merath_Cluade_Pro7.html
 *
 * تحتوي على جميع قواعد الفروض والعصبات والحالات الخاصة الكاملة
 * شاملة لجميع المذاهب الأربعة (حنفي، مالكي، شافعي، حنبلي)
 *
 * FIXES IMPLEMENTED:
 * - C1: Musharraka (المشتركة/الحمارية) special case
 * - C2: Akdariyya (الأكدرية/الغراء) special case
 * - C3: Grandfather with siblings optimal selection (muqasamah vs third vs sixth)
 * - C4: Blood relatives priority system by class
 */

import { FractionClass } from './fraction';
import { FIQH_DATABASE } from './constants';
import type {
  EstateData,
  EstateInput,
  HeirsData,
  MadhhabType,
  CalculationResult,
  HeirShare,
  MadhhabConfig,
  MadhhabRules,
} from './types';
import { HijabSystem } from './hijab';

interface HeirShareObject {
  key: string;
  name: string;
  type: string;
  fraction: FractionClass;
  count: number;
  reason: string;
  addToExisting?: boolean;
}

interface EngineState {
  blockedHeirs: string[];
  hijabTypes: string[];
  awlApplied: boolean;
  raddApplied: boolean;
  bloodRelativesApplied: boolean;
  confidenceFactors: string[];
  specialCases: Array<{ type: string; name: string; description: string }>;
}

export class EnhancedInheritanceCalculationEngine {
  private madhab: MadhhabType;
  private estate: EstateData;
  private heirs: HeirsData;
  private hijabSystem: HijabSystem;
  private steps: Array<{
    step: string;
    description: string;
    code: string;
    data?: unknown;
  }> = [];
  private specialCases: Array<{
    type: string;
    name: string;
    description: string;
  }> = [];
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
  } = {};

  private static readonly madhabConfigCache = new Map<MadhhabType, MadhhabConfig | null>();
  private static readonly madhabRuleCache = new Map<
    string,
    MadhhabRules[keyof MadhhabRules] | undefined
  >();

  private state: EngineState = {
    blockedHeirs: [],
    hijabTypes: [],
    awlApplied: false,
    raddApplied: false,
    bloodRelativesApplied: false,
    confidenceFactors: [],
    specialCases: [],
  };

  constructor(madhab: MadhhabType, estate: EstateData, heirs: HeirsData) {
    this.madhab = madhab;
    this.estate = {
      total: estate.total || 0,
      funeral: estate.funeral || 0,
      debts: estate.debts || 0,
      will: estate.will || 0,
    };
    this.heirs = this.normalizeHeirs(heirs);
    this.hijabSystem = new HijabSystem();
  }

  private addStep(title: string, description: string, details: unknown, type: string) {
    this.steps.push({
      step: title,
      description: description,
      code: type,
      data: details,
    });
  }

  // ========== Rich step detail methods (added by automation) ==========

  private getMadhabConfig(): MadhhabConfig | null {
    const cached = EnhancedInheritanceCalculationEngine.madhabConfigCache.get(this.madhab);
    if (cached !== undefined) {
      return cached;
    }

    const config = (FIQH_DATABASE.madhabs[this.madhab] as MadhhabConfig) || null;
    EnhancedInheritanceCalculationEngine.madhabConfigCache.set(this.madhab, config);
    return config;
  }

  private getMadhabRule<K extends keyof MadhhabRules>(ruleKey: K): MadhhabRules[K] | undefined {
    const cacheKey = `${this.madhab}:${ruleKey}`;
    const cached = EnhancedInheritanceCalculationEngine.madhabRuleCache.get(cacheKey);
    if (cached !== undefined) {
      return cached as MadhhabRules[K];
    }

    const ruleValue = this.getMadhabConfig()?.rules?.[ruleKey];
    EnhancedInheritanceCalculationEngine.madhabRuleCache.set(cacheKey, ruleValue);
    return ruleValue;
  }
  // ========== End of rich step methods ==========
  calculate(): CalculationResult {
    const startTime = performance.now();

    try {
      const validation = this.validateInput();
      if (!validation.valid) {
        const endTime = performance.now();
        const calcSteps = this.steps.map((stepObj, idx) => ({
          stepNumber: idx + 1,
          title: stepObj.step,
          description: stepObj.description,
          action: stepObj.code,
          details: stepObj.data || {},
          timestamp: new Date().toISOString(),
        }));

        // Ensure success and map grandfather key for tests
        return {
          success: false,
          madhab: this.madhab,
          madhhabName: this.madhab,
          shares: [],
          confidence: 0,
          confidenceFactors: [],
          steps: calcSteps,
          calculationTime: endTime - startTime,
          error: validation.error ?? 'خطأ في البيانات',
          specialCases: { awl: false, auled: 0, radd: false, hijabTypes: [] },
        };
      }
      this.addStep(
        'التحقق من البيانات: validate',
        `Estate validated: total=${this.estate.total}, funeral=${this.estate.funeral}, debts=${this.estate.debts}, will=${this.estate.will}`,
        { estate: this.estate },
        'info'
      );

      const netEstate = this.calculateNetEstate();
      this.addStep(
        'حساب التركة الصافية: estate_calculation',
        `Net estate = ${this.estate.total} - ${this.estate.funeral} - ${this.estate.debts} - ${this.estate.will} = ${netEstate}`,
        { netEstate },
        'info'
      );

      const madhabRules = this.getMadhabConfig()?.rules;
      const hijabResult = this.hijabSystem.applyHijab(
        this.heirs as Record<string, number | undefined>,
        madhabRules
      );
      const validHeirs = hijabResult.heirs;
      const blockedList = hijabResult.blocked;
      this.state.blockedHeirs = blockedList.map((b) => b.heir);
      this.addStep(
        'تطبيق الحجب: hijab',
        blockedList.length > 0
          ? `Applied hijab rules: ${blockedList.length} heir(s) blocked — ${blockedList.map((b) => b.reason).join(', ')}`
          : 'No heirs blocked by hijab rules',
        {
          blockedHeirs: blockedList,
          validHeirs: Object.keys(validHeirs).filter((k) => (validHeirs as any)[k] > 0),
        },
        'info'
      );

      let fixedShares: HeirShareObject[] = [];

      if (this.isMusharraka()) {
        fixedShares = this.computeMusharraka();
        this.state.specialCases.push({
          type: 'musharraka',
          name: 'المشتركة',
          description: 'الإخوة الأشقاء يشاركون الإخوة لأم في الثلث',
        });
        this.addStep(
          'المشتركة: musharraka',
          'Special case: Full siblings share with maternal siblings in 1/3',
          {
            shares: fixedShares.map((s) => ({
              key: s.key,
              fraction: `${s.fraction.getNumerator()}/${s.fraction.getDenominator()}`,
            })),
          },
          'info'
        );
      } else if (this.isAkdariyya()) {
        fixedShares = this.computeAkdariyya();
        this.state.specialCases.push({
          type: 'akdariyya',
          name: 'الأكدرية',
          description: 'مسألة الأكدرية - للجد مع الأخت طريقة خاصة',
        });
        this.addStep(
          'الأكدرية: akdariyya',
          'Special case: Akdariyya — grandfather with sister uses special distribution',
          {
            shares: fixedShares.map((s) => ({
              key: s.key,
              fraction: `${s.fraction.getNumerator()}/${s.fraction.getDenominator()}`,
            })),
          },
          'info'
        );
      } else {
        fixedShares = this.computeFixedShares(validHeirs);
        this.addStep(
          'الفروض: fixed_shares',
          `Assigned fixed shares to ${fixedShares.length} heir(s)`,
          {
            shares: fixedShares.map((s) => ({
              key: s.key,
              fraction: `${s.fraction.getNumerator()}/${s.fraction.getDenominator()}`,
            })),
          },
          'info'
        );
      }

      const totalFixed = this.sumFractions(fixedShares.map((s) => s.fraction));
      let adjustedFixed = fixedShares;

      if (totalFixed.toDecimal() > 1) {
        adjustedFixed = this.applyAwl(fixedShares, totalFixed);
        this.state.awlApplied = true;
        this.addStep(
          'الأول: awl',
          `Awl applied: shares sum ${totalFixed.getNumerator()}/${totalFixed.getDenominator()} > 1. Proportionally reduced all shares.`,
          {
            totalBeforeAwl: `${totalFixed.getNumerator()}/${totalFixed.getDenominator()}`,
            adjustedShares: adjustedFixed.length,
          },
          'info'
        );
      }

      // Removed spurious AWL hack for grandfather+multiple_sisters edge case
      // Correct handling is via grandfather-with-siblings optimal selection in computeAsaba

      const remainder = new FractionClass(1, 1).subtract(totalFixed);
      this.addStep(
        'حساب الباقي: remainder',
        `Remainder after fixed shares: ${remainder.getNumerator()}/${remainder.getDenominator()} (${(remainder.toDecimal() * 100).toFixed(1)}%)`,
        {
          remainder: `${remainder.getNumerator()}/${remainder.getDenominator()}`,
          pct: (remainder.toDecimal() * 100).toFixed(1),
        },
        'info'
      );

      const asabaShares = this.computeAsaba(adjustedFixed, remainder, validHeirs);
      this.addStep(
        'العصبات: asaba',
        asabaShares.length > 0
          ? `Residuary (${asabaShares.length} heir(s)) receive remainder`
          : 'No residuary heirs (asaba)',
        {
          asabaCount: asabaShares.length,
          shares: asabaShares.map((s) => ({
            key: s.key,
            fraction: `${s.fraction.getNumerator()}/${s.fraction.getDenominator()}`,
          })),
        },
        'info'
      );

      const allShares = this.mergeShares(adjustedFixed, asabaShares);
      this.addStep(
        'دمج الفروض والعصبات: merge',
        `Merged ${adjustedFixed.length} fixed + ${asabaShares.length} residuary = ${allShares.length} total shares`,
        {
          fixedCount: adjustedFixed.length,
          asabaCount: asabaShares.length,
          mergedCount: allShares.length,
        },
        'info'
      );

      const totalAllShares = this.sumFractions(allShares.map((s) => s.fraction));
      const finalRemainder = new FractionClass(1, 1).subtract(totalAllShares);
      this.addStep(
        'إعادة حساب الباقي: recalculate',
        `Total distributed: ${totalAllShares.getNumerator()}/${totalAllShares.getDenominator()}. Remainder: ${finalRemainder.getNumerator()}/${finalRemainder.getDenominator()}`,
        {
          total: `${totalAllShares.getNumerator()}/${totalAllShares.getDenominator()}`,
          remainder: `${finalRemainder.getNumerator()}/${finalRemainder.getDenominator()}`,
        },
        'info'
      );

      let finalShares = allShares;
      if (finalRemainder.toDecimal() > 0.0001 && asabaShares.length === 0) {
        finalShares = this.applyRadd(allShares, finalRemainder);
        this.state.raddApplied = true;
        this.addStep(
          'الرد: radd',
          `Radd applied: surplus ${finalRemainder.getNumerator()}/${finalRemainder.getDenominator()} returned proportionally to eligible heirs`,
          {
            surplus: `${finalRemainder.getNumerator()}/${finalRemainder.getDenominator()}`,
            raddHeirs: finalShares.length,
          },
          'info'
        );
      }

      // Recalculate remainder after radd
      const totalAfterRadd = this.sumFractions(finalShares.map((s) => s.fraction));
      const remainderAfterRadd = new FractionClass(1, 1).subtract(totalAfterRadd);

      // Blood relatives: only distribute if madhab allows it
      const bloodRelativesEnabled = this.getMadhabRule('blood_relatives_enabled') !== false;
      if (
        remainderAfterRadd.toDecimal() > 0.0001 &&
        asabaShares.length === 0 &&
        bloodRelativesEnabled
      ) {
        const bloodDistribution = this.distributeToBloodRelatives(finalShares, remainderAfterRadd);
        finalShares = bloodDistribution.shares;
        if (bloodDistribution.bloodRelatives.length > 0) {
          this.state.bloodRelativesApplied = true;
          this.specialCases.push({
            type: 'blood_relatives',
            name: 'ذوو الأرحام',
            description: 'توزيع الباقي على ذوي الأرحام',
          });
          this.addStep(
            'ذوو الأرحام: blood_relatives',
            `Blood relatives receive surplus: distributed to ${bloodDistribution.bloodRelatives.length} heir(s)`,
            { bloodRelatives: bloodDistribution.bloodRelatives },
            'info'
          );
        }
      }

      // Treasury (Bait al-Mal) - if no heirs, estate goes to treasury
      if (finalShares.length === 0) {
        this.addStep(
          'بيت المال: treasury',
          `No heirs found — entire estate (${netEstate}) goes to Bait al-Mal (Treasury)`,
          { amount: netEstate },
          'info'
        );
        this.state.specialCases.push({
          type: 'treasury',
          name: 'بيت المال',
          description: 'لا يوجد ورثة - التركة لبيت المال',
        });
        finalShares.push({
          key: 'treasury',
          name: 'بيت المال (Treasury)',
          type: 'بيت المال',
          fraction: new FractionClass(1, 1),
          count: 1,
          reason: 'لا يوجد ورثة - التركة لبيت المال الإسلامي',
        });
      }

      const results = this.calculateFinalAmounts(finalShares, netEstate);
      this.addStep(
        'تحويل للمبالغ: amounts',
        `Converted fractions to monetary amounts based on net estate ${netEstate}`,
        { netEstate, shareCount: results.length },
        'info'
      );

      const confidence = this.calculateConfidence(results, validHeirs);
      this.addStep(
        'حساب مستوى الثقة: confidence',
        `Confidence score: ${confidence}% based on ${this.state.confidenceFactors.length} factor(s)`,
        { confidence, factors: this.state.confidenceFactors },
        'info'
      );

      const endTime = performance.now();
      const calcSteps = this.steps.map((stepObj, idx) => ({
        stepNumber: idx + 1,
        title: stepObj.step,
        description: stepObj.description,
        action: stepObj.code,
        details: stepObj.data || {},
        timestamp: new Date().toISOString(),
      }));

      const special: import('./types').SpecialCases = {
        awl: this.specialCases.some((sc) => sc.type === 'awl'),
        auled: 0,
        radd: this.specialCases.some((sc) => sc.type === 'radd'),
        hijabTypes: blockedList.map((b) => b.reason),
      };

      return {
        success: true,
        madhab: this.madhab,
        madhhabName: this.madhab,
        shares: results,
        netEstate: netEstate,
        confidence,
        confidenceFactors: this.state.confidenceFactors,
        steps: calcSteps,
        calculationTime: endTime - startTime,
        specialCases: special,
        awlApplied: this.state.awlApplied,
        raddApplied: this.state.raddApplied,
        bloodRelativesApplied: this.state.bloodRelativesApplied,
        blockedHeirs: this.state.blockedHeirs,
      };
    } catch (error) {
      const endTime = performance.now();
      const calcSteps = this.steps.map((stepObj, idx) => ({
        stepNumber: idx + 1,
        title: stepObj.step,
        description: stepObj.description,
        action: stepObj.code,
        details: stepObj.data || {},
        timestamp: new Date().toISOString(),
      }));

      return {
        success: false,
        madhab: this.madhab,
        madhhabName: this.madhab,
        shares: [],
        confidence: 0,
        confidenceFactors: ['حدث خطأ في الحساب'],
        steps: calcSteps,
        calculationTime: endTime - startTime,
        error: `خطأ في الحساب: ${(error as Error).message}`,
        specialCases: { awl: false, auled: 0, radd: false, hijabTypes: [] },
      };
    }
  }

  private calculateNetEstate(): number {
    let net = this.estate.total;
    net -= this.estate.funeral || 0;
    net -= this.estate.debts || 0;

    const remainderAfterFuneral =
      this.estate.total - (this.estate.funeral || 0) - (this.estate.debts || 0);
    const maxWill = remainderAfterFuneral / 3;
    const actualWill = Math.min(this.estate.will || 0, maxWill);

    net -= actualWill;

    return Math.max(0, net);
  }

  private isMusharraka(): boolean {
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

  private computeMusharraka(): HeirShareObject[] {
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

  private isAkdariyya(): boolean {
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

  private computeAkdariyya(): HeirShareObject[] {
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

  private computeFixedShares(heirs: HeirsData): HeirShareObject[] {
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

  private applyAwl(shares: HeirShareObject[], totalFraction: FractionClass): HeirShareObject[] {
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

  private computeAsaba(
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

  private applyRadd(shares: HeirShareObject[], remainder: FractionClass): HeirShareObject[] {
    if (remainder.toDecimal() <= 0.0001) {
      return shares;
    }

    // Check if spouse should receive radd (madhab-dependent)
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

  private distributeToBloodRelatives(
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

  private calculateFinalAmounts(shares: HeirShareObject[], netEstate: number): HeirShare[] {
    return shares.map((share) => ({
      key: share.key as any,
      name: share.name,
      type: share.type,
      count: share.count,
      reason: share.reason,
      amount: Math.round(share.fraction.toDecimal() * netEstate * 100) / 100,
      percentage: Math.round(share.fraction.toDecimal() * 10000) / 100,
      fraction: {
        numerator: share.fraction.getNumerator(),
        denominator: share.fraction.getDenominator(),
      },
      shares: Array(share.count)
        .fill(0)
        .map((_, i) => ({
          person: i + 1,
          amount: Math.round(((share.fraction.toDecimal() * netEstate) / share.count) * 100) / 100,
        })),
    }));
  }

  private calculateConfidence(_results: HeirShare[], heirs: HeirsData): number {
    void _results;
    let confidence = 100;
    const factors: string[] = [];

    const heirCount = Object.values(heirs).filter((v) => v && v > 0).length;
    if (heirCount > 8) {
      confidence -= 15;
      factors.push('عدد كبير من الورثة (أكثر من 8)');
    } else if (heirCount > 5) {
      confidence -= 10;
      factors.push('عدد متوسط من الورثة (6-8)');
    } else if (heirCount > 3) {
      confidence -= 5;
      factors.push('عدد قليل من الورثة (4-5)');
    }

    if (this.state.awlApplied) {
      confidence -= 8;
      factors.push('تم تطبيق العول');
    }

    if (this.state.raddApplied) {
      confidence -= 5;
      factors.push('تم تطبيق الرد');
    }

    if (this.state.bloodRelativesApplied) {
      confidence -= 10;
      factors.push('تم توزيع الباقي على ذوي الأرحام');
    }

    if (this.specialCases.some((sc) => sc.type === 'musharraka')) {
      confidence -= 8;
      factors.push('المسألة المشتركة (الحمارية)');
    }

    if (this.specialCases.some((sc) => sc.type === 'akdariyya')) {
      confidence -= 12;
      factors.push('مسألة الأكدرية');
    }

    const hasChildren = heirs.son || heirs.daughter;
    const hasParents = heirs.father || heirs.mother;
    const hasGrandparents =
      heirs.grandfather || heirs.grandmother_mother || heirs.grandmother_father;

    const generationCount =
      (hasChildren ? 1 : 0) + (hasParents ? 1 : 0) + (hasGrandparents ? 1 : 0);
    if (generationCount >= 3) {
      confidence -= 5;
      factors.push('وجود عدة أجيال من الورثة');
    }

    const distantHeirs = [
      'full_nephew',
      'paternal_nephew',
      'full_uncle',
      'paternal_uncle',
      'full_cousin',
      'paternal_cousin',
      'daughter_son',
      'daughter_daughter',
      'sister_children',
      'maternal_uncle',
      'maternal_aunt',
      'paternal_aunt',
    ];

    const hasDistantHeirs = distantHeirs.some((key) => (heirs[key as keyof HeirsData] || 0) > 0);
    if (hasDistantHeirs) {
      confidence -= 8;
      factors.push('وجود ورثة من الدرجات البعيدة');
    }

    const hasGrandfatherWithSiblings =
      heirs.grandfather && (heirs.full_brother || heirs.paternal_brother);
    if (hasGrandfatherWithSiblings) {
      confidence -= 5;
      factors.push('حالة الجد مع الإخوة (تختلف باختلاف المذهب)');
    }

    if (heirs.wife && heirs.wife > 1) {
      confidence -= 3;
      factors.push('وجود عدة زوجات');
    }

    confidence = Math.max(50, Math.min(100, confidence));

    this.state.confidenceFactors = [];

    if (factors.length > 0) {
      this.state.confidenceFactors = factors;
    } else {
      this.state.confidenceFactors = ['حساب بسيط - دقة عالية'];
    }

    return confidence;
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

  // Used by hijab system via getMadhabRule checks
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected hasMaleAscendant(): boolean {
    if (this.memo.hasMaleAscendant !== undefined) {
      return this.memo.hasMaleAscendant;
    }
    const result = (this.heirs.father || 0) > 0 || (this.heirs.grandfather || 0) > 0;
    this.memo.hasMaleAscendant = result;
    return result;
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

  private sumFractions(fractions: FractionClass[]): FractionClass {
    return fractions.reduce((sum, frac) => sum.add(frac), new FractionClass(0, 1));
  }

  private mergeShares(
    fixedShares: HeirShareObject[],
    asabaShares: HeirShareObject[]
  ): HeirShareObject[] {
    const merged = [...fixedShares];

    asabaShares.forEach((asaba) => {
      const existing = merged.find((s) => s.key === asaba.key);
      if (existing && asaba.addToExisting) {
        existing.fraction = existing.fraction.add(asaba.fraction);
        existing.type = 'فرض + تعصيب';
      } else if (!existing) {
        merged.push(asaba);
      }
    });

    return merged;
  }

  private normalizeHeirs(heirs: HeirsData): HeirsData {
    return {
      husband: Math.min(heirs.husband || 0, 1),
      wife: Math.min(heirs.wife || 0, 4),
      son: heirs.son || 0,
      daughter: heirs.daughter || 0,
      father: Math.min(heirs.father || 0, 1),
      mother: Math.min(heirs.mother || 0, 1),
      grandfather: Math.min(heirs.grandfather || 0, 1),
      grandmother: Math.min(heirs.grandmother || 0, 1),
      grandmother_mother: heirs.grandmother_mother || 0,
      grandmother_father: heirs.grandmother_father || 0,
      full_brother: heirs.full_brother || 0,
      full_sister: heirs.full_sister || 0,
      half_brother_paternal: heirs.half_brother_paternal || 0,
      half_sister_paternal: heirs.half_sister_paternal || 0,
      maternal_brother: heirs.maternal_brother || 0,
      maternal_sister: heirs.maternal_sister || 0,
      grandson: heirs.grandson || 0,
      granddaughter: heirs.granddaughter || 0,
      nephew_from_brother: heirs.nephew_from_brother || 0,
      niece_from_brother: heirs.niece_from_brother || 0,
      full_nephew: heirs.full_nephew || 0,
      paternal_nephew: heirs.paternal_nephew || 0,
      uncle_paternal: heirs.uncle_paternal || 0,
      uncle_maternal: heirs.uncle_maternal || 0,
      full_uncle: heirs.full_uncle || 0,
      paternal_uncle: heirs.paternal_uncle || 0,
      aunt_paternal: heirs.aunt_paternal || 0,
      aunt_maternal: heirs.aunt_maternal || 0,
      full_cousin: heirs.full_cousin || 0,
      paternal_cousin: heirs.paternal_cousin || 0,
      daughter_son: heirs.daughter_son || 0,
      daughter_daughter: heirs.daughter_daughter || 0,
      sister_children: heirs.sister_children || 0,
      maternal_uncle: heirs.maternal_uncle || 0,
      maternal_aunt: heirs.maternal_aunt || 0,
      paternal_aunt: heirs.paternal_aunt || 0,
    };
  }

  private validateInput() {
    if (!this.estate.total || this.estate.total <= 0) {
      return {
        valid: false,
        error: 'يجب إدخال مبلغ إجمالي التركة',
      };
    }

    const totalHeirs = Object.values(this.heirs).filter((v) => v && v > 0).length;
    // Allow zero heirs - estate will go to treasury (Bait al-Mal)
    if (totalHeirs === 0) {
      this.state.bloodRelativesApplied = true;
    }

    return { valid: true };
  }
}

export function calculateInheritance(madhab: MadhhabType, estate: EstateInput, heirs: HeirsData) {
  const engine = new EnhancedInheritanceCalculationEngine(madhab, estate, heirs);
  return engine.calculate();
}
