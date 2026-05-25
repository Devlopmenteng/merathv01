import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { Stepper } from './ui/Stepper';
import { HeirType, HeirEntry } from '../lib/engine/types';
import { HEIR_NAMES } from '../lib/engine/constants';
import { applyHijab } from '../lib/engine/hijab';
import { t } from '../lib/i18n';
import { APP_DEFAULTS } from '../lib/constants/appDefaults';
import { showConfirm, showValidationError } from '../lib/utils/alerts';

const CATEGORIES: { titleKey: string; types: HeirType[] }[] = [
  { titleKey: 'spouse', types: ['husband', 'wife'] },
  { titleKey: 'children', types: ['son', 'daughter', 'grandson', 'granddaughter'] },
  { titleKey: 'parentsGrandparents', types: ['father', 'mother', 'grandfather', 'grandmother_mother', 'grandmother_father'] },
  { titleKey: 'siblings', types: ['full_brother', 'full_sister', 'paternal_brother', 'paternal_sister', 'maternal_brother', 'maternal_sister'] },
  { titleKey: 'extended', types: ['full_nephew', 'paternal_nephew', 'full_uncle', 'paternal_uncle', 'maternal_uncle', 'paternal_aunt', 'maternal_aunt'] },
];

const TEMPLATES: { name: string; heirs: { type: HeirType; count: number }[] }[] = [
  { name: 'Husband, Wife, 2 Sons, 1 Daughter', heirs: [{ type: 'husband', count: 1 }, { type: 'wife', count: 1 }, { type: 'son', count: 2 }, { type: 'daughter', count: 1 }] },
  { name: 'Father, Mother, Son, Daughter', heirs: [{ type: 'father', count: 1 }, { type: 'mother', count: 1 }, { type: 'son', count: 1 }, { type: 'daughter', count: 1 }] },
  { name: 'Wife, 3 Daughters', heirs: [{ type: 'wife', count: 1 }, { type: 'daughter', count: 3 }] },
  { name: 'Husband, 2 Sons', heirs: [{ type: 'husband', count: 1 }, { type: 'son', count: 2 }] },
  { name: 'Full Brothers (5)', heirs: [{ type: 'full_brother', count: 5 }] },
];

type Props = { heirs: HeirEntry[]; onHeirsChange: (heirs: HeirEntry[]) => void };

export const HeirSelector: React.FC<Props> = ({ heirs, onHeirsChange }) => {
  const theme = useAppTheme();
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['spouse', 'children']));
  const counts = React.useMemo(() => {
    const map = new Map<HeirType, number>();
    heirs.forEach(h => map.set(h.type, h.count));
    return map;
  }, [heirs]);

  const applyTemplate = (template: typeof TEMPLATES[0]) => {
    showConfirm(
      'apply_template',
      `Replace current heirs with "${template.name}"?`,
      () => onHeirsChange(template.heirs),
    );
  };

  const toggleExpand = (catKey: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(catKey)) next.delete(catKey);
      else next.add(catKey);
      return next;
    });
  };

  const updateCount = useCallback((type: HeirType, delta: number) => {
    const current = counts.get(type) || 0;
    const newCount = Math.max(0, current + delta);

    if (type === 'husband' && newCount > 0 && (counts.get('wife') || 0) > 0) {
      showValidationError('Husband', 'cannot_add_with_wife');
      return;
    }
    if (type === 'wife' && newCount > 0 && (counts.get('husband') || 0) > 0) {
      showValidationError('Wife', 'cannot_add_with_husband');
      return;
    }
    if (type === 'husband' && newCount > APP_DEFAULTS.MAX_HUSBANDS) {
      showValidationError('Husband', 'only_one_allowed');
      return;
    }
    if (type === 'wife' && newCount > APP_DEFAULTS.MAX_WIVES) {
      showValidationError('Wife', `maximum_allowed_${APP_DEFAULTS.MAX_WIVES}`);
      return;
    }
    if (['father', 'mother', 'grandfather'].includes(type) && newCount > APP_DEFAULTS.MAX_SINGLE_HEIRS) {
      showValidationError(HEIR_NAMES[type], 'only_one_allowed');
      return;
    }
    const newHeirs = heirs.filter(h => h.type !== type);
    if (newCount > 0) newHeirs.push({ type, count: newCount });
    onHeirsChange(newHeirs);
  }, [heirs, counts, onHeirsChange]);

  const blockedTypes = React.useMemo(() => {
    const active = heirs.filter(h => h.count > 0);
    if (active.length === 0) return new Set<HeirType>();
    const result = applyHijab(active);
    const remaining = new Set(result.map(h => h.type));
    const activeTypes = new Set(active.map(h => h.type));
    return new Set([...activeTypes].filter(t => !remaining.has(t)));
  }, [heirs]);

  return (
    <ScrollView>{CATEGORIES.map(cat => {
        const open = expanded.has(cat.titleKey);
        return (
          <View key={cat.titleKey} style={{ marginBottom: 12 }}>
            <TouchableOpacity
              onPress={() => toggleExpand(cat.titleKey)}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                padding: 12,
                backgroundColor: theme.colors?.surface || '#fff',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.colors?.outline || '#A49E93',
              }}
            >
              <Text style={theme.typography?.h3}>{t(cat.titleKey)}</Text>
              <Text style={{ fontSize: 18 }}>{open ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {open && cat.types.map(type => {
              const count = counts.get(type) || 0;
              const isBlocked = blockedTypes.has(type) && count === 0;
              return (
                <View key={type} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 6 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={theme.typography?.body}>{HEIR_NAMES[type]}</Text>
                    {isBlocked && <Text style={{ color: theme.colors?.error, fontSize: 12 }}>⛔ Blocked</Text>}
                  </View>
                  {isBlocked ? (
                    <Text style={{ color: theme.colors?.error, fontSize: 12 }}>—</Text>
                  ) : (
                    <Stepper
                      value={count}
                      onIncrease={() => updateCount(type, 1)}
                      onDecrease={() => updateCount(type, -1)}
                      min={0}
                      max={
                        type === 'wife'
                          ? APP_DEFAULTS.MAX_WIVES
                          : type === 'husband'
                          ? APP_DEFAULTS.MAX_HUSBANDS
                          : ['father', 'mother', 'grandfather'].includes(type)
                          ? APP_DEFAULTS.MAX_SINGLE_HEIRS
                          : APP_DEFAULTS.MAX_HEIR_COUNT
                      }
                    />
                  )}
                </View>
              );
            })}
          </View>
        );
      })}
    </ScrollView>
  );
};