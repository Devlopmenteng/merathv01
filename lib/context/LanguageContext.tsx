import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initI18n } from '../i18n';
import { APP_DEFAULTS } from '../constants/appDefaults';

type LanguageContextType = {
  locale: string;
  isReady: boolean;
  changeLocale: (locale: string) => Promise<boolean>;
};

const LanguageContext = createContext<LanguageContextType>({
  locale: APP_DEFAULTS.DEFAULT_LOCALE,
  isReady: false,
  changeLocale: async () => false,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocale] = useState(APP_DEFAULTS.DEFAULT_LOCALE);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(APP_DEFAULTS.STORAGE_KEYS.LANGUAGE_PREFERENCE)
      .then((storedLocale) => {
        const initialLocale = storedLocale || APP_DEFAULTS.DEFAULT_LOCALE;
        initI18n(initialLocale);
        setLocale(initialLocale);
      })
      .finally(() => setIsReady(true));
  }, []);

  const changeLocale = useCallback(async (nextLocale: string) => {
    initI18n(nextLocale);
    setLocale(nextLocale);
    await AsyncStorage.setItem(APP_DEFAULTS.STORAGE_KEYS.LANGUAGE_PREFERENCE, nextLocale);
    return true;
  }, []);

  const value = useMemo(
    () => ({ locale, isReady, changeLocale }),
    [locale, isReady, changeLocale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
