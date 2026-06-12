import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../hooks/useAppTheme';
import { useResponsive } from '../hooks/useResponsive';
import { Card } from '../components/ui/Card';
import { t } from '../lib/i18n';

type HomeNavigation = {
  navigate: (screen: string) => void;
};

export const Home = ({ navigation }: { navigation: HomeNavigation }) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { breakpoint } = useResponsive();
  const isGrid = breakpoint === 'lg' || breakpoint === 'xl';

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

        <View style={[isGrid ? styles.gridContainer : styles.listContainer]}>
          {menuItems.map((item) => (
            <Card
              key={item.screen}
              onPress={() => navigation.navigate(item.screen)}
              style={[
                isGrid ? styles.gridItem : { flexDirection: 'row', alignItems: 'center' },
                item.primary && styles.primaryMenuItem,
              ] as any}
              accessibilityLabel={`${item.title}. ${item.description}`}
              accessibilityHint={t('a11y_navigate_to_screen', { screen: item.title })}
              accessibilityRole="button"
            >
              <Text style={[styles.menuIcon, item.primary && styles.primaryIcon]}>{item.icon}</Text>
              <View style={styles.menuItemContent}>
                <Text
                  style={[
                    item.primary ? theme.typography.h2 : theme.typography.h3,
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
        </View>
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
  menuIcon: {
    fontSize: 32,
    marginEnd: 16,
  },
  primaryMenuItem: {
    borderWidth: 2,
    borderColor: 'transparent',
  },
  primaryIcon: {
    fontSize: 40,
  },
  listContainer: {
    gap: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gridItem: {
    width: '48%',
    flexDirection: 'column',
    alignItems: 'center',
  },
});
