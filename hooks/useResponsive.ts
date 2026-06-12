import { useWindowDimensions } from 'react-native';

export interface ResponsiveProps {
  isTablet: boolean;
  isMobile: boolean;
  isDesktop: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
  isSmallMobile: boolean;
  isLargeTablet: boolean;
  width: number;
  height: number;
  scale: number;
  fontScale: number;
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const useResponsive = (): ResponsiveProps => {
  const { width, height, scale, fontScale } = useWindowDimensions();

  // Breakpoints based on Material Design 3
  // Compact (Mobile): 0-599px
  // Medium (Tablet): 600-904px
  // Expanded (Desktop): 905px+
  const isSmallMobile = width < 360;
  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 904;
  const isLargeTablet = width >= 904 && width < 1200;
  const isDesktop = width >= 1200;

  const isLandscape = width > height;
  const isPortrait = !isLandscape;

  // Determine current breakpoint
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
};
