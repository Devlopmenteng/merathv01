import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from './AppText';

type TabItem = {
  key: string;
  title: string;
  icon?: string;
};

type Props = {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
  style?: object;
};

export const Tabs: React.FC<Props> = ({ tabs, activeTab, onTabChange, style }) => {
  const theme = useAppTheme();
  const [indicatorPosition] = useState(new Animated.Value(0));

  const handleTabChange = (key: string, index: number) => {
    onTabChange(key);
    Animated.spring(indicatorPosition, {
      toValue: index,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.tabsContainer, { borderBottomColor: theme.colors.outline }]}>
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => handleTabChange(tab.key, index)}
              style={styles.tab}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.title}
            >
              <AppText
                variant="button"
                color={isActive ? theme.colors.primary : theme.colors.text.secondary}
              >
                {tab.icon && `${tab.icon} `}
                {tab.title}
              </AppText>
              {isActive && (
                <Animated.View
                  style={[styles.indicator, { backgroundColor: theme.colors.primary }]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
});
