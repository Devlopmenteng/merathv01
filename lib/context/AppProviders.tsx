import React from 'react';
import { PremiumProvider } from './PremiumContext';
import { ThemeProvider } from './ThemeContext';
import { CalcProvider } from './CalcContext';
import StartupGate from './StartupGate';

export const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <PremiumProvider>
    <ThemeProvider>
      <CalcProvider>
        <StartupGate>{children}</StartupGate>
      </CalcProvider>
    </ThemeProvider>
  </PremiumProvider>
);
