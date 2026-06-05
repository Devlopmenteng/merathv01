import { I18nManager } from 'react-native';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18n } from 'i18n-js';
import { APP_DEFAULTS } from '../constants/appDefaults';
import en from './locales/en.json';
import ar from './locales/ar.json';
import ms from './locales/ms.json';
import ur from './locales/ur.json';

// RTL-aware helper
export const isRTL = () => I18nManager.isRTL;
export const isLocaleRTL = (locale: string) => locale === 'ar' || locale === 'ur';

const i18n = new I18n({ en, ar, ms, ur });
i18n.defaultLocale = APP_DEFAULTS.DEFAULT_LOCALE;
i18n.locale = APP_DEFAULTS.DEFAULT_LOCALE;
i18n.enableFallback = true;

function applyRTL(locale: string) {
  const shouldBeRTL = locale === 'ar' || locale === 'ur';
  I18nManager.allowRTL(shouldBeRTL);
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.forceRTL(shouldBeRTL);
  }
}
applyRTL(i18n.locale);

export async function loadPreferredLocale(): Promise<string> {
  const stored = await AsyncStorage.getItem(APP_DEFAULTS.STORAGE_KEYS.LANGUAGE_PREFERENCE);
  return stored || APP_DEFAULTS.DEFAULT_LOCALE;
}

export async function setPreferredLocale(locale: string): Promise<void> {
  await AsyncStorage.setItem(APP_DEFAULTS.STORAGE_KEYS.LANGUAGE_PREFERENCE, locale);
}

export function initI18n(locale?: string): boolean {
  const newLocale = locale || getLocales()[0]?.languageCode || APP_DEFAULTS.DEFAULT_LOCALE;
  const wasRTL = I18nManager.isRTL;
  i18n.locale = newLocale;
  applyRTL(newLocale);
  return wasRTL !== I18nManager.isRTL;
}

export const t = (key: string, options?: Record<string, string | number>) => i18n.t(key, options);
export { i18n };
