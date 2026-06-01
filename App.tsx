import React, { useEffect } from 'react';
import * as Linking from 'expo-linking';
import RootNavigator from './navigation/RootNavigator';
import { ErrorBoundary } from './ErrorBoundary';
import { EducationalTutorial } from './components/EducationalTutorial';
import { AppProviders } from './lib/context/AppProviders';

export default function App() {
  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      Linking.parse(url);
      // TODO: Implement route parsing and navigation based on parsed.path
    };
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);

  return (
    <ErrorBoundary>
      <AppProviders>
        <RootNavigator />
        <EducationalTutorial />
      </AppProviders>
    </ErrorBoundary>
  );
}
