import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Text, Animated, KeyboardTypeOptions } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { formatCurrency, parseCurrency } from '../../lib/utils/currencyFormatter';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: object;
  currency?: boolean;
  currencySymbol?: string;
  disabled?: boolean;
};

export const Input: React.FC<Props> = ({
  label,
  value,
  onChangeText,
  keyboardType,
  error,
  helper,
  leftIcon,
  rightIcon,
  style,
  currency = false,
  currencySymbol = '$',
  disabled = false,
}) => {
  const theme = useAppTheme();
  const [focused, setFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const animatedLabel = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    if (currency && value) {
      setLocalValue(formatCurrency(value, currencySymbol));
    } else {
      setLocalValue(value);
    }
  }, [value, currency, currencySymbol]);

  useEffect(() => {
    Animated.timing(animatedLabel, {
      toValue: focused || localValue ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focused, localValue]);

  const handleFocus = () => setFocused(true);
  const handleBlur = () => setFocused(false);

  const handleChange = (text: string) => {
    if (currency) {
      const raw = parseCurrency(text);
      setLocalValue(formatCurrency(raw.toString(), currencySymbol));
      onChangeText(raw.toString());
    } else {
      setLocalValue(text);
      onChangeText(text);
    }
  };

  const labelStyle = {
    position: 'absolute' as const,
    left: 12,
    top: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -8],
    }),
    fontSize: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: error ? theme.colors.error : focused ? theme.colors.primary : theme.colors.outline,
    backgroundColor: theme.colors.surfaceVariant,
    paddingHorizontal: 4,
  };

  const borderColor = error
    ? theme.colors.error
    : focused
      ? theme.colors.primary
      : theme.colors.outline;

  return (
    <View style={[{ marginBottom: theme.spacing.md }, style]}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor,
          borderRadius: theme.radius.sm,
          backgroundColor: disabled ? theme.colors.surfaceVariant : theme.colors.surface,
          paddingHorizontal: 12,
          paddingTop: 12,
          paddingBottom: 8,
          position: 'relative',
        }}
      >
        <Animated.Text style={labelStyle}>{label}</Animated.Text>
        {leftIcon && <View style={{ marginRight: 8 }}>{leftIcon}</View>}
        <TextInput
          value={localValue}
          onChangeText={handleChange}
          keyboardType={currency ? 'numeric' : keyboardType}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          accessibilityLabel={label}
          accessibilityHint={helper || error}
          accessibilityState={{ disabled: disabled }}
          style={{
            flex: 1,
            paddingVertical: theme.spacing.sm,
            color: disabled ? theme.colors.outline : theme.colors.onSurface,
            fontSize: 16,
          }}
          placeholderTextColor={theme.colors.outline}
        />
        {rightIcon && <View style={{ marginLeft: 8 }}>{rightIcon}</View>}
      </View>
      {error ? (
        <Text style={{ color: theme.colors.error, fontSize: 12, marginTop: 4 }}>{error}</Text>
      ) : helper ? (
        <Text style={{ color: theme.colors.outline, fontSize: 12, marginTop: 4 }}>{helper}</Text>
      ) : null}
    </View>
  );
};
