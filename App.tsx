import React from 'react';
import { PremiumProvider } from './lib/context/PremiumContext';
import { ThemeProvider } from './lib/context/ThemeContext';
import RootNavigator from './navigation/RootNavigator';
import { ErrorBoundary } from './ErrorBoundary';
import StartupGate from './lib/context/StartupGate';

export default function App() {
  return (
    <ErrorBoundary>
      <PremiumProvider>
        <ThemeProvider>
          <StartupGate>
            <RootNavigator />
          </StartupGate>
        </ThemeProvider>
      </PremiumProvider>
    </ErrorBoundary>
  );
}
