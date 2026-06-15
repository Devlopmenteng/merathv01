import { StepIndicator } from '../components/StepIndicator';
import { t, i18n } from '../lib/i18n';
import { heirsArrayToObject } from '../lib/utils/heirsConverter';
import { incrementCalculationCount } from '../lib/services/UsageStats';
import { usePremium } from '../lib/context/PremiumContext';
import { generateLegalReport } from '../components/LegalReportGenerator';
import { flipDirectionalIcon } from '../lib/utils/rtl';
import { formatCurrency as formatCurrencyLocale, formatDate } from '../lib/utils/localeFormatting';
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Switch,
  Platform,
  StyleProp,
  TextStyle,
  I18nManager,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCalc } from '../lib/context/CalcContext';
import { LinearGradient } from 'expo-linear-gradient';
import { showAlert } from '../lib/utils/alerts';
import { useAppTheme } from '../hooks/useAppTheme';
import { useResponsive } from '../hooks/useResponsive';
import { ResultsSkeleton } from '../components/SkeletonCard';
import { StepTimeline } from '../components/StepTimeline';
import { StickyBottomBar } from '../components/StickyBottomBar';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { saveAuditTrail } from '../lib/services/AuditTrailService';
import { APP_DEFAULTS } from '../lib/constants/appDefaults';
import { calculateInheritanceWithCache } from '../lib/inheritance/calculateAdapter';
import {
  localizeShareType,
  localizeHeirName,
  localizeReason,
  localizeStepTitle,
  localizeStepDesc,
} from '../lib/utils/shareLocalization';

const ExportBar = React.lazy(() =>
  import('../components/ExportBar').then((module) => ({ default: module.ExportBar }))
);
const PieChart = React.lazy(() =>
  import('../components/PieChart').then((module) => ({ default: module.PieChart }))
);
import type { CalculationResult, EstateInput, Madhab } from '../lib/engine/types';

type ResultsNavigation = {
  navigate: (screen: string, params?: Record<string, unknown>) => void;
};

type ChartDataItem = {
  label: string;
  value: number;
  color: string;
};

const AnimatedNumber = ({ value, style }: { value: number; style?: StyleProp<TextStyle> }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration: APP_DEFAULTS.ANIMATION_DURATION.NUMBER_ANIMATION,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const display = animatedValue.interpolate({
    inputRange: [0, value],
    outputRange: [0, value],
    extrapolate: 'clamp',
  });

  return <Animated.Text style={style}>{display}</Animated.Text>;
};

