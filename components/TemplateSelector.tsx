import React, { useState, useMemo } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import {
  ScenarioTemplate,
  getTemplatesByCategory,
  getPopularTemplates,
  searchTemplates,
  getAllCategories,
  getCategoryDisplayName,
  applyTemplate,
} from '../lib/templates/ScenarioTemplates';
import type { EstateInput, HeirEntry } from '../lib/engine/types';

type ScenarioCategory =
  | 'nuclear_family'
  | 'extended_family'
  | 'special_cases'
  | 'business_owners'
  | 'no_descendants'
  | 'complex_cases';

interface TemplateSelectorProps {
  visible: boolean;
  onClose: () => void;
  onApply: (templateData: {
    estate: EstateInput;
    heirs: HeirEntry[];
    recommendedMadhab?: string | undefined;
  }) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = React.memo(({
  visible,
  onClose,
  onApply,
}) => {
  const theme = useAppTheme();
  const [selectedCategory, setSelectedCategory] = useState<ScenarioCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ScenarioTemplate | null>(null);

  const displayedTemplates = useMemo(() => {
    return selectedCategory
      ? getTemplatesByCategory(selectedCategory)
      : searchQuery
        ? searchTemplates(searchQuery)
        : getPopularTemplates();
  }, [selectedCategory, searchQuery]);

  const handleApply = () => {
    if (selectedTemplate) {
      const applied = applyTemplate(selectedTemplate);
      onApply(applied);
      onClose();
    }
  };

  const renderCategoryChip = (category: ScenarioCategory) => {
    const isSelected = selectedCategory === category;
    return (
      <TouchableOpacity
        key={category}
        onPress={() => setSelectedCategory(category)}
        style={[
          styles.categoryChip,
          {
            backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceVariant,
            borderColor: isSelected ? theme.colors.primary : theme.colors.outline,
          },
        ]}
      >
        <Text
          style={{
            color: isSelected ? theme.colors.onPrimary : theme.colors.onSurface,
            fontSize: 12,
            fontWeight: '600',
          }}
        >
          {getCategoryDisplayName(category)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTemplateCard = (template: ScenarioTemplate) => {
    const isSelected = selectedTemplate?.id === template.id;
    return (
      <TouchableOpacity
        key={template.id}
        onPress={() => setSelectedTemplate(template)}
        style={styles.templateCard}
      >
        <Card
          variant={isSelected ? 'filled' : 'outlined'}
          {...(template.popular ? { leftBorder: theme.colors.secondary } : {})}
          style={
            [
              styles.card,
              isSelected ? { borderColor: theme.colors.primary, borderWidth: 2 } : {},
            ] as any
          }
        >
          <Text style={[styles.templateName, theme.typography.h4]}>{template.name}</Text>
          <Text style={[styles.templateDescription, { color: theme.colors.text.secondary }]}>
            {template.description}
          </Text>
          {template.notes && (
            <Text style={[styles.templateNotes, { color: theme.colors.outline }]}>
              💡 {template.notes}
            </Text>
          )}
          {template.popular && (
            <Text style={[styles.popularBadge, { color: theme.colors.secondary }]}>⭐ Popular</Text>
          )}
          {template.recommendedMadhab && (
            <Text style={[styles.recommendedMadhab, { color: theme.colors.primary }]}>
              Recommended: {template.recommendedMadhab}
            </Text>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.outline }]}>
          <Text style={[theme.typography.h3, { flex: 1 }]}>Quick Setup Templates</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ fontSize: 24, color: theme.colors.text.secondary }}>×</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Input label="Search templates" value={searchQuery} onChangeText={setSearchQuery} />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
          style={styles.categoriesScrollView}
        >
          <TouchableOpacity
            onPress={() => setSelectedCategory(null)}
            style={[
              styles.categoryChip,
              {
                backgroundColor:
                  selectedCategory === null ? theme.colors.primary : theme.colors.surfaceVariant,
                borderColor:
                  selectedCategory === null ? theme.colors.primary : theme.colors.outline,
              },
            ]}
          >
            <Text
              style={{
                color: selectedCategory === null ? theme.colors.onPrimary : theme.colors.onSurface,
                fontSize: 12,
                fontWeight: '600',
              }}
            >
              All
            </Text>
          </TouchableOpacity>
          {getAllCategories().map(renderCategoryChip)}
        </ScrollView>

        <ScrollView style={styles.templatesScroll}>
          {displayedTemplates.map(renderTemplateCard)}
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: theme.colors.outline }]}>
          <View style={styles.selectedTemplate}>
            {selectedTemplate ? (
              <>
                <Text style={[theme.typography.bodySmall, { color: theme.colors.text.secondary }]}>
                  Selected:
                </Text>
                <Text style={[theme.typography.button, { color: theme.colors.primary }]}>
                  {selectedTemplate.name}
                </Text>
              </>
            ) : (
              <Text style={[theme.typography.bodySmall, { color: theme.colors.text.secondary }]}>
                Select a template to get started
              </Text>
            )}
          </View>
          <Button
            title="Apply Template"
            onPress={handleApply}
            disabled={!selectedTemplate}
            mode="filled"
            fullWidth
          />
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  searchContainer: {
    marginBottom: 16,
  },
  categoriesScrollView: {
    maxHeight: 50,
  },
  categoriesScroll: {
    gap: 8,
    paddingHorizontal: 4,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  templatesScroll: {
    flex: 1,
    paddingBottom: 16,
  },
  templateCard: {
    marginBottom: 12,
  },
  card: {
    padding: 16,
  },
  templateName: {
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  templateNotes: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  popularBadge: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  recommendedMadhab: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'column',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  selectedTemplate: {
    flexDirection: 'column',
    gap: 4,
  },
});
