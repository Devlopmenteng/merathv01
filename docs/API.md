# Islamic Inheritance Calculator API Documentation
# توثيق واجهة برمجة تطبيقات حاسبة المواريث

## Table of Contents
- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [calculateInheritance](#calculateinheritance)
  - [InheritanceCalculationEngine](#inheritancecalculationengine)
  - [FractionClass](#fractionclass)
  - [HijabSystem](#hijabsystem)
- [Types](#types)
- [Error Handling](#error-handling)
- [Examples](#examples)

---

## Overview

The Islamic Inheritance Calculator provides a TypeScript/JavaScript library for calculating inheritance shares according to Islamic law (Fiqh) across the four major schools of jurisprudence (madhhabs):

- **Hanafi** (حنفي)
- **Maliki** (مالكي)
- **Shafii** (شافعي)
- **Hanbali** (حنبلي)

The library handles:
- Fixed shares (Furood - فروض)
- Residual shares (Asaba - عصبة)
- Special cases (Musharraka, Akdariyya, Grandfather rules)
- Awl (عول) - when shares exceed the estate
- Radd (رد) - when shares are less than the estate
- Hijab (حجب) - inheritance blocking rules
- Blood relatives (ذوو الأرحام)

---

## Installation

```bash
npm install merath
# or
yarn add merath
# or
pnpm add merath
```

---

## Quick Start

```typescript
import { calculateInheritance } from 'merath';

// Simple calculation
const result = calculateInheritance({
  madhab: 'hanafi',
  totalEstate: 100000,
  funeral: 5000,
  debts: 0,
  will: 0,
  heirs: [
    { type: 'wife', count: 1 },
    { type: 'son', count: 2 }
  ]
});

console.log(result.shares);
```

---

## API Reference

### calculateInheritance

Simplified interface for calculating inheritance with built-in validation.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `madhab` | `MadhhabType` | No | School of jurisprudence (default: 'hanafi') |
| `totalEstate` | `number` | Yes | Total value of the estate |
| `funeral` | `number` | No | Funeral expenses (default: 0) |
| `debts` | `number` | No | Outstanding debts (default: 0) |
| `will` | `number` | No | Will/bequest amount (default: 0) |
| `heirs` | `HeirEntry[]` | Yes | Array of heirs with types and counts |

#### Returns

`Promise<CalculationResult>` - Calculation result with shares, steps, and distribution details.

#### Example

```typescript
import { calculateInheritance } from 'merath';

const result = calculateInheritance({
  madhab: 'shafii',
  totalEstate: 500000,
  funeral: 10000,
  debts: 5000,
  will: 15000, // Will is limited to 1/3 of estate
  heirs: [
    { type: 'wife', count: 1 },
    { type: 'daughter', count: 2 },
    { type: 'father', count: 1 },
    { type: 'mother', count: 1 }
  ]
});

if (result.success) {
  console.log('Net Estate:', result.netEstate);
  result.shares.forEach(share => {
    console.log(`${share.name}: ${share.amount} (${share.fraction})`);
  });
}
```

---

### InheritanceCalculationEngine

Advanced class for complex calculations with step-by-step tracking.

#### Constructor

```typescript
constructor(
  madhab: MadhhabType,
  estate: EstateData,
  heirs: HeirsData
)
```

#### Methods

##### calculate()

Performs the inheritance calculation.

```typescript
const engine = new InheritanceCalculationEngine('hanafi', estate, heirs);
const result = engine.calculate();
```

##### getSteps()

Returns the calculation steps for debugging and auditing.

```typescript
const steps = engine.getSteps();
steps.forEach(step => {
  console.log(`${step.title}: ${step.description}`);
});
```

#### Example

```typescript
import { InheritanceCalculationEngine } from 'merath';

const estate = {
  total: 200000,
  funeral: 8000,
  debts: 12000,
  will: 0
};

const heirs = {
  wife: 1,
  son: 1,
  daughter: 2
};

const engine = new InheritanceCalculationEngine('maliki', estate, heirs);
const result = engine.calculate();

// Get detailed steps
const steps = engine.getSteps();
console.log('Calculation steps:', steps);
```

---

### FractionClass

Utility class for precise fraction arithmetic to avoid floating-point errors.

#### Methods

| Method | Description |
|--------|-------------|
| `add(fraction)` | Add another fraction |
| `subtract(fraction)` | Subtract another fraction |
| `multiply(fraction)` | Multiply by another fraction |
| `divide(fraction)` | Divide by another fraction |
| `toDecimal()` | Convert to decimal number |
| `toString()` | Get fraction as string (e.g., "1/2") |

#### Example

```typescript
import { FractionClass } from 'merath';

const half = new FractionClass(1, 2);
const third = new FractionClass(1, 3);

const sum = half.add(third); // 5/6
console.log(sum.toString()); // "5/6"
console.log(sum.toDecimal()); // 0.8333333333333333
```

---

### HijabSystem

Manages inheritance blocking rules (حجب).

#### Methods

| Method | Description |
|--------|-------------|
| `applyHijab(heirs)` | Apply hijab rules to filter blocked heirs |
| `getBlockedHeirs()` | Get list of blocked heirs |
| `getBlockingHeirs()` | Get list of heirs that block others |

#### Example

```typescript
import { HijabSystem } from 'merath';

const heirs = [
  { type: 'father', count: 1 },
  { type: 'grandfather', count: 1 },
  { type: 'brother', count: 2 }
];

const hijabSystem = new HijabSystem('hanafi');
const filteredHeirs = hijabSystem.applyHijab(heirs);
// Grandfather is blocked by father in Hanafi madhab
```

---

## Types

### EstateData

```typescript
interface EstateData {
  total: number;      // Total estate value
  funeral: number;    // Funeral expenses
  debts: number;      // Outstanding debts
  will: number;       // Will/bequest amount
}
```

### HeirsData

```typescript
interface HeirsData {
  [heirType: string]: number;  // Heir type -> count mapping
}
```

### HeirEntry

```typescript
interface HeirEntry {
  type: HeirType;    // Type of heir (e.g., 'wife', 'son', 'father')
  count: number;     // Number of heirs of this type
}
```

### HeirType

Supported heir types:
- `wife`, `husband`
- `father`, `mother`, `grandfather`, `grandmother`
- `son`, `daughter`
- `grandson`, `granddaughter`
- `full_brother`, `full_sister`
- `paternal_brother`, `paternal_sister`
- `maternal_brother`, `maternal_sister`
- `paternal_uncle`, `paternal_aunt`
- `maternal_uncle`, `maternal_aunt`
- And more...

### MadhhabType

```typescript
type MadhhabType = 'hanafi' | 'maliki' | 'shafii' | 'hanbali';
```

### CalculationResult

```typescript
interface CalculationResult {
  success: boolean;           // Whether calculation succeeded
  netEstate: number;          // Estate after expenses
  shares: HeirShare[];        // Array of heir shares
  steps: CalculationStep[];   // Calculation steps
  awl?: AwlResult;            // Awl (عول) result if applicable
  radd?: RaddResult;          // Radd (رد) result if applicable
  treasury?: number;          // Amount going to treasury (Baitul Mal)
}
```

### HeirShare

```typescript
interface HeirShare {
  key: string;          // Heir type key
  name: string;         // Heir name in Arabic
  type: 'فرض' | 'عصبة' | 'رد' | 'عول'; // Share type
  fraction: FractionClass;  // Share as fraction
  amount: number;       // Share amount in currency
  count: number;        // Number of heirs
  reason: string;       // Reason for this share
}
```

---

## Error Handling

The library provides custom error types for better error handling:

```typescript
import {
  EstateValidationError,
  HeirsValidationError,
  CalculationLogicError,
  getUserFriendlyError
} from 'merath';

try {
  const result = calculateInheritance(input);
} catch (error) {
  if (error instanceof EstateValidationError) {
    console.error('Invalid estate data:', error.message);
  } else if (error instanceof HeirsValidationError) {
    console.error('Invalid heirs data:', error.message);
  } else {
    console.error('Calculation error:', getUserFriendlyError(error));
  }
}
```

### Error Types

| Error Type | Description |
|------------|-------------|
| `EstateValidationError` | Invalid estate data |
| `HeirsValidationError` | Invalid heirs data |
| `CalculationLogicError` | Calculation logic failure |
| `FractionError` | Mathematical operation error |
| `SpecialCaseError` | Special case application failure |
| `MadhabRuleError` | Madhab-specific rule error |
| `AwlCalculationError` | Awl calculation failure |
| `RaddCalculationError` | Radd calculation failure |
| `HijabSystemError` | Hijab system error |
| `BloodRelativesError` | Blood relatives distribution error |

---

## Examples

### Example 1: Simple Family

```typescript
const result = calculateInheritance({
  madhab: 'hanafi',
  totalEstate: 100000,
  heirs: [
    { type: 'wife', count: 1 },
    { type: 'son', count: 2 }
  ]
});
// Wife: 1/8 = 12,500
// Each son: 43,750 (remainder divided equally)
```

### Example 2: Daughters Only (Radd)

```typescript
const result = calculateInheritance({
  madhab: 'shafii',
  totalEstate: 60000,
  heirs: [
    { type: 'daughter', count: 3 }
  ]
});
// Each daughter gets 2/3 = 40,000
// Radd (رد) applied: remaining 1/3 returned to daughters
```

### Example 3: Complex Case with Awl

```typescript
const result = calculateInheritance({
  madhab: 'hanafi',
  totalEstate: 24000,
  heirs: [
    { type: 'wife', count: 1 },
    { type: 'mother', count: 1 },
    { type: 'father', count: 1 },
    { type: 'daughter', count: 2 }
  ]
});
// Awl (عول) applied: shares (24) exceed estate base (24)
// All shares proportionally reduced
```

### Example 4: Grandfather with Siblings

```typescript
const result = calculateInheritance({
  madhab: 'maliki', // Shares with siblings
  totalEstate: 120000,
  heirs: [
    { type: 'grandfather', count: 1 },
    { type: 'full_brother', count: 2 }
  ]
});
// Maliki: Grandfather shares with siblings via muqasamah
// Shafii/Hanafi: Grandfather blocks siblings
```

### Example 5: Blood Relatives

```typescript
const result = calculateInheritance({
  madhab: 'shafii',
  totalEstate: 30000,
  heirs: [
    { type: 'daughter_son', count: 2 },
    { type: 'daughter_daughter', count: 1 }
  ]
});
// Blood relatives (ذوو الأرحام) inherit by priority classes
// Class 1: Children of daughters
// Class 2: Children of sisters
// Class 3: Maternal uncles/aunts
// Class 4: Paternal aunts
```

---

## Calculation Engine Internals

### EnhancedInheritanceCalculationEngine

The core calculation engine (`EnhancedInheritanceCalculationEngine`) provides advanced features for complex inheritance scenarios.

#### Constructor

```typescript
constructor(
  madhab: MadhhabType,
  estate: EstateData,
  heirs: HeirsData
)
```

#### Key Features

1. **Memoization**: Cached calculations for madhab configs and rules
2. **Step-by-Step Tracking**: Detailed audit trail of all calculation steps
3. **Confidence Scoring**: Validation metric for calculation accuracy
4. **Special Case Handling**: Musharraka, Akdariyya, grandfather rules
5. **Performance Tracking**: Calculation time measurement

#### Calculation Process

The engine follows this calculation pipeline:

1. **Input Validation**: Estate and heirs data validation
2. **Hijab Application**: Apply blocking rules to filter heirs
3. **Fixed Shares Calculation**: Calculate furood (fixed shares)
4. **Asaba Calculation**: Calculate residual shares
5. **Special Case Handling**: Apply madhab-specific special cases
6. **Awl/Radd Processing**: Handle share excess/shortfall
7. **Blood Relatives**: Distribute to ذوو الأرحام if needed
8. **Result Generation**: Compile final shares and audit trail

#### Advanced Example

```typescript
import { EnhancedInheritanceCalculationEngine } from '../lib/engine/calculator';

const estate = {
  total: 500000,
  funeral: 20000,
  debts: 10000,
  will: 0
};

const heirs = {
  wife: 1,
  daughter: 2,
  father: 1,
  mother: 1,
  full_brother: 2
};

const engine = new EnhancedInheritanceCalculationEngine('hanafi', estate, heirs);
const result = engine.calculate();

// Access detailed information
console.log('Calculation steps:', result.steps);
console.log('Confidence score:', result.confidence);
console.log('Special cases applied:', result.specialCases);
console.log('Calculation time:', result.calculationTime, 'ms');
```

### Special Cases

#### Musharraka (المشتركة)

Special case in Shafii madhab where grandfather and full siblings share the inheritance when certain conditions are met.

**Conditions**:
- Grandfather present with full siblings
- No father present
- No male descendants (sons/grandsons)

**Application**:
```typescript
// Shafii madhab - Musharraka applies
const result = calculateInheritance({
  madhab: 'shafii',
  totalEstate: 100000,
  heirs: [
    { type: 'grandfather', count: 1 },
    { type: 'full_brother', count: 2 },
    { type: 'full_sister', count: 1 }
  ]
});
```

#### Akdariyya (الأكدرية)

Special case where grandfather with single sister receives a reduced share.

**Conditions**:
- Grandfather present with one sister
- No other heirs

**Application**:
```typescript
const result = calculateInheritance({
  madhab: 'hanafi',
  totalEstate: 60000,
  heirs: [
    { type: 'grandfather', count: 1 },
    { type: 'full_sister', count: 1 }
  ]
});
```

#### Grandfather Optimal Selection

Engine automatically selects the best option for grandfather:

1. **Muqasamah** (مقاسمة) - Share as if he were a brother (most beneficial)
2. **One-Sixth** (سدس) - Fixed share
3. **One-Third** (ثلث) - When only grandfather and mother

The engine evaluates all options and selects the one most beneficial to the grandfather.

### Performance Optimization

#### Memoization

The engine uses memoization for:
- Madhab configuration lookup
- Rule caching
- Fraction GCD/LCM calculations

#### Overflow Protection

Fraction calculations include overflow protection for large denominators to prevent numerical instability.

#### Calculation Caching

For repeated calculations with same inputs, consider implementing external caching:

```typescript
const cache = new Map<string, CalculationResult>();

function getCachedCalculation(input: CalculateInheritanceInput): CalculationResult {
  const cacheKey = JSON.stringify(input);
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }
  const result = calculateInheritance(input);
  cache.set(cacheKey, result);
  return result;
}
```

### Configuration

#### Madhhab Rules

Each madhab has specific rules configured in `lib/engine/constants.ts`:

```typescript
interface MadhhabRules {
  grandfather_with_siblings: 'hijab' | 'musharak';
  mother_with_father_children: 'third_of_remainder' | 'sixth';
  mother_with_father_only: 'third' | 'sixth';
  spouse_radd: boolean;
  umariyyah_rule: 'first' | 'second';
}
```

#### APP_DEFAULTS

Centralized configuration in `lib/constants/appDefaults.ts`:

```typescript
import { APP_DEFAULTS } from '../lib/constants/appDefaults';

// Access default madhab
const defaultMadhab = APP_DEFAULTS.DEFAULT_MADHAB;

// Access limits
const maxWives = APP_DEFAULTS.MAX_WIVES;
const maxAuditEntries = APP_DEFAULTS.MAX_AUDIT_ENTRIES;

// Access storage keys
const premiumKey = APP_DEFAULTS.STORAGE_KEYS.PREMIUM;
```

## License

[MIT License](LICENSE)

---

## Support

For questions or issues, please visit the project repository or contact the maintainers.