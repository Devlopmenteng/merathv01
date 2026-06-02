import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import Svg, { Path, G, Text as SvgText } from 'react-native-svg';
import { useAppTheme } from '../hooks/useAppTheme';

type PieData = { label: string; value: number; color: string; fraction?: string };

const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => ({
  x: cx + r * Math.cos(((angle - 90) * Math.PI) / 180),
  y: cy + r * Math.sin(((angle - 90) * Math.PI) / 180),
});

const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} L ${cx} ${cy}`;
};

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Color-blind friendly palette
const COLOR_PALETTE = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#F7DC6F',
  '#96CEB4',
  '#FFB347',
  '#6B5B95',
  '#88B04B',
  '#D4A5A5',
  '#9B59B6',
  '#3498DB',
  '#E67E22',
  '#2ECC71',
  '#E74C3C',
  '#1ABC9C',
  '#F39C12',
];

export const PieChart = React.memo(({ data, size = 200 }: { data: PieData[]; size?: number }) => {
  const theme = useAppTheme();
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, { toValue: 1, duration: 800, useNativeDriver: false }).start();
  }, [data, animValue]);

  const center = size / 2;
  const radius = size / 2 - 10;

  const segments = useMemo(() => {
    let cumulativeAngle = 0;
    return data.map((item, idx) => {
      const valueAngle = total > 0 ? (item.value / total) * 360 : 0;
      const segment = {
        ...item,
        color: item.color || COLOR_PALETTE[idx % COLOR_PALETTE.length],
        startAngle: cumulativeAngle,
        endAngle: cumulativeAngle + valueAngle,
      };
      cumulativeAngle += valueAngle;
      return segment;
    });
  }, [data, total]);

  if (total === 0) return null;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((item, idx) => {
          const path = describeArc(center, center, radius, item.startAngle, item.endAngle);
          const midAngle = item.startAngle + (item.endAngle - item.startAngle) / 2;
          const labelRadius = radius * 0.65;
          const labelPos = polarToCartesian(center, center, labelRadius, midAngle);
          const percentage = ((item.value / total) * 100).toFixed(1);
          const showLabel = item.endAngle - item.startAngle > 15;
          return (
            <G key={idx}>
              <AnimatedPath
                d={path}
                fill={item.color}
                stroke={theme.colors.surface}
                strokeWidth={2}
                opacity={animValue}
              />
              {showLabel && (
                <SvgText
                  x={labelPos.x}
                  y={labelPos.y}
                  fill="#fff"
                  fontSize={10}
                  fontWeight="bold"
                  textAnchor="middle"
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth={0.5}
                >
                  {percentage}%
                </SvgText>
              )}
            </G>
          );
        })}
      </Svg>
      <View style={styles.legendContainer}>
        {data.map((item, idx) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          return (
            <View key={idx} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={[styles.legendText, { color: theme.colors.onSurface }]}>
                {item.label}: {percentage}%
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginBottom: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
  },
});
