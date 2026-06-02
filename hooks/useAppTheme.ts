import { useTheme } from '../lib/context/ThemeContext';
import { lightTheme, darkTheme, Theme } from '../lib/constants/theme';

export const useAppTheme = (): Theme => {
  const { isDark } = useTheme();
  return isDark ? darkTheme : lightTheme;
};
