import { StepIndicator } from '../components/StepIndicator';
import { t } from '../lib/i18n';
import React, { useState, useCallback } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAppTheme } from '../hooks/useAppTheme';
import { useCalc } from '../lib/context/CalcContext';
import { validateEstateInput, sanitizeInput } from '../lib/utils/validation';
import { showAlert } from '../lib/utils/alerts';
import { formatCurrency } from '../lib/utils/currency';

type EstateSetupNavigation = {
  navigate: (screen: string) => void;
};

export const EstateSetup = ({ navigation }: { navigation: EstateSetupNavigation }) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { state, dispatch } = useCalc();
  const { caseName, caseDate } = state;
  const [total, setTotal] = useState('');
  const [funeral, setFuneral] = useState('');
  const [debts, setDebts] = useState('');
  const [will, setWill] = useState('');
  const net = parseFloat(total || '0') - parseFloat(funeral || '0') - parseFloat(debts || '0');
  const maxWill = net / 3;
  const willError = parseFloat(will) > maxWill && maxWill >= 0 ? t('will_exceeds') : '';

  const onNext = useCallback(() => {
    const estate = {
      total: parseFloat(total) || 0,
      funeral: parseFloat(funeral) || 0,
      debts: parseFloat(debts) || 0,
      will: parseFloat(will) || 0,
    };

    const validation = validateEstateInput(estate);

    if (!validation.valid) {
      showAlert(t('validation_error'), validation.errors.join('\n'));
      return;
    }

    // Sanitize case name
    const sanitized = caseName ? sanitizeInput(caseName) : '';
    if (sanitized !== caseName) {
      dispatch({ type: 'SET_CASE', payload: { caseName: sanitized, caseDate } });
    }

    dispatch({
      type: 'SET_ESTATE',
      payload: estate,
    });
    navigation.navigate('MadhabSelect');
  }, [total, funeral, debts, will, caseName, caseDate, dispatch, navigation]);

  return (
    <ScrollView
      contentContainerStyle={{
        padding: theme.spacing.lg,
        paddingBottom: theme.spacing.xxl + insets.bottom,
        paddingTop: insets.top + theme.spacing.lg,
      }}
    >
      <StepIndicator
        currentStep={0}
        steps={['step_estate', 'step_madhab', 'step_heirs', 'step_results']}
      />
      <Text style={theme.typography.h1}>{t('estate_details')}</Text>

      <Card variant="outlined">
        <Text style={[theme.typography.h4, { marginBottom: theme.spacing.sm }]}>
          {t('case_info')}
        </Text>
        <Input
          label={t('case_name_optional')}
          value={caseName}
          onChangeText={(text) =>
            dispatch({ type: 'SET_CASE', payload: { caseName: text, caseDate } })
          }
          maxLength={100}
        />
        <Input
          label={t('date')}
          value={caseDate}
          onChangeText={(text) =>
            dispatch({ type: 'SET_CASE', payload: { caseName, caseDate: text } })
          }
        />
      </Card>

      <Card variant="outlined">
        <Text style={[theme.typography.h4, { marginBottom: theme.spacing.sm }]}>
          {t('estate')}
        </Text>
        <Input
          label={t('total_estate')}
          currency
          value={total}
          onChangeText={setTotal}
          keyboardType="numeric"
        />
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          <Input
            style={{ flex: 1 }}
            label={t('funeral_costs')}
            currency
            value={funeral}
            onChangeText={setFuneral}
            keyboardType="numeric"
          />
          <Input
            style={{ flex: 1 }}
            label={t('debts')}
            currency
            value={debts}
            onChangeText={setDebts}
            keyboardType="numeric"
          />
        </View>
        <Input
          label={t('will_optional')}
          currency
          value={will}
          onChangeText={setWill}
          keyboardType="numeric"
          helper={
            maxWill > 0 ? `${t('max_allowed')}: ${t('currency_symbol')}${maxWill.toFixed(2)}` : ''
          }
          error={willError}
        />
      </Card>

      {(parseFloat(total) > 0 || parseFloat(funeral) > 0 || parseFloat(debts) > 0) && (
        <Card variant="tonal">
          <Text style={[theme.typography.h4, { marginBottom: theme.spacing.sm }]}>
            {t('net_estate')}
          </Text>
          <Text style={theme.typography.display}>
            {formatCurrency(Math.max(0, net - (parseFloat(will) || 0)))}
          </Text>
          <Text style={[theme.typography.bodySmall, { color: theme.colors.text.secondary }]}>
            {t('total_estate')}: {formatCurrency(parseFloat(total) || 0)} — {t('deductions')}:&nbsp;
            {formatCurrency((parseFloat(funeral) || 0) + (parseFloat(debts) || 0) + (parseFloat(will) || 0))}
          </Text>
        </Card>
      )}
      <Button
        title={t('next_select_school')}
        onPress={onNext}
        disabled={!total || parseFloat(total) <= 0}
        style={{ marginTop: theme.spacing.lg }}
      />
    </ScrollView>
  );
};
