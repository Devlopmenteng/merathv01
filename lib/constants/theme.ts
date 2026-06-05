// Unified Islamic-inspired design system for Merath
// ─────────────────────────────────────────────────

// ── 8px grid spacing ──
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
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

// ── Chart palette (16 harmonious colors for PieChart) ──
const chartColors = [
  '#1B5E3B',
  '#C8923C',
  '#1A6B7A',
  '#A93545',
  '#B87D3A',
  '#2E6B8A',
  '#4A7C59',
  '#7B5EA7',
  '#C46B50',
  '#3A8B7C',
  '#8B6B4A',
  '#5C7BA8',
  '#9B7B5A',
  '#6B8A5C',
  '#A8707C',
  '#5A7B8A',
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
    secondary: '#C8923C',
    secondaryLight: '#FDF3E3',
    accent: '#1A6B7A',
    accentLight: '#E4F2F5',
    success: '#2E7D32',
    successLight: '#E8F5E9',
    warning: '#E68A00',
    warningLight: '#FFF8E1',
    error: '#C62828',
    errorLight: '#FFEBEE',
    info: '#1565C0',
    infoLight: '#E3F2FD',
    background: '#FAF7F2',
    surface: '#FFFFFF',
    surfaceVariant: '#F0EBE3',
    outline: '#C4B9A8',
    backdrop: 'rgba(26, 20, 12, 0.55)',
    text: {
      primary: '#1A1612',
      secondary: '#5C5347',
      disabled: '#9E9589',
    },
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#1A1612',
    onSurface: '#1A1612',
    shadow: '#1A1612',
    chart: chartColors,
    madhab: madhabColors,
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
    secondary: '#F0C75E',
    secondaryLight: '#3D2E10',
    accent: '#5ABCC9',
    accentLight: '#132D32',
    success: '#66BB6A',
    successLight: '#1B3A1B',
    warning: '#FFB74D',
    warningLight: '#3D2E0A',
    error: '#EF5350',
    errorLight: '#4A1616',
    info: '#42A5F5',
    infoLight: '#0D2744',
    background: '#1E1C18',
    surface: '#2D2A24',
    surfaceVariant: '#3A3630',
    outline: '#5C5750',
    backdrop: 'rgba(0, 0, 0, 0.7)',
    text: {
      primary: '#F5F0E8',
      secondary: '#C4BDB2',
      disabled: '#7A746C',
    },
    onPrimary: '#0A2A16',
    onSecondary: '#2A1E05',
    onBackground: '#F5F0E8',
    onSurface: '#F5F0E8',
    shadow: '#000000',
    chart: chartColors,
    madhab: madhabColors,
  },
  spacing,
  borderRadius,
  typography,
  elevation,
};

export type Theme = typeof lightTheme;
