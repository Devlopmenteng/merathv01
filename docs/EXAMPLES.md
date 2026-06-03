# Code Examples
# أمثلة الكود

This document provides practical examples for using the Merath Islamic Inheritance Calculator API.

يقدم هذا المستند أمثلة عملية لاستخدام واجهة برمجة تطبيقات حاسبة المواريث الشرعية "مراث".

---

## Basic Usage / الاستخدام الأساسي

### Simple Inheritance Calculation / حساب ميراث بسيط

```typescript
import { calculateInheritance } from '../lib/inheritance';
import type { EstateInput, HeirsData } from '../lib/engine/types';

// Define estate details
const estate: EstateInput = {
  total: 100000,      // $100,000 total estate
  funeral: 5000,      // $5,000 funeral expenses
  debts: 0,           // No debts
  will: 0,            // No will
};

// Define heirs
const heirs: HeirsData = {
  wife: 1,      // 1 wife
  son: 2,       // 2 sons
  daughter: 1,  // 1 daughter
};

// Calculate inheritance using Hanafi madhab
const result = calculateInheritance('hanafi', estate, heirs);

console.log('Net Estate:', result.netEstate);        // $95,000
console.log('Success:', result.success);
console.log('Shares:', result.shares);
```

**Output / النتيجة:**
```
Net Estate: 95000
Success: true
Shares: [
  { name: 'Wife', amount: 11875, fraction: { numerator: 1, denominator: 8 } },
  { name: 'Son', amount: 52500, fraction: { numerator: 2, denominator: 7 } },
  { name: 'Daughter', amount: 30625, fraction: { numerator: 1, denominator: 7 } }
]
```

---

## Common Scenarios / السيناريوهات الشائعة

### Scenario 1: Nuclear Family / الأسرة النووية

**Case:** Husband, wife, 2 sons, 1 daughter
**الحالة:** زوج، زوجة، ابنان، بنت واحدة

```typescript
const estate: EstateInput = {
  total: 200000,
  funeral: 8000,
  debts: 5000,
  will: 0,
};

const heirs: HeirsData = {
  husband: 1,
  wife: 0,   // Can't have both husband and wife
  son: 2,
  daughter: 1,
};

const result = calculateInheritance('hanafi', estate, heirs);

result.shares.forEach(share => {
  console.log(`${share.name}: $${share.amount} (${share.fraction?.numerator}/${share.fraction?.denominator})`);
});
```

### Scenario 2: No Descendants / لا يوجد أحفاد

**Case:** Wife, father, mother
**الحالة:** زوجة، أب، أم

```typescript
const estate: EstateInput = {
  total: 150000,
  funeral: 6000,
  debts: 0,
  will: 0,
};

const heirs: HeirsData = {
  wife: 1,
  father: 1,
  mother: 1,
};

const result = calculateInheritance('shafii', estate, heirs);
```

### Scenario 3: Only Daughters (Radd applies) / بنات فقط (يطبق الرد)

```typescript
const estate: EstateInput = {
  total: 120000,
  funeral: 4000,
  debts: 0,
  will: 0,
};

const heirs: HeirsData = {
  daughter: 3,  // 3 daughters, no sons
};

const result = calculateInheritance('hanafi', estate, heirs);

// Radd will apply - daughters receive remaining estate after their 2/3 share
console.log('Radd Applied:', result.specialCases.radd);  // true
```

### Scenario 4: Complex Family with Grandfather / أسرة معقدة مع جد

```typescript
const estate: EstateInput = {
  total: 300000,
  funeral: 10000,
  debts: 20000,
  will: 0,
};

const heirs: HeirsData = {
  wife: 1,
  grandfather: 1,
  full_sister: 2,
};

const result = calculateInheritance('shafii', estate, heirs);
// Grandfather competes with sisters in Shafii madhab
```

---

## Madhab Comparison / مقارنة المذاهب

### Compare Calculation Across Madhhabs / مقارنة الحساب عبر المذاهب

```typescript
const estate: EstateInput = {
  total: 100000,
  funeral: 5000,
  debts: 0,
  will: 0,
};

const heirs: HeirsData = {
  wife: 1,
  grandfather: 1,
  full_brother: 2,
};

const madhhabs = ['hanafi', 'maliki', 'shafii', 'hanbali'] as const;

madhhabs.forEach(madhab => {
  const result = calculateInheritance(madhab, estate, heirs);
  console.log(`\n${madhab.toUpperCase()} Results:`);
  console.log(`Net Estate: $${result.netEstate}`);
  
  result.shares.forEach(share => {
    console.log(`  ${share.name}: $${share.amount}`);
  });
});
```

