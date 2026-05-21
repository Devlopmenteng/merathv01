import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useCalc } from '../lib/context/CalcContext';
import { calculateInheritance } from '../lib/engine/calculator';
import { MADHAB_NAMES, MADHAB_COLORS } from '../lib/engine/constants';
import type { Madhab, CalculationResult, EstateInput } from '../lib/engine/types';
import { useAppTheme } from '../hooks/useAppTheme';
import { FIQH_NOTES } from '../lib/services/FiqhReferences';
import { Button } from '../components/ui/Button';
import { formatCurrency } from '../lib/utils/currency';
import { heirsArrayToObject } from '../lib/utils/heirsConverter';

const TABS: Madhab[] = ['hanafi', 'maliki', 'shafii', 'hanbali'];

export const Comparison = () => {
  const { state } = useCalc();
  const theme = useAppTheme();
  const [selected, setSelected] = useState<Madhab>('hanafi');
  const [results, setResults] = useState<CalculationResult[]>([]);
  const [showNotes, setShowNotes] = useState(false);

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

  const notes = FIQH_NOTES[selected] || {};

  // Collect all heirs across all results
  const allHeirs = new Set<string>();
  results.forEach(res => {
    if (res.success && res.shares) {
      res.shares.forEach(share => allHeirs.add(share.key || share.name));
    }
  });

  const renderComparisonTable = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
      <View style={{ marginTop: 16, minWidth: 600 }}>
        {/* Header row */}
        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: theme.colors.outline, paddingBottom: 8 }}>
          <Text style={{ width: 140, fontWeight: 'bold', paddingHorizontal: 8 }}>الوارث</Text>
          {TABS.map(m => (
            <Text key={m} style={{ width: 120, textAlign: 'center', fontWeight: 'bold', paddingHorizontal: 4 }}>{MADHAB_NAMES[m]}</Text>
          ))}
        </View>
        {Array.from(allHeirs).map(heirKey => {
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
          return (
            <View key={heirKey} style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: theme.colors.outline, paddingVertical: 12 }}>
              <Text style={{ width: 140, paddingHorizontal: 8 }}>{heirKey}</Text>
              {sharesByMadhab.map((data, idx) => (
                <View key={idx} style={{ width: 120, alignItems: 'center' }}>
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
      <Text style={theme.typography.h1}>مقارنة المذاهب</Text>
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

      <Button title={showNotes ? 'إخفاء الملاحظات الفقهية' : 'عرض الملاحظات الفقهية'} onPress={() => setShowNotes(!showNotes)} mode="outlined" />
      {showNotes && (
        <View style={{ padding: 12, marginTop: 8, backgroundColor: theme.colors.surfaceVariant, borderRadius: 8 }}>
          {Object.entries(notes).map(([key, val]) => (
            <Text key={key} style={{ fontSize: 12, marginBottom: 4 }}>• {val}</Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
};
