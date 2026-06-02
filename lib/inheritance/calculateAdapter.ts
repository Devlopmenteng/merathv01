/**
 * Calculate Inheritance Adapter
 * محول حساب المواريث
 *
 * This adapter provides a simplified interface for calculating inheritance
 * with built-in validation and error handling.
 *
 * @module lib/inheritance/calculateAdapter
 */

import { EnhancedInheritanceCalculationEngine } from '../engine/calculator';
import { APP_DEFAULTS } from '../constants/appDefaults';
import { EstateInput, HeirEntry, HeirsData, MadhhabType, CalculationResult } from '../engine/types';
import {
  EstateValidationError,
  HeirsValidationError,
  isInheritanceCalculationError,
} from '../engine/errors';

/**
 * Input interface for inheritance calculation
 * Provides flexible property names for different integrations
 */
export interface CalculateInheritanceInput {
  /** School of Islamic jurisprudence (madhab) to use for calculation */
  madhab?: MadhhabType;
  /** Total value of the estate (alternative name: total) */
  totalEstate?: number;
  /** Total value of the estate (alternative name: totalEstate) */
  total?: number;
  /** Funeral expenses (alternative name: funeral) */
  funeralExpenses?: number;
  /** Funeral expenses (alternative name: funeralExpenses) */
  funeral?: number;
  /** Outstanding debts on the estate */
  debts?: number;
  /** Will/bequest amount (limited to 1/3 of estate) */
  will?: number;
  /** Will/bequest amount (alternative name: will) */
  willAmount?: number;
  /** Array of heirs with their types and counts */
  heirs?: HeirEntry[];
}

/**
 * Main function to calculate inheritance shares
 *
 * This function validates input data and performs inheritance calculation
 * according to the specified madhab rules.
 *
 * @param input - Input data for calculation including estate details, heirs, and madhab
 * @returns Calculation result with shares, steps, and distribution details
 * @throws {EstateValidationError} When estate data is invalid
 * @throws {HeirsValidationError} When heirs data is invalid
 * @throws {Error} When calculation fails
 *
 * @example
 * ```typescript
 * const result = calculateInheritance({
 *   madhab: 'hanafi',
 *   totalEstate: 100000,
 *   funeral: 5000,
 *   debts: 0,
 *   will: 0,
 *   heirs: [
 *     { type: 'wife', count: 1 },
 *     { type: 'son', count: 2 }
 *   ]
 * });
 * ```
 */
export function calculateInheritance(input: CalculateInheritanceInput): CalculationResult {
  try {
    // Validate estate data
    const total = input.totalEstate ?? input.total ?? 0;
    if (total <= 0) {
      throw new EstateValidationError('Total estate must be greater than zero', 'total');
    }

    const estate: EstateInput = {
      total,
      funeral: input.funeralExpenses ?? input.funeral ?? 0,
      debts: input.debts ?? 0,
      will: input.will ?? input.willAmount ?? 0,
    };

    // Validate estate expenses don't exceed total
    const expenses = (estate.funeral || 0) + (estate.debts || 0) + (estate.will || 0);
    if (expenses > estate.total) {
      throw new EstateValidationError('Total expenses exceed estate value', 'expenses', {
        total: estate.total,
        expenses,
      });
    }

    // Validate heirs data
    const heirs: HeirEntry[] = input.heirs ?? [];
    if (heirs.length === 0) {
      throw new HeirsValidationError('At least one heir must be specified');
    }

    const heirsRecord: HeirsData = heirs.reduce<HeirsData>((acc, heir) => {
      if (heir.count > 0) {
        acc[heir.type] = heir.count;
      }
      return acc;
    }, {});

    const engine = new EnhancedInheritanceCalculationEngine(
      input.madhab ?? APP_DEFAULTS.DEFAULT_MADHAB,
      estate,
      heirsRecord
    );

    return engine.calculate();
  } catch (error) {
    if (isInheritanceCalculationError(error)) {
      console.error('[CalculationError]', error.code, error.message, error.details);
      throw error;
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown calculation error';
    console.error('[CalculationError]', errorMessage, error);
    throw new Error(`Calculation failed: ${errorMessage}`);
  }
}
