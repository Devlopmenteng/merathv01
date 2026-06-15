import { t, i18n } from '../lib/i18n';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  ActivityIndicator,
  I18nManager,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAuditTrail, searchAuditTrail, AuditEntry } from '../lib/services/AuditTrailService';
import { useAppTheme } from '../hooks/useAppTheme';
import { formatCurrency as formatCurrencyLocale } from '../lib/utils/localeFormatting';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { elevation } from '../lib/constants/theme';

type HistoryNavigation = {
  navigate: (screen: string, params?: Record<string, unknown>) => void;
};

export const History = ({ navigation }: { navigation: HistoryNavigation }) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [trail, setTrail] = useState<AuditEntry[]>([]);
  const [filtered, setFiltered] = useState<AuditEntry[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const entries = await getAuditTrail();
      setTrail(entries);
      setFiltered(entries);
    } finally {
      setLoading(false);
    }
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

  const renderItem = ({ item }: { item: AuditEntry }) => (
    <TouchableOpacity
      style={[styles.historyItem, { backgroundColor: theme.colors.surface }]}
      onPress={() => navigation.navigate('CalculationSteps', { auditEntry: item })}
      activeOpacity={0.8}
      accessibilityLabel={`${item.caseName || t('no_name')} – ${item.caseDate || t('no_date')}. ${t('madhab')}: ${t('madhab_name_' + item.madhab, { defaultValue: item.madhab })}. ${t('netEstate')}: ${formatCurrencyLocale(item.netTotal, i18n.locale)}`}
      accessibilityHint={t('a11y_view_calculation_details')}
      accessibilityRole="button"
    >
      <View style={[styles.leftBorder, { backgroundColor: theme.colors.primary }]} />
      <View style={styles.historyContent}>
        <Text
          style={[
            styles.caseName,
            theme.typography.h4,
            { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr', color: theme.colors.onSurface },
          ]}
        >
          {item.caseName || t('no_name')} – {item.caseDate || t('no_date')}
        </Text>
        <View style={styles.detailRow}>
          <Badge 
            text={t('madhab_name_' + item.madhab, { defaultValue: item.madhab }).toUpperCase()} 
            variant="info" 
            size="small" 
          />
          <Text
            style={[
              styles.detailText,
              {
                color: theme.colors.text.secondary,
                writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
              },
            ]}
          >
            {t('netEstate')}: {formatCurrencyLocale(item.netTotal, i18n.locale)}
          </Text>
        </View>
        <View style={styles.heirsList}>
          {item.shares.slice(0, 3).map((share, i) => (
            <Badge
              key={i}
              text={`${share.name}: ${formatCurrencyLocale(share.amount, i18n.locale)}`}
              variant="success"
              size="small"
            />
          ))}
          {item.shares.length > 3 && (
            <Text
              style={[
                styles.heirText,
                {
                  color: theme.colors.text.secondary,
                  writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
                },
              ]}
            >
              ...
            </Text>
          )}
        </View>
      </View>
      {I18nManager.isRTL ? (
        <Text style={styles.chevron}>‹</Text>
      ) : (
        <Text style={styles.chevron}>›</Text>
      )}
    </TouchableOpacity>
  );

  const keyExtractor = (item: AuditEntry, index: number) => `${item.timestamp}-${index}`;

  return (
    <View
      style={{
        flex: 1,
        padding: theme.spacing.lg,
        paddingTop: insets.top + theme.spacing.lg,
        paddingBottom: insets.bottom,
      }}
    >
      <Button
        title={t('back_to_home')}
        onPress={() => navigation.navigate('Home')}
        mode="outlined"
        style={{ marginBottom: theme.spacing.md }}
      />
      <Text style={[theme.typography.h1, { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' }]}>
        {t('history_screen_title')}
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
          textAlign: I18nManager.isRTL ? 'right' : 'left',
          writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
        }}
        placeholder={t('search_placeholder')}
        placeholderTextColor={theme.colors.outline}
        value={search}
        onChangeText={handleSearch}
        accessibilityLabel={t('search_placeholder')}
        accessibilityHint={t('a11y_search_history')}
      />
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}
        >
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            style={[
              theme.typography.body,
              {
                marginTop: 8,
                color: theme.colors.text.secondary,
                writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
              },
            ]}
          >
            {t('loading')}
          </Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center', 
          paddingVertical: 40,
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: 12,
          marginVertical: theme.spacing.xl
        }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>📜</Text>
          <Text
            style={[
              theme.typography.h3,
              {
                textAlign: 'center',
                color: theme.colors.text.secondary,
                writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
              },
            ]}
          >
            {t('no_history')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={true}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10}
          getItemLayout={(_data, index) => ({
            length: 100,
            offset: 100 * index,
            index,
          })}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    ...elevation.small,
  },
  leftBorder: {
    position: 'absolute',
    left: I18nManager.isRTL ? undefined : 0,
    right: I18nManager.isRTL ? 0 : undefined,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderTopRightRadius: I18nManager.isRTL ? 12 : 0,
    borderBottomRightRadius: I18nManager.isRTL ? 12 : 0,
  },
  historyContent: {
    flex: 1,
    marginHorizontal: 16,
  },
  caseName: {
    fontWeight: '600',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
  },
  heirsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  heirText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  chevron: {
    fontSize: 24,
    color: '#9CA3AF',
    marginHorizontal: 8,
  },
});
