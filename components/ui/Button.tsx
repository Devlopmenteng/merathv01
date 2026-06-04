import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useState } from 'react';

type Props = {
  title: string;
  onPress: () => void;
  mode?: 'filled' | 'outlined' | 'gradient' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: object;
};

export const Button: React.FC<Props> = ({
  title,
  onPress,
  mode = 'filled',
  size = 'medium',
  disabled,
  loading,
  style,
}) => {
  const theme = useAppTheme();
  const [pressed, setPressed] = useState(false);

  const isOutlined = mode === 'outlined';
  const isGradient = mode === 'gradient';
  const isGhost = mode === 'ghost';

  const getSizeStyles = () => {
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
      default: // medium
        return {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
        };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  const content = (
    <Text
      style={[
        {
          color: isOutlined || isGhost ? theme.colors.primary : theme.colors.onPrimary,
          textAlign: 'center',
          fontSize: getFontSize(),
          fontWeight: '600',
          letterSpacing: 0.5,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={isOutlined || isGhost ? theme.colors.primary : theme.colors.onPrimary}
          size="small"
        />
      ) : (
        title
      )}
    </Text>
  );

  const buttonStyle = [
    styles.button,
    getSizeStyles(),
    {
      backgroundColor: isOutlined || isGhost ? 'transparent' : theme.colors.primary,
      borderWidth: isOutlined || isGhost ? 2 : 0,
      borderColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      opacity: disabled ? 0.5 : 1,
      transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
      ...theme.elevation.small,
    },
    style,
  ];

  if (isGradient) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled: disabled || loading }}
        activeOpacity={1}
        style={[buttonStyle, { overflow: 'hidden', borderWidth: 0 }]}
      >
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            StyleSheet.absoluteFillObject,
            getSizeStyles(),
            { alignItems: 'center', justifyContent: 'center' },
          ]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
      activeOpacity={1}
      style={buttonStyle}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    minWidth: 120,
  },
});
