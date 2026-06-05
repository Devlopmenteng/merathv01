import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Text, Animated, KeyboardTypeOptions, StyleSheet } from 'react-native';
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
  const animatedBorder = useRef(new Animated.Value(0)).current;

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
      duration: 200, // Fast animation for better UX
      useNativeDriver: false,
    }).start();
  }, [focused, localValue]);

  useEffect(() => {
    Animated.timing(animatedBorder, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focused]);

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
    left: 14,
    top: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [20, -10],
    }),
    fontSize: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: error ? theme.colors.error : focused ? theme.colors.primary : theme.colors.outline,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 6,
    zIndex: 1,
  };

  const borderColor = animatedBorder.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? theme.colors.error : theme.colors.outline,
      error ? theme.colors.error : theme.colors.primary,
    ],
  }) as unknown as string;

  const shadowStyle = focused
    ? {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
      }
    : theme.elevation.small;

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: disabled ? theme.colors.surfaceVariant : theme.colors.surface,
            borderColor,
            ...shadowStyle,
          },
        ]}
      >
        <Animated.Text style={labelStyle}>{label}</Animated.Text>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
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
          style={[
            styles.input,
            {
              color: disabled ? theme.colors.outline : theme.colors.onSurface,
            },
          ]}
          placeholderTextColor={theme.colors.outline}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error ? (
        <Text style={[styles.helperText, { color: theme.colors.error }]}>{error}</Text>
      ) : helper ? (
        <Text style={[styles.helperText, { color: theme.colors.text.secondary }]}>{helper}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 20,
    paddingBottom: 8,
    position: 'relative',
  },
  input: {
    flex: 1,
    paddingVertical: 4,
    fontSize: 16,
    fontWeight: '400',
  },
  leftIcon: {
    marginEnd: 8,
  },
  rightIcon: {
    marginStart: 8,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '400',
  },
});
