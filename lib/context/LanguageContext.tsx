import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import { initI18n } from '../i18n';
import { APP_DEFAULTS } from '../constants/appDefaults';
import { InitializationService } from '../services/InitializationService';

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

  // Initialize from coordinated service instead of independent AsyncStorage fetch
  useEffect(() => {
    const initState = InitializationService.getState();
    if (initState) {
      setLocale(initState.locale);
      setIsReady(true);
    }
  }, []);

  // SEPARATE EFFECT: Apply RTL setup whenever locale changes (decoupled from render)
  useEffect(() => {
    const shouldBeRTL = RTL_LOCALES.includes(locale);
    setupRTL(shouldBeRTL);
  }, [locale]);

  const changeLocale = useCallback(
    async (nextLocale: string) => {
      // Update i18n first
      initI18n(nextLocale);
      
      // Update locale state (triggers RTL setup effect)
      setLocale(nextLocale);

      // Force re-render of all components
      forceUpdate({});

      // Persist preference
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

/**
 * Setup RTL configuration (extracted for clarity and decoupling from render cycle)
 * This function is called from InitializationService during app startup
 * and also when locale changes (but not during React render)
 */
export function setupRTL(shouldBeRTL: boolean): void {
  try {
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.allowRTL(shouldBeRTL);
      // In React Native 0.71+, this works synchronously without restart
      I18nManager.forceRTL(shouldBeRTL);
    }
  } catch (error) {
    console.warn('[LanguageContext] Failed to setup RTL:', error);
  }
}
