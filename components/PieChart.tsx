import React, { useEffect, useRef } from 'react';
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

export const PieChart = ({ data, size = 200 }: { data: PieData[]; size?: number }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, { toValue: 1, duration: 800, useNativeDriver: false }).start();
  }, [data]);

  if (total === 0) return null;

  let cumulativeAngle = 0;
  const AnimatedPath = Animated.createAnimatedComponent(Path);
  const center = size / 2;
  const radius = size / 2 - 10;

  return (
    <View style={{ alignItems: 'center', marginVertical: 16 }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((item, idx) => {
          const angle = (item.value / total) * 360;
          const startAngle = cumulativeAngle;
          const endAngle = cumulativeAngle + angle;
          const path = describeArc(center, center, radius, startAngle, endAngle);
          cumulativeAngle += angle;

          const midAngle = startAngle + angle / 2;
          const labelRadius = radius * 0.6;
          const labelPos = polarToCartesian(center, center, labelRadius, midAngle);
          const fractionText = item.fraction || '';
          const showLabel = angle > 15 && fractionText;

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
                  {fractionText}
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
};
