// Modern design system for Merath - Inspired by HTML concept
// ─────────────────────────────────────────────────

// ── 8px grid spacing (with 2px/4px micro steps) ──
export const spacing = {
  xxxs: 2,
  xxs: 4,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
  huge: 64,
};

// ── Border radius scale ──
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 9999,
};

// ── Typography scale ──
export const typography = {
  display: { fontSize: 28, fontWeight: '700' as const, lineHeight: 40, letterSpacing: -0.5 },
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36, letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '600' as const, lineHeight: 32, letterSpacing: -0.25 },
  h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  h4: { fontSize: 18, fontWeight: '500' as const, lineHeight: 26 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  label: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20, letterSpacing: 0.1 },
  labelSmall: { fontSize: 11, fontWeight: '500' as const, lineHeight: 16, letterSpacing: 0.5 },
  mono: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  monoSmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24, letterSpacing: 0.5 },
  overline: {
    fontSize: 11,
    fontWeight: '600' as const,
    lineHeight: 16,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
};

// ── Elevation surface levels (MD3 tonal layering for dark mode) ──
const darkElevationLevels = {
  level0: '#1A1814',
  level1: '#22201C',
  level2: '#262420',
  level3: '#2A2723',
  level4: '#2C2925',
  level5: '#2E2B27',
};

// ── Elevation system ──
export const elevation = {
  none: {},
  small: {
    shadowColor: '#1A1612',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#1A1612',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: '#1A1612',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 6,
  },
};

// ── Chart palette (8 color‑blind safe colors, verified via Machado 2009) ──
const chartColors = [
  '#4f46e5', // Primary indigo
  '#10b981', // Success green
  '#f59e0b', // Warning amber
  '#ef4444', // Danger red
  '#3b82f6', // Info blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
];

// ── Madhab accent colors (HTML-inspired) ──
const madhabColors = {
  hanafi: '#dc2626', // Red gradient
  maliki: '#7c3aed', // Purple gradient
  shafii: '#059669', // Green gradient
  hanbali: '#0284c7', // Blue gradient
};

// ── Light Theme — Modern Gradient Design ──
export const lightTheme = {
  colors: {
    primary: '#4f46e5', // Indigo
    primaryDark: '#3730a3', // Darker indigo
    primaryLight: '#e0e7ff', // Light indigo
    primaryContainer: '#e0e7ff',
    secondary: '#8b5cf6', // Purple
    secondaryLight: '#ede9fe',
    secondaryContainer: '#ede9fe',
    tertiary: '#ec4899', // Pink
    tertiaryContainer: '#fce7f3',
    accent: '#06b6d4', // Cyan
    accentLight: '#cffafe',
    success: '#10b981', // Emerald
    successLight: '#d1fae5',
    warning: '#f59e0b', // Amber
    warningLight: '#fef3c7',
    error: '#ef4444', // Red
    errorLight: '#fee2e2',
    errorContainer: '#fecaca',
    info: '#3b82f6', // Blue
    infoLight: '#dbeafe',
    background: '#f8fafc', // Slate 50
    surface: '#ffffff',
    surfaceVariant: '#f1f5f9', // Slate 100
    surfaceTint: '#4f46e5',
    outline: '#cbd5e1', // Slate 300
    outlineVariant: '#e2e8f0', // Slate 200
    backdrop: 'rgba(15, 23, 42, 0.6)',
    scrim: 'rgba(0, 0, 0, 0.32)',
    text: {
      primary: '#0f172a', // Slate 900
      secondary: '#64748b', // Slate 500
      disabled: '#94a3b8', // Slate 400
    },
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    onBackground: '#0f172a',
    onSurface: '#0f172a',
    onSurfaceVariant: '#475569',
    shadow: '#1e293b', // Slate 800
    chart: chartColors,
    madhab: madhabColors,
    elevationLevels: {
      level0: '#f8fafc',
      level1: '#ffffff',
      level2: '#ffffff',
      level3: '#ffffff',
      level4: '#ffffff',
      level5: '#ffffff',
    },
  },
  spacing,
  borderRadius,
  typography,
  elevation,
};

// ── Dark Theme — Modern Dark Slate & Luminous Accents ──
export const darkTheme = {
  colors: {
    primary: '#818cf8', // Lighter indigo for dark mode
    primaryDark: '#4f46e5',
    primaryLight: '#1e1b4b',
    primaryContainer: '#1e1b4b',
    secondary: '#a78bfa', // Lighter purple
    secondaryLight: '#2e1065',
    secondaryContainer: '#2e1065',
    tertiary: '#f472b6', // Lighter pink
    tertiaryContainer: '#4a044e',
    accent: '#22d3ee', // Lighter cyan
    accentLight: '#164e63',
    success: '#34d399', // Lighter emerald
    successLight: '#064e3b',
    warning: '#fbbf24', // Lighter amber
    warningLight: '#451a03',
    error: '#f87171', // Lighter red
    errorLight: '#7f1d1d',
    errorContainer: '#450a0a',
    info: '#60a5fa', // Lighter blue
    infoLight: '#1e3a8a',
    background: '#0f172a', // Slate 900
    surface: '#1e293b', // Slate 800
    surfaceVariant: '#334155', // Slate 700
    surfaceTint: '#818cf8',
    outline: '#475569',
    outlineVariant: '#1e293b',
    backdrop: 'rgba(0, 0, 0, 0.8)',
    scrim: 'rgba(0, 0, 0, 0.7)',
    text: {
      primary: '#f1f5f9', // Slate 100
      secondary: '#cbd5e1', // Slate 300
      disabled: '#64748b', // Slate 500
    },
    onPrimary: '#0f172a',
    onSecondary: '#0f172a',
    onBackground: '#f1f5f9',
    onSurface: '#f1f5f9',
    onSurfaceVariant: '#e2e8f0',
    shadow: '#000000',
    chart: chartColors,
    madhab: madhabColors,
    elevationLevels: darkElevationLevels,
  },
  spacing,
  borderRadius,
  typography,
  elevation,
};

export type Theme = typeof lightTheme;
