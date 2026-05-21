import React from 'react';
import { View, Text, Animated } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

type PieData = { label: string; value: number; color: string };

export const PieChart = ({ data }: { data: PieData[] }) => {
  const theme = useAppTheme();
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;
  return (
    <View style={{ marginVertical: 16 }}>
      <Text style={theme.typography.h2}>توزيع التركة</Text>
      {data.map((item, idx) => {
        const percentage = (item.value / total) * 100;
        return (
          <View key={idx} style={{ marginBottom: theme.spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text>{item.label}</Text>
              <Text>{percentage.toFixed(1)}%</Text>
            </View>
            <View style={{ height: 8, backgroundColor: theme.colors.surfaceVariant, borderRadius: 4, overflow: 'hidden' }}>
              <Animated.View
                style={{
                  width: `${percentage}%`,
                  height: '100%',
                  backgroundColor: item.color,
                  borderRadius: 4,
                }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
};
