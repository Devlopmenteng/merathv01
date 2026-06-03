/**
 * Calculation Inspector - Debug Tools for Inheritance Calculations
 * أدوات تصحيح حسابات المواريث
 *
 * This module provides debugging and inspection capabilities for inheritance calculations,
 * allowing developers to analyze calculation steps, verify special cases, and diagnose issues.
 *
 * @module lib/debug/CalculationInspector
 */

import type { CalculationResult, CalculationStep, EstateData, HeirsData } from '../engine/types';

/**
 * Analysis result from inspection
 */
export interface InspectionResult {
  /** Overall analysis summary */
  summary: string;
  /** Step-by-step analysis */
  stepAnalysis: StepAnalysis[];
  /** Special cases detected */
  specialCases: SpecialCaseAnalysis[];
  /** Confidence analysis */
  confidenceAnalysis: ConfidenceAnalysis;
  /** Performance metrics */
  performanceAnalysis: PerformanceAnalysis;
  /** Warnings and recommendations */
  warnings: string[];
  /** Recommendations */
  recommendations: string[];
}

/**
 * Analysis of a single calculation step
 */
export interface StepAnalysis {
  stepNumber: number;
  title: string;
  action: string;
  details: Record<string, unknown>;
  analysis: string;
  potentialIssues: string[];
}

/**
 * Analysis of special cases
 */
export interface SpecialCaseAnalysis {
  caseType: string;
  detected: boolean;
  description: string;
  impact: string;
  conditions: string[];
  references: string[];
}

/**
 * Confidence score analysis
 */
export interface ConfidenceAnalysis {
  score: number;
  interpretation: string;
  factors: string[];
  criticalFactors: string[];
  recommendations: string[];
}

/**
 * Performance analysis
 */
export interface PerformanceAnalysis {
  calculationTime: number;
  timeCategory: 'fast' | 'moderate' | 'slow';
  bottleneckSteps: string[];
  optimizationSuggestions: string[];
}

/**
 * Calculation Inspector class
 */
export class CalculationInspector {
  private result: CalculationResult;
  private estate: EstateData;
  private heirs: HeirsData;

  /**
   * Create a new Calculation Inspector
   *
   * @param result - The calculation result to inspect
   * @param estate - The estate data used in calculation
   * @param heirs - The heirs data used in calculation
   */
  constructor(result: CalculationResult, estate: EstateData, heirs: HeirsData) {
    this.result = result;
    this.estate = estate;
    this.heirs = heirs;
  }

  /**
   * Perform full inspection of the calculation
   *
   * @returns Comprehensive inspection result
   */
  public inspect(): InspectionResult {
    const stepAnalysis = this.analyzeSteps();
    const specialCases = this.analyzeSpecialCases();
    const confidenceAnalysis = this.analyzeConfidence();
    const performanceAnalysis = this.analyzePerformance();
    const warnings = this.generateWarnings();
    const recommendations = this.generateRecommendations();
    const summary = this.generateSummary(stepAnalysis, specialCases, confidenceAnalysis);

    return {
      summary,
      stepAnalysis,
      specialCases,
      confidenceAnalysis,
      performanceAnalysis,
      warnings,
      recommendations,
    };
  }

  /**
   * Generate overall summary
   */
  private generateSummary(
    stepAnalysis: StepAnalysis[],
    specialCases: SpecialCaseAnalysis[],
    confidenceAnalysis: ConfidenceAnalysis
  ): string {
    const madhab = this.result.madhab;
    const heirCount = Object.keys(this.heirs).length;
    const specialCasesApplied = specialCases.filter((sc) => sc.detected).length;
    const confidence = confidenceAnalysis.score;

    return (
      `Calculation inspection for ${madhab} madhab with ${heirCount} heir types. ` +
      `Confidence score: ${confidence.toFixed(2)}/1.00. ` +
      `${specialCasesApplied} special case(s) applied. ` +
      `${stepAnalysis.length} calculation steps analyzed.`
    );
  }

  /**
   * Analyze calculation steps
   */
  private analyzeSteps(): StepAnalysis[] {
    return this.result.steps.map((step) => ({
      stepNumber: step.stepNumber,
      title: step.title,
      action: step.action,
      details: step.details,
      analysis: this.analyzeStep(step),
      potentialIssues: this.detectStepIssues(step),
    }));
  }

