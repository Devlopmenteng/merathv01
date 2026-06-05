/**
 * Input Validation Utilities
 * أدوات التحقق من المدخلات
 *
 * This module provides validation functions for user inputs
 * to ensure data integrity and security.
 */

import { APP_DEFAULTS } from '../constants/appDefaults';
import { t } from '../i18n';

/**
 * Validates a monetary value
 * يتحقق من قيمة مالية
 */
export function validateMonetaryValue(value: number): { valid: boolean; error?: string } {
  if (isNaN(value)) {
    return { valid: false, error: t('invalid_number') };
  }

  if (value < APP_DEFAULTS.MIN_ESTATE_VALUE) {
    return { valid: false, error: t('value_negative') };
  }

  if (value > APP_DEFAULTS.MAX_ESTATE_VALUE) {
    return { valid: false, error: t('value_exceeds_max').replace('%{max}', String(APP_DEFAULTS.MAX_ESTATE_VALUE)) };
  }

  // Check decimal places
  const decimalPlaces = value.toString().split('.')[1]?.length || 0;
  if (decimalPlaces > APP_DEFAULTS.MAX_DECIMAL_PLACES) {
    return {
      valid: false,
      error: t('max_decimal_places').replace('%{count}', String(APP_DEFAULTS.MAX_DECIMAL_PLACES)),
    };
  }

  return { valid: true };
}

/**
 * Validates a heir count
 * يتحقق من عدد الوارثة
 */
export function validateHeirCount(
  count: number,
  heirType: string
): { valid: boolean; error?: string } {
  if (isNaN(count) || count < 0 || !Number.isInteger(count)) {
    return { valid: false, error: t('count_positive_integer') };
  }

  // Check against heir-specific limits
  if (heirType === 'wife' && count > APP_DEFAULTS.MAX_WIVES) {
    return { valid: false, error: t('max_wives').replace('%{count}', String(APP_DEFAULTS.MAX_WIVES)) };
  }

  if (heirType === 'husband' && count > APP_DEFAULTS.MAX_HUSBANDS) {
    return { valid: false, error: t('one_husband_only') };
  }

  if (count > APP_DEFAULTS.MAX_HEIR_COUNT) {
    return { valid: false, error: t('max_heirs_per_type').replace('%{count}', String(APP_DEFAULTS.MAX_HEIR_COUNT)) };
  }

  return { valid: true };
}

/**
 * Validates text input (for names, etc.)
 * يتحقق من إدخال النصوص
 */
export function validateTextInput(text: string): { valid: boolean; error?: string } {
  if (!text || text.trim().length === 0) {
    return { valid: true }; // Empty is acceptable
  }

  if (text.length > APP_DEFAULTS.MAX_TEXT_LENGTH) {
    return { valid: false, error: `Maximum ${APP_DEFAULTS.MAX_TEXT_LENGTH} characters allowed` };
  }

  // Check for potential injection attempts
  const dangerousPatterns = [
    /<script\b/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
    /vbscript:/i,
    /<iframe/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(text)) {
      return { valid: false, error: 'Invalid characters detected' };
    }
  }

  return { valid: true };
}

/**
 * Validates estate input object
 * يتحقق من كائن إدخال التركة
 */
export function validateEstateInput(estate: {
  total: number;
  funeral: number;
  debts: number;
  will: number;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate total estate
  const totalValidation = validateMonetaryValue(estate.total);
  if (!totalValidation.valid) {
    errors.push(`Total estate: ${totalValidation.error}`);
  }

  // Validate funeral expenses
  const funeralValidation = validateMonetaryValue(estate.funeral);
  if (!funeralValidation.valid) {
    errors.push(`Funeral expenses: ${funeralValidation.error}`);
  }

  // Validate debts
  const debtsValidation = validateMonetaryValue(estate.debts);
  if (!debtsValidation.valid) {
    errors.push(`Debts: ${debtsValidation.error}`);
  }

  // Validate will
  const willValidation = validateMonetaryValue(estate.will);
  if (!willValidation.valid) {
    errors.push(`Will: ${willValidation.error}`);
  }

  // Validate that deductions don't exceed total
  const totalDeductions = estate.funeral + estate.debts + estate.will;
  if (totalDeductions > estate.total) {
    errors.push(t('deductions_exceed_estate'));
  }

  // Validate will doesn't exceed 1/3 of net estate
  const netEstate = estate.total - estate.funeral - estate.debts;
  const maxWill = netEstate * APP_DEFAULTS.WILL_MAX_FRACTION;
  if (estate.will > maxWill && netEstate > 0) {
    errors.push(t('will_exceeds_third'));
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitizes user input to prevent injection attacks
 * ينظف مدخلات المستخدم لمنع هجمات الحقن
 */
export function sanitizeInput(input: string): string {
  if (!input) return input;

  // Remove any HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');

  // Remove potentially dangerous JavaScript
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  sanitized = sanitized.replace(/data:text\/html/gi, '');
  sanitized = sanitized.replace(/vbscript:/gi, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Validates heirs configuration
 * يتحقق من تكوين الورثة
 */
export function validateHeirsConfig(heirs: Record<string, number>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for invalid combination: husband + wife
  const husband = heirs.husband || 0;
  const wife = heirs.wife || 0;

  if (husband > 0 && wife > 0) {
    errors.push(t('heirs_conflict_error'));
  }

  // Validate each heir count
  for (const [heirType, count] of Object.entries(heirs)) {
    if (count > 0) {
      const validation = validateHeirCount(count, heirType);
      if (!validation.valid) {
        errors.push(`${heirType}: ${validation.error}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
