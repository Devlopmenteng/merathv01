import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../hooks/useAppTheme';
import { Card } from '../components/ui/Card';
import { t } from '../lib/i18n';

type HomeNavigation = {
  navigate: (screen: string) => void;
};

export const Home = ({ navigation }: { navigation: HomeNavigation }) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

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
    {
      title: t('test_cases'),
      description: t('test_cases_description'),
      icon: '🧪',
      screen: 'TestCases',
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
          paddingBottom: theme.spacing.xxl + insets.bottom,
          paddingTop: insets.top + theme.spacing.lg,
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
          <Card
            key={item.screen}
            onPress={() => navigation.navigate(item.screen)}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <Text style={{ fontSize: 32, marginEnd: theme.spacing.md }}>{item.icon}</Text>
            <View style={styles.menuItemContent}>
              <Text
                style={[
                  theme.typography.h3,
                  { color: theme.colors.onSurface, marginBottom: theme.spacing.xs },
                ]}
              >
                {item.title}
              </Text>
              <Text style={[theme.typography.body, { color: theme.colors.text.secondary }]}>
                {item.description}
              </Text>
            </View>
          </Card>
        ))}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuItemContent: {
    flex: 1,
  },
});
