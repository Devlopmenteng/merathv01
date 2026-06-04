// Professional 8px grid spacing system
export const spacing = {
  xs: 4, // 0.5 grid units
  sm: 8, // 1 grid unit
  md: 16, // 2 grid units
  lg: 24, // 3 grid units
  xl: 32, // 4 grid units
  xxl: 48, // 6 grid units
  xxxl: 64, // 8 grid units
};

// Consistent border radius scale
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 9999,
};

// Enhanced typography with better hierarchy and readability
export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36, letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '600' as const, lineHeight: 32, letterSpacing: -0.25 },
  h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  h4: { fontSize: 18, fontWeight: '600' as const, lineHeight: 26 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24, letterSpacing: 0.5 },
  overline: {
    fontSize: 11,
    fontWeight: '600' as const,
    lineHeight: 16,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
};

// Enhanced elevation system with color-tinted shadows
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

// Professional light theme with refined colors
export const lightTheme = {
  colors: {
    primary: '#0A5E4A', // Deeper, more professional teal
    primaryDark: '#084A3A',
    primaryLight: '#E8F5F1', // Softer accent
    secondary: '#C49A2A', // More refined gold
    secondaryLight: '#FEF5E6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    dangerLight: '#FEE2E2',
    background: '#F8FAFC', // Light gray base
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

// Professional dark theme with better contrast
export const darkTheme = {
  colors: {
    primary: '#2DD4BF',
    primaryDark: '#0F766E',
    primaryLight: '#134E4A',
    secondary: '#FBBF24',
    secondaryLight: '#422006',
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
