import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  I18nManager,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCalc } from '../lib/context/CalcContext';
import { calculateInheritance } from '../lib/engine/calculator';
import { MADHAB_NAMES } from '../lib/engine/constants';
import type { Madhab, CalculationResult, EstateInput } from '../lib/engine/types';
import { useAppTheme } from '../hooks/useAppTheme';
import { useResponsive } from '../hooks/useResponsive';
import { formatCurrency as formatCurrencyLocale } from '../lib/utils/localeFormatting';
import { heirsArrayToObject } from '../lib/utils/heirsConverter';
import { t, i18n } from '../lib/i18n';
import { localizeHeirName } from '../lib/utils/shareLocalization';
import { Alert as AlertComponent } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

const TABS: Madhab[] = ['hanafi', 'maliki', 'shafii', 'hanbali'];

interface DifferenceAnalysis {
  heirKey: string;
  madhab1: string;
  madhab2: string;
  amountDifference: number;
  percentageDifference: number;
  isSignificant: boolean;
}

interface ComparisonSummary {
  totalMadhhabsDiffering: number;
  maxDifference: number;
  mostDifferentHeir: string;
  consistentMadhhabs: string[];
  specialCasesApplied: Record<string, string[]>;
}

type ComparisonNavigation = {
  navigate: (screen: string) => void;
};

