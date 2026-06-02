import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HeirType } from '../lib/engine/types';
import { useAppTheme } from '../hooks/useAppTheme';
import { Stepper } from './ui/Stepper';
import { HEIR_ICONS } from '../lib/constants/heirIcons';
import { t } from '../lib/i18n';

interface HeirRowProps {
  type: HeirType;
  name: string;
  count: number;
  isBlocked: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
}

export const HeirRow: React.FC<HeirRowProps> = ({
  type,
  name,
  count,
  isBlocked,
  onIncrease,
  onDecrease,
  min = 0,
  max = 99,
}) => {
  const theme = useAppTheme();
  const iconConfig = HEIR_ICONS[type];

  const rowStyle = [
    styles.row,
    { borderBottomColor: theme.colors.outline },
    isBlocked && { backgroundColor: theme.colors.error + '20', opacity: 0.7 },
  ];

  const iconColor = isBlocked ? theme.colors.outline : iconConfig?.color || theme.colors.primary;

  return (
    <View style={rowStyle}>
      <View style={styles.iconContainer}>
        <Text style={[styles.icon, { color: iconColor }]}>{iconConfig?.icon || '👤'}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text
          style={[
            theme.typography.body,
            isBlocked && { textDecorationLine: 'line-through', color: theme.colors.outline },
          ]}
        >
          {name}
        </Text>
        {isBlocked && (
          <Text style={{ fontSize: 10, color: theme.colors.error }}>⛔ {t('_blocked')}</Text>
        )}
      </View>
      <View style={styles.stepperContainer}>
        {isBlocked ? (
          <Text style={{ color: theme.colors.error }}>—</Text>
        ) : (
          <Stepper
            value={count}
            onIncrease={onIncrease}
            onDecrease={onDecrease}
            min={min}
            max={max}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 8,
  },
  stepperContainer: {
    width: 100,
    alignItems: 'flex-end',
  },
});
