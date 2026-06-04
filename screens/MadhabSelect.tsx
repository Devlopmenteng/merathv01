import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../hooks/useAppTheme';
import { useCalc } from '../lib/context/CalcContext';
import { Madhab } from '../lib/engine/types';
import { t } from '../lib/i18n';
import { StepIndicator } from '../components/StepIndicator';

const madhabs: { key: Madhab; title: string; desc: string; icon: string }[] = [
  { key: 'hanafi', title: t('madhab_hanafi'), desc: t('madhab_hanafi_desc'), icon: '📖' },
  { key: 'maliki', title: t('madhab_maliki'), desc: t('madhab_maliki_desc'), icon: '⚖️' },
  { key: 'shafii', title: t('madhab_shafii'), desc: t('madhab_shafii_desc'), icon: '🕌' },
  { key: 'hanbali', title: t('madhab_hanbali'), desc: t('madhab_hanbali_desc'), icon: '📜' },
];

type MadhabSelectNavigation = {
  navigate: (screen: string) => void;
};

export const MadhabSelect = ({ navigation }: { navigation: MadhabSelectNavigation }) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { dispatch } = useCalc();

  return (
    <View style={{ flex: 1 }}>
      <StepIndicator
        currentStep={1}
        steps={['step_estate', 'step_madhab', 'step_heirs', 'step_results']}
      />
      <FlatList
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: theme.spacing.xxl + insets.bottom,
          paddingTop: insets.top + theme.spacing.lg,
        }}
        data={madhabs}
        keyExtractor={(i) => i.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              dispatch({ type: 'SET_MADHAB', payload: item.key });
              navigation.navigate('HeirSelection');
            }}
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.md,
              padding: theme.spacing.md,
              marginBottom: theme.spacing.md,
              borderLeftWidth: 6,
              borderLeftColor: theme.colors.primary,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Text style={[{ marginEnd: 12 }, theme.typography.h1]}>{item.icon}</Text>
            <View>
              <Text style={theme.typography.h2}>{item.title}</Text>
              <Text style={theme.typography.body}>{item.desc}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};
