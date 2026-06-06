import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

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
          borderWidth: 1,
          borderColor: selected ? chipColor : theme.colors.outline,
          borderRadius: theme.borderRadius.sm,
        };
      case 'suggestion':
        return {
          backgroundColor: theme.colors.surfaceVariant,
          borderWidth: 0,
          borderRadius: theme.borderRadius.sm,
          ...theme.elevation.small,
        };
      default:
        return {
          backgroundColor: selected ? chipColor : theme.colors.surfaceVariant,
          borderWidth: 0,
          borderRadius: theme.borderRadius.full,
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
      <Text
        style={[
          styles.label,
          {
            color:
              selected && variant === 'filter' ? theme.colors.onPrimary : theme.colors.onSurface,
          },
        ]}
      >
        {label}
      </Text>
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
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
});
