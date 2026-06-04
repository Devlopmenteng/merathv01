import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../hooks/useAppTheme';
import { t } from '../lib/i18n';
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
import { showAlert } from '../lib/utils/alerts';

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

      showAlert(
        t('template_applied'),
        `${t('template_name')}: ${template.name}\n${t('recommended_madhab')}: ${recommendedMadhab || 'Any'}`
      );

      // Navigate to Results to show the calculation
      navigation.navigate('Results');
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
        <Text style={{ color: theme.colors.primary, fontSize: 16 }}>← {t('back')}</Text>
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
          accessibilityLabel="All categories"
          accessibilityRole="button"
          accessibilityState={{ selected: selectedCategory === null }}
        >
          <Text
            style={{
              color: selectedCategory === null ? theme.colors.onPrimary : theme.colors.text.primary,
            }}
          >
            All
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
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.lg,
              ...theme.elevation.small,
              borderWidth: 1,
              borderColor: theme.colors.outline,
            }}
          >
            <Text style={[theme.typography.body, { textAlign: 'center' }]}>
              {t('no_templates_found')}
            </Text>
          </View>
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
              accessibilityLabel={template.name}
              accessibilityHint={`${template.description}. Tap to apply this template.`}
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
                    style={{
                      color: theme.colors.onPrimary,
                      fontSize: 12,
                      fontWeight: '600',
                    }}
                  >
                    Popular
                  </Text>
                </View>
              )}

              <Text style={[styles.templateName, { color: theme.colors.text.primary }]}>
                {template.name}
              </Text>
              <Text style={[styles.templateDescription, { color: theme.colors.text.secondary }]}>
                {template.description}
              </Text>

              <View style={styles.detailsRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>
                  {t('estate')}:{' '}
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
                  ${template.estate.total.toLocaleString()}
                </Text>
              </View>

              <View style={styles.detailsRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>
                  {t('heirs')}:{' '}
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
                  {template.heirs.length} {template.heirs.length === 1 ? 'heir' : 'heirs'}
                </Text>
              </View>

              {template.recommendedMadhab && (
                <View style={styles.detailsRow}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>
                    {t('recommended_madhab')}:{' '}
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.colors.primary }]}>
                    {template.recommendedMadhab}
                  </Text>
                </View>
              )}

              {template.notes && (
                <Text
                  style={[
                    styles.templateNotes,
                    { color: theme.colors.text.secondary, marginTop: theme.spacing.sm },
                  ]}
                >
                  Note: {template.notes}
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
    paddingHorizontal: theme.spacing?.md || 16,
    paddingVertical: theme.spacing?.sm || 8,
    borderRadius: 20,
    marginRight: theme.spacing?.sm || 8,
    borderWidth: 1,
  },
  templateCard: {
    overflow: 'hidden',
  },
  templateName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: theme.spacing?.xs || 4,
  },
  templateDescription: {
    fontSize: 14,
    marginBottom: theme.spacing?.sm || 8,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing?.xs || 4,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
  },
  templateNotes: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});
