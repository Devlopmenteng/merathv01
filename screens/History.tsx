import { t } from '../lib/i18n';
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { getAuditTrail, searchAuditTrail, AuditEntry } from '../lib/services/AuditTrailService';
import { useAppTheme } from '../hooks/useAppTheme';
import { formatCurrency } from '../lib/utils/currency';

export const History = ({ navigation }: any) => {
  const theme = useAppTheme();
  const [trail, setTrail] = useState<AuditEntry[]>([]);
  const [filtered, setFiltered] = useState<AuditEntry[]>([]);
  const [search, setSearch] = useState('');
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const entries = await getAuditTrail();
      setTrail(entries);
      setFiltered(entries);
      setLoadError(false);
    } catch {
      setTrail([]);
      setFiltered([]);
      setLoadError(true);
    }
  };

  const handleSearch = async (text: string) => {
    setSearch(text);
    if (text.trim() === '') {
      setFiltered(trail);
    } else {
      try {
        const results = await searchAuditTrail(text);
        setFiltered(results);
      } catch {
        setFiltered([]);
      }
    }
  };

  return (
    <View style={{ flex: 1, padding: theme.spacing.lg }}>
      <Text style={theme.typography.h1}>سجل الحسابات</Text>
      <TextInput
        style={{
          padding: theme.spacing.sm,
          borderWidth: 1,
          borderColor: theme.colors.outline,
          borderRadius: theme.radius.md,
          marginVertical: theme.spacing.md,
          color: theme.colors.onSurface,
        }}
        placeholder="ابحث بالاسم أو التاريخ أو المذهب..."
        placeholderTextColor={theme.colors.outline}
        value={search}
        onChangeText={handleSearch}
      />
      <ScrollView>
        {loadError ? (
          <Text style={[theme.typography.body, { color: theme.colors.error }]}>تعذر تحميل السجلات. حاول مرة أخرى لاحقاً.</Text>
        ) : filtered.length === 0 ? (
          <Text style={theme.typography.body}>لا توجد سجلات مطابقة.</Text>
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
                {entry.caseName || 'بدون اسم'} – {entry.caseDate || 'بدون تاريخ'}
              </Text>
              <Text>المذهب: {entry.madhab}</Text>
              <Text>صافي التركة: {formatCurrency(entry.netTotal)}</Text>
              <Text style={{ marginTop: 8, fontWeight: '600' }}>الورثة:</Text>
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
