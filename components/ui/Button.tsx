import React, { useState, useRef, useMemo, memo } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../hooks/useAppTheme';

type Props = {
  title: string;
  onPress: () => void;
  mode?: 'filled' | 'outlined' | 'gradient' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: object;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: { disabled?: boolean };
};

export const Button: React.FC<Props> = memo(({
  title,
  onPress,
  mode = 'filled',
  size = 'medium',
  disabled,
  loading,
  icon,
  fullWidth,
  style,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
}) => {
  const theme = useAppTheme();
  const [pressed, setPressed] = useState(false);
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    setPressed(true);
    Animated.spring(scaleValue, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    setPressed(false);
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const isOutlined = mode === 'outlined';
  const isGradient = mode === 'gradient';
  const isGhost = mode === 'ghost';

  const sizeStyles = useMemo(() => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
        };
      case 'large':
        return {
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing.xl,
        };
      default:
        return {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
        };
    }
  }, [size, theme.spacing.sm, theme.spacing.md, theme.spacing.lg, theme.spacing.xl]);

  const fontSize = useMemo(() => {
    switch (size) {
      case 'small':
        return 14;
      case 'large':
        return 18;
      default:
        return 16;
    }
  }, [size]);

  const textColor = isOutlined || isGhost ? theme.colors.primary : theme.colors.onPrimary;

  const content = (
    <View style={styles.contentRow}>
      {icon && !loading && <View style={styles.icon}>{icon}</View>}
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text
          style={{
            color: textColor,
            textAlign: 'center',
            fontSize: fontSize,
            fontWeight: '600',
            letterSpacing: 0.5,
          }}
        >
          {title}
        </Text>
      )}
    </View>
  );

  const buttonStyle = [
    styles.button,
    sizeStyles,
    {
      backgroundColor: isOutlined || isGhost ? 'transparent' : theme.colors.primary,
      borderWidth: isOutlined || isGhost ? 2 : 0,
      borderColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      opacity: disabled ? 0.38 : 1,
      transform: [{ scale: pressed && !disabled ? 0.97 : 1 }],
      ...theme.elevation.small,
    },
    fullWidth && styles.fullWidth,
    style,
  ];

  if (isGradient) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel || title}
          accessibilityHint={accessibilityHint}
          accessibilityState={accessibilityState || { disabled: disabled || loading }}
          activeOpacity={1}
          style={[buttonStyle, { overflow: 'hidden', borderWidth: 0 }]}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              StyleSheet.absoluteFillObject,
              sizeStyles,
              { alignItems: 'center', justifyContent: 'center' },
            ]}
          >
            {content}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityState={accessibilityState || { disabled: disabled || loading }}
        activeOpacity={1}
        style={buttonStyle}
      >
        {content}
      </TouchableOpacity>
    </Animated.View>
  );
});

Button.displayName = 'Button';

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    minWidth: 120,
    minHeight: 44,
  },
  fullWidth: {
    minWidth: 'auto',
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginEnd: 8,
  },
});
