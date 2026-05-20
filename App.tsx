import React from 'react';
import { useEffect } from "react";
import * as Linking from "expo-linking";
import { PremiumProvider } from './lib/context/PremiumContext';
import { ThemeProvider } from './lib/context/ThemeContext';
import RootNavigator from './navigation/RootNavigator';
import { ErrorBoundary } from './ErrorBoundary';
import StartupGate from './lib/context/StartupGate';

export default function App() {
  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      // Parse URL and navigate
      console.log("Deep link:", url);
    };
    const subscription = Linking.addEventListener("url", handleDeepLink);
    return () => subscription.remove();
  }, []);
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
