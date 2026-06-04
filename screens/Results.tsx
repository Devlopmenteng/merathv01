import { StepIndicator } from '../components/StepIndicator';
import { t } from '../lib/i18n';
import { heirsArrayToObject } from '../lib/utils/heirsConverter';
import { incrementCalculationCount } from '../lib/services/UsageStats';
import { usePremium } from '../lib/context/PremiumContext';
import { generateLegalReport } from '../components/LegalReportGenerator';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCalc } from '../lib/context/CalcContext';
import { LinearGradient } from 'expo-linear-gradient';
import { showAlert } from '../lib/utils/alerts';
import { formatCurrency } from '../lib/utils/currency';
import { useAppTheme } from '../hooks/useAppTheme';
import { useResponsive } from '../hooks/useResponsive';
import { ResultsSkeleton } from '../components/SkeletonCard';
import { StepTimeline } from '../components/StepTimeline';
import { StickyBottomBar } from '../components/StickyBottomBar';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { saveAuditTrail } from '../lib/services/AuditTrailService';
import { APP_DEFAULTS } from '../lib/constants/appDefaults';
import { calculateInheritanceWithCache } from '../lib/inheritance/calculateAdapter';

const ExportBar = React.lazy(() =>
  import('../components/ExportBar').then((module) => ({ default: module.ExportBar }))
);
const PieChart = React.lazy(() =>
  import('../components/PieChart').then((module) => ({ default: module.PieChart }))
);
import type { CalculationResult, EstateInput } from '../lib/engine/types';

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
  const { state, caseName, caseDate } = useCalc();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { isTablet } = useResponsive();
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPercentage, setShowPercentage] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const savedRef = useRef(false);

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
      label: s.name,
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
          madhab: state.madhab as any,
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

        incrementCalculationCount().catch(() => {});
        if (!savedRef.current) {
          savedRef.current = true;
          saveAuditTrail({
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            madhab: state.madhab,
            netTotal: safeResult.netEstate ?? 0,
            shares: safeResult.shares,
            caseName: caseName,
            caseDate: caseDate,
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
    caseName,
    caseDate,
  ]);

  const generatePDF = useCallback(async () => {
    if (!result) return;
    if (isPremium) {
      await generateLegalReport(result, state.madhab);
      return;
    }

    const html = `
      <html><head><style>body{font-family:Arial;padding:20px}h1{color:${theme.colors.primaryDark || theme.colors.primary}}</style></head>
      <body>
        <h1>Inheritance Report</h1>
        <p>Madhab: ${result.madhab}</p>
        <p>Net Estate: $${result.netEstate}</p>
        <h2>Distribution</h2>
        <ul>${result.shares
          .map(
            (s) =>
              `<li>${s.name}: $${s.amount.toFixed(2)} (${s.fraction?.numerator}/${s.fraction?.denominator})</li>`
          )
          .join('')}</ul>
        <footer>Generated by Merath App - ${new Date().toLocaleDateString()}</footer>
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
    if (result.awlApplied) cases.push({ name: t('awl'), desc: t('awl_desc') });
    if (result.raddApplied) cases.push({ name: t('radd'), desc: t('radd_desc') });
    if (result.bloodRelativesApplied)
      cases.push({ name: t('bloodRelatives'), desc: t('blood_relatives_desc') });
    if (cases.length === 0) return null;
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 12 }}>
        {cases.map((c, i) => (
          <View
            key={i}
            style={{
              backgroundColor: theme.colors.primaryLight,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
            }}
          >
            <Text style={{ color: theme.colors.primary, fontSize: 12 }}>{c.name}</Text>
          </View>
        ))}
      </View>
    );
  }, [result, theme.colors.primaryLight, theme.colors.primary]);

  const distributionRows = useMemo(() => {
    if (!result) return null;
    return result.shares.map((share, idx) => {
      const color = chartData[idx]?.color;
      const percentage = ((share.amount / (result.netEstate ?? 1)) * 100).toFixed(2);
      return (
        <View
          key={idx}
          style={{
            flexDirection: 'row',
            backgroundColor: idx % 2 === 0 ? theme.colors.surface : theme.colors.surfaceVariant,
            borderRadius: theme.radius.sm,
            paddingVertical: 8,
            marginBottom: 4,
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
            <Text>{share.name}</Text>
          </View>
          <Text style={{ width: isTablet ? 80 : 60, textAlign: 'center' }}>{share.count}</Text>
          <Text style={{ width: isTablet ? 100 : 80, textAlign: 'center' }}>{share.type}</Text>
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
            {showPercentage ? `${percentage}%` : formatCurrency(share.amount)}
          </Text>
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
    theme.radius.sm,
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
          contentContainerStyle={{
            padding: theme.spacing.lg,
            paddingBottom: 200 + insets.bottom,
            paddingTop: insets.top + theme.spacing.lg,
          }}
        >
          <StepIndicator
            currentStep={3}
            steps={['step_estate', 'step_madhab', 'step_heirs', 'step_results']}
          />

          {/* Treasury Notification */}
          {result.shares.some((s) => s.key === 'treasury') && (
            <View
              style={{
                backgroundColor: theme.colors.warning,
                padding: theme.spacing.md,
                borderRadius: theme.radius.sm,
                marginBottom: theme.spacing.md,
              }}
            >
              <Text style={[theme.typography.body, { color: theme.colors.onBackground, textAlign: 'center' }]}>
                {t('treasury_notice')}
              </Text>
            </View>
          )}

          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark || theme.colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderRadius: theme.radius.lg,
              padding: theme.spacing.lg,
              alignItems: 'center',
              marginBottom: theme.spacing.lg,
            }}
          >
            <Text style={{ color: theme.colors.onPrimary, fontSize: 16, marginBottom: 4 }}>
              {t('netEstate')}
            </Text>
            <AnimatedNumber
              value={result.netEstate ?? 0}
              style={{ color: theme.colors.onPrimary, fontSize: 32, fontWeight: 'bold' }}
            />
          </LinearGradient>

          <View
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}
          >
            <View
              style={{
                height: 10,
                flex: 1,
                backgroundColor: theme.colors.surfaceVariant,
                borderRadius: 5,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  height: 10,
                  width: `${result.confidence}%`,
                  backgroundColor: confidenceColor,
                  borderRadius: 5,
                }}
              />
            </View>
            <Text style={{ marginStart: 8, color: confidenceColor, fontWeight: '600' }}>
              {result.confidence}%
            </Text>
          </View>

          <Text style={theme.typography.caption}>{t('confidence')}</Text>

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
            <Switch value={showPercentage} onValueChange={setShowPercentage} />
            <Text style={{ marginStart: 8 }}>{t('percentages')}</Text>
          </View>

          <PieChart data={chartData} />

          <Text style={theme.typography.h2}>{t('distribution')}</Text>
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
                  style={{ width: isTablet ? 130 : 100, fontWeight: 'bold', paddingHorizontal: 4 }}
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
                  style={{ width: isTablet ? 100 : 80, fontWeight: 'bold', textAlign: 'center' }}
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
          <TouchableOpacity
            onPress={() => setShowSteps(!showSteps)}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: theme.spacing.lg,
              marginBottom: theme.spacing.md,
            }}
          >
            <Text style={theme.typography.h2}>{t('steps')}</Text>
            <Text style={{ fontSize: 16 }}>{showSteps ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {showSteps && (
            <View style={{ marginTop: theme.spacing.lg, marginBottom: theme.spacing.lg }}>
              <StepTimeline
                steps={result.steps.map((step) => ({
                  title: step.title,
                  description: step.description,
                }))}
              />
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
