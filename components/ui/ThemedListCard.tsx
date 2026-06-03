import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

type Props = {
  children: React.ReactNode;
  accentColor?: string;
  style?: ViewStyle;
};

export const ThemedListCard: React.FC<Props> = ({ children, accentColor, style }) => {
  const theme = useAppTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.md,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.md,
          ...(accentColor ? { borderLeftWidth: 4, borderLeftColor: accentColor } : {}),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};
