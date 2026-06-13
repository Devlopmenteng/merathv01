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
  changeLocale: (locale: string) => Promise<void>;
  forceUpdate: () => void;
};

const LanguageContext = createContext<LanguageContextType>({
  locale: APP_DEFAULTS.DEFAULT_LOCALE,
  isReady: false,
  isRTL: false,
  changeLocale: async () => {},
  forceUpdate: () => {},
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocale] = useState(APP_DEFAULTS.DEFAULT_LOCALE);
  const [isReady, setIsReady] = useState(false);
  const [, forceUpdate] = useState({});

  const isRTL = useMemo(() => RTL_LOCALES.includes(locale), [locale]);

  useEffect(() => {
    AsyncStorage.getItem(APP_DEFAULTS.STORAGE_KEYS.LANGUAGE_PREFERENCE)
      .then((storedLocale) => {
        const initialLocale = storedLocale || APP_DEFAULTS.DEFAULT_LOCALE;
        initI18n(initialLocale);
        setLocale(initialLocale);

        // Set RTL direction if needed
        const shouldBeRTL = RTL_LOCALES.includes(initialLocale);
        I18nManager.allowRTL(shouldBeRTL);

        // In React Native 0.71+, forceRTL works synchronously without restart
        if (I18nManager.isRTL !== shouldBeRTL) {
          I18nManager.forceRTL(shouldBeRTL);
        }
      })
      .finally(() => setIsReady(true));
  }, []);

  const changeLocale = useCallback(
    async (nextLocale: string) => {
      initI18n(nextLocale);
      setLocale(nextLocale);

      // Force re-render of all components by updating state
      forceUpdate({});

      // Update RTL direction
      const shouldBeRTL = RTL_LOCALES.includes(nextLocale);
      I18nManager.allowRTL(shouldBeRTL);

      // In React Native 0.71+, this works synchronously without restart
      if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.forceRTL(shouldBeRTL);
      }

      await AsyncStorage.setItem(APP_DEFAULTS.STORAGE_KEYS.LANGUAGE_PREFERENCE, nextLocale);
    },
    [forceUpdate]
  );

  const triggerUpdate = useCallback(() => forceUpdate({}), [forceUpdate]);

  const value = useMemo(
    () => ({ locale, isReady, isRTL, changeLocale, forceUpdate: triggerUpdate }),
    [locale, isReady, isRTL, changeLocale, triggerUpdate]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
