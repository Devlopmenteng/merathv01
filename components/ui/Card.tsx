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
          borderRadius: theme.radius.lg,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.md,
          ...(noShadow ? {} : {
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};
