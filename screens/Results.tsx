import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useCalc } from '../lib/context/CalcContext';
import { useAppTheme } from '../hooks/useAppTheme';
import { FAB } from '../components/ui/FAB';
import { Divider } from '../components/ui/Divider';
import { t } from '../lib/i18n';
import { calculateInheritanceWithCache } from '../lib/inheritance/calculateAdapter';
import type { CalculationResult, Madhab } from '../lib/engine/types';

export const Results = ({ navigation }: { navigation: any }) => {
  const theme = useAppTheme();
  const { state } = useCalc();
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [activeTab, setActiveTab] = useState('distribution');

  useEffect(() => {
    calculateInheritanceWithCache({
      madhab: state.madhab as Madhab,
      totalEstate: state.total,
      funeralExpenses: state.funeral,
      debts: state.debts,
      will: state.will,
      heirs: state.heirs,
    }).then(setResult);
  }, [state]);

  const handleRecalc = () => navigation.navigate('EstateSetup');

  if (!result) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Loading...</Text></View>;

  const renderDistribution = () => (
    <View>
      {result.shares.map((share, idx) => (
        <View key={idx} style={styles.listItem}>
          <View style={[styles.leftBorder, { borderLeftColor: theme.colors.primary }]} />
          <View style={styles.itemContent}>
            <Text style={theme.typography.h4}>{share.name}</Text>
            <Text>{`${share.fraction?.numerator ?? '?'}/${share.fraction?.denominator ?? '?'} • ${share.percentage?.toFixed(1) ?? '0'}% • ${share.amount?.toFixed(2) ?? '0'}`}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: 80 }}>
        <Text style={theme.typography.h1}>{t('inheritance_report')}</Text>
        <Divider />
        <View style={styles.tabBar}>
          {['distribution', 'steps', 'compare'].map(tab => (
            <Pressable key={tab} onPress={() => setActiveTab(tab)} style={[styles.tab, activeTab === tab && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 }]}>
              <Text style={activeTab === tab ? { color: theme.colors.primary } : {}}>{t(tab)}</Text>
            </Pressable>
          ))}
        </View>
        {activeTab === 'distribution' && renderDistribution()}
        {activeTab === 'steps' && result.steps.map((step, i) => <Text key={i}>{step.title}</Text>)}
        {activeTab === 'compare' && <Text>Comparison table (placeholder)</Text>}
      </ScrollView>
      <FAB onPress={handleRecalc} icon="⟳" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  listItem: { flexDirection: 'row', marginBottom: 12, paddingVertical: 8 },
  leftBorder: { borderLeftWidth: 4, marginRight: 12 },
  itemContent: { flex: 1 },
  tabBar: { flexDirection: 'row', marginVertical: 16 },
  tab: { flex: 1, alignItems: 'center', paddingBottom: 8 },
});
