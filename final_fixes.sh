#!/bin/bash
set -e

echo "Applying final TypeScript fixes..."

# 1. Fix Input.tsx – rewrite with proper onChangeText (no duplicate attribute)
cat > components/ui/Input.tsx << 'INPUTEOF'
import React, { useState } from 'react';
import { View, TextInput, Text } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

type Props = {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: any;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  style?: object;
};

export const Input: React.FC<Props> = ({
  label, value, onChangeText, keyboardType, error, helper, leftIcon, style
}) => {
  const theme = useAppTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? theme.colors.error : focused ? theme.colors.primary : theme.colors.outline;

  // Handle input change with negative number prevention
  const handleChange = (text: string) => {
    if (text === '') {
      onChangeText('');
      return;
    }
    const num = parseFloat(text);
    if (!isNaN(num) && num >= 0) {
      onChangeText(text);
    }
  };

  return (
    <View style={[{ marginBottom: theme.spacing.md }, style]}>
      <Text style={{ color: theme.colors.onSurface, marginBottom: 4 }}>{label}</Text>
      <View style={{
        flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor,
        borderRadius: theme.radius.sm, backgroundColor: theme.colors.surfaceVariant,
        paddingHorizontal: 12
      }}>
        {leftIcon}
        <TextInput
          value={value}
          onChangeText={handleChange}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ flex: 1, paddingVertical: theme.spacing.sm, color: theme.colors.onSurface }}
          placeholderTextColor={theme.colors.outline}
        />
      </View>
      {error ? <Text style={{ color: theme.colors.error, fontSize: 12 }}>{error}</Text> :
        helper ? <Text style={{ color: theme.colors.outline, fontSize: 12 }}>{helper}</Text> : null}
    </View>
  );
};
INPUTEOF

# 2. Fix SkeletonLoader.tsx – convert string width to numeric (e.g., '100%' -> 100)
cat > components/ui/SkeletonLoader.tsx << 'SKELETONEOF'
import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

type SkeletonLoaderProps = {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
};

// Helper to convert percentage string to number (e.g., "100%" -> 100)
const normalizeWidth = (width: number | string | undefined): number | undefined => {
  if (typeof width === 'string' && width.endsWith('%')) {
    const percent = parseFloat(width);
    if (!isNaN(percent)) return percent;
  }
  if (typeof width === 'number') return width;
  return undefined;
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

  // Use numeric width for Animated.View (percentage strings need to be handled by parent layout)
  const numericWidth = normalizeWidth(width);
  const finalWidth = numericWidth !== undefined ? `${numericWidth}%` : 'auto';

  return (
    <Animated.View
      style={[
        { width: finalWidth, height, borderRadius: theme.radius.sm, backgroundColor: bg },
        style,
      ]}
    />
  );
};
SKELETONEOF

echo "✅ Fixed Input.tsx and SkeletonLoader.tsx"
echo "Now run 'npx tsc --noEmit' to verify no TypeScript errors."