---

## Special Cases Handling / معالجة الحالات الخاصة

### Handling Awl (Estate Deficit) / معالجة العول (عجز التركة)

```typescript
const estate: EstateInput = {
  total: 100,
  funeral: 0,
  debts: 0,
  will: 0,
};

const heirs: HeirsData = {
  husband: 1,
  wife: 1,  // This is invalid - can't have both
  daughter: 2,
  father: 1,
  mother: 1,
};

// In valid cases where shares exceed estate:
const result = calculateInheritance('hanafi', estate, heirs);

if (result.specialCases.awl) {
  console.log('Awl applied - shares were proportionally reduced');
  console.log('Original shares would have exceeded estate');
}
```

### Handling Radd (Surplus Estate) / معالجة الرد (فائض التركة)

```typescript
const estate: EstateInput = {
  total: 100000,
  funeral: 5000,
  debts: 0,
  will: 0,
};

const heirs: HeirsData = {
  daughter: 2,  // Only daughters, no asaba heirs
};

const result = calculateInheritance('hanafi', estate, heirs);

if (result.specialCases.radd) {
  console.log('Radd applied - daughters receive remaining estate');
  console.log('Each daughter receives more than the basic 1/3 share');
}
```

---

## Error Handling / معالجة الأخطاء

### Validation and Error Handling / التحقق والتعامل مع الأخطاء

```typescript
import { InheritanceCalculationError, MadhabRuleError } from '../lib/engine/errors';

function safeCalculate(madhab: string, estate: EstateInput, heirs: HeirsData) {
  try {
    // Validate inputs
    if (estate.total <= 0) {
      throw new Error('Estate total must be positive');
    }
    
    if (estate.funeral < 0 || estate.debts < 0 || estate.will < 0) {
      throw new Error('Deductions cannot be negative');
    }
    
    // Validate heirs
    const totalHeirs = Object.values(heirs).reduce((sum, count) => sum + count, 0);
    if (totalHeirs === 0) {
      throw new Error('At least one heir must be specified');
    }
    
    // Check for invalid combinations
    if (heirs.husband && heirs.wife) {
      throw new Error('Cannot have both husband and wife');
    }
    
    // Calculate inheritance
    const result = calculateInheritance(madhab as any, estate, heirs);
    
    if (!result.success) {
      throw new InheritanceCalculationError('Calculation failed');
    }
    
    return result;
    
  } catch (error) {
    if (error instanceof MadhabRuleError) {
      console.error(`Madhab rule error: ${error.message}`);
      console.error(`Madhab: ${error.madhab}`);
    } else if (error instanceof InheritanceCalculationError) {
      console.error(`Calculation error: ${error.message}`);
    } else {
      console.error(`Unexpected error: ${error}`);
    }
    throw error;
  }
}
```

---

## Integration Examples / أمثلة التكامل

### React Native Component / مكون React Native

```typescript
import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { calculateInheritance } from '../lib/inheritance';
import type { EstateInput, HeirsData, CalculationResult } from '../lib/engine/types';

export const InheritanceCalculator: React.FC = () => {
  const [result, setResult] = useState<CalculationResult | null>(null);
  
  const calculate = () => {
    const estate: EstateInput = {
      total: 100000,
      funeral: 5000,
      debts: 0,
      will: 0,
    };
    
    const heirs: HeirsData = {
      wife: 1,
      son: 2,
    };
    
    try {
      const calculationResult = calculateInheritance('hanafi', estate, heirs);
      setResult(calculationResult);
    } catch (error) {
      console.error('Calculation failed:', error);
    }
  };
  
  return (
    <View>
      <Button title="Calculate" onPress={calculate} />
      {result && (
        <View>
          <Text>Net Estate: ${result.netEstate}</Text>
          {result.shares.map((share, index) => (
            <Text key={index}>
              {share.name}: ${share.amount}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};
```

### Web Application / تطبيق ويب

```typescript
// Similar structure for web applications
// هيكل مماثل لتطبيقات الويب

function calculateInheritanceWeb() {
  const estate: EstateInput = {
    total: parseFloat(document.getElementById('total')?.value || '0'),
    funeral: parseFloat(document.getElementById('funeral')?.value || '0'),
    debts: parseFloat(document.getElementById('debts')?.value || '0'),
    will: parseFloat(document.getElementById('will')?.value || '0'),
  };
  
  const heirs: HeirsData = {
    wife: parseInt(document.getElementById('wife')?.value || '0'),
    son: parseInt(document.getElementById('son')?.value || '0'),
    daughter: parseInt(document.getElementById('daughter')?.value || '0'),
  };
  
  const result = calculateInheritance('hanafi', estate, heirs);
  
  // Display results
  displayResults(result);
}
```

