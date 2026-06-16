import React, { useState, useCallback } from 'react';
import { ScrollView, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCalc } from '../lib/context/CalcContext';
import { useAppTheme } from '../hooks/useAppTheme';
import { Input } from '../components/ui/Input';
import { RadioButton } from '../components/ui/RadioButton';
import { Button } from '../components/ui/Button';
import { LeftBorderView } from '../components/ui/LeftBorderView';
import { Divider } from '../components/ui/Divider';
import { t } from '../lib/i18n';
import { useLocalizedTitle } from '../hooks/useLocalizedTitle';

type EstateSetupNavigation = { navigate: (screen: string) => void };

const MADHABS = [
  { value: 'hanafi', label: t('madhab_hanafi') },
  { value: 'maliki', label: t('madhab_maliki') },
  { value: 'shafii', label: t('madhab_shafii') },
  { value: 'hanbali', label: t('madhab_hanbali') },
];

export const EstateSetup = ({ navigation }: { navigation: EstateSetupNavigation }) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  useLocalizedTitle('estate_details');
  const { state, dispatch } = useCalc();
  const [total, setTotal] = useState(state.total ? String(state.total) : '');
  const [funeral, setFuneral] = useState(state.funeral ? String(state.funeral) : '');
  const [debts, setDebts] = useState(state.debts ? String(state.debts) : '');
  const [will, setWill] = useState(state.will ? String(state.will) : '');

  const handleNext = useCallback(() => {
    dispatch({
      type: 'SET_ESTATE',
      payload: {
        total: parseFloat(total) || 0,
        funeral: parseFloat(funeral) || 0,
        debts: parseFloat(debts) || 0,
        will: parseFloat(will) || 0,
      },
    });
    navigation.navigate('HeirSelection');
  }, [total, funeral, debts, will, dispatch, navigation]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: insets.bottom + theme.spacing.xxl,
          paddingTop: insets.top + theme.spacing.lg,
        }}
      >
        <Text style={[theme.typography.h1, { marginBottom: theme.spacing.md }]}>
          {t('estate_details')}
        </Text>

        <LeftBorderView color={theme.colors.primary}>
          <Text style={[theme.typography.h3, { marginBottom: theme.spacing.sm }]}>
            {t('select_madhab')}
          </Text>
          {MADHABS.map((madhab) => (
            <RadioButton
              key={madhab.value}
              label={madhab.label}
              value={madhab.value}
              selected={state.madhab === madhab.value}
              onSelect={(val) => dispatch({ type: 'SET_MADHAB', payload: val })}
            />
          ))}
        </LeftBorderView>

        <Divider />

        <LeftBorderView>
          <Input
            label={t('total_estate')}
            value={total}
            onChangeText={setTotal}
            keyboardType="numeric"
            currency
          />
          <Input
            label={t('funeral_costs')}
            value={funeral}
            onChangeText={setFuneral}
            keyboardType="numeric"
            currency
          />
          <Input
            label={t('debts')}
            value={debts}
            onChangeText={setDebts}
            keyboardType="numeric"
            currency
          />
          <Input
            label={t('will_optional')}
            value={will}
            onChangeText={setWill}
            keyboardType="numeric"
            currency
          />
        </LeftBorderView>

        <Button
          title={t('next_select_school')}
          onPress={handleNext}
          mode="filled"
          fullWidth
          style={{ marginTop: theme.spacing.lg }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
