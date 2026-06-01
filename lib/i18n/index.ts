import { I18nManager } from 'react-native';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18n } from 'i18n-js';
import { APP_DEFAULTS } from '../constants/appDefaults';
import en from './locales/en.json';
import ar from './locales/ar.json';

const i18n = new I18n({ en, ar });
i18n.defaultLocale = APP_DEFAULTS.DEFAULT_LOCALE;
i18n.locale = APP_DEFAULTS.DEFAULT_LOCALE;
i18n.enableFallback = true;

// Ensure RTL for Arabic
if (i18n.locale === 'ar') {
  I18nManager.forceRTL(true);
}

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
  if (newLocale === 'ar') I18nManager.forceRTL(true);
  else I18nManager.forceRTL(false);
  const nowRTL = I18nManager.isRTL;
  return wasRTL !== nowRTL;
}

export const t = (key: string) => i18n.t(key);
export { i18n };
