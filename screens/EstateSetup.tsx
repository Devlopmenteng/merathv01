import { showToast } from "../lib/utils/toast";
import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput } from 'react-native';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAppTheme } from '../hooks/useAppTheme';
import { useCalc } from '../lib/context/CalcContext';
import { validateEstateData } from '../lib/engine/constants';

export const EstateSetup = ({ navigation }: any) => {
  const theme = useAppTheme();
  const { dispatch, caseName, setCaseName, caseDate, setCaseDate } = useCalc();
  const [total, setTotal] = useState('');
  const [funeral, setFuneral] = useState('');
  const [debts, setDebts] = useState('');
  const [will, setWill] = useState('');
  const net = parseFloat(total || '0') - parseFloat(funeral || '0') - parseFloat(debts || '0');
  const maxWill = net / 3;
  const willError = parseFloat(will) > maxWill && maxWill >= 0 ? 'Exceeds 1/3 of net estate' : '';

  const onNext = () => {
    const t = parseFloat(total) || 0;
    const f = parseFloat(funeral) || 0;
    const d = parseFloat(debts) || 0;
    const w = parseFloat(will) || 0;
    const validationError = validateEstateData(t, f, d, w);
    if (validationError) {
      showToast(validationError, 'error');
      return;
    }
    dispatch({ type: 'SET_ESTATE', payload: { total: t, funeral: f, debts: d, will: w } });
    navigation.navigate('MadhabSelect');
  };

  return (
    <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl }}>
      <Text style={theme.typography.h1}>Estate Details</Text>
      <TextInput
        placeholder="Case Name (optional)"
        value={caseName}
        onChangeText={setCaseName}
        style={{
          borderWidth: 1,
          borderColor: theme.colors.outline,
          borderRadius: theme.radius.md,
          padding: theme.spacing.sm,
          marginBottom: theme.spacing.md,
          color: theme.colors.onSurface,
        }}
      />
      <TextInput
        placeholder="Date (YYYY-MM-DD)"
        value={caseDate}
        onChangeText={setCaseDate}
        style={{
          borderWidth: 1,
          borderColor: theme.colors.outline,
          borderRadius: theme.radius.md,
          padding: theme.spacing.sm,
          marginBottom: theme.spacing.md,
          color: theme.colors.onSurface,
        }}
      />
      <Input label="Total Estate ($)" value={total} onChangeText={setTotal} keyboardType="numeric" leftIcon={<Text>$</Text>} />
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        <Input style={{ flex: 1 }} label="Funeral Costs" value={funeral} onChangeText={setFuneral} keyboardType="numeric" />
        <Input style={{ flex: 1 }} label="Debts" value={debts} onChangeText={setDebts} keyboardType="numeric" />
      </View>
      <Input label="Will (optional)" value={will} onChangeText={setWill} keyboardType="numeric" helper={maxWill > 0 ? `Max: $${maxWill.toFixed(2)}` : ''} error={willError} />
      <Button title="Next: Select School" onPress={onNext} disabled={!total || parseFloat(total) <= 0} style={{ marginTop: theme.spacing.lg }} />
    </ScrollView>
  );
};
