/**
 * Custom Error Classes for Islamic Inheritance Calculation
 * فئات الأخطاء المخصصة لحساب المواريث الشرعية
 *
 * This module provides domain-specific error types for better error handling,
 * user feedback, and debugging in the inheritance calculation system.
 *
 * @module lib/engine/errors
 */

/**
 * Base error class for all inheritance calculation errors
 *
 * All custom errors in the inheritance system extend this class to provide
 * consistent error handling and type checking.
 *
 * @extends Error
 */
export class InheritanceCalculationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when estate data is invalid or missing required fields
 */
export class EstateValidationError extends InheritanceCalculationError {
  constructor(
    message: string,
    public readonly field?: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'ESTATE_VALIDATION_ERROR', details);
    this.field = field;
  }
}

/**
 * Error thrown when heirs data is invalid or contains unsupported heir types
 */
export class HeirsValidationError extends InheritanceCalculationError {
  constructor(
    message: string,
    public readonly heirType?: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'HEIRS_VALIDATION_ERROR', details);
    this.heirType = heirType;
  }
}

/**
 * Error thrown when calculation encounters inconsistent or impossible scenarios
 */
export class CalculationLogicError extends InheritanceCalculationError {
  constructor(
    message: string,
    public readonly step: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'CALCULATION_LOGIC_ERROR', details);
    this.step = step;
  }
}

/**
 * Error thrown when fraction operations fail (e.g., division by zero, overflow)
 */
export class FractionError extends InheritanceCalculationError {
  constructor(
    message: string,
    public readonly operation: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'FRACTION_ERROR', details);
    this.operation = operation;
  }
}

/**
 * Error thrown when special case conditions cannot be met
 */
export class SpecialCaseError extends InheritanceCalculationError {
  constructor(
    message: string,
    public readonly caseType: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'SPECIAL_CASE_ERROR', details);
    this.caseType = caseType;
  }
}

/**
 * Error thrown when madhab-specific rules cannot be applied
 */
export class MadhabRuleError extends InheritanceCalculationError {
  constructor(
    message: string,
    public readonly madhab: string,
    public readonly rule?: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'MADHAB_RULE_ERROR', details);
    this.madhab = madhab;
    this.rule = rule;
  }
}

/**
 * Error thrown when awl (عول) calculation fails
 */
export class AwlCalculationError extends InheritanceCalculationError {
  constructor(
    message: string,
    public readonly originalTotal: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'AWL_CALCULATION_ERROR', details);
    this.originalTotal = originalTotal;
  }
}

/**
 * Error thrown when radd (رد) calculation fails
 */
export class RaddCalculationError extends InheritanceCalculationError {
  constructor(
    message: string,
    public readonly remainder: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'RADD_CALCULATION_ERROR', details);
    this.remainder = remainder;
  }
}

/**
 * Error thrown when hijab (حجب) system encounters issues
 */
export class HijabSystemError extends InheritanceCalculationError {
  constructor(
    message: string,
    public readonly blockedHeir?: string,
    public readonly blockingHeir?: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'HIJAB_SYSTEM_ERROR', details);
    this.blockedHeir = blockedHeir;
    this.blockingHeir = blockingHeir;
  }
}

/**
 * Error thrown when blood relatives distribution fails
 */
export class BloodRelativesError extends InheritanceCalculationError {
  constructor(
    message: string,
    public readonly classLevel?: number,
    details?: Record<string, unknown>
  ) {
    super(message, 'BLOOD_RELATIVES_ERROR', details);
    this.classLevel = classLevel;
  }
}

/**
 * Utility function to determine if an error is an inheritance calculation error
 */
export function isInheritanceCalculationError(
  error: unknown
): error is InheritanceCalculationError {
  return error instanceof InheritanceCalculationError;
}

/**
 * Utility function to get user-friendly error message
 */
export function getUserFriendlyError(error: unknown): string {
  if (isInheritanceCalculationError(error)) {
    switch (error.code) {
      case 'ESTATE_VALIDATION_ERROR':
        return 'Invalid estate data. Please check the values and try again.';
      case 'HEIRS_VALIDATION_ERROR':
        return 'Invalid heirs data. Please check the heir types and counts.';
      case 'CALCULATION_LOGIC_ERROR':
        return 'Calculation error occurred. Please review the input data.';
      case 'FRACTION_ERROR':
        return 'Mathematical error in calculation. Please contact support.';
      case 'SPECIAL_CASE_ERROR':
        return 'Special case cannot be applied with current heirs.';
      case 'MADHAB_RULE_ERROR':
        if (error instanceof MadhabRuleError) {
          return `Madhab rule error for ${error.madhab}. Please try a different madhab.`;
        }
        return 'Madhab rule error. Please try a different madhab.';
      case 'AWL_CALCULATION_ERROR':
        return 'Awl calculation error. Shares exceed the estate.';
      case 'RADD_CALCULATION_ERROR':
        return 'Radd calculation error. Remainder distribution failed.';
      case 'HIJAB_SYSTEM_ERROR':
        return 'Inheritance blocking error. Please review heir relationships.';
      case 'BLOOD_RELATIVES_ERROR':
        return 'Blood relatives distribution error. Please check the heir hierarchy.';
      default:
        return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred. Please try again.';
}
