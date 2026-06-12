import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../hooks/useAppTheme';
import { Card } from '../components/ui/Card';
import { t } from '../lib/i18n';
import { backArrow } from '../lib/utils/rtl';
import {
  SCENARIO_TEMPLATES,
  getTemplatesByCategory,
  searchTemplates,
  getAllCategories,
  getCategoryDisplayName,
  applyTemplate,
  type ScenarioTemplate,
  type ScenarioCategory,
} from '../lib/templates/ScenarioTemplates';
import { useCalc } from '../lib/context/CalcContext';
import { Alert } from 'react-native';

type TestCasesNavigation = {
  navigate: (screen: string, params?: Record<string, unknown>) => void;
  goBack: () => void;
};

export const TestCases = ({ navigation }: { navigation: TestCasesNavigation }) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { dispatch } = useCalc();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ScenarioCategory | null>(null);
  const [filteredTemplates, setFilteredTemplates] =
    useState<ScenarioTemplate[]>(SCENARIO_TEMPLATES);

  const categories = getAllCategories();

  const handleSearch = useCallback(
    (text: string) => {
      setSearch(text);
      if (text.trim() === '') {
        setFilteredTemplates(
          selectedCategory ? getTemplatesByCategory(selectedCategory) : SCENARIO_TEMPLATES
        );
      } else {
        setFilteredTemplates(searchTemplates(text));
      }
    },
    [selectedCategory]
  );

  const handleCategoryFilter = useCallback((category: ScenarioCategory | null) => {
    setSelectedCategory(category);
    if (category) {
      setFilteredTemplates(getTemplatesByCategory(category));
    } else {
      setFilteredTemplates(SCENARIO_TEMPLATES);
    }
    setSearch('');
  }, []);

  const applyTestCase = useCallback(
    (template: ScenarioTemplate) => {
      // Show immediate feedback
      Alert.alert(
        t('template_applied'),
        `${t('template_name')}: ${template.name}\n${t('recommended_madhab')}: ${template.recommendedMadhab ? t('madhab_name_' + template.recommendedMadhab, { defaultValue: template.recommendedMadhab }) : t('any_fallback')}`
      );

      // Navigate immediately for optimistic feedback
      navigation.navigate('Results');

      // Then apply the actual state updates
      setTimeout(() => {
        const { estate, heirs, recommendedMadhab } = applyTemplate(template);

        // Dispatch estate setup
        dispatch({
          type: 'SET_ESTATE',
          payload: {
            total: estate.total,
            funeral: estate.funeral,
            debts: estate.debts,
            will: estate.will,
          },
        });

        // Dispatch heirs
        dispatch({
          type: 'SET_HEIRS',
          payload: heirs,
        });

        // Dispatch madhab if recommended
        if (recommendedMadhab) {
          dispatch({
            type: 'SET_MADHAB',
            payload: recommendedMadhab,
          });
        }
      }, 100);
    },
    [dispatch, navigation]
  );

  return (
    <View
      style={{
        flex: 1,
        padding: theme.spacing.lg,
        paddingTop: insets.top + theme.spacing.lg,
        paddingBottom: insets.bottom,
      }}
    >
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ marginBottom: theme.spacing.md }}
        accessibilityLabel={t('back')}
        accessibilityRole="button"
      >
        <Text style={[{ color: theme.colors.primary }, theme.typography.button]}>
          {backArrow()} {t('back')}
        </Text>
      </TouchableOpacity>

      <Text style={theme.typography.h1}>{t('test_cases')}</Text>
      <Text
        style={[
          theme.typography.body,
          { color: theme.colors.text.secondary, marginBottom: theme.spacing.md },
        ]}
      >
        {t('test_cases_description')}
      </Text>

      <TextInput
        style={{
          padding: theme.spacing.sm,
          borderWidth: 2,
          borderColor: theme.colors.outline,
          borderRadius: theme.borderRadius.md,
          marginBottom: theme.spacing.md,
          color: theme.colors.onSurface,
          backgroundColor: theme.colors.surface,
          ...theme.elevation.small,
        }}
        placeholder={t('search_templates')}
        placeholderTextColor={theme.colors.outline}
        value={search}
        onChangeText={handleSearch}
        accessibilityLabel={t('search_templates')}
        accessibilityHint={t('a11y_search_templates_hint')}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: theme.spacing.md }}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            {
              backgroundColor:
                selectedCategory === null ? theme.colors.primary : theme.colors.surfaceVariant,
              borderColor: theme.colors.outline,
            },
          ]}
          onPress={() => handleCategoryFilter(null)}
          accessibilityLabel={t('all')}
          accessibilityHint={t('a11y_filter_all_categories')}
          accessibilityRole="button"
          accessibilityState={{ selected: selectedCategory === null }}
        >
          <Text
            style={{
              color: selectedCategory === null ? theme.colors.onPrimary : theme.colors.text.primary,
            }}
          >
            {t('all')}
          </Text>
        </TouchableOpacity>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              {
                backgroundColor:
                  selectedCategory === category
                    ? theme.colors.primary
                    : theme.colors.surfaceVariant,
                borderColor: theme.colors.outline,
              },
            ]}
            onPress={() => handleCategoryFilter(category)}
            accessibilityLabel={getCategoryDisplayName(category)}
            accessibilityHint={t('a11y_filter_by_category', { category: getCategoryDisplayName(category) })}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedCategory === category }}
          >
            <Text
              style={{
                color:
                  selectedCategory === category
                    ? theme.colors.onPrimary
                    : theme.colors.text.primary,
              }}
            >
              {getCategoryDisplayName(category)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredTemplates.length === 0 ? (
          <Card variant="outlined" padding="lg">
            <Text style={[theme.typography.body, { textAlign: 'center' }]}>
              {t('no_templates_found')}
            </Text>
          </Card>
        ) : (
          filteredTemplates.map((template) => (
            <TouchableOpacity
              key={template.id}
              style={[
                styles.templateCard,
                {
                  backgroundColor: template.popular
                    ? theme.colors.primary + '10'
                    : theme.colors.surface,
                  borderRadius: theme.borderRadius.lg,
                  padding: theme.spacing.md,
                  marginBottom: theme.spacing.md,
                  ...theme.elevation.small,
                  borderWidth: 1,
                  borderColor: template.popular ? theme.colors.primary : theme.colors.outline,
                },
              ]}
              onPress={() => applyTestCase(template)}
              accessibilityLabel={`${template.name}. ${template.description}`}
              accessibilityHint={t('a11y_apply_template', { description: template.description })}
              accessibilityRole="button"
            >
              {template.popular && (
                <View
                  style={{
                    position: 'absolute',
                    top: theme.spacing.sm,
                    right: theme.spacing.sm,
                    backgroundColor: theme.colors.primary,
                    paddingHorizontal: theme.spacing.sm,
                    paddingVertical: theme.spacing.xs,
                    borderRadius: theme.borderRadius.sm,
                  }}
                >
                  <Text
                    style={[
                      {
                        color: theme.colors.onPrimary,
                        fontWeight: '600',
                      },
                      theme.typography.caption,
                    ]}
                  >
                    {t('popular')}
                  </Text>
                </View>
              )}

              <Text
                style={[
                  theme.typography.h3,
                  { color: theme.colors.text.primary, marginBottom: theme.spacing.xs },
                ]}
              >
                {template.name}
              </Text>
              <Text
                style={[
                  theme.typography.body,
                  { color: theme.colors.text.secondary, marginBottom: theme.spacing.sm },
                ]}
              >
                {template.description}
              </Text>

              <View style={styles.detailsRow}>
                <Text
                  style={[
                    theme.typography.body,
                    { fontWeight: '500', color: theme.colors.text.secondary },
                  ]}
                >
                  {t('estate')}:{' '}
                </Text>
                <Text style={[theme.typography.body, { color: theme.colors.text.primary }]}>
                  {t('currency_symbol')}
                  {template.estate.total.toLocaleString()}
                </Text>
              </View>

              <View style={styles.detailsRow}>
                <Text
                  style={[
                    theme.typography.body,
                    { fontWeight: '500', color: theme.colors.text.secondary },
                  ]}
                >
                  {t('heirs')}:{' '}
                </Text>
                <Text style={[theme.typography.body, { color: theme.colors.text.primary }]}>
                  {template.heirs.length === 1
                    ? t('heir_count_one')
                    : t('heir_count_other').replace('%{count}', String(template.heirs.length))}
                </Text>
              </View>

              {template.recommendedMadhab && (
                <View style={styles.detailsRow}>
                  <Text
                    style={[
                      theme.typography.body,
                      { fontWeight: '500', color: theme.colors.text.secondary },
                    ]}
                  >
                    {t('recommended_madhab')}:{' '}
                  </Text>
                  <Text style={[theme.typography.body, { color: theme.colors.primary }]}>
                    {t('madhab_name_' + template.recommendedMadhab, {
                      defaultValue: template.recommendedMadhab,
                    })}
                  </Text>
                </View>
              )}

              {template.notes && (
                <Text
                  style={[
                    theme.typography.caption,
                    {
                      fontStyle: 'italic',
                      color: theme.colors.text.secondary,
                      marginTop: theme.spacing.sm,
                    },
                  ]}
                >
                  {t('note')}: {template.notes}
                </Text>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginEnd: 8,
    borderWidth: 1,
    minHeight: 44,
  }, // chip uses fixed values intentionally for pill-shape design
  templateCard: {
    overflow: 'hidden',
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
});
