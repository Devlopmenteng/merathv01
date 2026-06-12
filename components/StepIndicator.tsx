import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { t } from '../lib/i18n';

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

export const StepIndicator = ({ currentStep, steps }: StepIndicatorProps) => {
  const theme = useAppTheme();
  const circleAnims = useRef(steps.map(() => new Animated.Value(0))).current;
  const lineAnims = useRef(steps.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    steps.forEach((_, index) => {
      Animated.timing(circleAnims[index], {
        toValue: currentStep >= index ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      if (index < steps.length - 1) {
        Animated.timing(lineAnims[index], {
          toValue: currentStep > index ? 1 : 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    });
  }, [currentStep, steps, circleAnims, lineAnims]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outline },
      ]}
    >
      {steps.map((stepKey, index) => (
        <View key={stepKey} style={styles.stepWrapper}>
          <View style={styles.stepRow}>
            <Animated.View
              style={[
                styles.circle,
                {
                  borderColor: theme.colors.primary,
                  backgroundColor: circleAnims[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: ['transparent', theme.colors.primary],
                  }),
                  transform: [
                    {
                      scale: circleAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.1],
                      }),
                    },
                  ],
                },
                currentStep >= index && styles.activeCircle,
              ]}
            >
              <Text
                style={[
                  styles.stepNumber,
                  {
                    color:
                      currentStep >= index ? theme.colors.onPrimary : theme.colors.text.secondary,
                  },
                ]}
              >
                {index + 1}
              </Text>
            </Animated.View>
            {index < steps.length - 1 && (
              <Animated.View
                style={[
                  styles.line,
                  {
                    backgroundColor: lineAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [theme.colors.outline, theme.colors.primary],
                    }),
                  },
                ]}
              />
            )}
          </View>
          <Animated.Text
            style={[
              styles.stepLabel,
              {
                color: circleAnims[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [theme.colors.text.secondary, theme.colors.primary],
                }),
              },
            ]}
          >
            {t(stepKey)}
          </Animated.Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  stepWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  activeCircle: {
    borderWidth: 0,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  line: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
  },
  activeLine: {},
  stepLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});
