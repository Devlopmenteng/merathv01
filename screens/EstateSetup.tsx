import { StepIndicator } from '../components/StepIndicator';
import { t, i18n } from '../lib/i18n';
import React, { useState, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, I18nManager } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAppTheme } from '../hooks/useAppTheme';
import { useCalc } from '../lib/context/CalcContext';
import { validateEstateInput, sanitizeInput } from '../lib/utils/validation';
import { showAlert } from '../lib/utils/alerts';
import { formatCurrency as formatCurrencyLocale } from '../lib/utils/localeFormatting';
import { TemplateSelector } from '../components/TemplateSelector';
import type { HeirEntry, EstateInput } from '../lib/engine/types';

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
  const [totalError, setTotalError] = useState('');
  const [funeralError, setFuneralError] = useState('');
  const [debtsError, setDebtsError] = useState('');
  const [willError] = useState('');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const net = parseFloat(total || '0') - parseFloat(funeral || '0') - parseFloat(debts || '0');
  const maxWill = net / 3;

  const validateTotal = (value: string) => {
    const num = parseFloat(value);
    if (value && (isNaN(num) || num < 0)) {
      return t('invalid_positive_number');
    }
    return '';
  };

  const validateCurrency = (value: string) => {
    const num = parseFloat(value);
    if (value && (isNaN(num) || num < 0)) {
      return t('invalid_positive_number');
    }
    return '';
  };

  const handleTotalChange = (text: string) => {
    setTotal(text);
    setTotalError(validateTotal(text));
  };

  const handleFuneralChange = (text: string) => {
    setFuneral(text);
    setFuneralError(validateCurrency(text));
  };

  const handleDebtsChange = (text: string) => {
    setDebts(text);
    setDebtsError(validateCurrency(text));
  };

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

  const handleApplyTemplate = useCallback(
    (templateData: {
      estate: EstateInput;
      heirs: HeirEntry[];
      recommendedMadhab?: string | undefined;
    }) => {
      // Apply estate values
      setTotal(String(templateData.estate.total));
      setFuneral(String(templateData.estate.funeral));
      setDebts(String(templateData.estate.debts));
      setWill(String(templateData.estate.will));

      // Apply heirs and recommended madhab to context
      dispatch({
        type: 'SET_ESTATE',
        payload: templateData.estate,
      });
      dispatch({
        type: 'SET_HEIRS',
        payload: templateData.heirs,
      });
      if (templateData.recommendedMadhab) {
        dispatch({
          type: 'SET_MADHAB',
          payload: templateData.recommendedMadhab,
        });
      }
    },
    [dispatch]
  );

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

      {/* Modern Header */}
      <View style={[styles.headerSection, { borderLeftColor: theme.colors.primary }]}>
        <View style={styles.headerContent}>
          <View style={[styles.headerIcon, { backgroundColor: theme.colors.primaryLight }]}>
            <Text style={styles.headerEmoji}>💰</Text>
          </View>
          <View>
            <Text
              style={[theme.typography.h1, { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' }]}
            >
              {t('estate_details')}
            </Text>
            <Text
              style={[
                theme.typography.body,
                {
                  color: theme.colors.text.secondary,
                  marginTop: theme.spacing.xs,
                  writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
                },
              ]}
            >
              {t('estate_details_description')}
            </Text>
          </View>
        </View>
      </View>

      {/* Case Info Section */}
      <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
        <Text
          style={[
            theme.typography.h4,
            { marginBottom: theme.spacing.md, writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
          ]}
        >
          {t('case_info')}
        </Text>
        <Input
          label={t('case_name_optional')}
          value={caseName}
          onChangeText={(text) =>
            dispatch({ type: 'SET_CASE', payload: { caseName: text, caseDate } })
          }
          maxLength={100}
          accessibilityLabel={t('case_name_optional')}
          accessibilityHint={t('a11y_enter_case_name')}
        />
        <Input
          label={t('date')}
          value={caseDate}
          onChangeText={(text) =>
            dispatch({ type: 'SET_CASE', payload: { caseName, caseDate: text } })
          }
          accessibilityLabel={t('date')}
          accessibilityHint={t('a11y_enter_case_date')}
        />
      </View>

      {/* Estate Section with Alert */}
      <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
        <Text
          style={[
            theme.typography.h4,
            { marginBottom: theme.spacing.md, writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
          ]}
        >
          {t('estate')}
        </Text>
        <Input
          label={t('total_estate')}
          currency
          value={total}
          onChangeText={handleTotalChange}
          keyboardType="numeric"
          accessibilityLabel={t('total_estate')}
          accessibilityHint={t('a11y_enter_total_estate')}
          error={totalError}
        />
        <View
          style={{
            flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
            gap: theme.spacing.sm,
          }}
        >
          <Input
            style={{ flex: 1 }}
            label={t('funeral_costs')}
            currency
            value={funeral}
            onChangeText={handleFuneralChange}
            keyboardType="numeric"
            accessibilityLabel={t('funeral_costs')}
            accessibilityHint={t('a11y_enter_funeral_costs')}
            error={funeralError}
          />
          <Input
            style={{ flex: 1 }}
            label={t('debts')}
            currency
            value={debts}
            onChangeText={handleDebtsChange}
            keyboardType="numeric"
            accessibilityLabel={t('debts')}
            accessibilityHint={t('a11y_enter_debts')}
            error={debtsError}
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
          accessibilityLabel={t('will_optional')}
          accessibilityHint={
            willError ? t('a11y_will_exceeds_limit') : t('a11y_enter_will_optional')
          }
          accessibilityState={{ error: !!willError }}
        />
      </View>

      {/* Order of Rights Alert */}
      <View style={[styles.infoAlert, { borderLeftColor: theme.colors.warning }]}>
        <Text style={[styles.alertTitle, { color: theme.colors.warning }]}>
          ⚠️ {t('rights_order_title')}
        </Text>
        <Text
          style={[styles.alertMessage, { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' }]}
        >
          {t('rights_order_description')}
        </Text>
      </View>

      {/* Summary Card */}
      {(parseFloat(total) > 0 || parseFloat(funeral) > 0 || parseFloat(debts) > 0) && (
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.successLight }]}>
          <Text
            style={[
              theme.typography.h4,
              {
                marginBottom: theme.spacing.sm,
                writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
              },
            ]}
          >
            {t('net_estate')}
          </Text>
          <Text
            style={[
              theme.typography.display,
              { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr', color: theme.colors.success },
            ]}
            accessibilityLiveRegion="polite"
            accessibilityLabel={`${t('net_estate')}: ${formatCurrencyLocale(Math.max(0, net - (parseFloat(will) || 0)), i18n.locale)}`}
          >
            {formatCurrencyLocale(Math.max(0, net - (parseFloat(will) || 0)), i18n.locale)}
          </Text>
          <Text
            style={[
              theme.typography.bodySmall,
              {
                color: theme.colors.text.secondary,
                writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
              },
            ]}
            accessibilityLiveRegion="polite"
          >
            {t('total_estate')}: {formatCurrencyLocale(parseFloat(total) || 0, i18n.locale)} —{' '}
            {t('deductions')}:&nbsp;
            {formatCurrencyLocale(
              (parseFloat(funeral) || 0) + (parseFloat(debts) || 0) + (parseFloat(will) || 0),
              i18n.locale
            )}
          </Text>
        </View>
      )}

      {/* Template Button */}
      <Button
        title={t('quick_templates')}
        onPress={() => setShowTemplateSelector(true)}
        mode="outlined"
        fullWidth
        style={{ marginBottom: theme.spacing.md }}
      />

      {/* Next Button */}
      <Button
        title={t('next_select_school')}
        onPress={onNext}
        mode="gradient"
        disabled={!total || parseFloat(total) <= 0}
        style={{ marginTop: theme.spacing.lg }}
        accessibilityLabel={t('next_select_school')}
        accessibilityHint={
          !total || parseFloat(total) <= 0
            ? t('a11y_enter_total_estate_first')
            : t('a11y_proceed_to_madhab_selection')
        }
        accessibilityState={{ disabled: !total || parseFloat(total) <= 0 }}
      />

      <TemplateSelector
        visible={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onApply={handleApplyTemplate}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  headerSection: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerEmoji: {
    fontSize: 28,
  },
  sectionCard: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  infoAlert: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  alertMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  summaryCard: {
    padding: 20,
    marginBottom: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
});
