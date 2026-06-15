import React, { memo } from 'react';
import { View, Text, StyleSheet, I18nManager } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

type Props = {
  text: string;
  variant?: 'fard' | 'asaba' | 'radd' | 'blocked' | 'relative' | 'awl' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
  style?: object;
};

export const Badge: React.FC<Props> = memo(({ text, variant = 'info', size = 'medium', style }) => {
  const theme = useAppTheme();

  const variantStyles = {
    fard: { backgroundColor: '#dbeafe', color: '#1d4ed8' },
    asaba: { backgroundColor: '#dcfce7', color: '#166534' },
    radd: { backgroundColor: '#fef3c7', color: '#92400e' },
    blocked: { backgroundColor: '#fee2e2', color: '#991b1b' },
    relative: { backgroundColor: '#fce7f3', color: '#be185d' },
    awl: { backgroundColor: '#e0e7ff', color: '#3730a3' },
    success: { backgroundColor: theme.colors.successLight, color: '#065f46' },
    warning: { backgroundColor: theme.colors.warningLight, color: '#92400e' },
    error: { backgroundColor: theme.colors.errorLight, color: '#991b1b' },
    info: { backgroundColor: theme.colors.infoLight, color: '#1e40af' },
  };

  const sizeStyles = {
    small: { paddingHorizontal: 8, paddingVertical: 2, fontSize: 10 },
    medium: { paddingHorizontal: 12, paddingVertical: 4, fontSize: 12 },
    large: { paddingHorizontal: 16, paddingVertical: 6, fontSize: 14 },
  };

  const currentVariant = variantStyles[variant] || variantStyles.info;
  const currentSize = sizeStyles[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: currentVariant.backgroundColor,
          paddingHorizontal: currentSize.paddingHorizontal,
          paddingVertical: currentSize.paddingVertical,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: currentVariant.color,
            fontSize: currentSize.fontSize,
            writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
          },
        ]}
      >
        {text}
      </Text>
    </View>
  );
});

Badge.displayName = 'Badge';

const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});