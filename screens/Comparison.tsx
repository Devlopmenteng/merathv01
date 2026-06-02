import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useCalc } from '../lib/context/CalcContext';
import { calculateInheritance } from '../lib/engine/calculator';
import { MADHAB_NAMES, MADHAB_COLORS } from '../lib/engine/constants';
import type { Madhab, CalculationResult, EstateInput } from '../lib/engine/types';
import { useAppTheme } from '../hooks/useAppTheme';
import { formatCurrency } from '../lib/utils/currency';
import { heirsArrayToObject } from '../lib/utils/heirsConverter';
import { t } from '../lib/i18n';

const TABS: Madhab[] = ['hanafi', 'maliki', 'shafii', 'hanbali'];

export const Comparison = React.memo(() => {
  const { state } = useCalc();
  const theme = useAppTheme();
  const [selected, setSelected] = useState<Madhab>('hanafi');
  const [results, setResults] = useState<CalculationResult[]>([]);

  const allHeirs = useMemo(() => {
    const heirSet = new Set<string>();
    results.forEach(res => {
      if (res.success && res.shares) {
        res.shares.forEach(share => heirSet.add(share.key || share.name));
      }
    });
    return heirSet;
  }, [results]);

  const getCount = useCallback((key: string) => {
    const heirsObj = heirsArrayToObject(state.heirs);
    return heirsObj[key] || 0;
  }, [state.heirs]);

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
    return Array.from(allHeirs).map(heirKey => {
      const sharesByMadhab = TABS.map(madhab => {
        const result = results[TABS.indexOf(madhab)];
        if (!result?.success) return null;
        const share = result.shares.find(s => (s.key === heirKey) || (s.name === heirKey));
        if (!share) return null;
        const fractionStr = share.fraction ? `${share.fraction.numerator}/${share.fraction.denominator}` : '—';
        const percentage = share.fraction ? ((share.fraction.numerator / share.fraction.denominator) * 100).toFixed(1) + '%' : '—';
        const amount = share.amount ? formatCurrency(share.amount) : '—';
        return { fraction: fractionStr, percentage, amount };
      });
      if (sharesByMadhab.every(s => s === null)) return null;
      return { heirKey, sharesByMadhab };
    });
  }, [allHeirs, results]);

  const renderComparisonTable = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
      <View style={{ marginTop: 16, minWidth: 700 }}>
        {/* Header row */}
        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: theme.colors.outline, paddingBottom: 8 }}>
          <Text style={{ width: 140, fontWeight: 'bold', paddingHorizontal: 8 }}>{t('heir')}</Text>
          <Text style={{ width: 60, fontWeight: 'bold', textAlign: 'center' }}>{t('count')}</Text>
          {TABS.map(m => (
            <Text key={m} style={{ width: 100, textAlign: 'center', fontWeight: 'bold', paddingHorizontal: 4 }}>{MADHAB_NAMES[m]}</Text>
          ))}
        </View>
        {comparisonRows.map((row) => {
          if (!row) return null;
          return (
            <View key={row.heirKey} style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: theme.colors.outline, paddingVertical: 12 }}>
              <Text style={{ width: 140, paddingHorizontal: 8 }}>{row.heirKey}</Text>
              <Text style={{ width: 60, textAlign: 'center' }}>{getCount(row.heirKey)}</Text>
              {row.sharesByMadhab.map((data, index) => (
                <View key={index} style={{ width: 100, alignItems: 'center' }}>
                  {data ? (
                    <>
                      <Text style={{ fontSize: 12 }}>{data.fraction}</Text>
                      <Text style={{ fontSize: 10, color: theme.colors.outline }}>{data.percentage}</Text>
                      <Text style={{ fontSize: 10, fontWeight: 'bold', color: theme.colors.primary }}>{data.amount}</Text>
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
    <ScrollView contentContainerStyle={{ padding: theme.spacing.lg }}>
      <Text style={theme.typography.h1}>{t('comparison_title')}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16 }}>
        {TABS.map((m) => (
          <TouchableOpacity
            key={m}
            onPress={() => setSelected(m)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 20,
              backgroundColor: selected === m ? MADHAB_COLORS[m] : theme.colors.surfaceVariant,
            }}
          >
            <Text style={{ color: selected === m ? '#fff' : theme.colors.onSurface }}>{MADHAB_NAMES[m]}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {renderComparisonTable()}
    </ScrollView>
  );
});