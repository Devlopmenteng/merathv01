import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export const OfflineIndicator: React.FC = () => {
  const theme = useAppTheme();
  const { isConnected } = useNetworkStatus();

  if (isConnected) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.error }]}>
      <Text style={[styles.text, { color: theme.colors.onSurface }]}>
        ⚠️ You're offline. Some features may be limited.
      </Text>
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
    fontSize: 12,
    fontWeight: '600',
  },
});
