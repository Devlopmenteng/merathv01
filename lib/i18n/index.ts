import { I18nManager } from 'react-native';
import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import en from './locales/en.json';
import ar from './locales/ar.json';

const i18n = new I18n({ en, ar });
i18n.defaultLocale = 'en';
i18n.locale = getLocales()[0]?.languageCode || 'en';
i18n.enableFallback = true;

// Ensure RTL for Arabic
if (i18n.locale === 'ar') {
  I18nManager.forceRTL(true);
}

export function initI18n(locale?: string): boolean {
  const newLocale = locale || getLocales()[0]?.languageCode || 'en';
  const wasRTL = I18nManager.isRTL;
  i18n.locale = newLocale;
  if (newLocale === 'ar') I18nManager.forceRTL(true);
  else I18nManager.forceRTL(false);
  const nowRTL = I18nManager.isRTL;
  return wasRTL !== nowRTL;
}

export const t = (key: string) => i18n.t(key);
export { i18n };