export const Results = ({ navigation }: { navigation: ResultsNavigation }) => {
  const { isPremium } = usePremium();
  const { state } = useCalc();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { isTablet, breakpoint } = useResponsive();
  const useGridLayout = breakpoint === 'lg' || breakpoint === 'xl';
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPercentage, setShowPercentage] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const savedRef = useRef(false);
  const [successAnimValue] = useState(new Animated.Value(0));
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const heirsObject = useMemo(() => heirsArrayToObject(state.heirs), [state.heirs]);
  const hasSpouse = (heirsObject.husband || 0) > 0 || (heirsObject.wife || 0) > 0;
  const hasNoHeirs = Object.keys(heirsObject).length === 0;

  useEffect(() => {
    if (!hasSpouse) {
      showAlert(t('warning'), t('spouse_missing_message'));
    }
  }, [hasSpouse]);

  const chartData = useMemo<ChartDataItem[]>(() => {
    const colors = [
      theme.colors.error,
      theme.colors.primaryLight,
      theme.colors.secondary,
      theme.colors.success,
      theme.colors.primary,
      theme.colors.warning,
      theme.colors.onBackground,
      theme.colors.primaryDark || theme.colors.primary,
    ];
    if (!result) return [];
    return result.shares.map((s, idx) => ({
      label: localizeHeirName(s.key || '', s.name),
      value: s.amount,
      color: colors[idx % colors.length],
      fraction: s.fraction ? `${s.fraction.numerator}/${s.fraction.denominator}` : '',
    }));
  }, [result, theme.colors]);

  useEffect(() => {
    setLoading(true);

    const performCalculation = async () => {
      const estate: EstateInput = {
        total: state.total,
        funeral: state.funeral,
        debts: state.debts,
        will: state.will,
      };

      try {
        // Use cached calculation for better performance
        const res = await calculateInheritanceWithCache({
          madhab: state.madhab as Madhab,
          totalEstate: estate.total,
          funeralExpenses: estate.funeral,
          debts: estate.debts,
          will: estate.will,
          heirs: state.heirs,
        });

        let confidence = 100;

        if ((res.netEstate ?? 0) <= 0) confidence -= 50;
        if (hasNoHeirs) confidence -= 30;

        const safeResult: CalculationResult = {
          ...res,
          confidence: Math.max(confidence, 10),
        };

        setResult(safeResult);
        setShowSuccessAnimation(true);

        // Trigger success animation
        Animated.sequence([
          Animated.timing(successAnimValue, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(successAnimValue, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start(() => setShowSuccessAnimation(false));

        incrementCalculationCount().catch(() => {});
        if (!savedRef.current) {
          savedRef.current = true;
          saveAuditTrail({
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            madhab: state.madhab,
            netTotal: safeResult.netEstate ?? 0,
            shares: safeResult.shares,
            caseName: state.caseName,
            caseDate: state.caseDate,
            steps: safeResult.steps.map(({ title, description }) => ({ title, description })),
          }).catch(() => {});
        }
      } catch (error) {
        console.error('Calculation error:', error);
        showAlert(t('calculation_error'), t('try_again_message'));
      } finally {
        setLoading(false);
      }
    };

    performCalculation();
  }, [
    state.madhab,
    state.total,
    state.funeral,
    state.debts,
    state.will,
    heirsObject,
    hasNoHeirs,
    state.caseName,
    state.caseDate,
  ]);

  const generatePDF = useCallback(async () => {
    if (!result) return;
    if (isPremium) {
      await generateLegalReport(result, state.madhab);
      return;
    }

    const madhabName = t('madhab_name_' + result.madhab, { defaultValue: result.madhab });
    const html = `
      <html><head><style>body{font-family:Arial;padding:20px}h1{color:${theme.colors.primaryDark || theme.colors.primary}}</style></head>
      <body>
        <h1>${t('pdf_report_title')}</h1>
        <p>${t('madhab')}: ${madhabName}</p>
        <p>${t('pdf_estate_label', { amount: t('currency_symbol') + result.netEstate })}</p>
        <h2>${t('pdf_distribution_heading')}</h2>
        <ul>${result.shares
          .map(
            (s) =>
              `<li>${s.name}: ${t('currency_symbol')}${s.amount.toFixed(2)} (${s.fraction?.numerator}/${s.fraction?.denominator})</li>`
          )
          .join('')}</ul>
        <footer>${t('pdf_footer', { date: formatDate(new Date(), i18n.locale) })}</footer>
      </body></html>
    `;
    const { uri } = await Print.printToFileAsync({ html });
    if (Platform.OS === 'web') window.open(uri);
    else await Sharing.shareAsync(uri);
  }, [isPremium, result, state.madhab]);

  const confidenceColor =
    (result?.confidence ?? 0 >= 70)
      ? theme.colors.success
      : (result?.confidence ?? 0 >= 40)
        ? theme.colors.warning
        : theme.colors.error;

  const specialCaseElements = useMemo(() => {
    if (!result) return null;
    const cases = [];
    if (result.awlApplied)
      cases.push({ name: t('awl'), variant: 'awl' as const, desc: t('awl_desc') });
    if (result.raddApplied)
      cases.push({ name: t('radd'), variant: 'radd' as const, desc: t('radd_desc') });
    if (result.bloodRelativesApplied)
      cases.push({
        name: t('bloodRelatives'),
        variant: 'relative' as const,
        desc: t('blood_relatives_desc'),
      });
    if (cases.length === 0) return null;
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 12 }}>
        {cases.map((c, i) => (
          <Badge key={i} text={c.name} variant={c.variant} />
        ))}
      </View>
    );
  }, [result]);

  const distributionRows = useMemo(() => {
    if (!result) return null;
    return result.shares.map((share, idx) => {
      const color = chartData[idx]?.color;
      const percentage = ((share.amount / (result.netEstate ?? 1)) * 100).toFixed(2);
      return (
        <View key={idx} style={{ marginBottom: 4 }}>
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: idx % 2 === 0 ? theme.colors.surface : theme.colors.surfaceVariant,
              borderRadius: theme.borderRadius.sm,
              paddingVertical: 8,
            }}
          >
            <View
              style={{
                width: isTablet ? 130 : 100,
                paddingHorizontal: 4,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
              <Text numberOfLines={1} style={{ flexShrink: 1 }}>
                {localizeHeirName(share.key || '', share.name)}
              </Text>
            </View>
            <Text style={{ width: isTablet ? 80 : 60, textAlign: 'center' }}>{share.count}</Text>
            <Text style={{ width: isTablet ? 100 : 80, textAlign: 'center' }}>
              {localizeShareType(share.type || '')}
            </Text>
            <Text
              style={{
                width: isTablet ? 100 : 80,
                textAlign: 'center',
                writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
              }}
            >
              {share.fraction ? `${share.fraction.numerator}/${share.fraction.denominator}` : ''}
            </Text>
            <Text style={{ width: isTablet ? 100 : 80, textAlign: 'center' }}>{percentage}%</Text>
            <Text
              style={{
                width: isTablet ? 130 : 100,
                textAlign: 'center',
                fontWeight: 'bold',
                color: theme.colors.primary,
                writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
              }}
            >
              {showPercentage ? `${percentage}%` : formatCurrencyLocale(share.amount, i18n.locale)}
            </Text>
          </View>
          {share.reason ? (
            <Text
              style={[
                theme.typography.caption,
                {
                  color: theme.colors.outline,
                  paddingHorizontal: 22,
                  paddingBottom: 4,
                  writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
                },
              ]}
            >
              {localizeReason(share.reason)}
            </Text>
          ) : null}
        </View>
      );
    });
  }, [
    result,
    chartData,
    showPercentage,
    theme.colors.surface,
    theme.colors.surfaceVariant,
    theme.colors.primary,
    theme.borderRadius.sm,
  ]);

  if (loading || !result) return <ResultsSkeleton />;

  return (
    <React.Suspense fallback={<ResultsSkeleton />}>
      <ExportBar
        resultData={result}
        estate={{
          total: state.total,
          funeral: state.funeral,
          debts: state.debts,
          will: state.will,
        }}
        heirs={state.heirs}
      >
        <ScrollView
          accessibilityLiveRegion="polite"
          contentContainerStyle={{
            padding: theme.spacing.lg,
            paddingBottom: 200 + insets.bottom,
            paddingTop: insets.top + theme.spacing.lg,
          }}
        >
          {/* Success Animation Overlay */}
          {showSuccessAnimation && (
            <Animated.View
              style={[
                styles.successOverlay,
                {
                  opacity: successAnimValue.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 1, 0],
                  }),
                  transform: [
                    {
                      scale: successAnimValue.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.5, 1.2, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Animated.Text style={styles.successCheckmark}>✓</Animated.Text>
            </Animated.View>
          )}

          <StepIndicator
            currentStep={3}
            steps={['step_estate', 'step_madhab', 'step_heirs', 'step_results']}
          />

          {/* Treasury Notification */}
          {result.shares.some((s) => s.key === 'treasury') && (
            <Alert
              title="⚠️ Treasury"
              message={t('treasury_notice')}
              variant="warning"
              style={{ marginBottom: theme.spacing.md }}
            />
          )}

          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark || theme.colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 16,
              padding: theme.spacing.xl,
              alignItems: 'center',
              marginBottom: theme.spacing.lg,
              ...theme.elevation.large,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}
          >
            <View style={{ alignItems: 'center', gap: 8 }}>
              <Text
                style={[{ color: theme.colors.onPrimary, opacity: 0.9 }, theme.typography.label]}
              >
                {t('netEstate')}
              </Text>
              <AnimatedNumber
                value={result.netEstate ?? 0}
                style={[
                  {
                    color: theme.colors.onPrimary,
                    fontWeight: '800',
                    fontSize: 48,
                    letterSpacing: -1,
                  },
                ]}
              />
              <Text
                style={[{ color: theme.colors.onPrimary, opacity: 0.7 }, theme.typography.caption]}
              >
                {t('currency_symbol')}
                {formatCurrencyLocale(result.netEstate ?? 0, i18n.locale)}
              </Text>
            </View>
          </LinearGradient>

          <View
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}
            accessibilityLiveRegion="polite"
            accessibilityLabel={`${t('confidence')}: ${result.confidence}%`}
          >
            <View
              style={{
                height: 8,
                flex: 1,
                backgroundColor: theme.colors.surfaceVariant,
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  height: 8,
                  width: `${result.confidence}%`,
                  backgroundColor: confidenceColor,
                  borderRadius: 4,
                }}
              />
            </View>
            <Text
              style={{ marginStart: 12, color: confidenceColor, fontWeight: '600', fontSize: 14 }}
            >
              {result.confidence}%
            </Text>
          </View>

          <Text style={[theme.typography.caption, { marginBottom: theme.spacing.md }]}>
            {t('confidence')}
          </Text>

          {specialCaseElements}

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
              marginVertical: 12,
            }}
          >
            <Text style={{ marginEnd: 8 }}>{t('fractions')}</Text>
            <Switch
              value={showPercentage}
              onValueChange={setShowPercentage}
              accessibilityLabel={showPercentage ? t('percentages') : t('fractions')}
              accessibilityHint={t('a11y_toggle_fraction_percentage')}
              accessibilityRole="switch"
              accessibilityState={{ selected: showPercentage }}
            />
            <Text style={{ marginStart: 8 }}>{t('percentages')}</Text>
          </View>

          <View style={[useGridLayout ? styles.gridRow : {}]}>
            <View style={[useGridLayout ? styles.gridItem : {}]}>
              <PieChart data={chartData} />
            </View>

            <View style={[useGridLayout ? styles.gridItem : {}]}>
              <Text
                style={[
                  theme.typography.h2,
                  {
                    marginTop: useGridLayout ? 0 : theme.spacing.xl,
                    marginBottom: theme.spacing.md,
                  },
                ]}
              >
                {t('distribution')}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <View style={{ minWidth: '100%' }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      borderBottomWidth: 2,
                      borderColor: theme.colors.primary,
                      paddingBottom: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        width: isTablet ? 130 : 100,
                        fontWeight: 'bold',
                        paddingHorizontal: 4,
                      }}
                    >
                      {t('heir')}
                    </Text>
                    <Text
                      style={{ width: isTablet ? 80 : 60, fontWeight: 'bold', textAlign: 'center' }}
                    >
                      {t('count')}
                    </Text>
                    <Text
                      style={{
                        width: isTablet ? 100 : 80,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
                      }}
                    >
                      {t('type')}
                    </Text>
                    <Text
                      style={{
                        width: isTablet ? 100 : 80,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
                      }}
                    >
                      {t('share')}
                    </Text>
                    <Text
                      style={{
                        width: isTablet ? 100 : 80,
                        fontWeight: 'bold',
                        textAlign: 'center',
                      }}
                    >
                      {t('percentage')}
                    </Text>
                    <Text
                      style={{
                        width: isTablet ? 130 : 100,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
                      }}
                    >
                      {t('amount')}
                    </Text>
                  </View>
                  {distributionRows}
                </View>
              </ScrollView>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setShowSteps(!showSteps)}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: theme.spacing.lg,
              marginBottom: theme.spacing.md,
              padding: theme.spacing.md,
              backgroundColor: theme.colors.surfaceVariant,
              borderRadius: theme.borderRadius.md,
            }}
            accessibilityLabel={showSteps ? t('a11y_hide_steps') : t('a11y_show_steps')}
            accessibilityHint={
              showSteps ? t('a11y_hide_calculation_steps') : t('a11y_show_calculation_steps')
            }
            accessibilityRole="button"
            accessibilityState={{ expanded: showSteps }}
          >
            <Text style={[theme.typography.h2, { color: theme.colors.onSurface }]}>
              {t('steps')}
            </Text>
            <Text style={[{ color: theme.colors.primary }, theme.typography.button]}>
              {showSteps ? flipDirectionalIcon('▲') : flipDirectionalIcon('▼')}
            </Text>
          </TouchableOpacity>
          {showSteps && (
            <View style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.lg }}>
              <View style={styles.stepCard}>
                <StepTimeline
                  steps={result.steps.map((step) => ({
                    title: localizeStepTitle(step.title, step.stepType),
                    description: localizeStepDesc(step.description, step.stepType),
                  }))}
                />
              </View>
            </View>
          )}

          <StickyBottomBar
            onCompare={() => navigation.navigate('Comparison')}
            onHistory={() => navigation.navigate('History')}
            onSettings={() => navigation.navigate('Settings')}
            onPDF={generatePDF}
          />
        </ScrollView>
      </ExportBar>
    </React.Suspense>
  );
};

const styles = StyleSheet.create({
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  tableCell: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  stepCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successCheckmark: {
    fontSize: 120,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 16,
  },
  gridItem: {
    flex: 1,
  },
});