  /**
   * Analyze a single step
   */
  private analyzeStep(step: CalculationStep): string {
    const { action } = step;

    if (action.includes('hijab')) {
      return 'Inheritance blocking rules applied. Check for proper heir filtering.';
    }
    if (action.includes('fixed') || action.includes('furood')) {
      return 'Fixed share calculation. Verify Quranic share accuracy.';
    }
    if (action.includes('asaba') || action.includes('residual')) {
      return 'Residual share calculation. Check asaba hierarchy.';
    }
    if (action.includes('awl') || action.includes('عول')) {
      return 'Awl (reduction) applied. Shares exceeded estate base.';
    }
    if (action.includes('radd') || action.includes('رد')) {
      return 'Radd (return) applied. Shares were less than estate.';
    }
    if (action.includes('blood') || action.includes('ذوو')) {
      return 'Blood relatives distribution. Check priority classes.';
    }

    return `Step executed: ${action}`;
  }

  /**
   * Detect potential issues in a step
   */
  private detectStepIssues(step: CalculationStep): string[] {
    const issues: string[] = [];

    if (step.details && typeof step.details === 'object') {
      const details = step.details as Record<string, unknown>;

      // Check for zero values where unexpected
      Object.entries(details).forEach(([key, value]) => {
        if (value === 0 && key.includes('amount') && !key.includes('zero')) {
          issues.push(`Zero amount detected for ${key}`);
        }
      });

      // Check for negative values
      Object.entries(details).forEach(([key, value]) => {
        if (typeof value === 'number' && value < 0) {
          issues.push(`Negative value detected for ${key}: ${value}`);
        }
      });
    }

    return issues;
  }

  /**
   * Analyze special cases
   */
  private analyzeSpecialCases(): SpecialCaseAnalysis[] {
    const specialCases: SpecialCaseAnalysis[] = [
      this.analyzeMusharraka(),
      this.analyzeAkdariyya(),
      this.analyzeGrandfatherOptimalSelection(),
      this.analyzeAwl(),
      this.analyzeRadd(),
      this.analyzeBloodRelatives(),
    ];

    return specialCases;
  }

  /**
   * Analyze Musharraka case
   */
  private analyzeMusharraka(): SpecialCaseAnalysis {
    const detected =
      Boolean(this.result.specialCases?.hijabTypes?.includes('musharraka')) ||
      Boolean(this.result.madhhabNotes?.some((note: string) => note.includes('Musharraka')));

    return {
      caseType: 'Musharraka (المشتركة)',
      detected,
      description: 'Grandfather shares with full siblings in Shafii madhab',
      impact: detected
        ? 'Grandfather received share as if he were a brother'
        : 'Not applicable (not Shafii or conditions not met)',
      conditions: [
        'Shafii madhab',
        'Grandfather present',
        'Full siblings present',
        'No father present',
        'No male descendants (sons/grandsons)',
      ],
      references: ['Al-Umm by Imam Shafii', 'Shafii inheritance law texts'],
    };
  }

  /**
   * Analyze Akdariyya case
   */
  private analyzeAkdariyya(): SpecialCaseAnalysis {
    const detected =
      Boolean(this.result.specialCases?.hijabTypes?.includes('akdariyya')) ||
      Boolean(this.result.madhhabNotes?.some((note: string) => note.includes('Akdariyya')));

    return {
      caseType: 'Akdariyya (الأكدرية)',
      detected,
      description: 'Grandfather with single sister receives reduced share',
      impact: detected
        ? 'Special distribution applied for grandfather + single sister'
        : 'Not applicable (conditions not met)',
      conditions: ['Grandfather present', 'Single sister present', 'No other heirs'],
      references: ['Named after Akdarah case', 'Shafii and Hanafi commentaries'],
    };
  }

  /**
   * Analyze grandfather optimal selection
   */
  private analyzeGrandfatherOptimalSelection(): SpecialCaseAnalysis {
    const hasGrandfather = Boolean(this.heirs.grandfather && this.heirs.grandfather > 0);
    const hasSiblings = Boolean(
      (this.heirs.full_brother || 0) > 0 ||
      (this.heirs.full_sister || 0) > 0 ||
      (this.heirs.paternal_brother || 0) > 0 ||
      (this.heirs.paternal_sister || 0) > 0
    );

    const detected = hasGrandfather && hasSiblings;

    return {
      caseType: 'Grandfather Optimal Selection',
      detected,
      description: 'Engine selects most beneficial option for grandfather',
      impact: detected
        ? 'Optimal share selected: muqasamah, 1/6, or 1/3'
        : 'Not applicable (no grandfather or siblings)',
      conditions: ['Grandfather present', 'Siblings present (in some cases)', 'No father present'],
      references: ['Al-Mughni by Ibn Qudamah', 'Comparative fiqh analysis'],
    };
  }

