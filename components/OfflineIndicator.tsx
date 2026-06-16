import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { AppText } from './ui/AppText';

export const OfflineIndicator: React.FC = () => {
  const theme = useAppTheme();
  const { isConnected } = useNetworkStatus();

  if (isConnected) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.error }]}>
      <AppText variant="caption" color={theme.colors.onSurface} style={styles.text}>
        ⚠️ You're offline. Some features may be limited.
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  text: {
    fontWeight: '600',
  },
});
