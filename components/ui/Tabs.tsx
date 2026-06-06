import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

type Tab = {
  key: string;
  label: string;
};

type TabsProps = {
  tabs: Tab[];
  activeTab: string;
  onChange: (key: string) => void;
  variant?: 'primary' | 'underlined';
};

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, variant = 'primary' }) => {
  const theme = useAppTheme();

  if (variant === 'underlined') {
    return (
      <View
        style={[styles.underlinedContainer, { borderBottomColor: theme.colors.outlineVariant }]}
      >
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onChange(tab.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              style={styles.underlinedTab}
            >
              <Text
                style={[
                  styles.underlinedLabel,
                  {
                    color: isActive ? theme.colors.primary : theme.colors.onSurfaceVariant,
                    fontWeight: isActive ? '600' : '400',
                  },
                ]}
              >
                {tab.label}
              </Text>
              {isActive && (
                <View
                  style={[styles.underlinedIndicator, { backgroundColor: theme.colors.primary }]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <View style={[styles.primaryContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onChange(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            style={[
              styles.primaryTab,
              isActive && {
                backgroundColor: theme.colors.primary,
                ...theme.elevation.small,
              },
            ]}
          >
            <Text
              style={[
                styles.primaryLabel,
                {
                  color: isActive ? theme.colors.onPrimary : theme.colors.onSurface,
                  fontWeight: isActive ? '600' : '400',
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  primaryContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  primaryTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryLabel: {
    fontSize: 14,
  },
  underlinedContainer: {
    flexDirection: 'row',
    borderBottomWidth: 2,
  },
  underlinedTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  underlinedLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  underlinedIndicator: {
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    width: '60%',
  },
});
