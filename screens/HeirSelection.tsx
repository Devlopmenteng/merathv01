import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { HeirSelector } from '../components/HeirSelector';
import { Button } from '../components/ui/Button';
import { FAB } from '../components/ui/FAB';
import { useAppTheme } from '../hooks/useAppTheme';
import { useCalc } from '../lib/context/CalcContext';
import { t } from '../lib/i18n';
import { useLocalizedTitle } from '../hooks/useLocalizedTitle';

type HeirSelectionNavigation = { navigate: (screen: string) => void };

export const HeirSelection = ({ navigation }: { navigation: HeirSelectionNavigation }) => {
  const theme = useAppTheme();
  useLocalizedTitle('select_heirs');
  const { state, dispatch } = useCalc();

  const handleCalculate = () => {
    navigation.navigate('Results');
  };

  const handleReset = () => {
    dispatch({ type: 'SET_HEIRS', payload: [] });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: 80 }}>
        <Text style={[theme.typography.h1, { marginBottom: theme.spacing.md }]}>
          {t('select_heirs')}
        </Text>
        <HeirSelector
          heirs={state.heirs}
          onHeirsChange={(heirs) => dispatch({ type: 'SET_HEIRS', payload: heirs })}
        />
        <Button
          title={t('calculate_inheritance')}
          onPress={handleCalculate}
          mode="filled"
          fullWidth
          style={{ marginTop: theme.spacing.lg }}
        />
      </ScrollView>
      <FAB onPress={handleReset} icon="⟳" />
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1 } });
