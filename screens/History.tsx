import { t } from '../lib/i18n';
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { getAuditTrail, searchAuditTrail, AuditEntry } from '../lib/services/AuditTrailService';
import { useAppTheme } from '../hooks/useAppTheme';
import { formatCurrency } from '../lib/utils/currency';

export const History = () => {
  const theme = useAppTheme();
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
    <View style={{ flex: 1, padding: theme.spacing.lg }}>
      <Text style={theme.typography.h1}>{t('history_screen_title')}</Text>
      <TextInput
        style={{
          padding: theme.spacing.sm,
          borderWidth: 1,
          borderColor: theme.colors.outline,
          borderRadius: theme.radius.md,
          marginVertical: theme.spacing.md,
          color: theme.colors.onSurface,
        }}
        placeholder={t('search_placeholder')}
        placeholderTextColor={theme.colors.outline}
        value={search}
        onChangeText={handleSearch}
      />
      <ScrollView>
        {filtered.length === 0 ? (
          <Text style={theme.typography.body}>{t('no_history')}</Text>
        ) : (
          filtered.map((entry, idx) => (
            <TouchableOpacity
              key={idx}
              style={{
                backgroundColor: theme.colors.surface,
                padding: theme.spacing.md,
                marginBottom: theme.spacing.sm,
                borderRadius: theme.radius.md,
                borderLeftWidth: 4,
                borderLeftColor: theme.colors.primary,
              }}
            >
              <Text style={{ fontWeight: 'bold' }}>
                {entry.caseName || t('no_name')} – {entry.caseDate || t('no_date')}
              </Text>
              <Text>
                {t('madhab')}: {entry.madhab}
              </Text>
              <Text>
                {t('netEstate')}: {formatCurrency(entry.netTotal)}
              </Text>
              <Text style={{ marginTop: 8, fontWeight: '600' }}>{t('heirs')}:</Text>
              {entry.shares.slice(0, 3).map((share, i) => (
                <Text key={i} style={{ fontSize: 12, marginLeft: 8 }}>
                  • {share.name}: {formatCurrency(share.amount)}
                </Text>
              ))}
              {entry.shares.length > 3 && <Text style={{ fontSize: 12, marginLeft: 8 }}>...</Text>}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};
