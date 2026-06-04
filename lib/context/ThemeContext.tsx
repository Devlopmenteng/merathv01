import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_DEFAULTS } from '../constants/appDefaults';
import { lightTheme, darkTheme } from '../constants/theme';

const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
  theme: lightTheme,
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

  const theme = React.useMemo(() => (isDark ? darkTheme : lightTheme), [isDark]);

  const value = React.useMemo(() => ({ isDark, toggleTheme, theme }), [isDark, toggleTheme, theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