  /**
   * Analyze Awl case
   */
  private analyzeAwl(): SpecialCaseAnalysis {
    const detected = this.result.awlApplied || false;

    return {
      caseType: 'Awl (عول)',
      detected,
      description: 'Shares exceeded estate base, proportionally reduced',
      impact: detected
        ? 'All fixed shares were proportionally reduced'
        : 'Shares did not exceed estate base',
      conditions: ['Sum of fixed shares > 1 (100%)'],
      references: [
        'Classical fiqh texts across all madhhabs',
        'Surah An-Nisa implementation details',
      ],
    };
  }

  /**
   * Analyze Radd case
   */
  private analyzeRadd(): SpecialCaseAnalysis {
    const detected = this.result.raddApplied || false;

    return {
      caseType: 'Radd (رد)',
      detected,
      description: 'Shares were less than estate, remainder returned to fixed sharers',
      impact: detected
        ? 'Remaining estate distributed to fixed sharers (spouses per madhab rules)'
        : 'Shares fully distributed (no remainder)',
      conditions: ['Sum of fixed shares < 1 (100%)', 'No asaba heirs to receive remainder'],
      references: ['Madhab-specific rules for spouse Radd', 'Classical inheritance law texts'],
    };
  }

  /**
   * Analyze Blood Relatives case
   */
  private analyzeBloodRelatives(): SpecialCaseAnalysis {
    const detected = Boolean(this.result.bloodRelativesApplied);

    return {
      caseType: 'Blood Relatives (ذوو الأرحام)',
      detected,
      description: 'Distant relatives inherit when no fixed sharers or asaba exist',
      impact: detected
        ? 'Blood relatives inherited by priority classes'
        : 'Fixed sharers or asaba covered entire estate',
      conditions: [
        'No fixed sharers (or shares exhausted)',
        'No asaba heirs',
        'Blood relatives present',
      ],
      references: [
        'Consensus across madhhabs with minor variations',
        'Priority classes established by scholarly consensus',
      ],
    };
  }

  /**
   * Analyze confidence score
   */
  private analyzeConfidence(): ConfidenceAnalysis {
    const score = this.result.confidence || 0;
    const factors = this.result.confidenceFactors || [];

    const interpretation = this.interpretConfidence(score);
    const criticalFactors = factors.filter((f) => f.includes('error') || f.includes('uncertain'));
    const recommendations = this.generateConfidenceRecommendations(score, factors);

    return {
      score,
      interpretation,
      factors,
      criticalFactors,
      recommendations,
    };
  }

  /**
   * Interpret confidence score
   */
  private interpretConfidence(score: number): string {
    if (score >= 0.95) {
      return 'Very High Confidence - Calculation follows standard fiqh rules';
    }
    if (score >= 0.8) {
      return 'High Confidence - Minor variations or special cases detected';
    }
    if (score >= 0.6) {
      return 'Moderate Confidence - Some unusual conditions detected';
    }
    if (score >= 0.4) {
      return 'Low Confidence - Significant uncertainties detected';
    }
    return 'Very Low Confidence - Calculation may require scholarly review';
  }

  /**
   * Generate confidence recommendations
   */
  private generateConfidenceRecommendations(score: number, factors: string[]): string[] {
    const recommendations: string[] = [];

    if (score < 0.8) {
      recommendations.push('Consider consulting Islamic scholar for validation');
    }

    if (factors.some((f) => f.includes('special case'))) {
      recommendations.push('Review special case application against madhab rules');
    }

    if (factors.some((f) => f.includes('blood relative'))) {
      recommendations.push('Verify blood relatives priority class application');
    }

    if (factors.some((f) => f.includes('awl'))) {
      recommendations.push('Cross-check Awl calculation with classical texts');
    }

    if (recommendations.length === 0) {
      recommendations.push('No specific recommendations - calculation appears standard');
    }

    return recommendations;
  }

  /**
   * Analyze performance
   */
  private analyzePerformance(): PerformanceAnalysis {
    const calculationTime = this.result.calculationTime || 0;
    const timeCategory = this.categorizePerformance(calculationTime);
    const bottleneckSteps = this.identifyBottlenecks();
    const optimizationSuggestions = this.generateOptimizationSuggestions();

    return {
      calculationTime,
      timeCategory,
      bottleneckSteps,
      optimizationSuggestions,
    };
  }

  /**
   * Categorize performance
   */
  private categorizePerformance(time: number): 'fast' | 'moderate' | 'slow' {
    if (time < 10) return 'fast';
    if (time < 50) return 'moderate';
    return 'slow';
  }

