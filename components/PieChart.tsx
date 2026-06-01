import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, Animated } from 'react-native';
import Svg, { Path, G, Text as SvgText } from 'react-native-svg';

type PieData = { label: string; value: number; color: string; fraction?: string };

const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => ({
  x: cx + r * Math.cos((angle - 90) * Math.PI / 180),
  y: cy + r * Math.sin((angle - 90) * Math.PI / 180),
});

const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} L ${cx} ${cy}`;
};

const AnimatedPath = Animated.createAnimatedComponent(Path);

export const PieChart = React.memo(({ data, size = 200 }: { data: PieData[]; size?: number }) => {
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, { toValue: 1, duration: 800, useNativeDriver: false }).start();
  }, [data, animValue]);

  const center = size / 2;
  const radius = size / 2 - 10;

  const segments = useMemo(() => {
    let cumulativeAngle = 0;
    return data.map((item) => {
      const valueAngle = total > 0 ? (item.value / total) * 360 : 0;
      const segment = {
        ...item,
        startAngle: cumulativeAngle,
        endAngle: cumulativeAngle + valueAngle,
      };
      cumulativeAngle += valueAngle;
      return segment;
    });
  }, [data, total]);

  if (total === 0) return null;

  return (
    <View style={{ alignItems: 'center', marginVertical: 16 }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((item, idx) => {
          const path = describeArc(center, center, radius, item.startAngle, item.endAngle);
          const midAngle = item.startAngle + (item.endAngle - item.startAngle) / 2;
          const labelRadius = radius * 0.6;
          const labelPos = polarToCartesian(center, center, labelRadius, midAngle);
          const showLabel = item.endAngle - item.startAngle > 15 && item.fraction;
          return (
            <G key={idx}>
              <AnimatedPath d={path} fill={item.color} stroke="#fff" strokeWidth={2} opacity={animValue} />
              {showLabel && (
                <SvgText
                  x={labelPos.x}
                  y={labelPos.y}
                  fill="#fff"
                  fontSize={12}
                  fontWeight="bold"
                  textAnchor="middle"
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth={0.5}
                >
                  {item.fraction}
                </SvgText>
              )}
            </G>
          );
        })}
      </Svg>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
        {data.map((item, idx) => (
          <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 8, marginBottom: 4 }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: item.color, marginRight: 4 }} />
            <Text style={{ fontSize: 12 }}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
});
