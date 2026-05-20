import { I18nManager } from 'react-native';
import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import en from './locales/en.json';
import ar from './locales/ar.json';

const i18n = new I18n({ en, ar });
// set a sensible default but allow explicit initialization
i18n.locale = getLocales()[0]?.languageCode || 'en';
i18n.enableFallback = true;

/**
 * Initialize or switch the app locale. Call this from startup or when user changes language.
 * Returns true if RTL was enabled and a full app reload may be required to apply layout.
 */
export function initI18n(locale?: string): boolean {
  const newLocale = locale || getLocales()[0]?.languageCode || 'en';
  const wasRTL = I18nManager.isRTL;
  i18n.locale = newLocale;
  // Force RTL for Arabic; note: flipping RTL typically requires app reload to fully apply
  if (newLocale === 'ar') I18nManager.forceRTL(true);
  else I18nManager.forceRTL(false);
  const nowRTL = I18nManager.isRTL;
  return wasRTL !== nowRTL;
}

export const t = (key: string) => i18n.t(key);
export { i18n };
import { I18nManager } from 'react-native';
import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import en from './locales/en.json';
import ar from './locales/ar.json';

const i18n = new I18n({ en, ar });
i18n.locale = getLocales()[0]?.languageCode || 'en';
i18n.enableFallback = true;

// Enable RTL if Arabic
if (i18n.locale === 'ar') {
  I18nManager.forceRTL(true);
}

export const t = (key: string) => i18n.t(key);
