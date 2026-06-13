/**
 * Translation Key Validator
 * مدقق مفاتي الترجمة
 *
 * This module provides utilities to validate translation keys and detect
 * missing or inconsistent translations across locale files.
 *
 * @module lib/utils/translationValidator
 */

import { i18n } from '../i18n';
import en from '../i18n/locales/en.json';
import ar from '../i18n/locales/ar.json';
import ms from '../i18n/locales/ms.json';
import ur from '../i18n/locales/ur.json';

/**
 * Translation validation result
 */
export interface ValidationResult {
  isValid: boolean;
  missingKeys: Record<string, string[]>; // locale -> missing keys
  extraKeys: Record<string, string[]>; // locale -> keys not in reference
  totalKeys: Record<string, number>; // locale -> total key count
  inconsistencies: string[]; // descriptions of inconsistencies found
}

/**
 * Get all translation files
 */
const translations = {
  en,
  ar,
  ms,
  ur,
} as const;

/**
 * Get all nested keys from an object
 */
function getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  let keys: string[] = [];

  for (const key in obj) {
    const newPrefix = prefix ? `${prefix}.${key}` : key;

    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key] as Record<string, unknown>, newPrefix));
    } else {
      keys.push(newPrefix);
    }
  }

  return keys;
}

/**
 * Validate translation keys across all locales
 */
export function validateTranslations(referenceLocale: string = 'en'): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    missingKeys: {},
    extraKeys: {},
    totalKeys: {},
    inconsistencies: [],
  };

  // Use reference locale (default to English)
  const reference = translations[referenceLocale as keyof typeof translations] || en;
  const referenceKeys = getAllKeys(reference);

  // Calculate total keys for each locale
  for (const locale in translations) {
    const translation = translations[locale as keyof typeof translations];
    const keys = getAllKeys(translation);
    result.totalKeys[locale] = keys.length;
  }

  // Check for missing keys in each locale
  for (const locale in translations) {
    if (locale === referenceLocale) continue;

    const translation = translations[locale as keyof typeof translations];
    const keys = getAllKeys(translation);
    const missing = referenceKeys.filter((key) => !keys.includes(key));

    if (missing.length > 0) {
      result.missingKeys[locale] = missing;
      result.isValid = false;
    }

    // Check for extra keys (keys that exist but not in reference)
    const extra = keys.filter((key) => !referenceKeys.includes(key));
    if (extra.length > 0) {
      result.extraKeys[locale] = extra;
    }
  }

  return result;
}

/**
 * Check if a specific translation key exists in the current locale
 */
export function hasTranslationKey(key: string): boolean {
  try {
    const translation = i18n.t(key);
    // If the key is returned as-is (with no interpolation), it might be missing
    // This is a simple heuristic - for production, you'd want a more robust check
    return translation !== key;
  } catch {
    return false;
  }
}

/**
 * Get missing keys for a specific locale compared to reference
 */
export function getMissingKeysForLocale(locale: string, referenceLocale: string = 'en'): string[] {
  const reference = translations[referenceLocale as keyof typeof translations] || en;
  const target = translations[locale as keyof typeof translations];

  if (!target) {
    return getAllKeys(reference);
  }

  const referenceKeys = getAllKeys(reference);
  const targetKeys = getAllKeys(target);

  return referenceKeys.filter((key) => !targetKeys.includes(key));
}

/**
 * Get translation statistics
 */
export function getTranslationStats(): Record<
  string,
  { total: number; missing: number; coverage: number }
> {
  const stats: Record<string, { total: number; missing: number; coverage: number }> = {};
  const validation = validateTranslations();

  for (const locale in translations) {
    const total = validation.totalKeys[locale] || 0;
    const missing = validation.missingKeys[locale]?.length || 0;
    stats[locale] = {
      total,
      missing,
      coverage: total > 0 ? Math.round((1 - missing / total) * 100) : 0,
    };
  }

  return stats;
}

/**
 * Print translation validation report (useful for debugging)
 */
export function printValidationReport(referenceLocale: string = 'en'): void {
  const result = validateTranslations(referenceLocale);

  console.log('=== Translation Validation Report ===');
  console.log(`Reference Locale: ${referenceLocale}`);
  console.log(`Total Keys: ${result.totalKeys[referenceLocale]}`);
  console.log('');

  console.log('Coverage by Locale:');
  for (const locale in result.totalKeys) {
    const missing = result.missingKeys[locale]?.length || 0;
    const total = result.totalKeys[locale];
    const coverage = total > 0 ? Math.round(((total - missing) / total) * 100) : 0;
    console.log(`  ${locale}: ${coverage}% (${total} total, ${missing} missing)`);

    if (result.missingKeys[locale]?.length > 0) {
      console.log(`    Missing keys: ${result.missingKeys[locale].slice(0, 5).join(', ')}...`);
    }
  }

  if (result.isValid) {
    console.log('');
    console.log('✅ All translations are valid!');
  } else {
    console.log('');
    console.log('❌ Translation issues found. Please fix the missing keys.');
  }
}
