import React from 'react';
import { PremiumProvider } from './PremiumContext';
import { ThemeProvider } from './ThemeContext';
import { LanguageProvider } from './LanguageContext';
import { CalcProvider } from './CalcContext';
import StartupGate from './StartupGate';

export const AppProviders = React.memo(({ children }: { children: React.ReactNode }) => (
  <PremiumProvider>
    <ThemeProvider>
      <LanguageProvider>
        <CalcProvider>
          <StartupGate>{children}</StartupGate>
        </CalcProvider>
      </LanguageProvider>
    </ThemeProvider>
  </PremiumProvider>
));
