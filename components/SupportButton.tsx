import React from 'react';
import { TouchableOpacity, Text, Linking } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { t } from '../lib/i18n';

export const SupportButton = () => {
  const theme = useAppTheme();

  return (
    <TouchableOpacity
      accessibilityLabel={t('_support_us')}
      onPress={() => Linking.openURL('https://merath.app/support')}
      style={{
        padding: theme.spacing.md,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.sm,
        marginVertical: theme.spacing.sm,
      }}
    >
      <Text style={{ color: theme.colors.onPrimary, textAlign: 'center' }}>{t('_support_us')}</Text>
    </TouchableOpacity>
  );
};
