import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import Haptic from 'react-native-haptic-feedback';

type Props = {
  onPress: () => void;
  icon: string;
  disabled?: boolean;
};

export const FAB: React.FC<Props> = ({ onPress, icon, disabled }) => {
  const theme = useAppTheme();

  const handlePress = () => {
    Haptic.trigger('impactLight');
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.fab,
        { backgroundColor: theme.colors.primary, opacity: disabled ? 0.5 : pressed ? 0.9 : 1 },
      ]}
    >
      <Text style={[styles.icon, { color: theme.colors.onPrimary }]}>{icon}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  fab: { position: 'absolute', bottom: 16, right: 16, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 0 },
  icon: { fontSize: 24 },
});
