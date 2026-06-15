import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAuditTrail, AuditEntry } from '../lib/services/AuditTrailService';
import { useAppTheme } from '../hooks/useAppTheme';
import { Divider } from '../components/ui/Divider';
import { Chip } from '../components/ui/Chip';
import { t } from '../lib/i18n';

export const History = ({
  navigation,
}: {
  navigation: { navigate: (screen: string, params?: Record<string, unknown>) => void };
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    getAuditTrail().then(setEntries);
  }, []);

  const filtered = entries.filter((e) => e.caseName?.includes(filter) || e.madhab.includes(filter));

  const renderItem = ({ item }: { item: AuditEntry }) => (
    <Pressable
      onPress={() => navigation.navigate('CalculationSteps', { auditEntry: item })}
      style={({ pressed }) => [styles.item, pressed && { opacity: 0.7 }]}
    >
      <View style={[styles.leftBorder, { borderLeftColor: theme.colors.primary }]} />
      <View style={styles.content}>
        <Text style={theme.typography.h4}>{item.caseName || t('no_name')}</Text>
        <Text style={theme.typography.caption}>
          {item.madhab} • {item.caseDate}
        </Text>
        <Text>
          {t('netEstate')}: {item.netTotal}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={{ padding: theme.spacing.lg, paddingTop: insets.top + theme.spacing.lg }}>
        <Text style={theme.typography.h1}>{t('history_screen_title')}</Text>
        <TextInput
          placeholder={t('search_placeholder')}
          value={filter}
          onChangeText={setFilter}
          style={styles.searchInput}
        />
        <ScrollView horizontal style={{ marginVertical: 8 }}>
          <Chip label="All" selected /> <Chip label="Hanafi" /> <Chip label="Maliki" />
        </ScrollView>
        <Divider />
        <FlatList data={filtered} renderItem={renderItem} keyExtractor={(_, i) => String(i)} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 8,
    marginVertical: 8,
  },
  item: { flexDirection: 'row', marginBottom: 12, paddingVertical: 8 },
  leftBorder: { borderLeftWidth: 4, marginRight: 12 },
  content: { flex: 1 },
});
