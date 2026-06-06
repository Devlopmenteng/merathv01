// Unified Islamic-inspired design system for Merath
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
  '#1B5E3B',
  '#C8923C',
  '#A93545',
  '#2E6B8A',
  '#CC79A7',
  '#6B8E7B',
  '#B87D3A',
  '#7799BB',
];

// ── Madhab accent colors ──
const madhabColors = {
  hanafi: '#A93545',
  maliki: '#B87D3A',
  shafii: '#2E6B8A',
  hanbali: '#4A7C59',
};

// ── Light Theme — Parchment & Paradise Green ──
export const lightTheme = {
  colors: {
    primary: '#1B5E3B',
    primaryDark: '#0F3D26',
    primaryLight: '#E6F2EC',
    primaryContainer: '#E6F2EC',
    secondary: '#C8923C',
    secondaryLight: '#FDF3E3',
    secondaryContainer: '#FDF3E3',
    tertiary: '#CC79A7',
    tertiaryContainer: '#F9ECF3',
    accent: '#1A6B7A',
    accentLight: '#E4F2F5',
    success: '#2E7D32',
    successLight: '#E8F5E9',
    warning: '#E68A00',
    warningLight: '#FFF8E1',
    error: '#BA1A1A',
    errorLight: '#FFEBEE',
    errorContainer: '#FFDAD6',
    info: '#1565C0',
    infoLight: '#E3F2FD',
    background: '#FAF7F2',
    surface: '#FFFFFF',
    surfaceVariant: '#F0EBE3',
    surfaceTint: '#1B5E3B',
    outline: '#7A766C',
    outlineVariant: '#CBC4B8',
    backdrop: 'rgba(26, 20, 12, 0.55)',
    scrim: 'rgba(0, 0, 0, 0.32)',
    text: {
      primary: '#1A1612',
      secondary: '#5C5347',
      disabled: '#9E9589',
    },
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#1C1B16',
    onSurface: '#1C1B16',
    onSurfaceVariant: '#49473E',
    shadow: '#1A1612',
    chart: chartColors,
    madhab: madhabColors,
    elevationLevels: {
      level0: '#FAF7F2',
      level1: '#FFFFFF',
      level2: '#FFFFFF',
      level3: '#FFFFFF',
      level4: '#FFFFFF',
      level5: '#FFFFFF',
    },
  },
  spacing,
  borderRadius,
  typography,
  elevation,
};

// ── Dark Theme — Warm Charcoal & Luminous Green ──
export const darkTheme = {
  colors: {
    primary: '#6FCF97',
    primaryDark: '#1B5E3B',
    primaryLight: '#1A3A2A',
    primaryContainer: '#1A3A2A',
    secondary: '#F0C75E',
    secondaryLight: '#3D2E10',
    secondaryContainer: '#3D2E10',
    tertiary: '#D6B48A',
    tertiaryContainer: '#3D2E20',
    accent: '#5ABCC9',
    accentLight: '#132D32',
    success: '#66BB6A',
    successLight: '#1B3A1B',
    warning: '#FFB74D',
    warningLight: '#3D2E0A',
    error: '#EF5350',
    errorLight: '#4A1616',
    errorContainer: '#4A1616',
    info: '#42A5F5',
    infoLight: '#0D2744',
    background: '#1A1814',
    surface: '#22201C',
    surfaceVariant: '#2D2A24',
    surfaceTint: '#6FCF97',
    outline: '#8D887E',
    outlineVariant: '#44413A',
    backdrop: 'rgba(0, 0, 0, 0.7)',
    scrim: 'rgba(0, 0, 0, 0.6)',
    text: {
      primary: '#E3E0D8',
      secondary: '#C4BDB2',
      disabled: '#7A746C',
    },
    onPrimary: '#0A2A16',
    onSecondary: '#2A1E05',
    onBackground: '#E3E0D8',
    onSurface: '#E3E0D8',
    onSurfaceVariant: '#C4BDB2',
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
