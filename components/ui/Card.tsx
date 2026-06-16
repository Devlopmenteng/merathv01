import React, { useMemo, memo } from 'react';
import {
  View,
  TouchableOpacity,
  ViewStyle,
  AccessibilityRole,
  AccessibilityState,
} from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

type CardVariant = 'elevated' | 'outlined' | 'filled' | 'tonal';

type CardProps = {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  leftBorder?: string;
  onPress?: () => void;
  style?: ViewStyle;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
  accessibilityState?: { selected?: boolean; disabled?: boolean; expanded?: boolean };
};

export const Card: React.FC<CardProps> = memo(
  ({
    children,
    variant = 'elevated',
    padding = 'md',
    leftBorder,
    onPress,
    style,
    accessible,
    accessibilityLabel,
    accessibilityHint,
    accessibilityRole,
    accessibilityState,
  }) => {
    const theme = useAppTheme();

    const paddingValue = useMemo(() => {
      switch (padding) {
        case 'none':
          return 0;
        case 'sm':
          return theme.spacing.sm;
        case 'md':
          return theme.spacing.md;
        case 'lg':
          return theme.spacing.lg;
        default:
          return theme.spacing.md;
      }
    }, [padding, theme.spacing.sm, theme.spacing.md, theme.spacing.lg]);

    const variantStyle = useMemo((): ViewStyle => {
      switch (variant) {
        case 'elevated':
          return {
            backgroundColor: theme.colors.surface,
            ...theme.elevation.medium,
          };
        case 'outlined':
          return {
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.outline,
          };
        case 'filled':
          return {
            backgroundColor: theme.colors.surfaceVariant,
          };
        case 'tonal':
          return {
            backgroundColor: theme.colors.primaryContainer,
          };
        default:
          return {
            backgroundColor: theme.colors.surface,
            ...theme.elevation.medium,
          };
      }
    }, [
      variant,
      theme.colors.surface,
      theme.colors.surfaceVariant,
      theme.colors.primaryContainer,
      theme.colors.outline,
      theme.elevation.medium,
    ]);

    const containerStyle = useMemo(
      (): ViewStyle => ({
        padding: paddingValue,
        borderRadius: theme.borderRadius.lg,
        marginBottom: theme.spacing.md,
        ...(leftBorder
          ? {
              borderLeftWidth: 4,
              borderLeftColor: leftBorder,
              overflow: 'hidden' as const,
            }
          : {}),
        ...variantStyle,
      }),
      [theme.borderRadius.lg, paddingValue, theme.spacing.md, leftBorder, variantStyle]
    );

    if (onPress) {
      return (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPress}
          style={[containerStyle, style, { minHeight: 44 }]}
          accessibilityRole={(accessibilityRole as AccessibilityRole) || 'button'}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityState={accessibilityState as AccessibilityState}
        >
          {children}
        </TouchableOpacity>
      );
    }

    return (
      <View
        style={[containerStyle, style]}
        accessible={accessible}
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </View>
    );
  }
);

Card.displayName = 'Card';
