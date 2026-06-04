import { useTheme } from '../lib/context/ThemeContext';
import { Theme } from '../lib/constants/theme';

export const useAppTheme = (): Theme => {
  const { theme } = useTheme();
  return theme;
};
