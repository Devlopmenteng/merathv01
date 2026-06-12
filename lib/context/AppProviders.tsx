import React, { useEffect } from 'react';
import { PremiumProvider } from './PremiumContext';
import { ThemeProvider } from './ThemeContext';
import { LanguageProvider } from './LanguageContext';
import { CalcProvider } from './CalcContext';
import { initializeOfflineCache } from '../services/OfflineCacheService';

export const AppProviders = React.memo(({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Initialize offline cache on app start
    initializeOfflineCache().catch((error) => {
      console.error('Failed to initialize offline cache:', error);
    });
  }, []);

  return (
    <PremiumProvider>
      <ThemeProvider>
        <LanguageProvider>
          <CalcProvider>{children}</CalcProvider>
        </LanguageProvider>
      </ThemeProvider>
    </PremiumProvider>
  );
});
