import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, I18nManager } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCalc } from '../lib/context/CalcContext';
import { calculateInheritance } from '../lib/engine/calculator';
import { MADHAB_NAMES } from '../lib/engine/constants';
import type { Madhab, CalculationResult, EstateInput } from '../lib/engine/types';
import { useAppTheme } from '../hooks/useAppTheme';
import { useResponsive } from '../hooks/useResponsive';
import { formatCurrency } from '../lib/utils/currency';
import { heirsArrayToObject } from '../lib/utils/heirsConverter';
import { t } from '../lib/i18n';

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
  const { isTablet } = useResponsive();
  const [selected, setSelected] = useState<Madhab>('hanafi');
  const [results, setResults] = useState<CalculationResult[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);

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
    const estate: EstateInput = {
      total: state.total,
      funeral: state.funeral,
      debts: state.debts,
      will: state.will,
    };
    const all = TABS.map((m) => calculateInheritance(m, estate, heirsArrayToObject(state.heirs)));
    setResults(all);
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
        const amount = share.amount ? formatCurrency(share.amount) : '—';
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

        if (result.specialCases.awl) cases.push('Awl (عول)');
        if (result.specialCases.radd) cases.push('Radd (رد)');
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
    const mostDiff = differenceAnalysis.length > 0 ? differenceAnalysis[0].heirKey : 'None';

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

    Alert.alert(
      'Export Complete',
      'Comparison data has been logged to console for development. Full export functionality coming soon.',
      [{ text: 'OK', onPress: () => {} }]
    );
  }, [state, comparisonSummary, differenceAnalysis, results]);

  const renderSummary = () => (
    <View
      style={{
        backgroundColor: theme.colors.surfaceVariant,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
      }}
    >
      <Text style={[{ fontWeight: 'bold', marginBottom: 12 }, theme.typography.button]}>
        {t('comparison_summary')}
      </Text>

      {comparisonSummary.totalMadhhabsDiffering === 0 ? (
        <Text style={{ color: theme.colors.success }}>✅ {t('all_madhhabs_consistent')}</Text>
      ) : (
        <View>
          <Text style={{ marginBottom: 8 }}>
            ⚠️ {comparisonSummary.totalMadhhabsDiffering} {t('madhhabs_differ')}
          </Text>
          {comparisonSummary.maxDifference > 0 && (
            <Text style={{ marginBottom: 8 }}>
              {t('max_difference')}: {formatCurrency(comparisonSummary.maxDifference)} (
              {comparisonSummary.mostDifferentHeir})
            </Text>
          )}
        </View>
      )}

      {Object.keys(comparisonSummary.specialCasesApplied).length > 0 && (
        <View style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>{t('special_cases')}:</Text>
          {Object.entries(comparisonSummary.specialCasesApplied).map(([madhab, cases]) => (
            <Text key={madhab} style={[{ marginBottom: 4 }, theme.typography.caption]}>
              • {MADHAB_NAMES[madhab as Madhab]}: {cases.join(', ')}
            </Text>
          ))}
        </View>
      )}
    </View>
  );

  const renderDifferenceAnalysis = () => {
    if (differenceAnalysis.length === 0) {
      return (
        <View
          style={{
            backgroundColor: theme.colors.surfaceVariant,
            padding: 16,
            borderRadius: 12,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              color: theme.colors.success,
              textAlign: 'center',
              writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
            }}
          >
            ✅ {t('no_significant_differences')}
          </Text>
        </View>
      );
    }

    return (
      <View
        style={{
          backgroundColor: theme.colors.surfaceVariant,
          padding: 16,
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <Text style={[{ fontWeight: 'bold', marginBottom: 12 }, theme.typography.button]}>
          {t('special_cases_title')}
        </Text>
        <Text style={[{ fontWeight: 'bold', marginBottom: 12 }, theme.typography.button]}>
          {t('difference_analysis')}
        </Text>

        {differenceAnalysis.slice(0, 5).map((diff, index) => (
          <View
            key={index}
            style={{
              paddingVertical: 8,
              borderBottomWidth: 1,
              borderColor: theme.colors.outline,
            }}
          >
            <Text style={{ fontWeight: 'bold' }}>{diff.heirKey}</Text>
            <Text style={[{ color: theme.colors.outline }, theme.typography.caption]}>
              {MADHAB_NAMES[diff.madhab1 as Madhab]} vs {MADHAB_NAMES[diff.madhab2 as Madhab]}
            </Text>
            <Text style={theme.typography.caption}>
              Difference: {formatCurrency(diff.amountDifference)} (
              {diff.percentageDifference.toFixed(1)}%)
            </Text>
            {diff.isSignificant && (
              <Text style={[{ color: theme.colors.warning, marginTop: 4 }, theme.typography.caption]}>
                ⚠️ {t('significant_difference')}
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderComparisonTable = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
      <View style={{ marginTop: 16, minWidth: 700 }}>
        {/* Header row */}
        <View
          style={{
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderColor: theme.colors.outline,
            paddingBottom: 8,
          }}
        >
          <Text style={{ width: isTablet ? 180 : 140, fontWeight: 'bold', paddingHorizontal: 8 }}>
            {t('heir')}
          </Text>
          <Text style={{ width: isTablet ? 80 : 60, fontWeight: 'bold', textAlign: 'center' }}>
            {t('count')}
          </Text>
          {TABS.map((m) => (
            <Text
              key={m}
              style={{
                width: isTablet ? 120 : 100,
                textAlign: 'center',
                fontWeight: 'bold',
                paddingHorizontal: 4,
              }}
            >
              {MADHAB_NAMES[m]}
            </Text>
          ))}
        </View>
        {comparisonRows.map((row) => {
          if (!row) return null;
          return (
            <View
              key={row.heirKey}
              style={{
                flexDirection: 'row',
                borderBottomWidth: 1,
                borderColor: theme.colors.outline,
                paddingVertical: 12,
              }}
            >
              <Text style={{ width: isTablet ? 180 : 140, paddingHorizontal: 8 }}>
                {row.heirKey}
              </Text>
              <Text style={{ width: isTablet ? 80 : 60, textAlign: 'center' }}>
                {getCount(row.heirKey)}
              </Text>
              {row.sharesByMadhab.map((data, index) => (
                <View key={index} style={{ width: isTablet ? 120 : 100, alignItems: 'center' }}>
                  {data ? (
                    <>
                      <Text style={theme.typography.caption}>{data.fraction}</Text>
                      <Text style={[{ color: theme.colors.outline }, theme.typography.caption]}>
                        {data.percentage}
                      </Text>
                      <Text
                        style={[
                          { fontWeight: 'bold', color: theme.colors.primary },
                          theme.typography.caption,
                        ]}
                      >
                        {data.amount}
                      </Text>
                    </>
                  ) : (
                    <Text style={{ color: theme.colors.outline }}>—</Text>
                  )}
                </View>
              ))}
            </View>
          );
        })}
      </View>
    </ScrollView>
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
        <Text style={theme.typography.h1}>{t('comparison_title')}</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={{
            backgroundColor: theme.colors.surfaceVariant,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
            {t('back_to_home')}
          </Text>
        </TouchableOpacity>
      </View>

      {!hasData && (
        <View
          style={{
            backgroundColor: theme.colors.surfaceVariant,
            padding: 16,
            borderRadius: 12,
            marginTop: 16,
          }}
        >
          <Text style={[{ textAlign: 'center' }, theme.typography.button]}>{t('no_history')}</Text>
          <Text
            style={{
              textAlign: 'center',
              ...theme.typography.button,
              marginTop: 8,
              color: theme.colors.secondary,
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
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 20,
                  backgroundColor:
                    selected === m ? theme.colors.madhab[m] : theme.colors.surfaceVariant,
                }}
              >
                <Text
                  style={{
                    color: selected === m ? theme.colors.onPrimary : theme.colors.onSurface,
                  }}
                >
                  {MADHAB_NAMES[m]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Action buttons */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => setShowAnalysis(!showAnalysis)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: showAnalysis ? theme.colors.primary : theme.colors.surfaceVariant,
              }}
            >
              <Text
                style={{ color: showAnalysis ? theme.colors.onPrimary : theme.colors.onSurface }}
              >
                {showAnalysis ? '📊 Hide Analysis' : '📊 Show Analysis'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleExportComparison}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: theme.colors.primary,
              }}
            >
              <Text style={{ color: theme.colors.onPrimary }}>📥 Export</Text>
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
