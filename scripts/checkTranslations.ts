/**
 * Quick script to check translation coverage
 */

// @ts-ignore - Utility script, type safety not critical
const en = require('../lib/i18n/locales/en.json');
const ar = require('../lib/i18n/locales/ar.json');
const ms = require('../lib/i18n/locales/ms.json');
const ur = require('../lib/i18n/locales/ur.json');

function getAllKeys(obj: any, prefix = ''): string[] {
  let keys: string[] = [];
  for (const key in obj) {
    const newPrefix = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], newPrefix));
    } else {
      keys.push(newPrefix);
    }
  }
  return keys;
}

const translations: Record<string, Record<string, unknown>> = { en, ar, ms, ur };
const referenceKeys = getAllKeys(en);

console.log('=== Translation Coverage Check ===\n');
console.log(`Reference (en): ${referenceKeys.length} keys\n`);

for (const locale in translations) {
  if (locale === 'en') continue;

  const keys = getAllKeys(translations[locale]);
  const missing = referenceKeys.filter((key) => !keys.includes(key));
  const coverage = Math.round(((keys.length - missing.length) / referenceKeys.length) * 100);

  console.log(`${locale}: ${coverage}% coverage (${keys.length} total, ${missing.length} missing)`);

  if (missing.length > 0) {
    console.log(`  Missing keys (first 10):`);
    missing.slice(0, 10).forEach((key: string) => console.log(`    - ${key}`));
    if (missing.length > 10) {
      console.log(`    ... and ${missing.length - 10} more`);
    }
  }
  console.log('');
}
