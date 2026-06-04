import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

type Props = {
  children: React.ReactNode;
  style?: object;
  noShadow?: boolean;
  elevation?: 'none' | 'small' | 'medium' | 'large';
  padding?: 'none' | 'sm' | 'md' | 'lg';
};

export const Card: React.FC<Props> = ({
  children,
  style,
  noShadow = false,
  elevation = 'medium',
  padding = 'lg',
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
        return theme.spacing.lg;
    }
  };

  const getElevation = () => {
    if (noShadow) return {};
    switch (elevation) {
      case 'none':
        return theme.elevation.none;
      case 'small':
        return theme.elevation.small;
      case 'large':
        return theme.elevation.large;
      case 'medium':
      default:
        return theme.elevation.medium;
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: getPadding(),
          marginBottom: theme.spacing.md,
          borderWidth: 1,
          borderColor: theme.colors.outline,
          ...getElevation(),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});
