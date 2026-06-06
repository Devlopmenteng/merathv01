/**
 * Islamic Inheritance Calculation Library
 * مكتبة حساب المواريث الشرعية
 *
 * This module provides the main entry point for Islamic inheritance calculations
 * according to the four major schools of Islamic jurisprudence (madhhabs):
 * - Hanafi (حنفي)
 * - Maliki (مالكي)
 * - Shafii (شافعي)
 * - Hanbali (حنبلي)
 *
 * @module lib/inheritance
 */

export { EnhancedInheritanceCalculationEngine as InheritanceCalculationEngine } from '../engine/calculator';
export { FractionClass } from '../engine/fraction';
export { HijabSystem } from '../engine/hijab';
export {
  validateEstateData,
  validateHeirsData,
  countTotalHeirs,
  countHeirTypes,
  getHeirName,
} from '../engine/constants';

/**
 * Type exports for TypeScript users
 */
export type {
  EstateData,
  HeirsData,
  HeirEntry,
  HeirType,
  Madhab,
  CalculationResult,
  HeirShare,
  HeirShareBase,
  EngineHeirShare,
  UIHeirShare,
  ReportHeirShare,
  HeirShareObject,
  CalculationStep,
} from '../engine/types';
