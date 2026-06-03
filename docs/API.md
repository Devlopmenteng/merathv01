# Merath API Documentation
# توثيق واجهة برمجة تطبيقات مراث

## Overview / نظرة عامة

The Merath Islamic Inheritance Calculator provides a comprehensive API for calculating inheritance according to Islamic law (Fiqh) across the four major schools of jurisprudence (Madhhabs).

توفر حاسبة المواريث الشرعية "مراث" واجهة برمجة تطبيقات شاملة لحساب المواريث وفقاً للشريعة الإسلامية عبر المدارس الفقهية الأربعة الكبرى.

---

## Core API / واجهة برمجة التطبيقات الأساسية

### Main Calculator Engine / محرك الحسابات الرئيسي

#### `calculateInheritance()`

Calculates inheritance distribution based on madhab rules.

تحسب توزيع المواريث بناءً على قواعد المذهب.

```typescript
import { calculateInheritance } from './lib/inheritance';

interface CalculationResult {
  success: boolean;
  netEstate: number;
  shares: HeirShare[];
  steps: CalculationStep[];
  specialCases: SpecialCases;
  confidence: number;
}

const result: CalculationResult = calculateInheritance(
  'hanafi',           // madhab: Madhab
  estate: EstateInput, // estate details
  heirs: HeirsData     // heirs configuration
);
```

**Parameters:**

- `madhab`: The school of Islamic jurisprudence (`'hanafi' | 'maliki' | 'shafii' | 'hanbali'`)
- `estate`: Object containing estate details
  - `total`: Total estate value
  - `funeral`: Funeral expenses
  - `debts`: Outstanding debts
  - `will`: Bequest (will) amount (max 1/3 of net estate)
- `heirs`: Object mapping heir types to counts

**Returns:** `CalculationResult` object with distribution details

---

### Type Definitions / تعريفات الأنواع

#### Estate Input / مدخلات التركة

```typescript
interface EstateInput {
  total: number;      // Total estate value / القيمة الإجمالية للتركة
  funeral: number;    // Funeral expenses / مصاريف الجنازة
  debts: number;      // Outstanding debts / الديون المستحقة
  will: number;       // Bequest amount / مبلغ الوصية (حد أقصى الثلث)
}
```

#### Heirs Data / بيانات الورثة

```typescript
interface HeirsData {
  [heirType: string]: number;
}

// Example / مثال:
const heirs: HeirsData = {
  husband: 1,      // زوج
  wife: 2,         // زوجات
  son: 3,          // أبناء
  daughter: 2,     // بنات
  father: 1,       // أب
  mother: 1,       // أم
  // ... other heir types
};
```

#### Heir Types / أنواع الورثة

Available heir types:

الأنواع المتاحة من الورثة:

```typescript
type HeirType =
  | 'husband'        // زوج
  | 'wife'           // زوجة
  | 'son'            // ابن
  | 'daughter'       // بنت
  | 'grandson'       // ابن ابن
  | 'granddaughter'  // بنت ابن
  | 'father'         // أب
  | 'mother'         // أم
  | 'grandfather'    // جد
  | 'grandmother_mother'  // جدة لأم
  | 'grandmother_father'  // جدة لأب
  | 'full_brother'   // أخ شقيق
  | 'full_sister'    // أخت شقيقة
  | 'paternal_brother'    // أخ لأب
  | 'paternal_sister'     // أخت لأب
  | 'maternal_brother'    // أخ لأم
  | 'maternal_sister'     // أخت لأم
  | 'full_nephew'    // ابن أخ شقيق
  | 'paternal_nephew'     // ابن أخ لأب
  | 'full_uncle'     // عم شقيق
  | 'paternal_uncle'      // عم لأب
  | 'maternal_uncle'      // خال
  | 'paternal_aunt'       // عمة
  | 'maternal_aunt'       // خالة;
```

#### Calculation Result / نتيجة الحساب

```typescript
interface CalculationResult {
  success: boolean;           // Calculation succeeded / نجح الحساب
  netEstate: number;          // Net estate after deductions / صافي التركة بعد الخصومات
  shares: HeirShare[];        // Distribution to each heir / توزيع كل وارث
  steps: CalculationStep[];  // Step-by-step calculation / خطوات الحساب
  specialCases: SpecialCases; // Special cases applied / الحالات الخاصة المطبقة
  confidence: number;        // Confidence score (0-100) / درجة الثقة (0-100)
  madhab: string;             // Madhab used / المذهب المستخدم
}
```

#### Heir Share / حصة الوارث

```typescript
interface HeirShare {
  key?: string;              // Heir type key / مفتاح نوع الوارث
  name: string;              // Heir name / اسم الوارث
  count?: number;            // Number of heirs / عدد الورثة
  fraction?: FractionData;  // Fraction share / الحصة بالكسر
  amount: number;            // Monetary amount / المبلغ المالي
  shareType?: string;        // Type of share (fixed/asaba) / نوع الحصة (محددة/عصبة)
}
```

