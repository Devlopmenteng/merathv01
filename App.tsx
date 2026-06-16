import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  NotoNaskhArabic_400Regular,
  NotoNaskhArabic_500Medium,
  NotoNaskhArabic_600SemiBold,
  NotoNaskhArabic_700Bold,
} from '@expo-google-fonts/noto-naskh-arabic';
import RootNavigator from './navigation/RootNavigator';
import { ErrorBoundary } from './ErrorBoundary';
import { EducationalTutorial } from './components/EducationalTutorial';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AppProviders } from './lib/context/AppProviders';
import { useTheme } from './lib/context/ThemeContext';
import { lightTheme } from './lib/constants/theme';
import { InitializationService } from './lib/services/InitializationService';

function AppContent() {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <OfflineIndicator />
      <RootNavigator />
      <EducationalTutorial />
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    NotoNaskhArabic_400Regular,
    NotoNaskhArabic_500Medium,
    NotoNaskhArabic_600SemiBold,
    NotoNaskhArabic_700Bold,
  });

  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Initialize app services (AsyncStorage, i18n, RTL) before rendering contexts
    InitializationService.initialize()
      .then(() => {
        setAppReady(true);
      })
      .catch((error) => {
        console.error('[App] Initialization failed:', error);
        // Still render app even if initialization fails
        setAppReady(true);
      });
  }, []);

  if (!fontsLoaded || !appReady) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={lightTheme.colors.primary} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <AppProviders>
        <AppContent />
      </AppProviders>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: lightTheme.colors.background,
  },
});
