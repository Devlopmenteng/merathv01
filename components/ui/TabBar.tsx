import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

type Tab<T extends string> = {
  key: T;
  label: string;
  activeColor?: string;
};

type Props<T extends string> = {
  tabs: Tab<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
};

export function TabBar<T extends string>({ tabs, activeTab, onTabChange }: Props<T>) {
  const theme = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.key;
        const activeBg = tab.activeColor || theme.colors.primary;
        return (
          <TouchableOpacity
            key={tab.key}
            style={{
              flex: 1,
              padding: theme.spacing.sm,
              borderRadius: theme.radius.md,
              backgroundColor: isActive ? activeBg : theme.colors.surfaceVariant,
              alignItems: 'center',
            }}
            onPress={() => onTabChange(tab.key)}
          >
            <Text style={{ color: isActive ? theme.colors.onPrimary : theme.colors.onSurface }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
