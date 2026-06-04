import React, { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './navigation/RootNavigator';
import { ErrorBoundary } from './ErrorBoundary';
import { EducationalTutorial } from './components/EducationalTutorial';
import { AppProviders } from './lib/context/AppProviders';
import { useTheme } from './lib/context/ThemeContext';
import { useLanguage } from './lib/context/LanguageContext';

function AppContent() {
  const { isDark } = useTheme();
  const { locale } = useLanguage();

  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      Linking.parse(url);
      // TODO: Implement route parsing and navigation based on parsed.path
    };
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator key={locale} />
      <EducationalTutorial key={`tutorial-${locale}`} />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppContent />
      </AppProviders>
    </ErrorBoundary>
  );
}
