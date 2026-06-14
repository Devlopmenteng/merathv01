import React from 'react';
import { View, Text, FlatList, I18nManager, TouchableOpacity, StyleSheet } from 'react-native';
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
            activeOpacity={0.7}
            accessibilityLabel={`${item.title}. ${item.desc}`}
            accessibilityHint={t('a11y_select_madhab', { madhab: item.title })}
            accessibilityRole="button"
          >
            <View style={[styles.leftBorder, { backgroundColor: theme.colors.primary }]} />
            <Text style={[styles.icon, theme.typography.h1]}>{item.icon}</Text>
            <View style={styles.content}>
              <Text
                style={[
                  theme.typography.h2,
                  { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
                ]}
              >
                {item.title}
              </Text>
              <Text
                style={[
                  theme.typography.body,
                  { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
                ]}
              >
                {item.desc}
              </Text>
            </View>
            {I18nManager.isRTL ? (
              <Text style={styles.chevron}>‹</Text>
            ) : (
              <Text style={styles.chevron}>›</Text>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  madhabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  leftBorder: {
    position: 'absolute',
    left: I18nManager.isRTL ? undefined : 0,
    right: I18nManager.isRTL ? 0 : undefined,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderTopRightRadius: I18nManager.isRTL ? 12 : 0,
    borderBottomRightRadius: I18nManager.isRTL ? 12 : 0,
  },
  icon: {
    marginHorizontal: 16,
  },
  content: {
    flex: 1,
  },
  chevron: {
    fontSize: 28,
    color: '#9CA3AF',
    marginHorizontal: 8,
  },
});
