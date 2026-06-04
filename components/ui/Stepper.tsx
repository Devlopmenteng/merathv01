import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

type Props = {
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
  size?: 'small' | 'medium' | 'large';
};

export const Stepper: React.FC<Props> = ({
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
        style={[
          styles.button,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            backgroundColor: canDecrease ? theme.colors.surfaceVariant : theme.colors.surface,
            opacity: canDecrease ? 1 : 0.4,
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
      <View style={[styles.valueContainer, { marginHorizontal: spacing }]}>
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
        style={[
          styles.button,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            backgroundColor: canIncrease ? theme.colors.primaryLight : theme.colors.surface,
            opacity: canIncrease ? 1 : 0.4,
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
};

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