---

## Advanced Usage / الاستخدام المتقدم

### Custom Madhab Configuration / تكوين مذهب مخصص

```typescript
import { MadhhabConfig } from '../lib/engine/types';

const customConfig: MadhhabConfig = {
  name: 'custom',
  rules: {
    // Custom rules can be added here
    // يمكن إضافة قواعد مخصصة هنا
  }
};
```

### Fraction Calculations / حسابات الكسور

```typescript
import { FractionClass } from '../lib/engine/fraction';

// Create fractions
const oneThird = new FractionClass(1, 3);
const oneHalf = new FractionClass(1, 2);

// Perform operations
const sum = oneThird.add(oneHalf);           // 1/3 + 1/2 = 5/6
const difference = oneHalf.subtract(oneThird); // 1/2 - 1/3 = 1/6
const product = oneThird.multiply(oneHalf);   // 1/3 * 1/2 = 1/6
const quotient = oneHalf.divide(oneThird);     // 1/2 ÷ 1/3 = 3/2

// Convert to decimal
const decimalValue = oneThird.toDecimal();     // 0.333...

// Compare fractions
if (oneHalf.greaterThan(oneThird)) {
  console.log('1/2 > 1/3');
}
```

### Hijab System / نظام الحجب

```typescript
import { HijabSystem } from '../lib/engine/hijab';

const hijabSystem = new HijabSystem();

const heirs = [
  { type: 'son', count: 2 },
  { type: 'daughter', count: 1 },
  { type: 'father', count: 1 },
];

const blockedHeirs = hijabSystem.applyHijab(heirs);

console.log('Blocked heirs:', blockedHeirs);
// Shows which heirs are excluded by others
// يظهر الورثة الذين يتم استبعادهم بواسطة آخرين
```

---

## Testing Examples / أمثلة الاختبار

### Unit Test Example / مثال اختبار وحدة

```typescript
import { describe, it, expect } from 'vitest';
import { calculateInheritance } from '../lib/inheritance';

describe('Inheritance Calculator', () => {
  it('should calculate basic inheritance correctly', () => {
    const estate = {
      total: 100000,
      funeral: 5000,
      debts: 0,
      will: 0,
    };
    
    const heirs = {
      wife: 1,
      son: 2,
    };
    
    const result = calculateInheritance('hanafi', estate, heirs);
    
    expect(result.success).toBe(true);
    expect(result.netEstate).toBe(95000);
    expect(result.shares.length).toBeGreaterThan(0);
  });
  
  it('should handle Radd case correctly', () => {
    const estate = {
      total: 100000,
      funeral: 5000,
      debts: 0,
      will: 0,
    };
    
    const heirs = {
      daughter: 2,
    };
    
    const result = calculateInheritance('hanafi', estate, heirs);
    
    expect(result.specialCases.radd).toBe(true);
  });
});
```

---

## Performance Tips / نصائح الأداء

### Caching Results / تخزين النتائج مؤقتاً

```typescript
const calculationCache = new Map<string, CalculationResult>();

function getCachedCalculation(
  madhab: string,
  estate: EstateInput,
  heirs: HeirsData
): CalculationResult {
  const cacheKey = JSON.stringify({ madhab, estate, heirs });
  
  if (calculationCache.has(cacheKey)) {
    return calculationCache.get(cacheKey)!;
  }
  
  const result = calculateInheritance(madhab as any, estate, heirs);
  calculationCache.set(cacheKey, result);
  
  return result;
}
```

---

## Best Practices / أفضل الممارسات

1. **Always validate inputs** before calculation
   **تحقق دائماً من المدخلات** قبل الحساب

2. **Handle errors gracefully** with try-catch blocks
   **تعامل مع الأخطاء بشكل صحيح** باستخدام كتل try-catch

3. **Use appropriate madhab** for your target audience
   **استخدم المذهب المناسب** لجمهورك المستهدف

4. **Test edge cases** like no heirs, estate deficit
   **اختبر الحالات الحدية** مثل عدم وجود ورثة، عجز التركة

5. **Document custom logic** when extending the calculator
   **وثق المنطق المخصص** عند توسيع الحاسبة

---

**Last Updated:** June 3, 2026  
**آخر تحديث:** 3 يونيو 2026
