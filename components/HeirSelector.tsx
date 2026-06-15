import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { HeirType, HeirEntry } from '../lib/engine/types';
import { HEIR_NAMES } from '../lib/engine/constants';
import { applyHijab } from '../lib/engine/hijab';
import { t } from '../lib/i18n';
import { APP_DEFAULTS } from '../lib/constants/appDefaults';
import { showValidationError } from '../lib/utils/alerts';
import { flipDirectionalIcon } from '../lib/utils/rtl';
import { HeirRow } from './HeirRow';
import { TemplatesModal } from './TemplatesModal';
import { localizeHeirType } from '../lib/utils/shareLocalization';

const CATEGORIES: { titleKey: string; types: HeirType[] }[] = [
  { titleKey: 'spouse', types: ['husband', 'wife'] },
  { titleKey: 'children', types: ['son', 'daughter', 'grandson', 'granddaughter'] },
  {
    titleKey: 'parentsGrandparents',
    types: ['father', 'mother', 'grandfather', 'grandmother_mother', 'grandmother_father'],
  },
  {
    titleKey: 'siblings',
    types: [
      'full_brother',
      'full_sister',
      'paternal_brother',
      'paternal_sister',
      'maternal_brother',
      'maternal_sister',
    ],
  },
  {
    titleKey: 'extended',
    types: [
      'full_nephew',
      'paternal_nephew',
      'full_uncle',
      'paternal_uncle',
      'maternal_uncle',
      'paternal_aunt',
      'maternal_aunt',
    ],
  },
];

type Props = { heirs: HeirEntry[]; onHeirsChange: (heirs: HeirEntry[]) => void };

const areEqual = (prev: Props, next: Props) => {
  if (prev.onHeirsChange !== next.onHeirsChange) return false;
  if (prev.heirs.length !== next.heirs.length) return false;
  return prev.heirs.every((heir, index) => {
    const nextHeir = next.heirs[index];
    return heir.type === nextHeir.type && heir.count === nextHeir.count;
  });
};

export const HeirSelector: React.FC<Props> = React.memo(({ heirs, onHeirsChange }) => {
  const theme = useAppTheme();
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['spouse', 'children']));
  const [templatesVisible, setTemplatesVisible] = useState(false);

  const counts = useMemo(() => {
    const map = new Map<HeirType, number>();
    heirs.forEach((h) => map.set(h.type, h.count));
    return map;
  }, [heirs]);

  const toggleExpand = useCallback((catKey: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(catKey)) next.delete(catKey);
      else next.add(catKey);
      return next;
    });
  }, []);

  const updateCount = useCallback(
    (type: HeirType, delta: number) => {
      const current = counts.get(type) || 0;
      const newCount = Math.max(0, current + delta);

      if (type === 'husband' && newCount > 0 && (counts.get('wife') || 0) > 0) {
        showValidationError(t('husband'), 'cannot_add_with_wife');
        return;
      }
      if (type === 'wife' && newCount > 0 && (counts.get('husband') || 0) > 0) {
        showValidationError(t('wife'), 'cannot_add_with_husband');
        return;
      }
      if (type === 'husband' && newCount > APP_DEFAULTS.MAX_HUSBANDS) {
        showValidationError(t('husband'), 'only_one_allowed');
        return;
      }
      if (type === 'wife' && newCount > APP_DEFAULTS.MAX_WIVES) {
        Alert.alert(t('validation_error'), t('max_wives', { count: APP_DEFAULTS.MAX_WIVES }));
        return;
      }
      if (
        ['father', 'mother', 'grandfather'].includes(type) &&
        newCount > APP_DEFAULTS.MAX_SINGLE_HEIRS
      ) {
        Alert.alert(t('validation_error'), `${localizeHeirType(type)}: ${t('only_one_allowed')}`);
        return;
      }
      const newHeirs = heirs.filter((h) => h.type !== type);
      if (newCount > 0) newHeirs.push({ type, count: newCount });
      onHeirsChange(newHeirs);
    },
    [heirs, counts, onHeirsChange]
  );

  const blockedTypes = useMemo(() => {
    const active = heirs.filter((h) => h.count > 0);
    if (active.length === 0) return new Set<HeirType>();
    const result = applyHijab(active);
    const remaining = new Set(result.map((h) => h.type));
    const activeTypes = new Set(active.map((h) => h.type));
    return new Set([...activeTypes].filter((t) => !remaining.has(t)));
  }, [heirs]);

  const applyTemplate = (templateHeirs: HeirEntry[]) => {
    onHeirsChange(templateHeirs);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Modern Templates Button */}
      <TouchableOpacity
        style={[styles.templatesButton, { backgroundColor: theme.colors.primaryLight }]}
        onPress={() => setTemplatesVisible(true)}
      >
        <Text style={[styles.templatesButtonText, { color: theme.colors.primary }]}>
          {t('quick_templates')}
        </Text>
      </TouchableOpacity>

      {CATEGORIES.map((cat) => {
        const open = expanded.has(cat.titleKey);
        return (
          <View key={cat.titleKey} style={[styles.category, { backgroundColor: theme.colors.surface }]}>
            <TouchableOpacity
              onPress={() => toggleExpand(cat.titleKey)}
              style={[
                styles.categoryHeader,
                {
                  borderBottomColor: theme.colors.outline,
                  backgroundColor: open ? theme.colors.primaryLight : 'transparent',
                },
              ]}
            >
              <Text style={[styles.categoryTitle, { color: open ? theme.colors.primary : theme.colors.onSurface }]}>
                {t(cat.titleKey)}
              </Text>
              <Text style={[styles.categoryIcon, { color: theme.colors.text.secondary }]}>
                {open ? flipDirectionalIcon('▲') : flipDirectionalIcon('▼')}
              </Text>
            </TouchableOpacity>
            {open && (
              <View>
                {cat.types.map((type) => {
                  const count = counts.get(type) || 0;
                  const isBlocked = blockedTypes.has(type) && count === 0;
                  const max =
                    type === 'wife'
                      ? APP_DEFAULTS.MAX_WIVES
                      : type === 'husband'
                        ? APP_DEFAULTS.MAX_HUSBANDS
                        : ['father', 'mother', 'grandfather'].includes(type)
                          ? APP_DEFAULTS.MAX_SINGLE_HEIRS
                          : APP_DEFAULTS.MAX_HEIR_COUNT;
                  return (
                    <HeirRow
                      key={type}
                      type={type}
                      name={localizeHeirType(type) || HEIR_NAMES[type]}
                      count={count}
                      isBlocked={isBlocked}
                      onIncrease={() => updateCount(type, 1)}
                      onDecrease={() => updateCount(type, -1)}
                      min={0}
                      max={max}
                    />
                  );
                })}
              </View>
            )}
          </View>
        );
      })}

      <TemplatesModal
        visible={templatesVisible}
        onClose={() => setTemplatesVisible(false)}
        onSelectTemplate={applyTemplate}
      />
    </ScrollView>
  );
}, areEqual);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  templatesButton: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  templatesButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  category: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  categoryIcon: {
    fontSize: 18,
  },
});
