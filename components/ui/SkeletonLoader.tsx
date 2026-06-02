import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

type SkeletonLoaderProps = {
  height?: number;
  style?: ViewStyle;
};

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ height = 20, style }) => {
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

  return (
    <Animated.View
      style={[{ height, borderRadius: theme.radius.sm, backgroundColor: bg }, style]}
    />
  );
};
