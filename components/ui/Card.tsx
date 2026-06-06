import React from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
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
};

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'md',
  leftBorder,
  onPress,
  style,
  accessible,
  accessibilityLabel,
}) => {
  const theme = useAppTheme();

  const getPadding = () => {
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
  };

  const variantStyles = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: theme.colors.surface,
          ...theme.elevation.medium,
          borderWidth: 0,
        };
      case 'outlined':
        return {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.outline,
          ...theme.elevation.none,
        };
      case 'filled':
        return {
          backgroundColor: theme.colors.surfaceVariant,
          borderWidth: 0,
          ...theme.elevation.none,
        };
      case 'tonal':
        return {
          backgroundColor: theme.colors.primaryContainer,
          borderWidth: 0,
          ...theme.elevation.none,
        };
      default:
        return {
          backgroundColor: theme.colors.surface,
          ...theme.elevation.medium,
          borderWidth: 0,
        };
    }
  };

  const containerStyle: ViewStyle = {
    borderRadius: theme.borderRadius.lg,
    padding: getPadding(),
    marginBottom: theme.spacing.md,
    ...(leftBorder
      ? {
          borderLeftWidth: 4,
          borderLeftColor: leftBorder,
          overflow: 'hidden' as const,
        }
      : {}),
    ...variantStyles(),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[containerStyle, style]}
        accessibilityRole="button"
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
};
