import { t } from '../lib/i18n';
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAuditTrail, searchAuditTrail, AuditEntry } from '../lib/services/AuditTrailService';
import { useAppTheme } from '../hooks/useAppTheme';
import { formatCurrency } from '../lib/utils/currency';

type HistoryNavigation = {
  navigate: (screen: string, params?: Record<string, unknown>) => void;
};

export const History = ({ navigation }: { navigation: HistoryNavigation }) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [trail, setTrail] = useState<AuditEntry[]>([]);
  const [filtered, setFiltered] = useState<AuditEntry[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const entries = await getAuditTrail();
    setTrail(entries);
    setFiltered(entries);
  };

  const handleSearch = async (text: string) => {
    setSearch(text);
    if (text.trim() === '') {
      setFiltered(trail);
    } else {
      const results = await searchAuditTrail(text);
      setFiltered(results);
    }
  };

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
        onPress={() => navigation.navigate('Home')}
        style={{ marginBottom: theme.spacing.md }}
        accessibilityLabel={t('back_to_home')}
        accessibilityRole="button"
      >
        <Text style={[{ color: theme.colors.primary }, theme.typography.button]}>← {t('back_to_home')}</Text>
      </TouchableOpacity>
      <Text style={theme.typography.h1}>{t('history_screen_title')}</Text>
      <TextInput
        style={{
          padding: theme.spacing.sm,
          borderWidth: 2,
          borderColor: theme.colors.outline,
          borderRadius: theme.borderRadius.md,
          marginVertical: theme.spacing.md,
          color: theme.colors.onSurface,
          backgroundColor: theme.colors.surface,
          ...theme.elevation.small,
        }}
        placeholder={t('search_placeholder')}
        placeholderTextColor={theme.colors.outline}
        value={search}
        onChangeText={handleSearch}
      />
      <ScrollView>
        {filtered.length === 0 ? (
          <Text
            style={[theme.typography.body, { textAlign: 'center', marginTop: theme.spacing.xl }]}
          >
            {t('no_history')}
          </Text>
        ) : (
          filtered.map((entry, idx) => (
            <TouchableOpacity
              key={idx}
              style={{
                backgroundColor: theme.colors.surface,
                padding: theme.spacing.md,
                marginBottom: theme.spacing.sm,
                borderRadius: theme.borderRadius.md,
                borderLeftWidth: 4,
                borderLeftColor: theme.colors.primary,
                ...theme.elevation.small,
                borderWidth: 1,
                borderColor: theme.colors.outline,
              }}
              onPress={() => navigation.navigate('CalculationSteps', { auditEntry: entry })}
              accessibilityLabel={`${entry.caseName || t('no_name')}, ${entry.caseDate || t('no_date')}, ${entry.madhab} madhab, ${formatCurrency(entry.netTotal)}`}
              accessibilityHint={`${entry.shares.length} heirs. Tap to view calculation steps.`}
              accessibilityRole="button"
            >
              <Text style={[{ fontWeight: '600', marginBottom: theme.spacing.xs }, theme.typography.button]}>
                {entry.caseName || t('no_name')} – {entry.caseDate || t('no_date')}
              </Text>
              <Text style={[theme.typography.bodySmall, { color: theme.colors.text.secondary }]}>
                {t('madhab')}: {entry.madhab}
              </Text>
              <Text style={[theme.typography.bodySmall, { color: theme.colors.text.secondary }]}>
                {t('netEstate')}: {formatCurrency(entry.netTotal)}
              </Text>
              <Text
                style={[
                  theme.typography.bodySmall,
                  { fontWeight: '600', marginTop: theme.spacing.sm },
                ]}
              >
                {t('heirs')}:
              </Text>
              {entry.shares.slice(0, 3).map((share, i) => (
                <Text
                  key={i}
                  style={[
                    theme.typography.caption,
                    { marginLeft: theme.spacing.sm, color: theme.colors.text.secondary },
                  ]}
                >
                  • {share.name}: {formatCurrency(share.amount)}
                </Text>
              ))}
              {entry.shares.length > 3 && (
                <Text
                  style={[
                    theme.typography.caption,
                    { marginLeft: theme.spacing.sm, color: theme.colors.text.secondary },
                  ]}
                >
                  ...
                </Text>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};
