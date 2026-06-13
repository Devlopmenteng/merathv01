import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { t } from '../../lib/i18n';

type Props = {
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
  size?: 'small' | 'medium' | 'large';
};

export const Stepper: React.FC<Props> = React.memo(({
  value,
  onIncrease,
  onDecrease,
  min = 0,
  max = 99,
  size = 'medium',
}) => {
  const theme = useAppTheme();
  const [pressedDecrease, setPressedDecrease] = useState(false);
  const [pressedIncrease, setPressedIncrease] = useState(false);

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          buttonSize: 36,
          fontSize: 20,
          spacing: 12,
          valueFontSize: 16,
        };
      case 'large':
        return {
          buttonSize: 44,
          fontSize: 24,
          spacing: 16,
          valueFontSize: 20,
        };
      default: // medium
        return {
          buttonSize: 40,
          fontSize: 22,
          spacing: 14,
          valueFontSize: 18,
        };
    }
  };

  const { buttonSize, fontSize, spacing, valueFontSize } = getSizeStyles();

  const canDecrease = value > min;
  const canIncrease = value < max;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onDecrease}
        onPressIn={() => setPressedDecrease(true)}
        onPressOut={() => setPressedDecrease(false)}
        disabled={!canDecrease}
        accessibilityLabel={t('a11y_decrease')}
        accessibilityHint={t('a11y_decrease_hint', { value, next: value - 1, min })}
        accessibilityState={{ disabled: !canDecrease }}
        accessibilityRole="button"
        style={[
          styles.button,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            backgroundColor: canDecrease
              ? theme.colors.surfaceVariant
              : theme.colors.surfaceVariant,
            opacity: canDecrease ? 1 : 0.38,
            transform: [{ scale: pressedDecrease && canDecrease ? 0.95 : 1 }],
            ...theme.elevation.small,
          },
        ]}
      >
        <Text
          style={[
            styles.buttonText,
            {
              fontSize,
              color: canDecrease ? theme.colors.text.primary : theme.colors.text.disabled,
            },
          ]}
        >
          −
        </Text>
      </TouchableOpacity>
      <View
        style={[styles.valueContainer, { marginHorizontal: spacing }]}
        accessible
        accessibilityLabel={t('a11y_current_value', { value })}
      >
        <Text
          style={[
            styles.valueText,
            {
              fontSize: valueFontSize,
              fontWeight: '600',
              color: theme.colors.text.primary,
            },
          ]}
        >
          {value}
        </Text>
      </View>
      <TouchableOpacity
        onPress={onIncrease}
        onPressIn={() => setPressedIncrease(true)}
        onPressOut={() => setPressedIncrease(false)}
        disabled={!canIncrease}
        accessibilityLabel={t('a11y_increase')}
        accessibilityHint={t('a11y_increase_hint', { value, next: value + 1, max })}
        accessibilityState={{ disabled: !canIncrease }}
        accessibilityRole="button"
        style={[
          styles.button,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            backgroundColor: canIncrease ? theme.colors.primaryLight : theme.colors.surfaceVariant,
            opacity: canIncrease ? 1 : 0.38,
            transform: [{ scale: pressedIncrease && canIncrease ? 0.95 : 1 }],
            ...theme.elevation.small,
          },
        ]}
      >
        <Text
          style={[
            styles.buttonText,
            {
              fontSize,
              color: canIncrease ? theme.colors.primary : theme.colors.text.disabled,
            },
          ]}
        >
          +
        </Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
  },
  valueContainer: {
    justifyContent: 'center',
  },
  valueText: {},
});
