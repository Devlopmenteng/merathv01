import React from 'react';
import { View, Text, ScrollView, I18nManager, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../hooks/useAppTheme';
import { t } from '../lib/i18n';
import type { AuditEntry } from '../lib/services/AuditTrailService';
import { localizeStepTitle, localizeStepDesc } from '../lib/utils/shareLocalization';
import { Button } from '../components/ui/Button';
import { useLocalizedTitle } from '../hooks/useLocalizedTitle';

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
  useLocalizedTitle('calculation_steps');
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
        <Button
          title={t('back')}
          onPress={() => navigation.goBack()}
          mode="outlined"
          style={{ marginBottom: theme.spacing.md }}
        />
        <Text
          style={[theme.typography.h1, { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' }]}
        >
          {t('calculation_steps')}
        </Text>
        <Text
          style={[
            theme.typography.body,
            { marginTop: theme.spacing.md, writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
          ]}
        >
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
      <Button
        title={t('back')}
        onPress={() => navigation.goBack()}
        mode="outlined"
        style={{ marginBottom: theme.spacing.md }}
      />

      <Text style={[theme.typography.h1, { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' }]}>
        {t('calculation_steps')}
      </Text>

      <View style={[styles.infoCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
        <Text
          style={[
            theme.typography.bodySmall,
            {
              color: theme.colors.text.secondary,
              writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
            },
          ]}
        >
          {t('case_name')}: {auditEntry.caseName || t('no_name')}
        </Text>
        <Text
          style={[
            theme.typography.bodySmall,
            {
              color: theme.colors.text.secondary,
              writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
            },
          ]}
        >
          {t('date')}: {auditEntry.caseDate || t('no_date')}
        </Text>
        <Text
          style={[
            theme.typography.bodySmall,
            {
              color: theme.colors.text.secondary,
              writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
            },
          ]}
        >
          {t('madhab')}:{' '}
          {t('madhab_name_' + auditEntry.madhab, { defaultValue: auditEntry.madhab })}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {auditEntry.steps && auditEntry.steps.length > 0 ? (
          auditEntry.steps.map((step, index) => (
            <View
              key={index}
              style={[styles.stepCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}
              accessible
              accessibilityLabel={t('a11y_step_prefix', { number: index + 1, title: step.title })}
            >
              <View
                style={{
                  flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
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
                    marginEnd: I18nManager.isRTL ? undefined : theme.spacing.md,
                    marginStart: I18nManager.isRTL ? theme.spacing.md : undefined,
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
                <Text
                  style={[
                    theme.typography.h3,
                    {
                      flex: 1,
                      color: theme.colors.text.primary,
                      writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
                    },
                  ]}
                >
                  {localizeStepTitle(step.title)}
                </Text>
              </View>

              <Text
                style={[
                  theme.typography.body,
                  {
                    marginStart: I18nManager.isRTL ? undefined : 48,
                    marginEnd: I18nManager.isRTL ? 48 : undefined,
                    color: theme.colors.text.secondary,
                    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
                  },
                ]}
              >
                {localizeStepDesc(step.description)}
              </Text>
            </View>
          ))
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
            <Text
              style={[
                theme.typography.body,
                { textAlign: 'center', writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
              ]}
            >
              {t('no_steps_available')}
            </Text>
          </View>
        )}

        {auditEntry.hijabLog && auditEntry.hijabLog.length > 0 && (
          <View style={[styles.hijabCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.errorLight }]}>
            <Text
              style={[
                theme.typography.h3,
                {
                  marginBottom: theme.spacing.md,
                  writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
                },
              ]}
            >
              {t('hijab_log')}
            </Text>
            {auditEntry.hijabLog.map((log, index) => (
              <Text
                key={index}
                style={[
                  theme.typography.body,
                  {
                    color: theme.colors.text.secondary,
                    marginBottom: theme.spacing.xs,
                    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
                  },
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
  infoCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  stepCard: {
    overflow: 'hidden',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  emptyCard: {
    padding: 24,
    borderRadius: 12,
  },
  hijabCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
});
