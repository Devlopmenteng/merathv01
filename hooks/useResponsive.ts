import { useWindowDimensions } from 'react-native';

export interface ResponsiveProps {
  isTablet: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
  width: number;
  height: number;
  scale: number;
  fontScale: number;
}

export const useResponsive = (): ResponsiveProps => {
  const { width, height, scale, fontScale } = useWindowDimensions();
  // Tablet threshold: width >= 600 (Material Design compact/medium breakpoint)
  const isTablet = width >= 600;
  const isLandscape = width > height;
  const isPortrait = !isLandscape;

  return {
    isTablet,
    isLandscape,
    isPortrait,
    width,
    height,
    scale,
    fontScale,
  };
};
