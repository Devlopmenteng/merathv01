import React from 'react';
import { PremiumProvider } from './PremiumContext';
import { ThemeProvider } from './ThemeContext';
import { LanguageProvider } from './LanguageContext';
import { CalcProvider } from './CalcContext';

export const AppProviders = React.memo(({ children }: { children: React.ReactNode }) => (
  <PremiumProvider>
    <ThemeProvider>
      <LanguageProvider>
        <CalcProvider>{children}</CalcProvider>
      </LanguageProvider>
    </ThemeProvider>
  </PremiumProvider>
));
