import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from './AppText';

type ChipVariant = 'filter' | 'input' | 'suggestion';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  variant?: ChipVariant;
  leftIcon?: React.ReactNode;
  color?: string;
  disabled?: boolean;
};

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  variant = 'filter',
  leftIcon,
  color,
  disabled = false,
}) => {
  const theme = useAppTheme();

  const chipColor = color || theme.colors.primary;

  const getVariantStyle = () => {
    switch (variant) {
      case 'input':
        return {
          backgroundColor: selected ? theme.colors.primaryContainer : theme.colors.surfaceVariant,

          borderColor: selected ? chipColor : theme.colors.outline,
        };
      case 'suggestion':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      default:
        return {
          backgroundColor: selected ? chipColor : theme.colors.surfaceVariant,
          borderWidth: 0,
        };
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.chip, getVariantStyle(), disabled && { opacity: 0.38 }]}
    >
      {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
      <AppText
        variant="label"
        color={
          selected && variant === 'filter' ? theme.colors.onPrimary : theme.colors.onSurface
        }
      >
        {label}
      </AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginEnd: 8,
    marginBottom: 8,
  },
  icon: {
    marginEnd: 4,
  },
});
