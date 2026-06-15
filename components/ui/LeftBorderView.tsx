import React from 'react';
import { View, ViewStyle, I18nManager } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

type Props = {
  children: React.ReactNode;
  color?: string;
  style?: ViewStyle;
  padding?: number;
};

export const LeftBorderView: React.FC<Props> = ({ children, color, style, padding = 16 }) => {
  const theme = useAppTheme();
  const borderColor = color || theme.colors.primary;
  const borderProp = I18nManager.isRTL ? { borderRightWidth: 4, borderRightColor: borderColor } : { borderLeftWidth: 4, borderLeftColor: borderColor };
  return (
    <View style={[{ padding, marginBottom: 8 }, borderProp, style]}>
      {children}
    </View>
  );
};
