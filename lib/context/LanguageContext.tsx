import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import { initI18n } from '../i18n';
import { APP_DEFAULTS } from '../constants/appDefaults';

// RTL languages
const RTL_LOCALES = ['ar', 'ur'];

type LanguageContextType = {
  locale: string;
  isReady: boolean;
  isRTL: boolean;
  changeLocale: (locale: string) => Promise<boolean>;
};

const LanguageContext = createContext<LanguageContextType>({
  locale: APP_DEFAULTS.DEFAULT_LOCALE,
  isReady: false,
  isRTL: false,
  changeLocale: async () => false,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocale] = useState(APP_DEFAULTS.DEFAULT_LOCALE);
  const [isReady, setIsReady] = useState(false);

  const isRTL = useMemo(() => RTL_LOCALES.includes(locale), [locale]);

  useEffect(() => {
    AsyncStorage.getItem(APP_DEFAULTS.STORAGE_KEYS.LANGUAGE_PREFERENCE)
      .then((storedLocale) => {
        const initialLocale = storedLocale || APP_DEFAULTS.DEFAULT_LOCALE;
        initI18n(initialLocale);
        setLocale(initialLocale);

        // Set RTL direction if needed
        if (RTL_LOCALES.includes(initialLocale) && !I18nManager.isRTL) {
          I18nManager.allowRTL(true);
          I18nManager.forceRTL(true);
        } else if (!RTL_LOCALES.includes(initialLocale) && I18nManager.isRTL) {
          I18nManager.allowRTL(false);
          I18nManager.forceRTL(false);
        }
      })
      .finally(() => setIsReady(true));
  }, []);

  const changeLocale = useCallback(async (nextLocale: string) => {
    initI18n(nextLocale);
    setLocale(nextLocale);

    // Update RTL direction if needed
    if (RTL_LOCALES.includes(nextLocale) && !I18nManager.isRTL) {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);
      // Note: In production, you might need to restart the app for this to take full effect
    } else if (!RTL_LOCALES.includes(nextLocale) && I18nManager.isRTL) {
      I18nManager.allowRTL(false);
      I18nManager.forceRTL(false);
    }

    await AsyncStorage.setItem(APP_DEFAULTS.STORAGE_KEYS.LANGUAGE_PREFERENCE, nextLocale);
    return true;
  }, []);

  const value = useMemo(
    () => ({ locale, isReady, isRTL, changeLocale }),
    [locale, isReady, isRTL, changeLocale]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
