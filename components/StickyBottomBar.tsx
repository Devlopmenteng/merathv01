import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { t } from '../lib/i18n';

interface StickyBottomBarProps {
  onCompare: () => void;
  onHistory: () => void;
  onSettings: () => void;
  onPDF: () => void;
}

export const StickyBottomBar: React.FC<StickyBottomBarProps> = ({
  onCompare,
  onHistory,
  onSettings,
  onPDF,
}) => {
  const theme = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outline }]}>
      <TouchableOpacity style={styles.button} onPress={onCompare}>
        <Text style={[styles.buttonText, { color: theme.colors.primary }]}>{t('compare')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onHistory}>
        <Text style={[styles.buttonText, { color: theme.colors.primary }]}>{t('history')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onSettings}>
        <Text style={[styles.buttonText, { color: theme.colors.primary }]}>{t('settings')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onPDF}>
        <Text style={[styles.buttonText, { color: theme.colors.primary }]}>{t('pdf')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
