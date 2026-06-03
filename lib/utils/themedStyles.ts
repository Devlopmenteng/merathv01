import type { TextStyle, ViewStyle } from 'react-native';

type ThemeColors = { outline: string; onSurface: string };
type ThemeSpacing = { sm: number; md: number };
type ThemeRadius = { md: number };

export function themedTextInputStyle(
  colors: ThemeColors,
  spacing: ThemeSpacing,
  radius: ThemeRadius,
): ViewStyle & TextStyle {
  return {
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
    color: colors.onSurface,
  };
}
