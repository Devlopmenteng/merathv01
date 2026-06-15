import React from 'react';
import { Pressable, View, Text, StyleSheet, I18nManager } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

type Props = {
  label: string;
  value: string;
  selected: boolean;
  onSelect: (value: string) => void;
  disabled?: boolean;
};

export const RadioButton: React.FC<Props> = ({ label, value, selected, onSelect, disabled }) => {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={() => !disabled && onSelect(value)}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        { flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.radio, { borderColor: theme.colors.primary }]}>
        {selected && <View style={[styles.radioInner, { backgroundColor: theme.colors.primary }]} />}
      </View>
      <Text
        style={[
          theme.typography.body,
          { color: disabled ? theme.colors.text.disabled : theme.colors.onBackground },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 12, paddingHorizontal: 0, marginBottom: 8 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginRight: I18nManager.isRTL ? 0 : 12, marginLeft: I18nManager.isRTL ? 12 : 0 },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.8 },
});
