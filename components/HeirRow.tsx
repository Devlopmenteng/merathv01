import React from 'react';
import { View, Text, StyleSheet, I18nManager } from 'react-native';
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
    {
      backgroundColor: isBlocked ? theme.colors.errorLight : (count > 0 ? theme.colors.primaryLight : 'transparent'),
      borderBottomColor: theme.colors.outline,
      flexDirection: (I18nManager.isRTL ? 'row-reverse' : 'row') as 'row' | 'row-reverse',
    },
    isBlocked && { opacity: 0.6 },
  ];

  const iconColor = isBlocked ? theme.colors.outline : iconConfig?.color || theme.colors.primary;

  return (
    <View style={rowStyle}>
      <View style={styles.iconContainer}>
        <Text style={[styles.icon, { color: iconColor }]}>{iconConfig?.icon || '👤'}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text
          numberOfLines={2}
          style={[
            theme.typography.body,
            { flexShrink: 1, writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
            isBlocked && { textDecorationLine: 'line-through', color: theme.colors.outline },
          ]}
        >
          {name}
        </Text>
        {isBlocked && (
          <Text
            style={{
              fontSize: 10,
              color: theme.colors.error,
              writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
            }}
          >
            ⛔ {t('_blocked')}
          </Text>
        )}
      </View>
      <View style={styles.stepperContainer}>
        {isBlocked ? (
          <Text
            style={{
              color: theme.colors.error,
              writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
            }}
          >
            —
          </Text>
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 12,
  },
  icon: {
    fontSize: 24,
  },
  infoContainer: {
    flex: 1,
    marginStart: I18nManager.isRTL ? undefined : 8,
    marginEnd: I18nManager.isRTL ? 8 : undefined,
  },
  stepperContainer: {
    width: 100,
    alignItems: 'flex-end',
  },
});
