import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

type SkeletonLoaderProps = {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
};

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ width = '100%', height = 20, style }) => {
  const theme = useAppTheme();
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 800, useNativeDriver: false }),
        Animated.timing(shimmer, { toValue: 0, duration: 800, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const bg = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.surfaceVariant, theme.colors.surface],
  });

  return <Animated.View style={[{ width, height, borderRadius: theme.radius.sm, backgroundColor: bg }, style]} />;
};
