# System Architecture
# هندسة النظام

## Overview / نظرة عامة

The Merath Islamic Inheritance Calculator follows a layered architecture pattern with clear separation of concerns. The system is designed to be maintainable, testable, and extensible.

تتبع حاسبة المواريث الشرعية "مراث" نمط هندسة طبقي مع فصل واضح للمسؤوليات. النظام مصمم ليكون قابلاً للصيانة والاختبار والتوسع.

---

## Architecture Layers / طبقات الهندسة

### 1. Engine Layer / طبقة المحرك

**Location:** `lib/engine/`

The core calculation engine containing the Islamic inheritance logic.

محرك الحسابات الأساسي الذي يحتوي على منطق المواريث الشرعية.

```
lib/engine/
├── calculator.ts       # Main calculation engine / محرك الحسابات الرئيسي
├── fraction.ts         # Fraction arithmetic / حساب الكسور
├── hijab.ts           # Inheritance exclusion system / نظام استثناء الميراث
├── constants.ts       # Islamic inheritance constants / ثوابت المواريث الشرعية
├── types.ts           # TypeScript type definitions / تعريفات الأنواع TypeScript
└── errors.ts          # Custom error classes / فئات الأخطاء المخصصة
```

**Key Components:**
- **calculator.ts**: Main `EnhancedInheritanceCalculationEngine` class with madhab-specific rules
- **fraction.ts**: `FractionClass` for precise fractional calculations
- **hijab.ts**: `HijabSystem` for heir exclusion rules
- **constants.ts**: Heir names, madhab configurations, Islamic law references

---

### 2. Inheritance API Layer / طبقة واجهة برمجة المواريث

**Location:** `lib/inheritance/`

Public API layer that provides simplified interfaces for the calculation engine.

طبقة واجهة برمجة تطبيقات عامة توفر واجهات مبسطة لمحرك الحسابات.

```
lib/inheritance/
├── index.ts           # Main exports / الصادرات الرئيسية
└── calculateAdapter.ts # Simplified calculation interface / واجهة حساب مبسطة
```

**Key Functions:**
- `calculateInheritance()`: Main entry point for calculations
- Type exports for TypeScript users
- Validation helpers

---

### 3. Services Layer / طبقة الخدمات

**Location:** `lib/services/`

Business logic services that support the application.

خدمات المنطق التجاري التي تدعم التطبيق.

```
lib/services/
├── AuditTrailService.ts    # Calculation history / سجل الحسابات
├── UsageStats.ts          # Usage tracking / تتبع الاستخدام
└── FiqhReferences.ts      # Islamic law references / مراجع الفقه الإسلامي
```

---

### 4. UI Layer / طبقة واجهة المستخدم

**Location:** `screens/` and `components/`

React Native UI components and screens.

مكونات وشاشات واجهة مستخدم React Native.

```
screens/
├── EstateSetup.tsx       # Estate entry screen / شاشة إدخال التركة
├── MadhabSelect.tsx      # Madhab selection screen / شاشة اختيار المذهب
├── HeirSelection.tsx     # Heir selection screen / شاشة اختيار الورثة
├── Results.tsx           # Results display screen / شاشة عرض النتائج
├── Comparison.tsx        # Madhab comparison screen / شاشة مقارنة المذاهب
├── History.tsx           # Calculation history / سجل الحسابات
└── Settings.tsx         # Application settings / إعدادات التطبيق

components/
├── HeirSelector.tsx      # Heir selection component / مكون اختيار الورثة
├── PieChart.tsx          # Distribution chart / رسم بياني للتوزيع
├── StepIndicator.tsx    # Progress indicator / مؤشر التقدم
└── [other UI components]
```

---

### 5. Context Layer / طبقة السياق

**Location:** `lib/context/`

React Context providers for state management.

مزودات سياق React لإدارة الحالة.

```
lib/context/
├── CalcContext.tsx      # Calculation state / حالة الحساب
├── ThemeContext.tsx      # Theme management / إدارة المظهر
├── LanguageContext.tsx   # Language/i18n / اللغة والتدويل
├── PremiumContext.tsx    # Premium features / ميزات Premium
└── AppProviders.tsx     # Combined providers / مزودات مجتمعة
```

---

### 6. Utilities Layer / طبقة الأدوات المساعدة

