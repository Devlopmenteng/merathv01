import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_DEFAULTS } from '../constants/appDefaults';
import { InitializationService } from '../services/InitializationService';

type PremiumContextType = {
  isPremium: boolean;
  isReady: boolean;
  togglePremium: () => void;
};

export const PremiumContext = createContext<PremiumContextType>({
  isPremium: false,
  isReady: false,
  togglePremium: () => {},
});

export const PremiumProvider = ({ children }: { children: React.ReactNode }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Initialize from coordinated service instead of independent AsyncStorage fetch
  useEffect(() => {
    const initState = InitializationService.getState();
    if (initState) {
      setIsPremium(initState.isPremium);
      setIsReady(true);
    }
  }, []);

  const togglePremium = useCallback(() => {
    setIsPremium((current) => {
      const next = !current;
      AsyncStorage.setItem(APP_DEFAULTS.STORAGE_KEYS.PREMIUM, next ? 'true' : 'false');
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ isPremium, isReady, togglePremium }),
    [isPremium, isReady, togglePremium]
  );

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
};

export const usePremium = () => useContext(PremiumContext);
