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
  HeirType,
  Madhab,
  CalculationResult,
  HeirShare,
  MadhhabConfig,
  MadhhabRules,
  HeirShareObject,
  EngineState,
} from './types';
import { BoundedCache, DEFAULT_CACHE_CONFIGS } from './CacheManager';
import { HijabSystem } from './hijab';
import { FixedSharesCalculator } from './FixedSharesCalculator';
import { AsabaCalculator } from './AsabaCalculator';
import { AwlCalculator } from './AwlCalculator';
import { RaddCalculator } from './RaddCalculator';
import { SpecialCasesCalculator } from './SpecialCasesCalculator';
import { BloodRelativesCalculator } from './BloodRelativesCalculator';
import { ConfidenceCalculator } from './ConfidenceCalculator';

export class EnhancedInheritanceCalculationEngine {
  private madhab: Madhab;
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

  private static readonly madhabConfigCache = new BoundedCache<
    Madhab,
    MadhhabConfig | null
  >(DEFAULT_CACHE_CONFIGS.madhab);
  private static readonly madhabRuleCache = new BoundedCache<
    string,
    MadhhabRules[keyof MadhhabRules] | undefined
  >(DEFAULT_CACHE_CONFIGS.rules);

  // ========== Cache Management Methods ==========

  /**
   * Invalidate all caches (use sparingly, mainly for testing)
   */
  static clearAllCaches(): void {
    EnhancedInheritanceCalculationEngine.madhabConfigCache.clear();
    EnhancedInheritanceCalculationEngine.madhabRuleCache.clear();
  }

  /**
   * Invalidate madhab-specific caches
   * Call this when madhab rules might have changed
   */
  static clearMadhabCache(madhab: Madhab): void {
    EnhancedInheritanceCalculationEngine.madhabConfigCache.set(madhab, null);
    EnhancedInheritanceCalculationEngine.madhabRuleCache.clearMatching(
      (key: string) => key.startsWith(`${madhab}:`)
    );
  }

  /**
   * Get cache statistics for monitoring
   */
  static getCacheStats() {
    return {
      madhab: EnhancedInheritanceCalculationEngine.madhabConfigCache.getStats(),
      rules: EnhancedInheritanceCalculationEngine.madhabRuleCache.getStats(),
    };
  }

  // ========== End Cache Management Methods ==========

  private state: EngineState = {
    blockedHeirs: [],
    hijabTypes: [],
    awlApplied: false,
    raddApplied: false,
    bloodRelativesApplied: false,
    confidenceFactors: [],
    specialCases: [],
  };

  private fixedSharesCalc: FixedSharesCalculator;
  private asabaCalc: AsabaCalculator;
  private awlCalc: AwlCalculator;
  private raddCalc: RaddCalculator;
  private specialCasesCalc: SpecialCasesCalculator;
  private bloodRelCalc: BloodRelativesCalculator;
  private confidenceCalc: ConfidenceCalculator;

  constructor(madhab: Madhab, estate: EstateData, heirs: HeirsData) {
    this.madhab = madhab;
    this.estate = {
      total: estate.total || 0,
      funeral: estate.funeral || 0,
      debts: estate.debts || 0,
      will: estate.will || 0,
    };
    this.heirs = this.normalizeHeirs(heirs);
    this.hijabSystem = new HijabSystem();

    this.fixedSharesCalc = new FixedSharesCalculator(
      this.heirs,
      this.memo,
      <K extends keyof MadhhabRules>(key: K) => this.getMadhabRule(key)
    );
    this.asabaCalc = new AsabaCalculator(
      this.heirs,
      this.memo,
      this.steps,
      <K extends keyof MadhhabRules>(key: K) => this.getMadhabRule(key)
    );
    this.awlCalc = new AwlCalculator(this.specialCases);
    this.raddCalc = new RaddCalculator(
      <K extends keyof MadhhabRules>(key: K) => this.getMadhabRule(key),
      this.specialCases,
      (fractions: FractionClass[]) => this.sumFractions(fractions)
    );
    this.specialCasesCalc = new SpecialCasesCalculator(
      this.heirs,
      this.memo,
      this.state,
      this.steps,
      <K extends keyof MadhhabRules>(key: K) => this.getMadhabRule(key)
    );
    this.bloodRelCalc = new BloodRelativesCalculator(this.heirs, this.steps, this.specialCases);
    this.confidenceCalc = new ConfidenceCalculator(this.state, this.specialCases);
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
    if (cached !== null) {
      return cached;
    }

    const config = (FIQH_DATABASE.madhabs[this.madhab] as MadhhabConfig) || null;
    EnhancedInheritanceCalculationEngine.madhabConfigCache.set(this.madhab, config);
    return config;
  }

  private getMadhabRule<K extends keyof MadhhabRules>(ruleKey: K): MadhhabRules[K] | undefined {
    const cacheKey = `${this.madhab}:${ruleKey}`;
    const cached = EnhancedInheritanceCalculationEngine.madhabRuleCache.get(cacheKey);
    if (cached !== null) {
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
          details: (stepObj.data || {}) as Record<string, unknown>,
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
          validHeirs: Object.keys(validHeirs).filter((k) => validHeirs[k]! > 0),
        },
        'info'
      );

      let fixedShares: HeirShareObject[] = [];

      if (this.specialCasesCalc.isMusharraka()) {
        fixedShares = this.specialCasesCalc.computeMusharraka();
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
      } else if (this.specialCasesCalc.isAkdariyya()) {
        fixedShares = this.specialCasesCalc.computeAkdariyya();
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
        fixedShares = this.fixedSharesCalc.computeFixedShares(validHeirs);
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
        adjustedFixed = this.awlCalc.applyAwl(fixedShares, totalFixed);
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

      const asabaShares = this.asabaCalc.computeAsaba(adjustedFixed, remainder, validHeirs);
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
        finalShares = this.raddCalc.applyRadd(allShares, finalRemainder);
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
        const bloodDistribution = this.bloodRelCalc.distributeToBloodRelatives(
          finalShares,
          remainderAfterRadd
        );
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

      const confidence = this.confidenceCalc.calculateConfidence(results, validHeirs);
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
        details: (stepObj.data || {}) as Record<string, unknown>,
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
        details: (stepObj.data || {}) as Record<string, unknown>,
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

  private calculateFinalAmounts(shares: HeirShareObject[], netEstate: number): HeirShare[] {
    return shares.map((share) => ({
      key: share.key as HeirType,
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

  protected hasMaleAscendant(): boolean {
    if (this.memo.hasMaleAscendant !== undefined) {
      return this.memo.hasMaleAscendant;
    }
    const result = (this.heirs.father || 0) > 0 || (this.heirs.grandfather || 0) > 0;
    this.memo.hasMaleAscendant = result;
    return result;
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

export function calculateInheritance(madhab: Madhab, estate: EstateInput, heirs: HeirsData) {
  const engine = new EnhancedInheritanceCalculationEngine(madhab, estate, heirs);
  return engine.calculate();
}
