import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../hooks/useAppTheme';

type Props = {
  title: string;
  onPress: () => void;
  mode?: 'filled' | 'outlined' | 'gradient';
  disabled?: boolean;
  loading?: boolean;
  style?: object;
};

export const Button: React.FC<Props> = ({
  title,
  onPress,
  mode = 'filled',
  disabled,
  loading,
  style,
}) => {
  const theme = useAppTheme();
  const isOutlined = mode === 'outlined';
  const isGradient = mode === 'gradient';

  const content = (
    <Text
      style={[
        theme.typography.button,
        {
          color: isOutlined ? theme.colors.primary : theme.colors.onPrimary,
          textAlign: 'center',
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutlined ? theme.colors.primary : theme.colors.onPrimary} />
      ) : (
        title
      )}
    </Text>
  );

  if (isGradient) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={title}
        style={[{ borderRadius: theme.borderRadius.full, overflow: 'hidden' }, style]}
      >
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.lg,
            alignItems: 'center',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={[
        {
          backgroundColor: isOutlined ? 'transparent' : theme.colors.primary,
          borderWidth: isOutlined ? 2 : 0,
          borderColor: theme.colors.primary,
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.borderRadius.full,
          alignItems: 'center',
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {content}
    </TouchableOpacity>
  );
};
