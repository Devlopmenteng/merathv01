import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../hooks/useAppTheme';
import { t } from '../lib/i18n';

type HomeNavigation = {
  navigate: (screen: string) => void;
};

export const Home = ({ navigation }: { navigation: HomeNavigation }) => {
  const theme = useAppTheme();

  const menuItems = [
    {
      title: t('calculate_inheritance'),
      description: t('start_new_calculation'),
      icon: '📊',
      screen: 'EstateSetup',
      primary: true,
    },
    {
      title: t('compare'),
      description: t('comparison_title'),
      icon: '⚖️',
      screen: 'Comparison',
      primary: false,
    },
    {
      title: t('history'),
      description: t('view_previous_calculations'),
      icon: '📜',
      screen: 'History',
      primary: false,
    },
    {
      title: t('glossary'),
      description: t('learn_terminology'),
      icon: '📖',
      screen: 'Glossary',
      primary: false,
    },
    {
      title: t('settings'),
      description: t('configure_app'),
      icon: '⚙️',
      screen: 'Settings',
      primary: false,
    },
  ];

  return (
    <LinearGradient
      colors={[theme.colors.background, theme.colors.surfaceVariant]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: theme.spacing.xxl,
        }}
      >
        <View style={{ marginBottom: theme.spacing.xxl }}>
          <Text style={theme.typography.h1}>{t('merath_v10__islamic_inheritance_calculator')}</Text>
          <Text
            style={[
              theme.typography.body,
              { color: theme.colors.text.secondary, marginTop: theme.spacing.sm },
            ]}
          >
            {t('app_description')}
          </Text>
        </View>

        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.screen}
            style={[
              styles.menuItem,
              {
                backgroundColor: item.primary ? theme.colors.primary : theme.colors.surface,
                borderColor: theme.colors.outline,
                ...theme.elevation.small,
              },
            ]}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <View style={styles.menuItemContent}>
              <Text
                style={[
                  styles.menuItemTitle,
                  { color: item.primary ? theme.colors.onPrimary : theme.colors.onSurface },
                ]}
              >
                {item.title}
              </Text>
              <Text
                style={[
                  styles.menuItemDescription,
                  {
                    color: item.primary
                      ? theme.colors.onPrimary + 'CC'
                      : theme.colors.text.secondary,
                  },
                ]}
              >
                {item.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  icon: {
    fontSize: 32,
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
  },
});
