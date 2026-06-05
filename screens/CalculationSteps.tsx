import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../hooks/useAppTheme';
import { t } from '../lib/i18n';
import type { AuditEntry } from '../lib/services/AuditTrailService';
import { backArrow } from '../lib/utils/rtl';
import { localizeStepTitle, localizeStepDesc } from '../lib/utils/shareLocalization';

type CalculationStepsNavigation = {
  navigate: (screen: string) => void;
  goBack: () => void;
};

type Props = {
  route: {
    params?: {
      auditEntry?: AuditEntry;
    };
  };
  navigation: CalculationStepsNavigation;
};

export const CalculationSteps = ({ route, navigation }: Props) => {
  const { auditEntry } = route.params || {};
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  if (!auditEntry) {
    return (
      <View
        style={{
          flex: 1,
          padding: theme.spacing.lg,
          paddingTop: insets.top + theme.spacing.lg,
          paddingBottom: insets.bottom,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginBottom: theme.spacing.md }}
          accessibilityLabel={t('back')}
          accessibilityRole="button"
        >
          <Text style={[{ color: theme.colors.primary }, theme.typography.button]}>
            {backArrow()} {t('back')}
          </Text>
        </TouchableOpacity>
        <Text style={theme.typography.h1}>{t('calculation_steps')}</Text>
        <Text style={[theme.typography.body, { marginTop: theme.spacing.md }]}>
          {t('no_calculation_data')}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        padding: theme.spacing.lg,
        paddingTop: insets.top + theme.spacing.lg,
        paddingBottom: insets.bottom,
      }}
    >
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ marginBottom: theme.spacing.md }}
        accessibilityLabel={t('back')}
        accessibilityRole="button"
      >
        <Text style={[{ color: theme.colors.primary }, theme.typography.button]}>
          {backArrow()} {t('back')}
        </Text>
      </TouchableOpacity>

      <Text style={theme.typography.h1}>{t('calculation_steps')}</Text>

      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.md,
          ...theme.elevation.small,
          borderWidth: 1,
          borderColor: theme.colors.outline,
        }}
      >
        <Text style={[theme.typography.bodySmall, { color: theme.colors.text.secondary }]}>
          {t('case_name')}: {auditEntry.caseName || t('no_name')}
        </Text>
        <Text style={[theme.typography.bodySmall, { color: theme.colors.text.secondary }]}>
          {t('date')}: {auditEntry.caseDate || t('no_date')}
        </Text>
        <Text style={[theme.typography.bodySmall, { color: theme.colors.text.secondary }]}>
          {t('madhab')}:{' '}
          {t('madhab_name_' + auditEntry.madhab, { defaultValue: auditEntry.madhab })}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {auditEntry.steps && auditEntry.steps.length > 0 ? (
          auditEntry.steps.map((step, index) => (
            <View
              key={index}
              style={[
                styles.stepCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius.lg,
                  padding: theme.spacing.md,
                  marginBottom: theme.spacing.md,
                  ...theme.elevation.small,
                  borderWidth: 1,
                  borderColor: theme.colors.outline,
                },
              ]}
              accessible
              accessibilityLabel={t('a11y_step_prefix', { number: index + 1, title: step.title })}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: theme.spacing.sm,
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: theme.colors.primary,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginEnd: theme.spacing.md,
                  }}
                >
                  <Text
                    style={[
                      { color: theme.colors.onPrimary, fontWeight: 'bold' },
                      theme.typography.button,
                    ]}
                  >
                    {index + 1}
                  </Text>
                </View>
                <Text style={[theme.typography.h3, { flex: 1, color: theme.colors.text.primary }]}>
                  {localizeStepTitle(step.title)}
                </Text>
              </View>

              <Text
                style={[
                  theme.typography.body,
                  { marginStart: 48, color: theme.colors.text.secondary },
                ]}
              >
                {localizeStepDesc(step.description)}
              </Text>
            </View>
          ))
        ) : (
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.lg,
              ...theme.elevation.small,
              borderWidth: 1,
              borderColor: theme.colors.outline,
            }}
          >
            <Text style={[theme.typography.body, { textAlign: 'center' }]}>
              {t('no_steps_available')}
            </Text>
          </View>
        )}

        {auditEntry.hijabLog && auditEntry.hijabLog.length > 0 && (
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.md,
              marginTop: theme.spacing.md,
              ...theme.elevation.small,
              borderWidth: 1,
              borderColor: theme.colors.outline,
            }}
          >
            <Text style={[theme.typography.h3, { marginBottom: theme.spacing.md }]}>
              {t('hijab_log')}
            </Text>
            {auditEntry.hijabLog.map((log, index) => (
              <Text
                key={index}
                style={[
                  theme.typography.body,
                  { color: theme.colors.text.secondary, marginBottom: theme.spacing.xs },
                ]}
              >
                • {log}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  stepCard: {
    overflow: 'hidden',
  },
});
