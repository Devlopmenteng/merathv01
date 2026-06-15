import React from 'react';
import { View, Text, FlatList, I18nManager, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../hooks/useAppTheme';
import { useCalc } from '../lib/context/CalcContext';
import { Madhab } from '../lib/engine/types';
import { t } from '../lib/i18n';
import { StepIndicator } from '../components/StepIndicator';
import { elevation } from '../lib/constants/theme';

const madhabs: {
  key: Madhab;
  title: string;
  desc: string;
  icon: string;
  colors: readonly [string, string];
}[] = [
  {
    key: 'hanafi',
    title: t('madhab_hanafi'),
    desc: t('madhab_hanafi_desc'),
    icon: '🔴',
    colors: ['#dc2626', '#ef4444'] as const,
  },
  {
    key: 'maliki',
    title: t('madhab_maliki'),
    desc: t('madhab_maliki_desc'),
    icon: '🟣',
    colors: ['#7c3aed', '#8b5cf6'] as const,
  },
  {
    key: 'shafii',
    title: t('madhab_shafii'),
    desc: t('madhab_shafii_desc'),
    icon: '🟢',
    colors: ['#059669', '#10b981'] as const,
  },
  {
    key: 'hanbali',
    title: t('madhab_hanbali'),
    desc: t('madhab_hanbali_desc'),
    icon: '🔵',
    colors: ['#0284c7', '#0ea5e9'] as const,
  },
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
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={50}
        initialNumToRender={5}
        windowSize={5}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.madhabItem}
            onPress={() => {
              dispatch({ type: 'SET_MADHAB', payload: item.key });
              navigation.navigate('HeirSelection');
            }}
            activeOpacity={0.8}
            accessibilityLabel={`${item.title}. ${item.desc}`}
            accessibilityHint={t('a11y_select_madhab', { madhab: item.title })}
            accessibilityRole="button"
          >
            <LinearGradient
              colors={item.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.madhabGradient}
            >
              <Text style={styles.madhabIcon}>{item.icon}</Text>
              <Text
                style={[
                  styles.madhabTitle,
                  { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
                ]}
              >
                {item.title}
              </Text>
              <Text
                style={[styles.madhabDesc, { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' }]}
              >
                {t('imam')} {item.title}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  madhabItem: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    ...elevation.medium,
  },
  madhabGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  madhabIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  madhabTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    textAlign: 'center',
  },
  madhabDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});