**Location:** `lib/utils/`, `lib/constants/`

Helper functions and constants.

الدوال المساعدة والثوابت.

```
lib/utils/
├── alerts.ts            # Alert utilities / أدوات التنبيهات
├── currency.ts          # Currency formatting / تنسيق العملة
├── heirsConverter.ts    # Data transformation / تحويل البيانات
└── toast.ts             # Toast notifications / إشعارات Toast

lib/constants/
├── appDefaults.ts       # Application defaults / إعدادات التطبيق الافتراضية
├── colors.ts            # Color constants / ثوابت الألوان
├── heirIcons.ts         # Heir icons / أيقونات الورثة
└── theme.ts             # Theme configuration / تكوين المظهر
```

---

## Data Flow / تدفق البيانات

### Calculation Flow / تدفق الحساب

```
User Input (UI)
    ↓
Context State (CalcContext)
    ↓
Validation (calculateAdapter.ts)
    ↓
Calculation Engine (calculator.ts)
    ↓
Madhab Rules (constants.ts)
    ↓
Fraction Arithmetic (fraction.ts)
    ↓
Hijab Application (hijab.ts)
    ↓
Result Generation
    ↓
UI Display (Results.tsx)
```

### State Management Flow / تدفق إدارة الحالة

```
User Action
    ↓
Component Event Handler
    ↓
Context Dispatch
    ↓
State Update
    ↓
Component Re-render
    ↓
UI Update
```

---

## Component Architecture / هندسة المكونات

### Component Hierarchy / تسلسل المكونات

```
App.tsx
├── AppProviders.tsx (Context Providers)
│   ├── ThemeContext
│   ├── LanguageContext
│   ├── PremiumContext
│   └── CalcContext
├── RootNavigator.tsx (Navigation)
│   ├── EstateSetup
│   ├── MadhabSelect
│   ├── HeirSelection
│   │   └── HeirSelector
│   │       └── HeirRow
│   ├── Results
│   │   ├── PieChart
│   │   ├── StepTimeline
│   │   └── ExportBar
│   ├── Comparison
│   ├── History
│   └── Settings
└── ErrorBoundary.tsx
```

---

## Design Patterns / أنماط التصميم

### 1. Layered Architecture / هندسة طبقية

Clear separation between engine, business logic, and UI layers.

فصل واضح بين طبقات المحرك والمنطق التجاري وواجهة المستخدم.

### 2. Context Pattern / نمط السياق

React Context for global state management across the application.

React Context لإدارة الحالة العالمية عبر التطبيق.

### 3. Strategy Pattern / نمط الاستراتيجية

Madhab-specific calculation strategies in the engine.

استراتيجيات حساب خاصة بالمذهب في المحرك.

### 4. Factory Pattern / نمط المصنع

Heir creation and configuration through factory methods.

إنشاء الورثة وتكوينهم عبر طرق المصنع.

### 5. Observer Pattern / نمط المراقب

State updates trigger UI re-renders through React's reactivity.

تحديثات الحالة تؤدي إلى إعادة رسم واجهة المستخدم عبر تفاعلية React.

---

## Key Design Decisions / قرارات التصميم الرئيسية

### 1. TypeScript for Type Safety

Full TypeScript implementation with strict mode for type safety.

تنفيذ TypeScript كامل مع الوضع الصارم لسلامة الأنواع.

### 2. Fraction Class for Precision

Custom fraction class to avoid floating-point precision errors.

فئة كسور مخصصة لتجنب أخطاء دقة الفاصلة العائمة.

### 3. Madhab-Specific Rules

Separate rule sets for each Islamic school of jurisprudence.

مجموعات قواعد منفصلة لكل مدرسة فقهية إسلامية.

### 4. Component Memoization

React.memo and useMemo for performance optimization.

React.memo و useMemo لتحسين الأداء.

### 5. Lazy Loading

React.lazy for screen components to optimize initial load time.

React.lazy لمكونات الشاشات لتحسين وقت التحميل الأولي.

---

## Security Architecture / هندسة الأمان

### Input Validation

All user inputs are validated before processing:

جميع مدخلات المستخدم يتم التحقق منها قبل المعالجة:

- Estate values must be positive numbers
- Heir counts must be non-negative integers
- Invalid combinations are prevented (e.g., husband + wife)

