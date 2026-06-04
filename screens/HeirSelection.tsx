import { StepIndicator } from '../components/StepIndicator';
import { t } from '../lib/i18n';
import React, { useCallback } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { HeirSelector } from '../components/HeirSelector';
import { Button } from '../components/ui/Button';
import { useAppTheme } from '../hooks/useAppTheme';
import { useCalc } from '../lib/context/CalcContext';
import { OnboardingTooltip } from '../components/OnboardingTooltip';
import { validateHeirsConfig } from '../lib/utils/validation';
import { heirsArrayToObject } from '../lib/utils/heirsConverter';
import { showAlert } from '../lib/utils/alerts';

type HeirSelectionNavigation = {
  navigate: (screen: string) => void;
};

export const HeirSelection = ({ navigation }: { navigation: HeirSelectionNavigation }) => {
  const theme = useAppTheme();
  const { state, dispatch } = useCalc();

  const onNext = useCallback(() => {
    // Convert array to object for validation
    const heirsObject = heirsArrayToObject(state.heirs);

    const validation = validateHeirsConfig(heirsObject as Record<string, number>);

    if (!validation.valid) {
      showAlert(t('validation_error'), validation.errors.join('\n'));
      return;
    }

    dispatch({ type: 'SET_HEIRS', payload: state.heirs });
    navigation.navigate('Results');
  }, [state.heirs, dispatch, navigation]);

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: theme.spacing.lg }}>
          <StepIndicator
            currentStep={2}
            steps={['step_estate', 'step_madhab', 'step_heirs', 'step_results']}
          />
          <Text style={theme.typography.h1}>{t('select_heirs')}</Text>
          <HeirSelector
            heirs={state.heirs}
            onHeirsChange={(heirs) => dispatch({ type: 'SET_HEIRS', payload: heirs })}
          />
          <Button
            title={t('calculate_inheritance')}
            onPress={onNext}
            style={{ marginTop: theme.spacing.lg }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
      <OnboardingTooltip />
    </View>
  );
};
