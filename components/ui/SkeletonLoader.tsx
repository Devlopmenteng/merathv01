import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { APP_DEFAULTS } from '../../lib/constants/appDefaults';

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
        Animated.timing(shimmer, {
          toValue: 1,
          duration: APP_DEFAULTS.ANIMATION_DURATION.SKELETON_SHIMMER,
          useNativeDriver: false,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: APP_DEFAULTS.ANIMATION_DURATION.SKELETON_SHIMMER,
          useNativeDriver: false,
        }),
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
      style={[{ height, borderRadius: theme.borderRadius.sm, backgroundColor: bg }, style]}
    />
  );
};
