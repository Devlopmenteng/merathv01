import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_DEFAULTS } from '../constants/appDefaults';

type PremiumContextType = {
  isPremium: boolean;
  isReady: boolean;
  togglePremium: () => void;
};

const PremiumContext = createContext<PremiumContextType>({
  isPremium: false,
  isReady: false,
  togglePremium: () => {},
});

export const PremiumProvider = ({ children }: { children: React.ReactNode }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(APP_DEFAULTS.STORAGE_KEYS.PREMIUM)
      .then((val) => {
        setIsPremium(val === 'true');
      })
      .finally(() => setIsReady(true));
  }, []);

  const togglePremium = React.useCallback(() => {
    setIsPremium((current) => {
      const next = !current;
      AsyncStorage.setItem(APP_DEFAULTS.STORAGE_KEYS.PREMIUM, next ? 'true' : 'false');
      return next;
    });
  }, []);

  const value = React.useMemo(
    () => ({ isPremium, isReady, togglePremium }),
    [isPremium, isReady, togglePremium]
  );

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
};

export const usePremium = () => useContext(PremiumContext);