### Data Storage

Sensitive data stored securely:

البيانات الحساسة تخزن بأمان:

- AsyncStorage for local data
- No sensitive data in logs
- Encryption considerations for production

### Error Handling

Comprehensive error handling to prevent crashes:

معالجة شاملة للأخطاء لمنع الأعطال:

- Custom error classes
- Graceful error boundaries
- User-friendly error messages

---

## Performance Architecture / هندسة الأداء

### Optimization Strategies / استراتيجيات التحسين

1. **Memoization**: React.memo for expensive components
   **التخزين المؤقت**: React.memo للمكونات المكلفة

2. **Lazy Loading**: React.lazy for screen components
   **التحميل البطيء**: React.lazy لمكونات الشاشات

3. **Code Splitting**: Separate bundles for different features
   **تقسيم الكود**: حزم منفصلة لميزات مختلفة

4. **Caching**: Memoization of calculation results
   **التخزين المؤقت**: تخزين مؤقت لنتائج الحساب

5. **Optimized Re-renders**: Proper dependency arrays
   **تحسين إعادة الرسم**: مصفوفات تبعية صحيحة

---

## Testing Architecture / هندسة الاختبار

### Test Structure / هيكل الاختبار

```
__tests__/
├── components.test.ts      # Component tests / اختبارات المكونات
├── integration.test.ts     # Integration tests / اختبارات التكامل
├── inheritance.test.ts     # Logic tests / اختبارات المنطق
├── special-cases.test.ts   # Special case tests / اختبارات الحالات الخاصة
├── real-world-scenarios.test.ts # Real-world tests / اختبارات العالم الحقيقي
├── performance.test.ts     # Performance tests / اختبارات الأداء
└── history.test.ts         # History tests / اختبارات السجل
```

### Coverage Areas / مجالات التغطية

- **Unit Tests**: Individual functions and classes
  **اختبارات الوحدة**: الدوال والفردات الفردية

- **Integration Tests**: Component interactions
  **اختبارات التكامل**: تفاعلات المكونات

- **End-to-End Tests**: Complete user flows
  **اختبارات من البداية للنهاية**: تدفقات المستخدم الكاملة

- **Performance Tests**: Calculation speed and memory
  **اختبارات الأداء**: سرعة الحساب والذاكرة

---

## Internationalization Architecture / هندسة التدويل

### i18n Structure / هيكل التدويل

```
lib/i18n/
├── index.ts              # i18n configuration / تكوين التدويل
└── locales/
    ├── en.json          # English / الإنجليزية
    ├── ar.json          # Arabic / العربية
    ├── ur.json          # Urdu / الأردية
    └── ms.json          # Malay / الملايو
```

### Language Support / دعم اللغة

- 4 languages supported (English, Arabic, Urdu, Malay)
- RTL support for Arabic
- Currency formatting per locale
- Date formatting per locale

---

## Deployment Architecture / هندسة النشر

### Build Process / عملية البناء

```
Source Code
    ↓
TypeScript Compilation
    ↓
React Native Build
    ↓
Bundle Optimization
    ↓
Platform-Specific Build (iOS/Android)
    ↓
Deployment
```

### Environment Configuration / تكوين البيئة

- Development: Local development with hot reload
- Staging: Testing environment
- Production: Optimized production builds

---

## Future Architecture Considerations / اعتبارات هندسة المستقبل

### Scalability / قابلية التوسع

1. **Microservices**: Potential for separating calculation engine
   **الخدمات المصغرة**: إمكانية فصل محرك الحسابات

2. **API Layer**: REST API for external integrations
   **طبقة API**: واجهة برمجة تطبيقات REST للتكامل الخارجي

3. **Database**: Persistent storage for calculations
   **قاعدة البيانات**: تخزين دائم للحسابات

### Maintainability / قابلية الصيانة

1. **Module System**: Further module decomposition
   **نظام الوحدات**: مزيد من تفكك الوحدات

2. **Documentation**: Enhanced code documentation
   **التوثيق**: تحسين توثيق الكود

3. **Testing**: Increased test coverage
   **الاختبار**: زيادة تغطية الاختبار

---

**Last Updated:** June 3, 2026  
**آخر تحديث:** 3 يونيو 2026
