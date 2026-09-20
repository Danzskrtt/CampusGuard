import { useWindowDimensions } from 'react-native';

export const TABLET_MIN_WIDTH = 768; // iPad portrait and up (matches NativeWind's md breakpoint)

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  return { width, height, isTablet: width >= TABLET_MIN_WIDTH, isLandscape: width > height };
}
