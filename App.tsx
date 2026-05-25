import React from 'react';
import { useEffect } from "react";
import * as Linking from "expo-linking";
import { PremiumProvider } from './lib/context/PremiumContext';
import { ThemeProvider } from './lib/context/ThemeContext';
import { CalcProvider } from './lib/context/CalcContext';
import RootNavigator from './navigation/RootNavigator';
import { ErrorBoundary } from './ErrorBoundary';
import { EducationalTutorial } from "./components/EducationalTutorial";
import StartupGate from './lib/context/StartupGate';

export default function App() {
  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      // Parse URL and navigate
      const parsed = Linking.parse(url);
      // TODO: Implement route parsing and navigation based on parsed.path
    };
    const subscription = Linking.addEventListener("url", handleDeepLink);
    return () => subscription.remove();
  }, []);
  return (
    <ErrorBoundary>
      <PremiumProvider>
        <ThemeProvider>
          <CalcProvider>
            <StartupGate>
              <RootNavigator />
              <EducationalTutorial />
            </StartupGate>
          </CalcProvider>
        </ThemeProvider>
      </PremiumProvider>
    </ErrorBoundary>
  );
}
