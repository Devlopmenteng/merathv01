# Architectural Review & Enhancement Plan — Merath App

> **Date**: 2026-06-05
> **Reviewer**: Senior App Development Expert
> **Scope**: Full-stack audit of the Merath Islamic Inheritance Calculator (Expo SDK 55 / RN 0.83 / React 19 / TS 5.9)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Overview](#2-project-overview)
3. [Strengths](#3-strengths)
4. [Issues & Opportunities — By Domain](#4-issues--opportunities)
   - 4.1 Architecture & Structure
   - 4.2 Code Quality & Patterns
   - 4.3 Business Logic / Engine
   - 4.4 UI/UX & Theming
   - 4.5 Localization / i18n
   - 4.6 Testing
   - 4.7 Performance & Bundle
   - 4.8 Security
   - 4.9 State Management
   - 4.10 Build/Deploy/CI
   - 4.11 Accessibility
   - 4.12 Error Handling & Resilience
5. [Consolidated Enhancement Plan](#5-consolidated-enhancement-plan)
   - Phase A: Critical Fixes (now)
   - Phase B: Structural Improvements
   - Phase C: Feature Enhancements
   - Phase D: Quality & Polish
6. [What Has Already Been Done](#6-what-has-already-been-done)
7. [Decision Log](#7-decision-log)

---

## 1. Executive Summary

Merath is a React Native / Expo application for calculating Islamic inheritance (Faraid) according to all four major schools of thought. The codebase is **well-structured overall** with a clean separation between the core engine, UI components, localization, and services. However, there are **significant structural issues, duplicated configurations, test quality problems, and missed optimization opportunities** that should be addressed before production release.

**Key findings:**
- The inheritance engine (`calculator.ts` at 59KB / 1762 lines) is a **god class** needing decomposition
- ESLint is configured in **two conflicting formats** (`.eslintrc.json` + `eslint.config.js`)
- Prettier config exists as **two separate files** (`.prettierrc` + `.prettierrc.json`)
- Husky skips type-checking due to "existing errors" — these must be fixed
- Test files contain **significant quantities of placeholder/tautological tests** that provide no real coverage
- `OfflineManager.ts` exists but is **never instantiated or used** anywhere in the app
- `StartupGate` component is a passthrough wrapper with no actual logic
- Currency symbol is hardcoded as `$` when app deals in SAR (Saudi Riyal)
- `HeirSelector.tsx.backup6`, `Results.tsx.backup6`, `StepIndicator.tsx.backup6` are stale backup files

---

## 2. Project Overview

| Aspect | Detail |
|--------|--------|
| **Purpose** | Islamic inheritance calculator (Faraid) — 4 madhabs |
| **Tech Stack** | Expo SDK 55, RN 0.83.6, React 19.2, TypeScript 5.9 |
| **State Mgmt** | useReducer (CalcContext) + useState (per-context) |
| **Navigation** | @react-navigation/native-stack v7 |
| **i18n** | i18n-js v4 with 4 locales (en, ar, ms, ur) |
| **Storage** | AsyncStorage (audit trail, preferences, offline cache) |
| **Testing** | Vitest v4 with jsdom environment |
| **Engine Size** | ~12K lines across 6 files (calculator.ts alone: 1762 lines) |
| **Test Count** | 12 files — 226 pass, 3 skipped out of 229 total |
| **CI** | GitHub Actions (test + EAS Build preview) |

---

## 3. Strengths

1. **Well-defined type system** — comprehensive types in `types.ts` with support for all four madhabs
2. **Fraction arithmetic** — robust `FractionClass` with overflow protection, GCD/LCM caching, continued-fraction decimal conversion, and comprehensive Arabic fraction names
3. **Excellent i18n coverage** — 441 keys across 4 locales, including heir names, share reasons, step descriptions, accessibility labels, and fiqh references
4. **Responsive design foundations** — `useResponsive` hook, safe area insets, RTL-aware layouts
5. **Design system** — consistent spacing, typography, border-radius, elevation, and color tokens
6. **Error boundary** — class-based with AsyncStorage logging, calculation-error detection, and reset functionality
7. **Comprehensive hijab system** — all 12 hijab rules implemented with per-madhab awareness
8. **Memoization** — smart use of static caches in engine classes, `React.memo` on key components
9. **Madhab variance handling** — `MadhhabRules` config captures all inter-madhab differences (grandfather treatment, spouse radd, Umariyyah, Musharraka, etc.)
10. **Accessibility labels** — comprehensive `a11y_*` keys across most screens and components

---

## 4. Issues & Opportunities

### 4.1 Architecture & Structure

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| A1 | **Duplicate ESLint configs** | High | `.eslintrc.json` + `eslint.config.js` conflict. Flat config takes precedence in ESLint v9+ but `.eslintrc.json` has more rules (JSX overrides, test env etc.) that get ignored. |
| A2 | **Duplicate Prettier configs** | Low | `.prettierrc` + `.prettierrc.json` — `.prettierrc.json` is a superset. Stale redundancy. |
| A3 | **Stale backup files** | Medium | `HeirSelector.tsx.backup6`, `Results.tsx.backup6`, `StepIndicator.tsx.backup6` committed to repo. Should not be in version control. |
| A4 | **Dead code — OfflineManager** | Medium | 486-line `OfflineManager.ts` with full cache/sync/status system — never imported or instantiated by any screen, component, or service. Rusts in place. Evaluate: strip or integrate. |
| A5 | **Dead code — StartupGate** | Low | `StartupGate.tsx` is a `<>{children}</>` passthrough. Either implement actual logic (loading screen, init checks) or remove entirely. |
| A6 | **Dead code — PremiumContext** | Low | `PremiumContext` exists with `isPremium`/`togglePremium`/AsyncStorage persistence — but `isPremium` is never checked anywhere in the app. Unlock-legal-reports UI in Settings is present but the feature doesn't gate anything. |
| A7 | **No barrel exports pattern** | Low | Each module has its own barrel, but there is no top-level library barrel. Consumers import from scattered paths (`lib/engine/types`, `lib/engine/constants`, `lib/i18n`, etc.). |
| A8 | **Excessive engine file size** | High | `calculator.ts` (1762 lines, 59KB) is a god class violating SRP. Contains: validation, fixed shares, Awl, Radd, Asaba, special cases, Musharraka, Akdariyya, blood relatives, treasury, confidence scoring, memoized helpers, merge logic — should be 6-8 separate modules. |
| A9 | **`plan.md` contains inline edit traces** | Low | `plan.md` has old-style diff markers (`<<<<<<< SEARCH`, `=======`, `>>>>>>>`) that look like AI-edit remnants. Clean up. |

### 4.2 Code Quality & Patterns

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| B1 | **14 ESLint warnings** | Medium | `no-explicit-any` warnings across 7 files. In TS files (not .tsx) like `calculator.ts:200`, `types.ts:147,202`, `RootNavigator.tsx:44,102`. These should be typed properly. |
| B2 | **Unused eslint-disable directive** | Medium | `calculator.ts:1616` has `// eslint-disable-next-line @typescript-eslint/no-unused-vars` but no problems were reported — directive is stale. |
| B3 | **TS strict mode with errors** | High | `tsconfig.json` enables `strict`, `noUnusedLocals`, `noUnusedParameters`, `exactOptionalPropertyTypes` — yet the Husky pre-commit *skips* type-check because of "existing errors." These must be fixed; strict mode is pointless if bypassed. |
| B4 | **`exactOptionalPropertyTypes` compatibility** | High | This TS flag is on but most interfaces use optional properties (`?`). This flag changes how `undefined` interacts with optional props — likely causing hidden type errors. Review all optional interfaces. |
| B5 | **Inline styles throughout** | Medium | Most components use inline `style={{...}}` objects. These are recreated on every render. Should extract static styles to `StyleSheet.create()`. |
| B6 | **No `key` prop on mapped elements** | Low | Several `.map()` calls use array index as key (`key={idx}`) in `FiqhRules.tsx:105,138,165` and `Glossary.tsx:52`. Acceptable for static lists, but causes issues with dynamic lists. |
| B7 | **`console.log` in production code** | Low | `OfflineManager.ts` has 15+ `console.log` calls for debug logging. Should use a proper logger or remove for production. |
| B8 | **No path aliases** | Low | All imports use relative paths (`../../lib/engine/types`). TS path aliases (`@/`, `@engine/`, `@screens/`) would clean this up significantly. |

### 4.3 Business Logic / Engine

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| C1 | **God class — calculator.ts** | Critical | 59KB / 1762 lines with 25+ private methods. Every new feature or fix requires understanding the entire file. Break into: `FixedSharesCalculator`, `AsabaCalculator`, `AwlCalculator`, `RaddCalculator`, `SpecialCasesCalculator`, `BloodRelativesCalculator`, `ConfidenceCalculator`. |
| C2 | **`Madhab` / `MadhhabType` dual naming** | Medium | `types.ts` has both `Madhab` and `MadhhabType` (deprecated alias). Codebase uses both. Pick one (`Madhab`) and migrate. |
| C3 | **CalculationResult has duplicate fields** | Medium | `madhhabName` duplicates `madhab` (both hold same string). `shares` items have both `key?: HeirType` and `heir?: string` and `type?: string`. Overlapping, ambiguously typed fields increase bugs. |
| C4 | **`HeirShare` interface overloading** | Medium | `HeirShare` has 15 optional fields. Some used by engine, some by UI, some by reports. Should extend a base interface rather than one megatype. |
| C5 | **Hardcoded madhab colors in theme** | Low | `madhabColors` in `theme.ts` is defined but never used by `MadhabSelect.tsx` or `Comparison.tsx` — those use their own color logic. |
| C6 | **Confidence scoring is arbitrary** | Low | `calculateConfidence()` deducts fixed values (-8 for Awl, -12 for Akdariyya, etc.) with no empirical basis. Valid for display but misleading as a "confidence" metric. Document as "complexity index." |
| C7 | **No validation workflow** | Medium | Engine returns `confidence` but there is no UI to contest or validate results against known scholarly rulings. A "Validate by Scholar" or "Cross-Reference" feature would add credibility. |

### 4.4 UI/UX & Theming

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| D1 | **Currency symbol is `$` not SAR** | High | `currency_symbol` key in en.json is `$`. App deals in SAR (Saudi Riyal). Should be `﷼` or `SAR`. All 4 locale files need updating. |
| D2 | **No loading states on screens** | Medium | `Results.tsx` shows no `ActivityIndicator` while the engine calculates (the `calculateInheritance` in `useEffect` is sync but PDF generation is async). `ExportBar.tsx` has no loading state during PDF generation. |
| D3 | **Excessive re-renders in Comparison** | Medium | `Comparison.tsx` calls `calculateInheritance` 4 times (once per madhab) on mount. No debouncing, no caching of identical estate/heir inputs. Should memoize results by input hash. |
| D4 | **No dark mode toggle feedback** | Low | Toggling dark mode in Settings calls `toggleTheme()` which is async (writes to storage) but there is no visual feedback — toast or confirmation. |
| D5 | **Onboarding shows every time** | Medium | `EducationalTutorial.tsx` checks `ASYNC_STORAGE.STORAGE_KEYS.TUTORIAL_SEEN` on mount, but the key in `appDefaults.ts` is `merath_tutorial_seen` while `EducationalTutorial.tsx` likely uses a different key. Needs audit. |
| D6 | **No empty state for no results** | Low | If `calculateInheritance` returns `success: false`, `Results.tsx` shows nothing useful. Should show an error card with the error message and a retry button. |
| D7 | **Fixed-width tables in FiqhRules** | Low | `FiqhRules.tsx` uses hardcoded pixel widths (`width: 100`, `width: 200`) for fixed shares and hijab tables. These will break on small screens or in landscape. |
| D8 | **PieChart min slice angle may hide data** | Low | `MIN_SLICE_ANGLE_FOR_LABEL` = 15°. Some heirs get very small fractions (e.g., 1/24). If label is hidden, the heir still exists but the user sees no label — confusing. |

### 4.5 Localization / i18n

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| E1 | **`showAlert` in TestCases bypasses i18n** | Medium | `TestCases.tsx:89-92` calls `showAlert(t('template_applied'), template.name + t('madhab_name_x'))` but `showAlert` translates *both* parameters via `t()`. The concatenated message string gets passed through `t()`, missing translation and likely returning the key itself. |
| E2 | **`showAlert` API is unintuitive** | Medium | `showAlert` treats both params as i18n keys and calls `t()` on them. But callers in HeirSelector (`HeirSelector.tsx`) pass raw strings, which then also get `t()` called — leading to double-translation or key errors. |
| E3 | **Locale files not fully in sync** | Low | All 4 locale files have 441 keys, but some values contain `%{variable}` mismatches vs en.json (e.g., different parameter names in translations). |
| E4 | **No locale-aware number formatting** | Low | Numbers use `toLocaleString()` without locale argument. Should pass the current locale for Arabic/Western digit separation. |
| E5 | **Malay and Urdu have incomplete verse translations** | Low | Quranic verses have `en`, `ms?`, `ur?` — translations exist but the Glossary screen falls back to `en` when ms or ur are missing. Acceptable but ideally complete. |

### 4.6 Testing

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| F1 | **Many tests are tautological/placeholder** | High | `components.test.ts` has 50+ tests that test hardcoded variables (e.g., `expect(1 + 1).toBe(2)`). `performance.test.ts` has 40+ tests testing `Math.random()`. `integration.test.ts` has 40 tests testing string constants. These inflate pass rates but provide zero actual coverage. |
| F2 | **No engine unit tests for edge cases** | High | `edge-cases.test.ts` is a single placeholder test: `expect(true).toBe(true)`. The engine has 12+ edge cases (Awl with 10+ heirs, Radd with spouse, Musharraka boundary, Akdariyya, multi-generation, blood relatives priority) — none tested. |
| F3 | **No engine unit tests for madhab-specific behavior** | High | Critical rules differ between madhabs (grandfather+siblings, spouse radd, Musharraka) — zero tests verify these differences produce correct results. |
| F4 | **No component rendering tests** | High | `Settings.test.tsx` is the only component test (3426 bytes). Zero snapshot or render tests for HeirSelector, Results, ExportBar, Comparison, etc. |
| F5 | **History test uses wrong storage key** | Medium | `history.test.ts` uses `APP_DEFAULTS.STORAGE_KEYS.HISTORY` but the app actually persists via `AuditTrailService` which uses `APP_DEFAULTS.STORAGE_KEYS.AUDIT_TRAIL`. Test is checking the wrong key. |
| F6 | **Test files in `__tests__/` mix unit + integration** | Low | No convention for test file naming or organization. Some are pure unit tests, some integration, some performance benchmarks — all at the same directory level. |
| F7 | **Performance tests have no baseline** | Low | `performance-regression.test.ts` creates baselines within the test run but doesn't persist them. Each run is self-referential — cannot detect regressions across runs. |

### 4.7 Performance & Bundle

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| G1 | **Unused dependencies in package.json** | Medium | `@emnapi/core`, `@emnapi/runtime` — these are transitive. Should verify they're actually needed. `fake-indexeddb` in devDeps — used? |
| G2 | **No code splitting/react-lazy beyond navigation** | Low | Only navigation screens are lazy-loaded via `React.lazy`. Heavy components like `LegalReportGenerator`, `PieChart`, `ExcelExporter` are eagerly imported in `Results.tsx` and `ExportBar.tsx`. |
| G3 | **No bundle analysis in CI** | Low | No `npx expo-analyzer` or bundle-size tracking in CI pipeline. Risk of bundle bloat going unnoticed. |
| G4 | **Rapid madhab comparison triggers 4 sync calcs** | Medium | `Comparison.tsx` calculates all 4 madhabs synchronously on the JS thread. For complex estates, this blocks the UI for 200ms+. Should be parallelized with `Promise.all` or web workers. |

### 4.8 Security

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| H1 | **XSS surface in TextInput** | Medium | `EstateSetup.tsx` accepts case name and passes it through `t()`. If `t()` is used as a raw output (e.g., in alert messages), HTML/script injection is possible. Input validation exists but relies on regex blocking, not proper encoding. |
| H2 | **AsyncStorage keys are predictable** | Low | All storage keys use the `merath_` prefix. A malicious app on the same device could read/write AsyncStorage entries. Mitigated by RN's sandboxing, but worth noting. |
| H3 | **No input size limits on estate fields** | Low | `APP_DEFAULTS.MAX_ESTATE_VALUE` = 999,999,999,999 (~1 trillion). A user could enter absurd values. The fraction arithmetic could overflow (despite protections). |

### 4.9 State Management

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| I1 | **Fragmented context providers** | Medium | 5 context providers + `StartupGate` wrapper in `AppProviders.tsx`. Value recomputation in some contexts is not fully optimized (redundant `useMemo` + `useCallback` wrapping creates more overhead than value). |
| I2 | **CalcContext is both reducer + useState** | Medium | `CalcContext` uses `useReducer` for the calculation state (madhab, estate, heirs) but separate `useState` for `caseName` and `caseDate`. These should be in the reducer for consistency. |
| I3 | **No state persistence** | Medium | If user navigates away from EstateSetup (e.g., to Settings) and returns, the form state is lost. Should persist draft via AsyncStorage or context more robustly. |
| I4 | **Language change forces full remount** | Low | `App.tsx` keys `RootNavigator` by `locale`. This unmounts/mounts the entire navigation tree on language change. Acceptable performance hit but jarring UX. |

### 4.10 Build/Deploy/CI

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| J1 | **Type-check skipped in pre-commit** | High | Husky pre-commit: `⚠️ Skipping TypeScript type-check (existing errors in codebase)`. This is a red flag — the pre-commit gate should not bypass one of the most important checks. Fix existing errors and enable. |
| J2 | **Dual lint configs cause confusion** | Medium | The coexistence of `.eslintrc.json` and `eslint.config.js` (flat config) creates unpredictable behavior depending on which ESLint version resolves first. Standardize on flat config. |
| J3 | **No lint-staged in pre-commit** | Low | Prettier runs on ALL files (`**/*.{ts,tsx,json}`), not just staged. For a 25+ file commit, this wastes time and can cause unexpected formatting across the entire codebase. Use `lint-staged`. |
| J4 | **`eslint.config.js` has invalid rule name** | Medium | `eslint.config.js` lists `explicit-function-return-types` (should be `explicit-function-return-type` without trailing 's'). The rule is silently ignored. |
| J5 | **No version bump automation** | Low | `app.json` says version `1.0.0`. No semantic-release, no changelog, no version-bump script. |

### 4.11 Accessibility

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| K1 | **Duplicate `heir` i18n key** | High | en.json has `"heir"` defined twice — once at line `~75` and again at line `~172`. The second definition overwrites the first. Screen reader labels may be wrong. |
| K2 | **Missing accessibility roles on touchables** | Medium | `FiqhRules.tsx` madhab sections use `View` with `TouchableOpacity`-like behavior but no `accessibilityRole="button"`. Several screens lack proper roles. |
| K3 | **No `accessibilityLiveRegion` on results** | Low | When `Results.tsx` finishes calculation (async state transition), screen readers won't announce the change. Should set `aria-live="polite"` on the results container. |
| K4 | **`EducationalTutorial` stepper has no a11y** | Low | The 5-slide tutorial uses horizontal `ScrollView` with `onMomentumScrollEnd`. No `accessibilityLabel` on slides or navigation dots. |

### 4.12 Error Handling & Resilience

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| L1 | **Engine calculation has no timeout** | Medium | `calculator.ts::calculate()` has no timeout. A pathological case (impossible fractions, infinite loop) could hang the app. Should wrap engine calls in a timeout (e.g., 5s). |
| L2 | **AsyncStorage operations are unguarded** | Medium | `AuditTrailService.ts`, `Settings.tsx`, and several contexts call `AsyncStorage` without try/catch in all paths. A failed read/write crashes the screen. |
| L3 | **No retry mechanism for PDF generation** | Low | `LegalReportGenerator.tsx` calls `Print.printToFileAsync` without error recovery. If generation fails, the user gets a cryptic error. Should show actionable message and retry option. |
| L4 | **`showAlert` swallows errors silently** | Low | When `showError` or `showCalculationError` is called, the error is displayed to the user but never logged to console or crash reporter. Should integrate with a logging service. |

---

## 5. Consolidated Enhancement Plan

### Phase A: Critical Fixes (Should be done before any feature work)

| ID | Task | Area | Effort | Verification |
|----|------|------|--------|-------------|
| A-01 | **Fix TypeScript strict-mode errors** | Build | 2-3h | `npm run type-check` passes clean |
| A-02 | **Standardize on flat ESLint config** | Build | 0.5h | Remove `.eslintrc.json`, keep `eslint.config.js`; fix the invalid rule name |
| A-03 | **Remove duplicate Prettier config** | Build | 0.1h | Delete `.prettierrc`, keep `.prettierrc.json` |
| A-04 | **Delete stale backup files** | Repo | 0.1h | `git rm` all `*.backup6` files |
| A-05 | **Enable type-check in Husky pre-commit** | Build | 2-3h | After A-01 is done, remove skip line from pre-commit |
| A-06 | **Fix duplicate `heir` key in en.json** | i18n | 0.1h | Merge or rename the two `"heir"` definitions |
| A-07 | **Fix `showAlert` double-translation in TestCases** | UI | 0.2h | Use `Alert.alert` directly for pre-formatted messages |
| A-08 | **Fix history test to use correct storage key** | Test | 0.1h | Change `HISTORY` → `AUDIT_TRAIL` |
| A-09 | **Change currency symbol from `$` to SAR/﷼** | i18n | 0.2h | Update all 4 locale files |
| A-10 | **Remove unused eslint-disable directive** | Code | 0.1h | Clean calculator.ts:1616 |

### Phase B: Structural Improvements

| ID | Task | Area | Effort | Verification |
|----|------|------|--------|-------------|
| B-01 | **Decompose calculator.ts into domain modules** | Engine | 8-12h | All existing tests pass; new tests for each module |
| B-02 | **Resolve OfflineManager dead code** | Arch | 1h | Either integrate (call `initializeOfflineManager` at startup) or remove |
| B-03 | **Resolve PremiumContext dead code** | Arch | 0.5h | Either implement premium gating or remove |
| B-04 | **Resolve StartupGate dead code** | Arch | 0.3h | Implement loading gate or remove |
| B-05 | **Add barrel exports at `lib/` level** | Arch | 1h | Create `lib/index.ts` re-exporting commonly used modules |
| B-06 | **Consolidate CalcContext reducer + useState** | State | 1h | Move `caseName`/`caseDate` into the reducer |
| B-07 | **Fix `HeirShare` interface overloading** | Types | 2h | Split into `EngineHeirShare` + `UIHeirShare` + `ReportHeirShare` |
| B-08 | **Define path aliases in tsconfig** | Build | 0.5h | `@/` → `./`, `@engine/` → `./lib/engine/`, `@screens/` → `./screens/` |
| B-09 | **Clean up `plan.md` of edit traces** | Docs | 0.2h | Remove `<<<<<<< SEARCH` / `=======` / `>>>>>>>` markers |

### Phase C: Feature Enhancements

| ID | Task | Area | Effort | Verification |
|----|------|------|--------|-------------|
| C-01 | **Fix real edge-case engine tests** | Test | 4-6h | Write proper tests for Awl overflow, Radd with spouse, Musharraka, Akdariyya, multi-generation, blood relatives |
| C-02 | **Fix madhab-specific engine tests** | Test | 3-4h | Verify all 4 madhabs produce correct (different) results for key cases |
| C-03 | **Add component render tests** | Test | 4-6h | Snapshot tests for HeirSelector, Results, ExportBar, Comparison, Settings |
| C-04 | **Replace tautological tests** | Test | 2-3h | Audit and rewrite `components.test.ts`, `performance.test.ts`, `integration.test.ts` with meaningful assertions |
| C-05 | **Add loading states to Results and ExportBar** | UI | 1h | `ActivityIndicator` during async PDF/CSV/share |
| C-06 | **Add estate form draft persistence** | State | 1h | Persist/restore EstateSetup form to AsyncStorage |
| C-07 | **Memoize Comparison screen results** | Perf | 1h | Cache results by input hash (estate + heirs + madhab) |
| C-08 | **Add retry to PDF generation** | UI | 0.5h | Error recovery with retry button in LegalReportGenerator |
| C-09 | **Add engine timeout wrapper** | Engine | 0.5h | Wrap `engine.calculate()` in `Promise.race` with 5s timeout |
| C-10 | **Add `aria-live` region to Results** | A11y | 0.3h | Screen reader announces calculation completion |

### Phase D: Quality & Polish

| ID | Task | Area | Effort | Verification |
|----|------|------|--------|-------------|
| D-01 | **Extract inline styles to StyleSheet** | UI | 3-4h | Systematic refactor across all screens/components |
| D-02 | **Add lint-staged to pre-commit** | Build | 0.5h | Only lint/format staged files |
| D-03 | **Fix missing `key` props** | Code | 0.3h | Stable keys for all `.map()` iterations |
| D-04 | **Add loader/error states to all AsyncStorage paths** | Resilience | 1-2h | Wrap all `AsyncStorage` calls in try/catch |
| D-05 | **Fix FiqhRules fixed-width tables** | UI | 0.5h | Use percentage/flex instead of pixel widths |
| D-06 | **Locale-aware number formatting** | i18n | 0.5h | Pass `i18n.locale` to `toLocaleString()` |
| D-07 | **Standardize on `Madhab` naming** | Code | 0.5h | Remove `MadhhabType` alias, replace all `MadhhabType` → `Madhab` |
| D-08 | **Add bundle analyzer to CI** | Build | 0.5h | Track bundle size in CI pipeline |
| D-09 | **Fix `t()` usage in HeirSelector raw message** | i18n | 0.2h | Call `showValidationError` correctly or use `Alert.alert` directly |
| D-10 | **Switch from `console.log` to proper logger** | Code | 1h | Create `lib/utils/logger.ts` with level-aware, production-disable logging |

---

## 6. What Has Already Been Done

The following improvements have been implemented (on `feat/architectural-improvements` branch):

### Phase 1: Locale files
- All 4 locale files updated with ~441 keys each
- Added missing keys: `share_image`, `heir_count_one`, `share`
- Removed dead keys: `verse_arabic_label`, `verse_translation_label`, `verse_source_label`, `feedback_email_subject`, `export_error_title`, `a11y_heir_name_fallback`
- Renamed `a11y_dismiss_button` → `a11y_dismiss_tooltip`
- Added `fiqh_*_radd` keys for madhab match

### Phase 2: Localization infrastructure
- `shareLocalization.ts` updated with `STEP_TYPE_MAP`
- `types.ts` updated with `StepType` union and optional `stepType` on `CalculationStep`
- `localizeStepTitle`/`localizeStepDesc` prefer stepType-based translation before falling back

### Phase 3: Dark theme
- Dark theme colors updated (background #1E1C18, surface #2D2A24, text primary #F5F0E8)

### Phase 4: Screen localization
- All 7 screens fully localized with `t()` calls, `currency_symbol`, `madhab_name_*`

### Phase 5: Component localization
- All 6 components (ExportBar, HeirSelector, TemplatesModal, FeedbackButton, OnboardingTooltip, LegalReportGenerator) localized

### Phase 6: Wrapping fixes
- `HeirRow`, `Results`, `Comparison`, `StepTimeline`, `TemplatesModal` — `flexShrink` and `numberOfLines` added

### Phase 7: Quranic verse translations
- Malay and Urdu translations added for all 3 verses (An-Nisa 11, 12, 176)

### Phase 8: Accessibility
- `Stepper.tsx` hardcoded labels replaced with `t('a11y_decrease')`, `t('a11y_increase')`, `t('a11y_current_value')`

---

## 7. Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-05 | `a11y_dismiss_button` → `a11y_dismiss_tooltip` | Single key used by OnboardingTooltip |
| 2026-06-05 | `fiqh_*_radd` keys added alongside `fiqh_*_spouse_radd` | `FiqhReferences.ts` calls `t('fiqh_hanafi_radd')` without `_spouse_` infix |
| 2026-06-05 | Remove dead keys collectively | 6 keys proven unused via grep |
| 2026-06-05 | `showAlert` used directly in HeirSelector for `max_wives` | `showValidationError` doesn't support interpolation parameters |

---

## Appendix: File Map

```
lib/
├── engine/           # Core inheritance calculation (6 files, ~12K lines)
│   ├── calculator.ts # ⚠️ 1762 lines — god class, needs decomposition
│   ├── types.ts      # Type system (214 lines)
│   ├── constants.ts  # Fiqh database, helpers (545 lines)
│   ├── fraction.ts   # Fraction arithmetic (662 lines)
│   ├── hijab.ts      # Hijab/blocking system (253 lines)
│   └── errors.ts     # Error classes (223 lines)
├── inheritance/      # Public API layer
│   ├── calculateAdapter.ts  # Simplified interface
│   └── index.ts             # Barrel exports
├── i18n/             # Internationalization
│   ├── index.ts             # i18n-js setup + t() helper
│   └── locales/
│       ├── en.json   # 441 keys
│       ├── ar.json   # 441 keys
│       ├── ms.json   # 441 keys
│       └── ur.json   # 441 keys
├── context/          # State management (6 providers)
├── constants/        # App defaults, theme, glossary, icons, verses
├── utils/            # Validation, formatting, alerts, RTL, performance
├── services/         # Audit trail, fiqh references, usage stats
├── share/            # CalculationShare
├── templates/        # Scenario templates
├── export/           # ExcelExporter
├── offline/          # ⚠️ Dead code — OfflineManager (never imported)
└── debug/            # CalculationInspector

components/           # 13 reusable components
├── ui/               # 5 primitive components (Button, Card, Input, Stepper, Skeleton)

screens/              # 12 screens
navigation/           # RootNavigator (10 routes)
hooks/                # useAppTheme, useResponsive
__tests__/            # 12 test files (226 pass of 229)
```
