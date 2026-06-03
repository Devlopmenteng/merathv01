import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { FIQH_NOTES } from '../lib/services/FiqhReferences';
import { MADHAB_NAMES } from '../lib/engine/constants';
import { ThemedListCard } from '../components/ui/ThemedListCard';
import { DataTable } from '../components/ui/DataTable';

// Fixed shares table (from HTML)
const FIXED_SHARES = [
  { share: "النصف (½)", heirs: "الزوج (بدون فرع), البنت الواحدة, بنت الابن الواحدة, الأخت الشقيقة الواحدة, الأخت لأب الواحدة" },
  { share: "الربع (¼)", heirs: "الزوج (مع فرع), الزوجة (بدون فرع)" },
  { share: "الثمن (⅛)", heirs: "الزوجة (مع فرع)" },
  { share: "الثلثان (⅔)", heirs: "بنتان فأكثر, بنتا الابن فأكثر, أختان شقيقتان فأكثر, أختان لأب فأكثر" },
  { share: "الثلث (⅓)", heirs: "الأم (بدون فرع ولا جمع إخوة), الإخوة لأم (اثنان فأكثر)" },
  { share: "السدس (⅙)", heirs: "الأب (مع فرع), الأم (مع فرع أو جمع إخوة), الجد, الجدة, بنت الابن (تكملة), الأخت لأب (تكملة), الأخ لأم (الواحد)" },
];

// Hijab rules table (from HTML)
const HIJAB_RULES = [
  { blocked: "الجد", blocker: "الأب", type: "حجب حرمان" },
  { blocked: "الجدة لأب", blocker: "الأم أو الأب", type: "حجب حرمان" },
  { blocked: "الجدة لأم", blocker: "الأم", type: "حجب حرمان" },
  { blocked: "ابن الابن", blocker: "الابن", type: "حجب حرمان" },
  { blocked: "بنت الابن", blocker: "الابن أو بنتان بدون معصب", type: "حجب حرمان" },
  { blocked: "الإخوة الأشقاء", blocker: "الابن، ابن الابن، الأب", type: "حجب حرمان" },
  { blocked: "الإخوة لأب", blocker: "الأخ الشقيق أو من يحجب الأشقاء", type: "حجب حرمان" },
  { blocked: "الإخوة لأم", blocker: "الفرع الوارث، الأب، الجد", type: "حجب حرمان" },
  { blocked: "الأخت لأب", blocker: "أختان شقيقتان بدون معصب", type: "حجب حرمان" },
];

const SPECIAL_CASES = [
  { name: "العُمَريَّتان", description: "زوج/زوجة + أب + أم بدون فرع وارث. الأم تأخذ ثلث الباقي بعد فرض الزوج/الزوجة." },
  { name: "العَوْل", description: "عندما يزيد مجموع الفروض عن أصل المسألة، يُزاد المقام ليتسع للجميع." },
  { name: "الرَّد", description: "عندما يبقى فائض ولا يوجد عصبة، يُرد على أصحاب الفروض بنسبة فروضهم (باستثناء الزوجين في بعض المذاهب)." },
  { name: "المشتركة (الحمارية)", description: "زوج + أم + إخوة لأم (2+) + إخوة أشقاء. في بعض المذاهب يشترك الأشقاء مع الإخوة لأم في الثلث بالتساوي." },
  { name: "الأكدرية", description: "زوج + أم + جد + أخت شقيقة. تُجمع وتُقسم بطريقة خاصة (من 27)." },
  { name: "عصبة مع الغير", description: "الأخت الشقيقة أو لأب تصبح عصبة مع وجود البنت أو بنت الابن." },
];

const FIXED_SHARES_COLUMNS = [
  { key: 'share', label: 'الفرض', width: 100 },
  { key: 'heirs', label: 'أصحابه', width: 200 },
];

const HIJAB_COLUMNS = [
  { key: 'blocked', label: 'المحجوب', width: 120 },
  { key: 'blocker', label: 'الحاجب', width: 120 },
  { key: 'type', label: 'نوع الحجب', width: 100 },
];

export const FiqhRules = () => {
  const theme = useAppTheme();

  return (
    <ScrollView contentContainerStyle={{ padding: theme.spacing.md }}>
      {/* Madhab notes */}
      <Text style={[theme.typography.h2, { marginBottom: theme.spacing.md }]}>ملاحظات مذهبية</Text>
      {Object.entries(FIQH_NOTES).map(([madhab, notes]) => (
        <ThemedListCard key={madhab} accentColor={theme.colors.primary}>
          <Text style={[theme.typography.h3, { color: theme.colors.primary, marginBottom: 4 }]}>
            {MADHAB_NAMES[madhab as keyof typeof MADHAB_NAMES] || madhab}
          </Text>
          {Object.entries(notes).map(([key, val]) => (
            <Text key={key} style={[theme.typography.caption, { marginTop: 4 }]}>
              • {val as string}
            </Text>
          ))}
        </ThemedListCard>
      ))}

      {/* Special cases */}
      <Text style={[theme.typography.h2, { marginVertical: theme.spacing.md }]}>⚡ حالات خاصة</Text>
      {SPECIAL_CASES.map((caseItem, idx) => (
        <ThemedListCard key={idx}>
          <Text style={[theme.typography.h3, { color: theme.colors.secondary }]}>{caseItem.name}</Text>
          <Text style={theme.typography.body}>{caseItem.description}</Text>
        </ThemedListCard>
      ))}

      {/* Fixed shares table */}
      <Text style={[theme.typography.h2, { marginVertical: theme.spacing.md }]}>📊 جدول الفروض</Text>
      <DataTable columns={FIXED_SHARES_COLUMNS} data={FIXED_SHARES} />

      {/* Hijab rules table */}
      <Text style={[theme.typography.h2, { marginVertical: theme.spacing.md }]}>🚫 قواعد الحجب</Text>
      <DataTable columns={HIJAB_COLUMNS} data={HIJAB_RULES} />
    </ScrollView>
  );
};
