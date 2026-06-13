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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAuditTrail, searchAuditTrail, AuditEntry } from '../lib/services/AuditTrailService';
import { useAppTheme } from '../hooks/useAppTheme';
import { Card } from '../components/ui/Card';
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
    <Card
      variant="outlined"
      leftBorder={theme.colors.primary}
      onPress={() => navigation.navigate('CalculationSteps', { auditEntry: item })}
      accessibilityLabel={`${item.caseName || t('no_name')} – ${item.caseDate || t('no_date')}. ${t('madhab')}: ${t('madhab_name_' + item.madhab, { defaultValue: item.madhab })}. ${t('netEstate')}: ${formatCurrencyLocale(item.netTotal, i18n.locale)}`}
      accessibilityHint={t('a11y_view_calculation_details')}
      accessibilityRole="button"
    >
      <Text
        style={[
          { fontWeight: '600', marginBottom: theme.spacing.xs },
          theme.typography.button,
          { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
        ]}
      >
        {item.caseName || t('no_name')} – {item.caseDate || t('no_date')}
      </Text>
      <Text
        style={[
          theme.typography.bodySmall,
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
          theme.typography.bodySmall,
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
          theme.typography.bodySmall,
          {
            fontWeight: '600',
            marginTop: theme.spacing.sm,
            writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
          },
        ]}
      >
        {t('heirs')}:
      </Text>
      {item.shares.slice(0, 3).map((share, i) => (
        <Text
          key={i}
          style={[
            theme.typography.caption,
            {
              marginStart: theme.spacing.sm,
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
            theme.typography.caption,
            {
              marginStart: theme.spacing.sm,
              color: theme.colors.text.secondary,
              writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
            },
          ]}
        >
          ...
        </Text>
      )}
    </Card>
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
          contentContainerStyle={{ gap: theme.spacing.md }}
          showsVerticalScrollIndicator={true}
        />
      )}
    </View>
  );
};
