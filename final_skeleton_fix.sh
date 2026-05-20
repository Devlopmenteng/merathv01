#!/bin/bash
set -e

echo "Final SkeletonLoader fix..."

# 1. Replace SkeletonLoader component (no internal width prop)
cat > components/ui/SkeletonLoader.tsx << 'SKELETONEOF'
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
      style={[
        { height, borderRadius: theme.radius.sm, backgroundColor: bg },
        style,
      ]}
    />
  );
};
SKELETONEOF

# 2. Update HeirSelector.tsx to pass width via style
sed -i 's/<SkeletonLoader width="100%" height={40} style={{ marginVertical: 8 }} \/>/<SkeletonLoader height={40} style={{ width: "100%", marginVertical: 8 }} \/>/g' components/HeirSelector.tsx

echo "✅ Fix applied. Now run 'npx tsc --noEmit'"
