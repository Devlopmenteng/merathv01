import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

export const Divider = () => {
  const theme = useAppTheme();
  return <View style={[styles.divider, { backgroundColor: theme.colors.outline }]} />;
};

const styles = StyleSheet.create({ divider: { height: 1, marginVertical: 8 } });
