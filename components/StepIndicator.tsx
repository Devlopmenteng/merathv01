import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { t } from '../lib/i18n';

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

export const StepIndicator = ({ currentStep, steps }: StepIndicatorProps) => {
  const theme = useAppTheme();

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
                { borderColor: theme.colors.primary },
                currentStep >= index && styles.activeCircle,
                currentStep >= index && { backgroundColor: theme.colors.primary },
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
                  { backgroundColor: theme.colors.outline },
                  currentStep > index && styles.activeLine,
                  currentStep > index && { backgroundColor: theme.colors.primary },
                ]}
              />
            )}
          </View>
          <Text
            style={[
              styles.stepLabel,
              { color: currentStep >= index ? theme.colors.primary : theme.colors.text.secondary },
            ]}
          >
            {t(stepKey)}
          </Text>
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
