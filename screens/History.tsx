import { t, i18n } from '../lib/i18n';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  I18nManager,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAuditTrail, searchAuditTrail, AuditEntry } from '../lib/services/AuditTrailService';
import { useAppTheme } from '../hooks/useAppTheme';
import { formatCurrency as formatCurrencyLocale } from '../lib/utils/localeFormatting';
import { backArrow } from '../lib/utils/rtl';

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
      style={styles.historyItem}
      onPress={() => navigation.navigate('CalculationSteps', { auditEntry: item })}
      activeOpacity={0.7}
      accessibilityLabel={`${item.caseName || t('no_name')} – ${item.caseDate || t('no_date')}. ${t('madhab')}: ${t('madhab_name_' + item.madhab, { defaultValue: item.madhab })}. ${t('netEstate')}: ${formatCurrencyLocale(item.netTotal, i18n.locale)}`}
      accessibilityHint={t('a11y_view_calculation_details')}
      accessibilityRole="button"
    >
      <View style={[styles.leftBorder, { backgroundColor: theme.colors.primary }]} />
      <View style={styles.historyContent}>
        <Text
          style={[
            styles.caseName,
            theme.typography.button,
            { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
          ]}
        >
          {item.caseName || t('no_name')} – {item.caseDate || t('no_date')}
        </Text>
        <Text
          style={[
            styles.detailText,
            {
              color: theme.colors.text.secondary,
              writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
            },
          ]}
        >
          {t('madhab')}: {t('madhab_name_' + item.madhab, { defaultValue: item.madhab })}
        </Text>
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
        <Text
          style={[
            styles.detailText,
            {
              marginTop: theme.spacing.sm,
              writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
            },
          ]}
        >
          {t('heirs')}:
        </Text>
        <View style={styles.heirsList}>
          {item.shares.slice(0, 3).map((share, i) => (
            <Text
              key={i}
              style={[
                styles.heirText,
                {
                  color: theme.colors.text.secondary,
                  writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
                },
              ]}
            >
              • {share.name}: {formatCurrencyLocale(share.amount, i18n.locale)}
            </Text>
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
      <TouchableOpacity
        onPress={() => navigation.navigate('Home')}
        style={{ marginBottom: theme.spacing.md }}
        accessibilityLabel={t('back_to_home')}
        accessibilityRole="button"
      >
        <Text
          style={[
            { color: theme.colors.primary },
            theme.typography.button,
            { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
          ]}
        >
          {backArrow()} {t('back_to_home')}
        </Text>
      </TouchableOpacity>
      <Text style={[theme.typography.h1, { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' }]}>
        {t('history_screen_title')}
      </Text>
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
              theme.typography.button,
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
        <Text
          style={[
            theme.typography.body,
            {
              textAlign: 'center',
              marginTop: theme.spacing.xl,
              writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
            },
          ]}
        >
          {t('no_history')}
        </Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
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
    marginBottom: 4,
  },
  detailText: {
    fontSize: 13,
  },
  heirsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  heirText: {
    fontSize: 12,
    marginHorizontal: 4,
  },
  chevron: {
    fontSize: 24,
    color: '#9CA3AF',
    marginHorizontal: 8,
  },
});
