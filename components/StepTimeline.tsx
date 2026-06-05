import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

interface StepTimelineProps {
  steps: Array<{ title: string; description: string }>;
}

export const StepTimeline: React.FC<StepTimelineProps> = ({ steps }) => {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepRow}>
          <View style={styles.iconColumn}>
            <View style={[styles.circle, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.checkmark, { color: theme.colors.onPrimary }]}>✓</Text>
            </View>
            {index < steps.length - 1 && (
              <View style={[styles.line, { backgroundColor: theme.colors.outline }]} />
            )}
          </View>
          <View style={styles.contentColumn}>
            <Text style={[theme.typography.h3, { color: theme.colors.primary }]}>{step.title}</Text>
            <Text style={[theme.typography.body, { color: theme.colors.onSurface }]}>
              {step.description}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  iconColumn: {
    width: 40,
    alignItems: 'center',
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  line: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  contentColumn: {
    flex: 1,
    paddingStart: 12,
  },
});