export const Comparison = React.memo(({ navigation }: { navigation: ComparisonNavigation }) => {
  const { state } = useCalc();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { isTablet, isLandscape } = useResponsive();
  const [selected, setSelected] = useState<Madhab>('hanafi');
  const [results, setResults] = useState<CalculationResult[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tabAnimValues] = useState<Record<Madhab, Animated.Value>>({
    hanafi: new Animated.Value(0),
    maliki: new Animated.Value(0),
    shafii: new Animated.Value(0),
    hanbali: new Animated.Value(0),
  });

  // Simple cache for calculation results
  const calculationCache = useRef<Map<string, CalculationResult[]>>(new Map());

  // Animate tabs when selection changes
  useEffect(() => {
    TABS.forEach((m) => {
      Animated.timing(tabAnimValues[m], {
        toValue: selected === m ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }, [selected, tabAnimValues]);

  const allHeirs = useMemo(() => {
    const heirSet = new Set<string>();
    results.forEach((res) => {
      if (res.success && res.shares) {
        res.shares.forEach((share) => heirSet.add(share.key || share.name));
      }
    });
    return heirSet;
  }, [results]);

  const getCount = useCallback(
    (key: string) => {
      const heirsObj = heirsArrayToObject(state.heirs);
      return heirsObj[key] || 0;
    },
    [state.heirs]
  );

  useEffect(() => {
    const performCalculations = async () => {
      setLoading(true);
      try {
        const estate: EstateInput = {
          total: state.total,
          funeral: state.funeral,
          debts: state.debts,
          will: state.will,
        };

        // Create cache key from input parameters
        const cacheKey = JSON.stringify({
          estate,
          heirs: state.heirs,
        });

        // Check cache first
        if (calculationCache.current.has(cacheKey)) {
          setResults(calculationCache.current.get(cacheKey)!);
          setLoading(false);
          return;
        }

        // Simulate async calculation for better UX
        await new Promise((resolve) => setTimeout(resolve, 100));
        const all = TABS.map((m) =>
          calculateInheritance(m, estate, heirsArrayToObject(state.heirs))
        );

        // Cache the results
        calculationCache.current.set(cacheKey, all);

        // Limit cache size to prevent memory issues
        if (calculationCache.current.size > 50) {
          const firstKey = calculationCache.current.keys().next().value;
          if (firstKey) {
            calculationCache.current.delete(firstKey);
          }
        }

        setResults(all);
      } finally {
        setLoading(false);
      }
    };

    performCalculations();
  }, [state.total, state.funeral, state.debts, state.will, state.heirs]);

  const comparisonRows = useMemo(() => {
    return Array.from(allHeirs).map((heirKey) => {
      const sharesByMadhab = TABS.map((madhab) => {
        const result = results[TABS.indexOf(madhab)];
        if (!result?.success) return null;
        const share = result.shares.find((s) => s.key === heirKey || s.name === heirKey);
        if (!share) return null;
        const fractionStr = share.fraction
          ? `${share.fraction.numerator}/${share.fraction.denominator}`
          : '—';
        const percentage = share.fraction
          ? ((share.fraction.numerator / share.fraction.denominator) * 100).toFixed(1) + '%'
          : '—';
        const amount = share.amount ? formatCurrencyLocale(share.amount, i18n.locale) : '—';
        return { fraction: fractionStr, percentage, amount, amountValue: share.amount };
      });
      if (sharesByMadhab.every((s) => s === null)) return null;
      return { heirKey, sharesByMadhab };
    });
  }, [allHeirs, results]);

  // Check if there's any data to compare
  const hasData = comparisonRows.length > 0 && allHeirs.size > 0;

  const differenceAnalysis = useMemo((): DifferenceAnalysis[] => {
    const differences: DifferenceAnalysis[] = [];

    comparisonRows.forEach((row) => {
      if (!row) return;

      const amounts = row.sharesByMadhab.map((s) => s?.amountValue || 0);
      const uniqueAmounts = new Set(amounts.filter((a) => a > 0));

      if (uniqueAmounts.size > 1) {
        // Find the maximum difference
        const maxAmount = Math.max(...amounts);
        const minAmount = Math.min(...amounts.filter((a) => a > 0));
        const maxDiff = maxAmount - minAmount;
        const percentageDiff = minAmount > 0 ? (maxDiff / minAmount) * 100 : 0;

        const maxIndex = amounts.indexOf(maxAmount);
        const minIndex = amounts.indexOf(minAmount);

        differences.push({
          heirKey: row.heirKey,
          madhab1: TABS[maxIndex],
          madhab2: TABS[minIndex],
          amountDifference: maxDiff,
          percentageDifference: percentageDiff,
          isSignificant: percentageDiff > 10, // More than 10% difference is significant
        });
      }
    });

    return differences.sort((a, b) => b.amountDifference - a.amountDifference);
  }, [comparisonRows]);

  const comparisonSummary = useMemo((): ComparisonSummary => {
    const specialCases: Record<string, string[]> = {};

    results.forEach((result, index) => {
      if (result?.specialCases) {
        const madhab = TABS[index];
        const cases: string[] = [];

        if (result.specialCases.awl) cases.push(t('special_case_awl'));
        if (result.specialCases.radd) cases.push(t('special_case_radd'));
        if (result.specialCases.hijabTypes?.length > 0) {
          cases.push(...result.specialCases.hijabTypes);
        }

        if (cases.length > 0) {
          specialCases[madhab] = cases;
        }
      }
    });

    const differingMadhhabs = differenceAnalysis.length > 0 ? TABS : [];
    const maxDiff = differenceAnalysis.length > 0 ? differenceAnalysis[0].amountDifference : 0;
    const mostDiff =
      differenceAnalysis.length > 0 ? differenceAnalysis[0].heirKey : t('none_fallback');

    return {
      totalMadhhabsDiffering: differingMadhhabs.length,
      maxDifference: maxDiff,
      mostDifferentHeir: mostDiff,
      consistentMadhhabs: differenceAnalysis.length === 0 ? TABS : [],
      specialCasesApplied: specialCases,
    };
  }, [differenceAnalysis, results]);

  const handleExportComparison = useCallback(() => {
    const exportData = {
      estate: {
        total: state.total,
        funeral: state.funeral,
        debts: state.debts,
        will: state.will,
      },
      heirs: state.heirs,
      comparisonSummary,
      differences: differenceAnalysis,
      results: results.map((result, index) => ({
        madhab: TABS[index],
        madhabName: MADHAB_NAMES[TABS[index]],
        shares: result.shares,
        specialCases: result.specialCases,
      })),
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    console.log('Export data:', jsonString);

    Alert.alert(t('export_complete_title'), t('export_complete_message'), [
      { text: t('ok'), onPress: () => {} },
    ]);
  }, [state, comparisonSummary, differenceAnalysis, results]);

  const renderSummary = () => {
    const hasSpecialCases = Object.keys(comparisonSummary.specialCasesApplied).length > 0;
    const message =
      comparisonSummary.totalMadhhabsDiffering === 0
        ? `✅ ${t('all_madhhabs_consistent')}`
        : `⚠️ ${comparisonSummary.totalMadhhabsDiffering} ${t('madhhabs_differ')}${comparisonSummary.maxDifference > 0 ? `\n${t('max_difference')}: ${formatCurrencyLocale(comparisonSummary.maxDifference, i18n.locale)} (${localizeHeirName(comparisonSummary.mostDifferentHeir, comparisonSummary.mostDifferentHeir)})` : ''}`;

    return (
      <>
        <AlertComponent
          title={t('comparison_summary')}
          message={message}
          variant={comparisonSummary.totalMadhhabsDiffering === 0 ? 'success' : 'warning'}
          style={{ marginBottom: 16 }}
        />
        {hasSpecialCases && (
          <View
            style={{
              backgroundColor: 'transparent',
              padding: 16,
              borderRadius: 12,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontWeight: 'bold',
                marginBottom: 8,
                writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
                color: theme.colors.text.primary,
              }}
            >
              {t('special_cases')}:
            </Text>
            {Object.entries(comparisonSummary.specialCasesApplied).map(([madhab, cases]) => (
              <View
                key={madhab}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}
              >
                <Text
                  style={{
                    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
                    color: theme.colors.text.secondary,
                  }}
                >
                  • {t('madhab_name_' + madhab, { defaultValue: madhab })}:
                </Text>
                <Badge text={cases[0]} variant="info" size="small" />
              </View>
            ))}
          </View>
        )}
      </>
    );
  };

  const renderDifferenceAnalysis = () => {
    if (differenceAnalysis.length === 0) {
      return (
        <AlertComponent
          title="✅ No Differences"
          message={t('no_significant_differences')}
          variant="success"
          style={{ marginBottom: 16 }}
        />
      );
    }

    return (
      <AlertComponent
        title={t('difference_analysis')}
        message={differenceAnalysis
          .slice(0, 5)
          .map(
            (diff) =>
              `${localizeHeirName(diff.heirKey, diff.heirKey)}: ${t('madhab_name_' + diff.madhab1, { defaultValue: diff.madhab1 })} vs ${t('madhab_name_' + diff.madhab2, { defaultValue: diff.madhab2 })}\nDiff: ${formatCurrencyLocale(diff.amountDifference, i18n.locale)} (${diff.percentageDifference.toFixed(1)}%)${diff.isSignificant ? '\n⚠️ Significant' : ''}`
          )
          .join('\n\n')}
        variant="info"
        style={{ marginBottom: 16 }}
      />
    );
  };

  const renderComparisonTable = () => (
    <View style={styles.comparisonTableCard}>
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View style={{ minWidth: isLandscape ? 800 : 700 }}>
          {/* Header row */}
          <View
            style={{
              flexDirection: 'row',
              borderBottomWidth: 1,

              paddingBottom: 8,
            }}
          >
            <Text
              style={{
                width: isLandscape ? 200 : isTablet ? 180 : 140,
                fontWeight: 'bold',
                paddingHorizontal: 8,
                writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
              }}
              numberOfLines={1}
            >
              {t('heir')}
            </Text>
            <Text
              style={{
                width: isLandscape ? 100 : isTablet ? 80 : 60,
                fontWeight: 'bold',
                textAlign: 'center',
                writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
              }}
            >
              {t('count')}
            </Text>
            {TABS.map((m) => (
              <Text
                key={m}
                numberOfLines={1}
                style={{
                  width: isLandscape ? 150 : isTablet ? 120 : 100,
                  textAlign: 'center',
                  fontWeight: 'bold',
                  paddingHorizontal: 4,
                  writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
                }}
              >
                {t('madhab_name_' + m, { defaultValue: m })}
              </Text>
            ))}
          </View>
        </View>
        {comparisonRows.map((row) => {
          if (!row) return null;
          return (
            <View
              key={row.heirKey}
              style={{
                flexDirection: 'row',
                borderBottomWidth: 1,

                paddingVertical: 12,
              }}
            >
              <Text
                style={{
                  width: isLandscape ? 200 : isTablet ? 180 : 140,
                  paddingHorizontal: 8,
                  writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
                }}
                numberOfLines={1}
              >
                {localizeHeirName(row.heirKey, row.heirKey)}
              </Text>
              <Text
                style={{
                  width: isLandscape ? 100 : isTablet ? 80 : 60,
                  textAlign: 'center',
                  writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
                }}
              >
                {getCount(row.heirKey)}
              </Text>
              {row.sharesByMadhab.map((data, index) => (
                <View
                  key={index}
                  style={{
                    width: isLandscape ? 150 : isTablet ? 120 : 100,
                    alignItems: 'center',
                  }}
                >
                  {data ? (
                    <>
                      <Text
                        style={[
                          theme.typography.caption,
                          { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
                        ]}
                      >
                        {data.fraction}
                      </Text>
                      <Text
                        style={[
                          {
                            color: theme.colors.outline,
                            writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
                          },
                          theme.typography.caption,
                        ]}
                      >
                        {data.percentage}
                      </Text>
                      <Text
                        style={[
                          {
                            fontWeight: 'bold',
                            color: theme.colors.primary,
                            writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
                          },
                          theme.typography.caption,
                        ]}
                      >
                        {data.amount}
                      </Text>
                    </>
                  ) : (
                    <Text
                      style={{
                        color: theme.colors.outline,
                        writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
                      }}
                    >
                      —
                    </Text>
                  )}
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <ScrollView
      contentContainerStyle={{
        padding: theme.spacing.lg,
        paddingTop: insets.top + theme.spacing.lg,
        paddingBottom: insets.bottom,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Text
          style={[theme.typography.h1, { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' }]}
        >
          {t('comparison_title')}
        </Text>
        <Button
          title={t('back_to_home')}
          onPress={() => navigation.navigate('Home')}
          mode="outlined"
        />
      </View>

      {loading && (
        <View
          style={{
            backgroundColor: 'transparent',
            padding: 16,
            borderRadius: 12,
            marginTop: 16,
            alignItems: 'center',
          }}
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
            {t('calculating')}
          </Text>
        </View>
      )}

      {!loading && !hasData && (
        <View
          style={{
            backgroundColor: 'transparent',
            padding: 16,
            borderRadius: 12,
            marginTop: 16,
          }}
        >
          <Text
            style={[
              { textAlign: 'center', writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
              theme.typography.button,
            ]}
          >
            {t('no_history')}
          </Text>
          <Text
            style={{
              textAlign: 'center',
              ...theme.typography.button,
              marginTop: 8,
              color: theme.colors.secondary,
              writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
            }}
          >
            {t('start_new_calculation')}
          </Text>
        </View>
      )}

      {hasData && (
        <>
          {/* Toggle buttons */}
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16 }}
          >
            {TABS.map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setSelected(m)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 20,
                  minHeight: 44,
                }}
                accessibilityLabel={t('madhab_name_' + m, { defaultValue: m })}
                accessibilityHint={
                  selected === m
                    ? t('a11y_madhab_selected')
                    : t('a11y_select_madhab_view', {
                        madhab: t('madhab_name_' + m, { defaultValue: m }),
                      })
                }
                accessibilityRole="button"
                accessibilityState={{ selected: selected === m }}
              >
                <Animated.View
                  style={{
                    backgroundColor: tabAnimValues[m].interpolate({
                      inputRange: [0, 1],
                      outputRange: [theme.colors.surfaceVariant, theme.colors.madhab[m]],
                    }),
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderRadius: 20,
                  }}
                >
                  <Animated.Text
                    style={{
                      color: tabAnimValues[m].interpolate({
                        inputRange: [0, 1],
                        outputRange: [theme.colors.onSurface, theme.colors.onPrimary],
                      }),
                      writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
                    }}
                  >
                    {t('madhab_name_' + m, { defaultValue: m })}
                  </Animated.Text>
                </Animated.View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Action buttons */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => setShowAnalysis(!showAnalysis)}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: showAnalysis ? theme.colors.primary : theme.colors.surfaceVariant,
                minHeight: 44,
              }}
              accessibilityLabel={showAnalysis ? t('hide_analysis') : t('show_analysis')}
              accessibilityHint={showAnalysis ? t('a11y_hide_analysis') : t('a11y_show_analysis')}
              accessibilityRole="button"
              accessibilityState={{ selected: showAnalysis }}
            >
              <Text
                style={{ color: showAnalysis ? theme.colors.onPrimary : theme.colors.onSurface }}
              >
                {showAnalysis ? `📊 ${t('hide_analysis')}` : `📊 ${t('show_analysis')}`}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleExportComparison}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: theme.colors.primary,
                minHeight: 44,
              }}
              accessibilityLabel={t('export_button')}
              accessibilityHint={t('a11y_export_comparison')}
              accessibilityRole="button"
            >
              <Text style={{ color: theme.colors.onPrimary }}>📥 {t('export_button')}</Text>
            </TouchableOpacity>
          </View>

          {/* Summary and Analysis */}
          {showAnalysis && (
            <>
              {renderSummary()}
              {renderDifferenceAnalysis()}
            </>
          )}

          {/* Comparison Table */}
          {renderComparisonTable()}
        </>
      )}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  comparisonTableCard: {
    marginTop: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',

    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
});
