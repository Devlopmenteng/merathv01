import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_DEFAULTS } from '../constants/appDefaults';
import { lightTheme, darkTheme, typography as baseTypography } from '../constants/theme';
import type { ResponsiveProps } from '../../hooks/useResponsive';

const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
  theme: lightTheme,
  responsive: {} as ResponsiveProps,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(false);
  const { width, height, scale, fontScale } = useWindowDimensions();

  useEffect(() => {
    AsyncStorage.getItem(APP_DEFAULTS.STORAGE_KEYS.THEME_PREFERENCE).then((value) => {
      if (value === 'dark') setIsDark(true);
      else if (value === 'light') setIsDark(false);
      else setIsDark(false);
    });
  }, [systemColorScheme]);

  const toggleTheme = React.useCallback(() => {
    setIsDark((current) => {
      const next = !current;
      AsyncStorage.setItem(APP_DEFAULTS.STORAGE_KEYS.THEME_PREFERENCE, next ? 'dark' : 'light');
      return next;
    });
  }, []);

  const responsive = useMemo((): ResponsiveProps => {
    const isSmallMobile = width < 360;
    const isMobile = width < 600;
    const isTablet = width >= 600 && width < 904;
    const isLargeTablet = width >= 904 && width < 1200;
    const isDesktop = width >= 1200;
    const isLandscape = width > height;
    const isPortrait = !isLandscape;

    let breakpoint: ResponsiveProps['breakpoint'] = 'md';
    if (width < 360) breakpoint = 'xs';
    else if (width < 600) breakpoint = 'sm';
    else if (width < 904) breakpoint = 'md';
    else if (width < 1200) breakpoint = 'lg';
    else breakpoint = 'xl';

    return {
      isTablet,
      isMobile,
      isDesktop,
      isLandscape,
      isPortrait,
      isSmallMobile,
      isLargeTablet,
      width,
      height,
      scale,
      fontScale,
      breakpoint,
    };
  }, [width, height, scale, fontScale]);

  // Apply font scale to typography
  const typography = useMemo(() => {
    const scale = Math.min(Math.max(fontScale, 0.85), 1.3);
    return {
      display: { ...baseTypography.display, fontSize: baseTypography.display.fontSize * scale },
      h1: { ...baseTypography.h1, fontSize: baseTypography.h1.fontSize * scale },
      h2: { ...baseTypography.h2, fontSize: baseTypography.h2.fontSize * scale },
      h3: { ...baseTypography.h3, fontSize: baseTypography.h3.fontSize * scale },
      h4: { ...baseTypography.h4, fontSize: baseTypography.h4.fontSize * scale },
      body: { ...baseTypography.body, fontSize: baseTypography.body.fontSize * scale },
      bodySmall: {
        ...baseTypography.bodySmall,
        fontSize: baseTypography.bodySmall.fontSize * scale,
      },
      caption: { ...baseTypography.caption, fontSize: baseTypography.caption.fontSize * scale },
      label: { ...baseTypography.label, fontSize: baseTypography.label.fontSize * scale },
      labelSmall: {
        ...baseTypography.labelSmall,
        fontSize: baseTypography.labelSmall.fontSize * scale,
      },
      mono: { ...baseTypography.mono, fontSize: baseTypography.mono.fontSize * scale },
      monoSmall: {
        ...baseTypography.monoSmall,
        fontSize: baseTypography.monoSmall.fontSize * scale,
      },
      button: { ...baseTypography.button, fontSize: baseTypography.button.fontSize * scale },
      overline: { ...baseTypography.overline, fontSize: baseTypography.overline.fontSize * scale },
    };
  }, [fontScale]);

  const theme = React.useMemo(() => (isDark ? darkTheme : lightTheme), [isDark]);

  const scaledTheme = React.useMemo(() => ({ ...theme, typography }), [theme, typography]);

  const value = React.useMemo(
    () => ({ isDark, toggleTheme, theme: scaledTheme, responsive }),
    [isDark, toggleTheme, scaledTheme, responsive]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
