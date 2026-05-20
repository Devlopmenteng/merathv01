import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from './ThemeContext';
import { usePremium } from './PremiumContext';
import { initI18n } from '../i18n';

export const StartupGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isReady: themeReady } = useTheme();
  const { isReady: premiumReady } = usePremium();
  const [localeReady, setLocaleReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem('lang')
      .then((val) => {
        const needsReload = initI18n(val || undefined);
        // if RTL flip required, log or handle; currently we just continue
        if (mounted) setLocaleReady(true);
      })
      .catch(() => {
        if (mounted) setLocaleReady(true);
      });
    return () => { mounted = false; };
  }, []);

  if (!themeReady || !premiumReady || !localeReady) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default StartupGate;
