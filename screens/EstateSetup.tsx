import { StepIndicator } from '../components/StepIndicator';
import { t } from '../lib/i18n';
import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput } from 'react-native';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAppTheme } from '../hooks/useAppTheme';
import { useCalc } from '../lib/context/CalcContext';

type EstateSetupNavigation = {
  navigate: (screen: string) => void;
};

export const EstateSetup = ({ navigation }: { navigation: EstateSetupNavigation }) => {
  const theme = useAppTheme();
  const { dispatch, caseName, setCaseName, caseDate, setCaseDate } = useCalc();
  const [total, setTotal] = useState('');
  const [funeral, setFuneral] = useState('');
  const [debts, setDebts] = useState('');
  const [will, setWill] = useState('');
  const net = parseFloat(total || '0') - parseFloat(funeral || '0') - parseFloat(debts || '0');
  const maxWill = net / 3;
  const willError = parseFloat(will) > maxWill && maxWill >= 0 ? t('will_exceeds') : '';

  const onNext = () => {
    dispatch({
      type: 'SET_ESTATE',
      payload: {
        total: parseFloat(total) || 0,
        funeral: parseFloat(funeral) || 0,
        debts: parseFloat(debts) || 0,
        will: parseFloat(will) || 0,
      },
    });
    navigation.navigate('MadhabSelect');
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl }}
    >
      <StepIndicator
        currentStep={0}
        steps={['step_estate', 'step_madhab', 'step_heirs', 'step_results']}
      />
      <Text style={theme.typography.h1}>{t('estate_details')}</Text>
      <TextInput
        placeholder={t('case_name_optional')}
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
        placeholder={t('date_format')}
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
      <Input
        label={t('total_estate')}
        currency={true}
        value={total}
        onChangeText={setTotal}
        keyboardType="numeric"
        leftIcon={<Text>$</Text>}
      />
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        <Input
          style={{ flex: 1 }}
          label={t('funeral_costs')}
          currency={true}
          value={funeral}
          onChangeText={setFuneral}
          keyboardType="numeric"
        />
        <Input
          style={{ flex: 1 }}
          label={t('debts')}
          currency={true}
          value={debts}
          onChangeText={setDebts}
          keyboardType="numeric"
        />
      </View>
      <Input
        label={t('will_optional')}
        currency={true}
        value={will}
        onChangeText={setWill}
        keyboardType="numeric"
        helper={maxWill > 0 ? `${t('max_allowed')}: $${maxWill.toFixed(2)}` : ''}
        error={willError}
      />
      <Button
        title={t('next_select_school')}
        onPress={onNext}
        disabled={!total || parseFloat(total) <= 0}
        style={{ marginTop: theme.spacing.lg }}
      />
    </ScrollView>
  );
};
