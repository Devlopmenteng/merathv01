import React, { useState, useRef, useMemo, memo } from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from './AppText';

type Props = {
  title: string;
  onPress: () => void;
  mode?: 'filled' | 'outlined' | 'gradient' | 'ghost' | 'success' | 'danger' | 'warning';
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

export const Button: React.FC<Props> = memo(
  ({
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
    const isSuccess = mode === 'success';
    const isDanger = mode === 'danger';
    const isWarning = mode === 'warning';

    // Determine gradient colors based on mode
    const gradientColors = useMemo(() => {
      if (isSuccess) return [theme.colors.success, '#059669'] as const;
      if (isDanger) return [theme.colors.error, '#dc2626'] as const;
      if (isWarning) return [theme.colors.warning, '#d97706'] as const;
      return [theme.colors.primary, theme.colors.primaryDark] as const;
    }, [isSuccess, isDanger, isWarning, theme.colors]);

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

    const buttonColor = useMemo(() => {
      if (isSuccess) return theme.colors.success;
      if (isDanger) return theme.colors.error;
      if (isWarning) return theme.colors.warning;
      return theme.colors.primary;
    }, [isSuccess, isDanger, isWarning, theme.colors]);

    const textColor = isOutlined || isGhost ? buttonColor : theme.colors.onPrimary;

    const content = (
      <View style={styles.contentRow}>
        {icon && !loading && <View style={styles.icon}>{icon}</View>}
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <AppText
            variant="button"
            color={textColor}
            style={{ textAlign: 'center' }}
          >
            {title}
          </AppText>
        )}
      </View>
    );

    const buttonStyle = [
      styles.button,
      sizeStyles,
      {
        backgroundColor: isOutlined || isGhost ? 'transparent' : buttonColor,
        borderWidth: isOutlined || isGhost ? 2 : 0,
        borderColor: buttonColor,

        alignItems: 'center',
        opacity: disabled ? 0.38 : 1,
        transform: [{ scale: pressed && !disabled ? 0.97 : 1 }],
      },
      fullWidth && styles.fullWidth,
      style,
    ];

    if (isGradient || isSuccess || isDanger || isWarning) {
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
              colors={gradientColors}
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
  }
);

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
