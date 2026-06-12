import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_DEFAULTS } from '../constants/appDefaults';
import { lightTheme, darkTheme, typography as baseTypography } from '../constants/theme';

const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
  theme: lightTheme,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(false);
  const { fontScale } = useWindowDimensions();

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

  // Apply font scale to typography
  const typography = useMemo(() => {
    const scale = Math.min(Math.max(fontScale, 0.85), 1.3); // Limit scaling between 0.85x and 1.3x
    return {
      display: { ...baseTypography.display, fontSize: baseTypography.display.fontSize * scale },
      h1: { ...baseTypography.h1, fontSize: baseTypography.h1.fontSize * scale },
      h2: { ...baseTypography.h2, fontSize: baseTypography.h2.fontSize * scale },
      h3: { ...baseTypography.h3, fontSize: baseTypography.h3.fontSize * scale },
      h4: { ...baseTypography.h4, fontSize: baseTypography.h4.fontSize * scale },
      body: { ...baseTypography.body, fontSize: baseTypography.body.fontSize * scale },
      bodySmall: { ...baseTypography.bodySmall, fontSize: baseTypography.bodySmall.fontSize * scale },
      caption: { ...baseTypography.caption, fontSize: baseTypography.caption.fontSize * scale },
      label: { ...baseTypography.label, fontSize: baseTypography.label.fontSize * scale },
      labelSmall: { ...baseTypography.labelSmall, fontSize: baseTypography.labelSmall.fontSize * scale },
      mono: { ...baseTypography.mono, fontSize: baseTypography.mono.fontSize * scale },
      monoSmall: { ...baseTypography.monoSmall, fontSize: baseTypography.monoSmall.fontSize * scale },
      button: { ...baseTypography.button, fontSize: baseTypography.button.fontSize * scale },
      overline: { ...baseTypography.overline, fontSize: baseTypography.overline.fontSize * scale },
    };
  }, [fontScale]);

  const theme = React.useMemo(() => (isDark ? darkTheme : lightTheme), [isDark]);

  // Create scaled theme
  const scaledTheme = React.useMemo(() => ({ ...theme, typography }), [theme, typography]);

  const value = React.useMemo(
    () => ({ isDark, toggleTheme, theme: scaledTheme }),
    [isDark, toggleTheme, scaledTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
