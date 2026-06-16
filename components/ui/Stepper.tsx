import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { t } from '../../lib/i18n';
import { AppText } from './AppText';

type Props = {
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
  size?: 'small' | 'medium' | 'large';
};

export const Stepper: React.FC<Props> = React.memo(
  ({ value, onIncrease, onDecrease, min = 0, max = 99, size = 'medium' }) => {
    const theme = useAppTheme();
    const [pressedDecrease, setPressedDecrease] = useState(false);
    const [pressedIncrease, setPressedIncrease] = useState(false);

    const sizeConfig = useMemo(() => {
      switch (size) {
        case 'small':
          return {
            buttonSize: 36,
            symbolSize: 20,
            spacing: 12,
            valueVariant: 'body' as const,
          };
        case 'large':
          return {
            buttonSize: 44,
            symbolSize: 24,
            spacing: 16,
            valueVariant: 'h4' as const,
          };
        default:
          return {
            buttonSize: 40,
            symbolSize: 22,
            spacing: 14,
            valueVariant: 'body' as const,
          };
      }
    }, [size]);

    const { buttonSize, symbolSize, spacing, valueVariant } = sizeConfig;

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
            },
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              {
                fontSize: symbolSize,
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
          <AppText
            variant={valueVariant}
            color={theme.colors.text.primary}
            style={styles.valueText}
          >
            {value}
          </AppText>
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
              backgroundColor: canIncrease
                ? theme.colors.primaryLight
                : theme.colors.surfaceVariant,
              opacity: canIncrease ? 1 : 0.38,
              transform: [{ scale: pressedIncrease && canIncrease ? 0.95 : 1 }],
            },
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              {
                fontSize: symbolSize,
                color: canIncrease ? theme.colors.primary : theme.colors.text.disabled,
              },
            ]}
          >
            +
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
);

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
