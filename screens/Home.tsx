import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, I18nManager, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../hooks/useAppTheme';
import { useResponsive } from '../hooks/useResponsive';
import { t } from '../lib/i18n';

type HomeNavigation = {
  navigate: (screen: string) => void;
};

export const Home = ({ navigation }: { navigation: HomeNavigation }) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { breakpoint } = useResponsive();
  const isGrid = breakpoint === 'lg' || breakpoint === 'xl';

  const menuItems = useMemo(
    () => [
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
    ],
    []
  );

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
        {/* Modern Header with Gradient Background */}
        <View
          style={[
            styles.headerSection,
            {
              backgroundColor: 'rgba(79, 70, 229, 0.1)',
              borderLeftColor: theme.colors.primary,
            },
          ]}
        >
          <View style={styles.headerContent}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(79, 70, 229, 0.2)' }]}>
              <Text style={styles.headerIcon}>⚖️</Text>
            </View>
            <View>
              <Text
                style={[theme.typography.h1, { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' }]}
              >
                {t('merath_v10__islamic_inheritance_calculator')}
              </Text>
              <Text
                style={[
                  theme.typography.body,
                  {
                    color: theme.colors.text.secondary,
                    marginTop: theme.spacing.sm,
                    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
                  },
                ]}
              >
                {t('app_description')}
              </Text>
            </View>
          </View>
          
          {/* Feature Badges */}
          <View style={styles.badgesContainer}>
            <View style={[styles.featureBadge, { backgroundColor: 'rgba(79, 70, 229, 0.1)' }]}>
              <Text style={[styles.badgeText, { color: theme.colors.primary }]}>✓ {t('four_schools')}</Text>
            </View>
            <View style={[styles.featureBadge, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Text style={[styles.badgeText, { color: theme.colors.success }]}>✓ {t('blood_relatives')}</Text>
            </View>
            <View style={[styles.featureBadge, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <Text style={[styles.badgeText, { color: theme.colors.warning }]}>✓ {t('awl_radd')}</Text>
            </View>
          </View>
        </View>

        {/* Modern Menu Grid */}
        <View style={[isGrid ? styles.gridContainer : styles.listContainer]}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.screen}
              onPress={() => navigation.navigate(item.screen)}
              style={[
                isGrid
                  ? styles.gridItem
                  : [
                      styles.listItem,
                      {
                        flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
                        alignItems: 'center',
                      },
                    ],
                item.primary && styles.primaryMenuItem,
              ]}
              activeOpacity={0.7}
              accessibilityLabel={`${item.title}. ${item.description}`}
              accessibilityHint={t('a11y_navigate_to_screen', { screen: item.title })}
              accessibilityRole="button"
            >
              <View
                style={[
                  styles.iconContainer,
                  item.primary && styles.primaryIconContainer,
                  { borderLeftColor: item.primary ? theme.colors.primary : theme.colors.outline },
                ]}
              >
                <Text style={[styles.menuIcon, item.primary && styles.primaryIcon]}>
                  {item.icon}
                </Text>
              </View>
              <View style={styles.menuItemContent}>
                <Text
                  style={[
                    item.primary ? theme.typography.h2 : theme.typography.h3,
                    {
                      color: theme.colors.onSurface,
                      marginBottom: theme.spacing.xs,
                      writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
                    },
                  ]}
                >
                  {item.title}
                </Text>
                <Text
                  style={[
                    theme.typography.body,
                    {
                      color: theme.colors.text.secondary,
                      writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
                    },
                  ]}
                >
                  {item.description}
                </Text>
              </View>
              {I18nManager.isRTL ? (
                <Text style={styles.chevron}>‹</Text>
              ) : (
                <Text style={styles.chevron}>›</Text>
              )}
            </TouchableOpacity>
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
  headerSection: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIcon: {
    fontSize: 32,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  menuItemContent: {
    flex: 1,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderLeftWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: I18nManager.isRTL ? 0 : 16,
    marginLeft: I18nManager.isRTL ? 16 : 0,
  },
  primaryIconContainer: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  menuIcon: {
    fontSize: 28,
  },
  primaryIcon: {
    fontSize: 36,
  },
  primaryMenuItem: {
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
  },
  listItem: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  chevron: {
    fontSize: 28,
    color: '#9CA3AF',
    marginLeft: I18nManager.isRTL ? 0 : 8,
    marginRight: I18nManager.isRTL ? 8 : 0,
  },
  listContainer: {
    gap: 0,
  },
  gridContainer: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gridItem: {
    width: '48%',
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
});
