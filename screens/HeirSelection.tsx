import { StepIndicator } from '../components/StepIndicator';
import { t } from '../lib/i18n';
import React from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { HeirSelector } from '../components/HeirSelector';
import { Button } from '../components/ui/Button';
import { useAppTheme } from '../hooks/useAppTheme';
import { useCalc } from '../lib/context/CalcContext';
import { OnboardingTooltip } from '../components/OnboardingTooltip';

type HeirSelectionNavigation = {
  navigate: (screen: string) => void;
};

export const HeirSelection = ({ navigation }: { navigation: HeirSelectionNavigation }) => {
  const theme = useAppTheme();
  const { state, dispatch } = useCalc();

  const onNext = () => {
    dispatch({ type: 'SET_HEIRS', payload: state.heirs });
    navigation.navigate('Results');
  };

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: theme.spacing.md }}>
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