---

## Special Cases / الحالات الخاصة

### Awl (عول) - Estate Deficit

When the sum of fixed shares exceeds the net estate, proportional reduction (Awl) is applied.

عندما يتجاوز مجموع الحصص المحددة صافي التركة، يتم تطبيق التخفيض التناسبي (عول).

```typescript
interface SpecialCases {
  awl: boolean;           // Awl was applied / تم تطبيق العول
  radd: boolean;          // Radd was applied / تم تطبيق الرد
  hijabTypes: string[];   // Types of hijab applied / أنواع الحجب المطبقة
}
```

### Radd (رد) - Surplus Estate

When shares are less than the net estate and no asaba heirs exist, the remainder is redistributed (Radd).

عندما تكون الحصص أقل من صافي التركة ولا يوجد ورثة عصبة، يتم إعادة توزيع الباقي (رد).

### Hijab (حجب) - Exclusion

Certain heirs exclude others from inheritance completely (total exclusion) or reduce their shares (partial exclusion).

يستثني ورثة معينون غيرهم من الميراث كلياً (الحجب الكلي) أو يقللون من حصصهم (الحجب الناقص).

---

## Madhab-Specific Rules / قواعد خاصة بالمذاهب

### Hanafi (حنفي)

- Grandfather inherits as asaba with siblings
- Specific rules for akdariyya (الأكدرية)
- Special handling for musharraka (المسألة المشتركة)

### Maliki (مالكي)

- Different rules for grandfather with siblings
- Specific handling for certain complex cases

### Shafii (شافعي)

- Grandfather competes with siblings
- Specific priority rules for blood relatives

### Hanbali (حنبلي)

- Similar to Shafii with some variations
- Specific rules for certain edge cases

---

## Utility Functions / دوال مساعدة

### Fraction Operations / عمليات الكسور

```typescript
import { FractionClass } from './lib/engine/fraction';

const fraction = new FractionClass(1, 3);  // 1/3
const sum = fraction.add(new FractionClass(1, 6));  // 1/2
const decimal = fraction.toDecimal();  // 0.333...
```

### Hijab System / نظام الحجب

```typescript
import { HijabSystem } from './lib/engine/hijab';

const hijabSystem = new HijabSystem();
const blockedHeirs = hijabSystem.applyHijab(heirs);
```

---

## Error Handling / معالجة الأخطاء

### Custom Errors / أخطاء مخصصة

```typescript
import { InheritanceCalculationError, MadhabRuleError } from './lib/engine/errors';

try {
  const result = calculateInheritance(madhab, estate, heirs);
} catch (error) {
  if (error instanceof MadhabRuleError) {
    console.error(`Madhab rule error: ${error.message}`);
    // Handle madhab-specific errors
  }
}
```

---

## Integration Examples / أمثلة التكامل

### React Native Integration / تكامل مع React Native

```typescript
import { calculateInheritance } from './lib/inheritance';
import type { EstateInput, HeirsData } from './lib/engine/types';

const calculateAndDisplay = () => {
  const estate: EstateInput = {
    total: 100000,
    funeral: 5000,
    debts: 0,
    will: 0,
  };

  const heirs: HeirsData = {
    wife: 1,
    son: 2,
    daughter: 1,
  };

  const result = calculateInheritance('hanafi', estate, heirs);

  console.log('Net Estate:', result.netEstate);
  result.shares.forEach(share => {
    console.log(`${share.name}: ${share.amount}`);
  });
};
```

### Web Integration / تكامل مع الويب

```typescript
// Similar usage for web applications
// الاستخدام الممثل لتطبيقات الويب
```

---

## Best Practices / أفضل الممارسات

1. **Always validate input** before calculation
   **تحقق دائماً من المدخلات** قبل الحساب

2. **Handle errors gracefully** with try-catch blocks
   **تعامل مع الأخطاء بشكل صحيح** باستخدام كتل try-catch

3. **Use appropriate madhab** for your target audience
   **استخدم المذهب المناسب** لجمهورك المستهدف

4. **Consider edge cases** like no heirs, estate deficit
   **ضع في الاعتبار الحالات الحدية** مثل عدم وجود ورثة، عجز التركة

5. **Test with known scenarios** before production use
   **اختبر مع سيناريوهات معروفة** قبل الاستخدام الإنتاجي

---

## Support / الدعم

For issues, questions, or contributions:
للأخطاء والأسئل أو المساهمات:

- GitHub Issues: https://github.com/yourusername/merath/issues
- Documentation: See `/docs` directory
- Tests: Refer to `__tests__/` directory

---

**Last Updated:** June 3, 2026  
**آخر تحديث:** 3 يونيو 2026
