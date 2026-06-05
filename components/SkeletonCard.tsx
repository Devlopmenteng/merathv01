import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { APP_DEFAULTS } from '../lib/constants/appDefaults';
import { useAppTheme } from '../hooks/useAppTheme';

const Skeleton = React.memo(({ width = 100, height = 20 }: { width?: number; height?: number }) => {
  const theme = useAppTheme();
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
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

    animation.start();
    return () => animation.stop();
  }, [shimmer]);

  const bg = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.outline, theme.colors.surfaceVariant],
  });
  return (
    <Animated.View
      style={{
        width,
        height,
        backgroundColor: bg,
        borderRadius: theme.borderRadius.xs,
        marginBottom: theme.spacing.sm,
      }}
    />
  );
});

export const ResultsSkeleton = React.memo(() => {
  const theme = useAppTheme();

  return (
    <View style={{ padding: theme.spacing.lg }}>
      <Skeleton width={200} height={40} />
      <Skeleton width={150} height={30} />
      <Skeleton width={300} height={20} />
      <Skeleton width={300} height={20} />
      <Skeleton width={300} height={20} />
    </View>
  );
});
