import { colors as baseColors } from './colors';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const typography = {
  h1: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
};

export const elevation = {
  none: {},
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
};

export const lightTheme = {
  colors: {
    primary: baseColors.primary,
    primaryDark: baseColors.primaryDark,
    primaryLight: baseColors.primaryLight,
    secondary: baseColors.info,
    success: baseColors.success,
    warning: baseColors.warning,
    error: baseColors.danger,
    dangerLight: baseColors.dangerLight,
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceVariant: '#F1F5F9',
    outline: '#E2E8F0',
    text: {
      primary: '#0F172A',
      secondary: '#475569',
      disabled: '#94A3B8',
    },
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#0F172A',
    onSurface: '#0F172A',
    shadow: '#000000',
  },
  spacing,
  borderRadius,
  radius: borderRadius,
  typography,
  elevation,
};

export const darkTheme = {
  colors: {
    primary: '#2DD4BF',
    primaryDark: '#0F766E',
    primaryLight: '#134E4A',
    secondary: '#FBBF24',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    dangerLight: '#7f1d1d',
    background: '#0F172A',
    surface: '#1E293B',
    surfaceVariant: '#334155',
    outline: '#475569',
    text: {
      primary: '#F1F5F9',
      secondary: '#CBD5E1',
      disabled: '#64748B',
    },
    onPrimary: '#0F172A',
    onSecondary: '#0F172A',
    onBackground: '#F1F5F9',
    onSurface: '#F1F5F9',
    shadow: '#000000',
  },
  spacing,
  borderRadius,
  radius: borderRadius,
  typography,
  elevation,
};

export type Theme = typeof lightTheme;
