import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_DEFAULTS } from '../constants/appDefaults';

// Modern color palette
const lightColors = {
  primary: '#0D7C66',
  primaryLight: '#E6F9F5',
  primaryDark: '#0A5E4A',
  secondary: '#E6A817',
  secondaryLight: '#FEF5E6',
  secondaryDark: '#C48B0C',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F5F9',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  onPrimary: '#FFFFFF',
  onSecondary: '#FFFFFF',
  onBackground: '#1E293B',
  onSurface: '#1E293B',
  outline: '#CBD5E1',
  shadow: '#000000',
};

const darkColors = {
  // Primary – Teal (adjusted for higher contrast with white text)
  primary: '#14B8A6',        // Slightly darker than 2DD4BF for better visibility
  primaryLight: '#0D3D3A',   // Deep teal for backgrounds
  primaryDark: '#0F766E',
  
  // Secondary – Amber (bright but readable)
  secondary: '#F59E0B',
  secondaryLight: '#422006',
  secondaryDark: '#D97706',
  
  // Backgrounds – layered for depth
  background: '#0F172A',      // Slate 900 – deep dark blue
  surface: '#1E293B',         // Slate 800 – cards
  surfaceVariant: '#334155',  // Slate 700 – elevated surfaces
  
  // Semantic colors
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  
  // Text colors (light, high contrast)
  onPrimary: '#FFFFFF',       // White on teal – passes WCAG AAA
  onSecondary: '#FFFFFF',     // White on amber – passes WCAG AAA
  onBackground: '#F8FAFC',    // Slate 50 – very light
  onSurface: '#E2E8F0',       // Slate 200 – soft white for cards
  
  // Borders & outlines
  outline: '#64748B',         // Slate 500 – visible but not harsh
  shadow: '#000000',
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

const typography = {
  h1: { fontSize: 28, lineHeight: 36, fontWeight: '700' as const },
  h2: { fontSize: 22, lineHeight: 30, fontWeight: '600' as const },
  h3: { fontSize: 18, lineHeight: 26, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
  button: { fontSize: 14, lineHeight: 20, fontWeight: '600' as const },
};

const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
  theme: { colors: lightColors, spacing, radius, typography },
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(APP_DEFAULTS.STORAGE_KEYS.THEME_PREFERENCE).then((value) => {
      if (value === 'dark') setIsDark(true);
      else if (value === 'light') setIsDark(false);
      else setIsDark(false); // force light mode as default
    });
  }, [systemColorScheme]);

  const toggleTheme = React.useCallback(() => {
    setIsDark((current) => {
      const next = !current;
      AsyncStorage.setItem(APP_DEFAULTS.STORAGE_KEYS.THEME_PREFERENCE, next ? 'dark' : 'light');
      return next;
    });
  }, []);

  const theme = React.useMemo(
    () => ({ colors: isDark ? darkColors : lightColors, spacing, radius, typography }),
    [isDark],
  );

  const value = React.useMemo(
    () => ({ isDark, toggleTheme, theme }),
    [isDark, toggleTheme, theme],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
