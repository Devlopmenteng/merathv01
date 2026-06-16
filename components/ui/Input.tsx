import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Animated, KeyboardTypeOptions, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { formatCurrency, parseCurrency } from '../../lib/utils/currencyFormatter';
import { AppText } from './AppText';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  prefix?: string;
  suffix?: string;
  style?: object;
  currency?: boolean;
  currencySymbol?: string;
  disabled?: boolean;
  maxLength?: number;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: { disabled?: boolean; error?: boolean };
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
  prefix,
  suffix,
  style,
  currency = false,
  currencySymbol = '$',
  disabled = false,
  maxLength,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
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
      duration: 200,
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
    if (maxLength && text.length > maxLength) return;
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
      outputRange: [theme.typography.body.fontSize, theme.typography.caption.fontSize],
    }),
    color: error ? theme.colors.error : focused ? theme.colors.primary : theme.colors.outline,
    backgroundColor: 'transparent',
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

  const backgroundColor = error
    ? theme.colors.errorLight
    : focused && !error
      ? theme.colors.primaryLight
      : disabled
        ? theme.colors.surfaceVariant
        : theme.colors.surface;

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor,
            borderColor,
            ...shadowStyle,
          },
        ]}
      >
        <Animated.Text style={labelStyle}>{label}</Animated.Text>
        {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
        {prefix && (
          <AppText variant="label" color={theme.colors.text.secondary} style={styles.affix}>
            {prefix}
          </AppText>
        )}
        <TextInput
          value={localValue}
          onChangeText={handleChange}
          keyboardType={currency ? 'numeric' : keyboardType}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={accessibilityHint || helper || error}
          accessibilityState={accessibilityState || { disabled, error: !!error }}
          style={[
            styles.input,
            {
              color: disabled ? theme.colors.outline : theme.colors.onSurface,
              fontSize: theme.typography.body.fontSize,
              fontWeight: theme.typography.body.fontWeight,
            },
          ]}
          placeholderTextColor={theme.colors.outline}
        />
        {suffix && (
          <AppText variant="label" color={theme.colors.text.secondary} style={styles.affix}>
            {suffix}
          </AppText>
        )}
        {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
      </View>
      {error ? (
        <AppText variant="caption" color={theme.colors.error} style={styles.helperText}>
          {error}
        </AppText>
      ) : helper ? (
        <AppText variant="caption" color={theme.colors.text.secondary} style={styles.helperText}>
          {helper}
        </AppText>
      ) : null}
      {maxLength && (
        <AppText variant="labelSmall" color={theme.colors.text.disabled} style={styles.charCount}>
          {localValue.length}/{maxLength}
        </AppText>
      )}
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
    minHeight: 56,
  },
  input: {
    flex: 1,
    paddingVertical: 4,
    fontSize: 16,
    fontWeight: '400',
  },
  affix: {
    fontSize: 14,
    marginHorizontal: 4,
    fontWeight: '500',
  },
  icon: {
    marginHorizontal: 4,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '400',
  },
  charCount: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'right',
  },
});
