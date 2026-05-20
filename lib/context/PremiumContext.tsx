import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    AsyncStorage.getItem('merath_premium')
      .then((val) => {
        setIsPremium(val === 'true');
      })
      .finally(() => setIsReady(true));
  }, []);

  const togglePremium = () => {
    const next = !isPremium;
    setIsPremium(next);
    AsyncStorage.setItem('merath_premium', next ? 'true' : 'false');
  };

  return (
    <PremiumContext.Provider value={{ isPremium, isReady, togglePremium }}>
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = () => useContext(PremiumContext);