  /**
   * Identify bottleneck steps
   */
  private identifyBottlenecks(): string[] {
    const bottlenecks: string[] = [];
    const slowSteps = this.result.steps.filter((step) => {
      // Assuming slow steps might have certain characteristics
      return step.details && Object.keys(step.details).length > 10;
    });

    if (slowSteps.length > 0) {
      bottlenecks.push('Complex heir configurations detected');
    }

    if (this.heirs && Object.keys(this.heirs).length > 10) {
      bottlenecks.push('Large number of heir types');
    }

    return bottlenecks;
  }

  /**
   * Generate optimization suggestions
   */
  private generateOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];

    if (this.heirs && Object.keys(this.heirs).length > 10) {
      suggestions.push('Consider caching calculations for repeated heir configurations');
    }

    if (this.result.steps.length > 20) {
      suggestions.push('Calculation pipeline complex - consider modular refactoring');
    }

    if (this.result.calculationTime && this.result.calculationTime > 50) {
      suggestions.push('Performance optimization may be needed for real-time calculations');
    }

    if (suggestions.length === 0) {
      suggestions.push('Performance appears adequate - no optimization needed');
    }

    return suggestions;
  }

  /**
   * Generate warnings
   */
  private generateWarnings(): string[] {
    const warnings: string[] = [];

    // Check for zero estate
    if (this.estate.total <= 0) {
      warnings.push('Zero or negative estate value detected');
    }

    // Check for excessive expenses
    const expenses =
      (this.estate.funeral || 0) + (this.estate.debts || 0) + (this.estate.will || 0);
    if (expenses > this.estate.total * 0.9) {
      warnings.push('Expenses exceed 90% of estate value');
    }

    // Check for will exceeding 1/3
    const netEstate = this.estate.total - (this.estate.funeral || 0) - (this.estate.debts || 0);
    if (this.estate.will && this.estate.will > netEstate / 3) {
      warnings.push('Will exceeds recommended 1/3 of net estate');
    }

    // Check for confidence issues
    if (this.result.confidence && this.result.confidence < 0.7) {
      warnings.push('Low confidence score - calculation may need review');
    }

    return warnings;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // Check for complex configurations
    if (Object.keys(this.heirs).length > 8) {
      recommendations.push('Consider splitting complex inheritance into separate calculations');
    }

    // Check for special cases
    if (this.result.specialCases && Object.values(this.result.specialCases).some(Boolean)) {
      recommendations.push('Special cases applied - verify against madhab-specific rules');
    }

    // Check for documentation
    recommendations.push('Document unusual calculations for future reference');

    // Check for scholarly review
    if (this.result.confidence && this.result.confidence < 0.9) {
      recommendations.push('Consider scholarly consultation for low-confidence calculations');
    }

    return recommendations;
  }

  /**
   * Print inspection report to console
   */
  public printReport(): void {
    const inspection = this.inspect();

    console.log('\n=== CALCULATION INSPECTION REPORT ===\n');
    console.log(inspection.summary);
    console.log('\n--- CONFIDENCE ANALYSIS ---');
    console.log(`Score: ${inspection.confidenceAnalysis.score.toFixed(2)}/1.00`);
    console.log(inspection.confidenceAnalysis.interpretation);
    console.log('Factors:', inspection.confidenceAnalysis.factors.join(', '));

    if (inspection.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS ---');
      inspection.warnings.forEach((warning) => console.log(`  - ${warning}`));
    }

    if (inspection.specialCases.some((sc) => sc.detected)) {
      console.log('\n--- SPECIAL CASES DETECTED ---');
      inspection.specialCases
        .filter((sc) => sc.detected)
        .forEach((sc) => {
          console.log(`  ${sc.caseType}: ${sc.impact}`);
        });
    }

    console.log('\n--- RECOMMENDATIONS ---');
    inspection.recommendations.forEach((rec) => console.log(`  - ${rec}`));

    console.log('\n=== END REPORT ===\n');
  }

  /**
   * Export inspection as JSON
   */
  public exportAsJSON(): string {
    const inspection = this.inspect();
    return JSON.stringify(inspection, null, 2);
  }
}

/**
 * Convenience function to inspect a calculation result
 *
 * @param result - Calculation result to inspect
 * @param estate - Estate data used
 * @param heirs - Heirs data used
 * @returns Inspection result
 */
export function inspectCalculation(
  result: CalculationResult,
  estate: EstateData,
  heirs: HeirsData
): InspectionResult {
  const inspector = new CalculationInspector(result, estate, heirs);
  return inspector.inspect();
}

/**
 * Convenience function to print inspection report
 *
 * @param result - Calculation result to inspect
 * @param estate - Estate data used
 * @param heirs - Heirs data used
 */
export function printInspectionReport(
  result: CalculationResult,
  estate: EstateData,
  heirs: HeirsData
): void {
  const inspector = new CalculationInspector(result, estate, heirs);
  inspector.printReport();
}
