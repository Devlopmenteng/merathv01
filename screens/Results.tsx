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
  Alert,
  Platform,
} from 'react-native';
import { useCalc } from '../lib/context/CalcContext';
import { calculateInheritance } from '../lib/engine/calculator';
import { LinearGradient } from 'expo-linear-gradient';
import { formatCurrency } from '../lib/utils/currency';
import { useAppTheme } from '../hooks/useAppTheme';
import { ResultsSkeleton } from '../components/SkeletonCard';
import { Button } from '../components/ui/Button';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { saveAuditTrail } from '../lib/services/AuditTrailService';

const ExportBar = React.lazy(() => import('../components/ExportBar').then((module) => ({ default: module.ExportBar })));
const PieChart = React.lazy(() => import('../components/PieChart').then((module) => ({ default: module.PieChart })));
import type { CalculationResult, EstateInput } from '../lib/engine/types';

type ChartDataItem = {
  label: string;
  value: number;
  color: string;
};

const AnimatedNumber = ({ value, style }: { value: number; style?: any }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration: 1000,
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

export const Results = ({ navigation }: { navigation: any }) => {
  const { isPremium } = usePremium();
  const { state, caseName, caseDate } = useCalc();
  const theme = useAppTheme();
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
      Alert.alert(
        'تنبيه',
        'لم يتم تحديد زوج أو زوجة. إذا كان المتوفى متزوجاً، يرجى إضافة الزوج/الزوجة في شاشة الورثة.\n\nيمكنك متابعة الحساب إذا كان المتوفى أعزباً.',
        [{ text: 'موافق', style: 'default' }],
      );
    }
  }, [hasSpouse]);

  const chartData = useMemo<ChartDataItem[]>(() => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#F7DC6F', '#96CEB4', '#FFB347', '#6B5B95', '#88B04B'];
    if (!result) return [];
    return result.shares.map((s, idx) => ({
      label: s.name,
      value: s.amount,
      color: colors[idx % colors.length],
      fraction: s.fraction ? `${s.fraction.numerator}/${s.fraction.denominator}` : '',
    }));
  }, [result]);

  useEffect(() => {
    setLoading(true);

    const estate: EstateInput = {
      total: state.total,
      funeral: state.funeral,
      debts: state.debts,
      will: state.will,
    };

    const res = calculateInheritance(state.madhab as any, estate, heirsObject);
    let confidence = 100;

    if ((res.netEstate ?? 0) <= 0) confidence -= 50;
    if (hasNoHeirs) confidence -= 30;

    const safeResult: CalculationResult = {
      ...res,
      confidence: Math.max(confidence, 10),
    };

    setResult(safeResult);
    setLoading(false);

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
  }, [state.madhab, state.total, state.funeral, state.debts, state.will, heirsObject, hasNoHeirs, caseName, caseDate]);

  const generatePDF = useCallback(async () => {
    if (!result) return;
    if (isPremium) {
      await generateLegalReport(result, state.madhab);
      return;
    }

    const html = `
      <html><head><style>body{font-family:Arial;padding:20px}h1{color:#1B6B4A}</style></head>
      <body>
        <h1>Inheritance Report</h1>
        <p>Madhab: ${result.madhab}</p>
        <p>Net Estate: $${result.netEstate}</p>
        <h2>Distribution</h2>
        <ul>${result.shares
          .map(
            (s) =>
              `<li>${s.name}: $${s.amount.toFixed(2)} (${s.fraction?.numerator}/${s.fraction?.denominator})</li>`,
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
    result?.confidence ?? 0 >= 70
      ? theme.colors.success
      : result?.confidence ?? 0 >= 40
      ? theme.colors.warning
      : theme.colors.error;

  const specialCaseElements = useMemo(() => {
    if (!result) return null;
    const cases = [];
    if (result.awlApplied) cases.push({ name: "العول", desc: "تم تطبيق العول لزيادة أصل المسألة" });
    if (result.raddApplied) cases.push({ name: "الرد", desc: "تم تطبيق الرد لتوزيع الباقي على أصحاب الفروض" });
    if (result.bloodRelativesApplied) cases.push({ name: "ذوو الأرحام", desc: "تم توزيع الباقي على ذوي الأرحام" });
    if (cases.length === 0) return null;
    return (
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginVertical: 12 }}>
        {cases.map((c, i) => (
          <View key={i} style={{ backgroundColor: theme.colors.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
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
            flexDirection: "row",
            backgroundColor: idx % 2 === 0 ? theme.colors.surface : theme.colors.surfaceVariant,
            borderRadius: theme.radius.sm,
            paddingVertical: 8,
            marginBottom: 4,
          }}
        >
          <View style={{ width: 100, paddingHorizontal: 4, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
            <Text>{share.name}</Text>
          </View>
          <Text style={{ width: 60, textAlign: "center" }}>{share.count}</Text>
          <Text style={{ width: 80, textAlign: "center" }}>{share.type}</Text>
          <Text style={{ width: 80, textAlign: "center" }}>{share.fraction ? `${share.fraction.numerator}/${share.fraction.denominator}` : ""}</Text>
          <Text style={{ width: 80, textAlign: "center" }}>{percentage}%</Text>
          <Text style={{ width: 100, textAlign: "center", fontWeight: "bold", color: theme.colors.primary }}>
            {showPercentage ? `${percentage}%` : formatCurrency(share.amount)}
          </Text>
        </View>
      );
    });
  }, [result, chartData, showPercentage, theme.colors.surface, theme.colors.surfaceVariant, theme.colors.primary, theme.radius.sm]);

  if (loading || !result) return <ResultsSkeleton />;

  return (
    <React.Suspense fallback={<ResultsSkeleton />}>
      <ExportBar resultData={result}>
        <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: 150 }}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark || '#0A5E4A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            borderRadius: theme.radius.lg,
            padding: theme.spacing.lg,
            alignItems: 'center',
            marginBottom: theme.spacing.lg,
          }}
        >
          <Text style={{ color: theme.colors.onPrimary, fontSize: 16, marginBottom: 4 }}>{t('netEstate')}</Text>
          <AnimatedNumber value={result.netEstate ?? 0} style={{ color: theme.colors.onPrimary, fontSize: 32, fontWeight: 'bold' }} />
        </LinearGradient>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
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

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginVertical: 12 }}>
          <Text style={{ marginEnd: 8 }}>{t('fractions')}</Text>
          <Switch value={showPercentage} onValueChange={setShowPercentage} />
          <Text style={{ marginStart: 8 }}>{t('percentages')}</Text>
        </View>

        <PieChart data={chartData} />

        <Text style={theme.typography.h2}>{t('distribution')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={{ minWidth: "100%" }}>
            <View style={{ flexDirection: "row", borderBottomWidth: 2, borderColor: theme.colors.primary, paddingBottom: 8, marginBottom: 8 }}>
              <Text style={{ width: 100, fontWeight: "bold", paddingHorizontal: 4 }}>{t("heir")}</Text>
              <Text style={{ width: 60, fontWeight: "bold", textAlign: "center" }}>{t("count")}</Text>
              <Text style={{ width: 80, fontWeight: "bold", textAlign: "center" }}>{t("type")}</Text>
              <Text style={{ width: 80, fontWeight: "bold", textAlign: "center" }}>{t("share")}</Text>
              <Text style={{ width: 80, fontWeight: "bold", textAlign: "center" }}>{t("percentage")}</Text>
              <Text style={{ width: 100, fontWeight: "bold", textAlign: "center" }}>{t("amount")}</Text>
            </View>
            {distributionRows}
          </View>
        </ScrollView><TouchableOpacity
          onPress={() => setShowSteps(!showSteps)}
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.lg, marginBottom: theme.spacing.md }}
        >
          <Text style={theme.typography.h2}>{t('steps')}</Text>
          <Text style={{ fontSize: 16 }}>{showSteps ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {showSteps && (
          <View style={{ backgroundColor: theme.colors.surfaceVariant, borderRadius: theme.radius.md, padding: theme.spacing.md }}>
            {result.steps.map((step, idx) => (
              <View key={idx} style={{ marginBottom: idx < result.steps.length - 1 ? theme.spacing.md : 0, borderBottomWidth: idx < result.steps.length - 1 ? 1 : 0, borderColor: theme.colors.outline, paddingBottom: idx < result.steps.length - 1 ? theme.spacing.sm : 0 }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>{step.title}</Text>
                <Text style={{ fontSize: 12, color: theme.colors.onSurface }}>{step.description}</Text>
                {step.details && (
                  <View style={{ marginTop: 8, paddingTop: 4, borderTopWidth: 1, borderTopColor: theme.colors.outline }}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 2 }}>التفاصيل:</Text>
                    {typeof step.details === 'object' ? (
                      Object.entries(step.details).map(([key, val]) => (
                        <Text key={key} style={{ fontSize: 10, color: theme.colors.onSurface, marginTop: 2 }}>
                          {key}: {typeof val === 'object' ? JSON.stringify(val) : val}
                        </Text>
                      ))
                    ) : (
                      <Text style={{ fontSize: 10, color: theme.colors.onSurface }}>
                        {JSON.stringify(step.details)}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.md }}>
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <Button title={t('compare')} onPress={() => navigation.navigate('Comparison')} mode="outlined" />
            <Button title={t('history')} onPress={() => navigation.navigate('History')} mode="outlined" />
            <Button title={t('settings')} onPress={() => navigation.navigate('Settings')} mode="outlined" />
            <Button title={t('pdf')} onPress={generatePDF} mode="outlined" />
          </View>
        </ScrollView>
      </ScrollView>
    </ExportBar>
  </React.Suspense>
  );
};