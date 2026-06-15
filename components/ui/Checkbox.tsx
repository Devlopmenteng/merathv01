import React from 'react';
import { Pressable, View, Text, StyleSheet, I18nManager } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

type Props = {
  label?: string;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

export const Checkbox: React.FC<Props> = ({ label, checked, onToggle, disabled }) => {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={() => !disabled && onToggle()}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        { flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.checkbox,
          { borderColor: theme.colors.primary, backgroundColor: checked ? theme.colors.primary : 'transparent' },
        ]}
      >
        {checked && <Text style={[styles.checkmark, { color: theme.colors.onPrimary }]}>✓</Text>}
      </View>
      {label && (
        <Text style={[theme.typography.body, { color: disabled ? theme.colors.text.disabled : theme.colors.onBackground }]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 0 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginRight: I18nManager.isRTL ? 0 : 12, marginLeft: I18nManager.isRTL ? 12 : 0 },
  checkmark: { fontSize: 12, fontWeight: 'bold' },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.8 },
});
