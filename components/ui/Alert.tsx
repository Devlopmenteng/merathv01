import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from './AppText';

type Props = {
  title?: string;
  message: string;
  variant?: 'success' | 'warning' | 'danger' | 'info';
  style?: object;
};

export const Alert: React.FC<Props> = memo(({ title, message, variant = 'info', style }) => {
  const theme = useAppTheme();

  const variantConfig = {
    success: {
      gradient: ['#d1fae5', '#a7f3d0'] as const,
      borderColor: theme.colors.success,
      textColor: '#065f46',
      icon: '✓',
    },
    warning: {
      gradient: ['#fef3c7', '#fde68a'] as const,
      borderColor: theme.colors.warning,
      textColor: '#92400e',
      icon: '⚠️',
    },
    danger: {
      gradient: ['#fee2e2', '#fecaca'] as const,
      borderColor: theme.colors.error,
      textColor: '#991b1b',
      icon: '✕',
    },
    info: {
      gradient: ['#dbeafe', '#bfdbfe'] as const,
      borderColor: theme.colors.info,
      textColor: '#1e40af',
      icon: 'ℹ️',
    },
  };

  const config = variantConfig[variant];

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={config.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.content, { borderLeftColor: config.borderColor }]}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{config.icon}</Text>
        </View>
        <View style={styles.textContainer}>
          {title && (
            <AppText variant="body" color={config.textColor} style={styles.title}>
              {title}
            </AppText>
          )}
          <AppText variant="bodySmall" color={config.textColor}>
            {message}
          </AppText>
        </View>
      </LinearGradient>
    </View>
  );
});

Alert.displayName = 'Alert';

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  icon: {
    fontSize: 18,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    marginBottom: 4,
  },
});
