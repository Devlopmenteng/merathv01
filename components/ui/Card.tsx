import React from 'react';
import { View } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

export const Card: React.FC<{ children: React.ReactNode; style?: object; noShadow?: boolean }> = ({ children, style, noShadow }) => {
  const theme = useAppTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.md,
          ...(noShadow ? {} : theme.elevation.medium),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};
