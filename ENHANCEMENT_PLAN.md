# Merath Islamic Inheritance Calculator - Enhancement Plan

## Overview
This document tracks the comprehensive enhancement plan for the Merath Islamic Inheritance Calculator app, including completed phases and remaining tasks.

## Session Information
**Current Session**: TBD (to be assigned)
**Branch**: `feat/architectural-improvements`
**Working Directory**: `/workspaces/merathv01`
**Last Updated**: 2025-01-15

## Session History
- **Phase 1-7**: Completed in various sessions (see individual phase details)
- **Current Session**: Phase 8 UI Redesign preparation
- **Previous Session Summary**: Saved at `/home/codespace/.local/share/devin/cli/summaries/history_15a619b1b5df40cc.md`

## Original 7-Phase Plan (from "surf-laundry" session)

### Phase 1: Critical UX & Accessibility Improvements ✅ **COMPLETED**
**Session ID**: N/A (completed before session tracking)
**Commit**: `7bc0143` - "feat: implement Phase 1 critical UX and accessibility improvements"
**Directory**: `/workspaces/merathv01`
**Files Modified**: 14 files

#### Completed Tasks:
- ✅ Accessibility Enhancements
  - Standardized accessibility labels with descriptive text across all 12 screens
  - Added accessibility hints for all interactive elements
  - Implemented `accessibilityLiveRegion` for dynamic content updates
  - Added proper accessibility state for toggles and switches
  - Ensured touch targets meet minimum 44x44pt size requirements

- ✅ Error Handling & Validation Feedback
  - Implemented real-time field validation with inline error messages
  - Added contextual error messages with recovery suggestions
  - Implemented validation state visual indicators (success/warning/error)
  - Enhanced error announcement and recovery for screen readers

- ✅ Loading States & Performance
  - Added consistent loading states across all screens
  - Implemented calculation result caching in Comparison screen
  - Added optimistic UI updates for immediate feedback
  - Optimized lazy loading for critical paths

**Screens Enhanced:** All 12 screens (Home, EstateSetup, MadhabSelect, HeirSelection, Results, Comparison, History, Glossary, Settings, TestCases, CalculationSteps, FiqhRules)

---

### Phase 2: UI/UX Design Enhancements ✅ **COMPLETED**
**Commit**: `b993d67` - "feat: implement Phase 2 UI/UX design enhancements"

#### Completed Tasks:
- ✅ Visual Hierarchy & Information Architecture
  - Implemented visual hierarchy with size, color, and spacing
  - Added collapsible sections in Results screen
  - Implemented card-based layout for Comparison table
  - Added visual indicators for active tabs with smooth transitions
  - Implemented information grouping with clear section headers

- ✅ Interactive Feedback & Micro-interactions
  - Added ripple effects and press animations
  - Implemented success animations for completed actions
  - Added smooth page transitions and shared element transitions
  - Implemented progress indicators with step completion feedback
  - Added haptic feedback for key interactions

- ✅ Responsive Design & Layout
  - Implemented responsive breakpoints for mobile/tablet/desktop
  - Added landscape mode layouts for data-heavy screens
  - Implemented dynamic font scaling based on user preferences
  - Added adaptive layouts that reflow based on screen size
  - Implemented grid-based layouts for complex data displays

**New Components Created:** StepIndicator, StepTimeline, StickyBottomBar, OnboardingTooltip, SkeletonCard

---

### Phase 3: Architectural Improvements ✅ **COMPLETED**
Split into 4 sub-phases for better organization

#### Phase 3.1: Performance Optimization ✅ **COMPLETED**
**Commit**: `dd3ba0d` - "feat: implement Phase 3.1 Performance Optimization"

#### Completed Tasks:
- ✅ Rendering Optimization
  - Implemented React.memo for expensive components
  - Added useMemo/useCallback for expensive calculations
  - Virtualized long lists (history, glossary, test cases)
  - Implemented lazy loading for off-screen content
  - Added code splitting for less used features

- ✅ Asset & Resource Optimization
  - Implemented performance monitoring utilities
  - Optimized bundle size with dynamic imports
  - Added performance regression tests
  - Implemented benchmark testing

**New Files:**
- `lib/utils/performance.ts` - Performance monitoring utilities
- `__tests__/performance.test.ts` - Performance tests
- `__tests__/performance-regression.test.ts` - Regression tests
- `__tests__/performance/benchmarks.test.ts` - Benchmark tests

---

#### Phase 3.2: Advanced Features ✅ **COMPLETED**
**Commit**: `7c7d28b` - "feat: implement Phase 3.2 Advanced Features"

#### Completed Tasks:
- ✅ Offline Support with AsyncStorage Caching
  - Created `lib/services/OfflineCacheService.ts` - comprehensive caching with TTL support
  - Created `hooks/useNetworkStatus.ts` - network connectivity detection
  - Created `components/OfflineIndicator.tsx` - offline status display component
  - Modified `lib/context/AppProviders.tsx` - initialize cache on app start
  - Enhanced `lib/services/AuditTrailService.ts` - cache integration for faster retrieval

- ✅ Calculation Scenario Templates
  - Enhanced existing `lib/templates/ScenarioTemplates.ts` with 20+ pre-built scenarios
  - Created `components/TemplateSelector.tsx` - UI for selecting templates
  - Modified `screens/EstateSetup.tsx` - integrated template selector

- ✅ Advanced Export Options
  - Enhanced `lib/export/ExcelExporter.ts` with PDF export support (3 styles)
  - Enhanced CSV export with better formatting
  - Added calculation steps and special cases to exports
  - Added bilingual support (en, ar, ms, ur)
  - Fixed specialCases handling

- ✅ Shareable Calculation Links
  - Enhanced `lib/share/CalculationShare.ts` with compact deep link format
  - Added base64 encoding for compact URLs
  - Added hash-based URLs for better compatibility

**New Files:**
- `lib/services/OfflineCacheService.ts`
- `hooks/useNetworkStatus.ts`
- `components/OfflineIndicator.tsx`
- `components/TemplateSelector.tsx`
- `components/TemplatesModal.tsx`

---

#### Phase 3.3: Internationalization ✅ **COMPLETED**
**Commit**: `013c722` - "feat: implement Phase 3.3 Internationalization"

#### Completed Tasks:
- ✅ Dynamic Language Switching Without Restart
  - Modified `lib/context/LanguageContext.tsx` to support synchronous language switching
  - Improved RTL handling to work without restart in React Native 0.71+
  - Simplified state management for better re-render triggers

- ✅ Locale-Aware Formatting
  - Created `lib/utils/localeFormatting.ts` with Intl-based utilities
  - `formatNumber()` - locale-aware number formatting
  - `formatCurrency()` - proper currency symbols (SAR, PKR, MYR, USD)
  - `formatPercentage()` - locale-aware percentage with precision
  - `formatDate()` - locale-aware date formatting
  - RTL helpers: `getDirection()`, `isLocaleRTL()`, `getTextAlign()`

- ✅ Translation Key Validation
  - Created `lib/utils/translationValidator.ts`
  - `validateTranslations()` - validates all locales against reference
  - `hasTranslationKey()` - checks if specific key exists
  - `getMissingKeysForLocale()` - gets missing keys for specific locale
  - `getTranslationStats()` - calculates coverage statistics

- ✅ RTL Layout Foundation
  - Enhanced `lib/utils/rtl.ts` with flex alignment helpers
  - Created `hooks/useRTL.ts` - component-level RTL utilities hook
  - Added RTL support to Results screen

**New Files:**
- `lib/utils/localeFormatting.ts`
- `lib/utils/translationValidator.ts`
- `hooks/useRTL.ts`

---

#### Phase 3.4: Testing & Quality ✅ **COMPLETED**
**Commit**: `b17e5ce` - "feat: implement Phase 3.4 Testing & Quality"

#### Completed Tasks:
- ✅ Unit Test Coverage Improvements
  - Created `__tests__/localeFormatting.test.ts` with 29 new tests
  - Tests for formatNumber(), formatCurrency(), formatPercentage()
  - Tests for formatDate() and formatDateTime()
  - Tests for RTL utilities
  - **Total tests**: 268 (up from 239, +12% increase)

- ✅ Quality Gates
  - Pre-commit hooks configured (ESLint, Prettier, Tests)
  - All 268 tests passing (3 skipped)
  - TypeScript compilation errors resolved
  - No engine logic modifications (non-breaking changes)

**New Files:**
- `__tests__/localeFormatting.test.ts`

---

## Remaining Phases (Not Yet Implemented)

### Phase 4: Performance Optimization ✅ **COMPLETED**
**Session ID**: N/A (completed in continuation session)
**Commit**: `feat: implement Phase 4 - Performance Optimization (Advanced)`
**Directory**: `/workspaces/merathv01`
**Files Modified**: 14 files

#### Completed Tasks:
- ✅ Component Memoization
  - Added React.memo to TemplateSelector with useMemo for displayed templates
  - Added React.memo to TemplatesModal for better modal performance
  - Added React.memo to EducationalTutorial for tutorial overlay optimization
  - Added React.memo to ExportBar for export functionality optimization
  - Added React.memo to UI Modal component
  - Added React.memo to UI Stepper component
  - Implemented proper memoization dependencies to prevent unnecessary re-renders

- ✅ Code Splitting and Lazy Loading
  - Optimized screen preloading strategy in RootNavigator
  - Added preloadCriticalScreens function for preloading main flow screens
  - Reduced preloading delay from 2000ms to 1000ms for faster perceived performance
  - All screens already using lazy loading with Suspense
  - Added preloading for Home screen along with critical flow screens

- ✅ Virtualization for Long Lists
  - Optimized FlatList in History screen with virtualization props
  - Added removeClippedSubviews, maxToRenderPerBatch, updateCellsBatchingPeriod
  - Implemented getItemLayout for better performance
  - Optimized all FlatList components in Glossary screen (glossary, verses, hadith tabs)
  - Optimized FlatList in MadhabSelect screen
  - Added windowSize and initialNumToRender optimizations

- ✅ Tree Shaking and Bundle Optimization
  - Updated tsconfig.json with modern module configuration
  - Added ESNext module system for better tree shaking
  - Configured moduleResolution to bundler mode
  - Added isolatedModules and skipLibCheck flags
  - Created bundle size analysis script (scripts/analyzeBundle.js)
  - Added build scripts for web, android, and iOS platforms
  - Added analyze:bundle script for bundle size monitoring

- ✅ Performance Monitoring
  - Created bundle size budget limits (500KB JS, 100KB CSS, 600KB total)
  - Implemented bundle size analysis with file breakdown
  - Added optimization recommendations based on bundle size
  - Created tools to monitor largest files and their percentage of total bundle

**Modified Components (8 files):**
- components/TemplateSelector.tsx - Added React.memo and useMemo
- components/TemplatesModal.tsx - Added React.memo
- components/EducationalTutorial.tsx - Added React.memo
- components/ExportBar.tsx - Added React.memo
- components/ui/Modal.tsx - Added React.memo
- components/ui/Stepper.tsx - Added React.memo

**Modified Screens (3 files):**
- screens/History.tsx - Added FlatList virtualization
- screens/Glossary.tsx - Added FlatList virtualization for all tabs
- screens/MadhabSelect.tsx - Added FlatList virtualization

**Modified Navigation (1 file):**
- navigation/RootNavigator.tsx - Optimized screen preloading strategy

**Configuration Updates (2 files):**
- package.json - Added build scripts and bundle analysis
- tsconfig.json - Added tree shaking optimizations

**New Scripts (1 file):**
- scripts/analyzeBundle.js - Bundle size analysis tool

**Performance Improvements:**
- Reduced unnecessary re-renders with memoization
- Improved list scrolling performance with virtualization
- Faster initial load with optimized preloading
- Better tree shaking with modern module configuration
- Bundle size monitoring and optimization recommendations

---

### Phase 5: Testing & Quality Assurance (Partially Complete)
**Status**: Unit and integration tests exist, but comprehensive testing framework incomplete

#### Completed Tasks:
- ✅ Unit Test Infrastructure
  - 268 unit tests passing (up from 239, +12% increase)
  - Test files covering core functionality:
    - calculateAdapter.test.ts
    - components.test.ts
    - edge-cases.test.ts
    - history.test.ts
    - inheritance.test.ts
    - integration.test.ts
    - localeFormatting.test.ts
    - performance-regression.test.ts
    - performance.test.ts
    - real-world-scenarios.test.ts
    - special-cases.test.ts
  - Performance benchmark tests implemented

- ✅ Quality Gates
  - Pre-commit hooks configured (ESLint, Prettier, Tests)
  - All tests passing before commits
  - TypeScript compilation checks

#### Remaining Tasks:
- ⏳ End-to-End Testing
  - No E2E testing framework (Detox or React Native Testing Library)
  - No full user flow testing (estate setup → calculation → results)
  - No cross-screen navigation testing
  - No deep link testing

- ⏳ Accessibility Testing
  - No automated accessibility tests
  - Missing screen reader simulation tests
  - No keyboard navigation tests
  - No touch target size validation tests

- ⏳ Visual Regression Testing
  - No visual regression test framework
  - Missing screenshot comparison tests
  - No cross-device visual testing
  - No theme switching validation tests

- ⏳ Advanced Testing
  - Limited error handling path validation
  - Missing edge case test coverage for validation
  - No input sanitization validation tests
  - No security-focused penetration testing

---

### Phase 6: Internationalization Enhancements ✅ **COMPLETED**
**Session ID**: "surf-laundry" (from session history)
**Commit**: `feat: implement Phase 6 - Internationalization Enhancements (RTL Completion)`
**Directory**: `/workspaces/merathv01`
**Files Modified**: 15 files

#### Completed Tasks:
- ✅ RTL Support Completion
  - Added RTL support to all remaining screens (Home, EstateSetup, MadhabSelect, History, TestCases, CalculationSteps, FiqhRules)
  - Applied icon flipping using `flipDirectionalIcon()` across all screens with directional icons
  - RTL-specific spacing adjustments and flexDirection changes implemented
  - Layout direction consistency ensured across all components

- ✅ Translation Completeness
  - Verified 100% translation coverage across all locales (en, ar, ms, ur)
  - Added pluralization support with `tp()` helper function for `_one`/`_other` patterns
  - Removed duplicate translation keys in Urdu and Malay locales
  - Updated heir count pluralization to use new `tp()` function

- ✅ Locale-Specific Adjustments
  - Verified number formatting consistency using locale-aware `formatCurrency()` and `formatNumber()`
  - Checked date format variations using locale-aware `formatDate()`
  - Ensured currency symbol positioning consistency via `Intl.NumberFormat`
  - Replaced old currency formatting with locale-aware utilities across all screens

**Screens Enhanced with Full RTL Support:**
- CalculationSteps.tsx, EstateSetup.tsx, FiqhRules.tsx, History.tsx, MadhabSelect.tsx, TestCases.tsx
- components/HeirRow.tsx, HeirSelector.tsx, TemplatesModal.tsx

**New Utilities:**
- `tp()` function for pluralization in `lib/i18n/index.ts`
- Enhanced `flipDirectionalIcon()` function in `lib/utils/rtl.ts`

**Quality Assurance:**
- All 268 tests passing (3 skipped)
- TypeScript compilation successful
- ESLint passing (6 pre-existing warnings)
- Prettier formatting applied

---

### Phase 7: Security & Privacy ✅ **COMPLETED**
**Session ID**: "surf-laundry" (from session history)
**Commit**: `feat: implement Phase 7 - Security & Privacy (Secure Implementation)`
**Directory**: `/workspaces/merathv01`
**Files Modified**: 6 new services + multiple updates

#### Completed Tasks:
- ✅ Data Protection
  - Installed react-native-encrypted-storage for secure data encryption
  - Created SecureStorageService for encrypted data storage
  - Updated AuditTrailService to store sensitive financial data securely
  - Separated sensitive data (netTotal, shares, calculation steps) from searchable metadata
  - Implemented automatic cleanup of secure storage entries

- ✅ Advanced Security Measures
  - Created SecurityAuditService for comprehensive security event logging
  - Implemented rate limiting with RateLimitService to prevent API abuse
  - Added rate limit configurations for different operation types (strict, normal, lenient)
  - Created data sanitization utilities to prevent sensitive data logging
  - Added safeConsole for sanitized console output
  - Implemented sensitive data pattern masking (credit cards, emails, IP addresses, API keys)

- ✅ Privacy Features
  - Created ConsentService for user consent management (GDPR compliance)
  - Implemented granular consent controls (analytics, personalization, marketing, data processing, biometric auth)
  - Added consent versioning and re-consent requirements
  - Created DataExportService for GDPR data portability
  - Implemented comprehensive data export in JSON and CSV formats
  - Added data deletion functionality for right to be forgotten
  - Created AnalyticsService with built-in opt-out mechanism
  - Implemented automatic consent checking before analytics tracking
  - Added property sanitization for all analytics events

**New Services Created:**
- lib/services/SecureStorageService.ts - Encrypted storage for sensitive data
- lib/services/SecurityAuditService.ts - Security event logging and monitoring
- lib/services/RateLimitService.ts - Rate limiting to prevent API abuse
- lib/services/ConsentService.ts - User consent management
- lib/services/DataExportService.ts - GDPR-compliant data export/deletion
- lib/services/AnalyticsService.ts - Privacy-controlled analytics

**Enhanced Services:**
- lib/services/AuditTrailService.ts - Updated to use secure storage for sensitive data
- lib/utils/validation.ts - Added data sanitization utilities

**GDPR Compliance Features:**
- Right to access (data export)
- Right to rectification (consent management)
- Right to erasure (data deletion)
- Right to restrict processing (analytics opt-out)
- Right to data portability (export in multiple formats)
- Right to object (consent revocation)
- Right to withdraw consent (analytics disable)

**Quality Assurance:**
- All security services include error handling and logging
- Sensitive data is automatically masked in logs
- Rate limiting prevents abuse and brute force attacks
- Consent requirements are enforced across all data operations

---

## Current Status Summary

### Completed Work
- ✅ **Phase 1**: Critical UX & Accessibility Improvements (14 files)
- ✅ **Phase 2**: UI/UX Design Enhancements (multiple new components)
- ✅ **Phase 3.1**: Performance Optimization (4 new test files, performance utilities)
- ✅ **Phase 3.2**: Advanced Features (5 new files, offline support, templates)
- ✅ **Phase 3.3**: Internationalization (3 new files, dynamic language switching)
- ✅ **Phase 3.4**: Testing & Quality (29 new tests, 268 total tests)
- ✅ **Phase 6**: Internationalization Enhancements (15 files, complete RTL support, pluralization)
- ✅ **Phase 7**: Security & Privacy (6 new services, GDPR compliance, data encryption)
- ✅ **Phase 4**: Performance Optimization (14 files, memoization, virtualization, code splitting)

### Statistics
- **Total Commits**: 9 major phase commits + 4 fix/style commits
- **Files Modified**: 167 files changed
- **Lines Added**: +28,985
- **Lines Removed**: -5,195
- **Test Coverage**: 268 tests passing (up from 239, +12% increase)
- **Branch**: `feat/architectural-improvements`
- **Status**: Clean working tree, 2 commits ahead of origin

### Remaining Work Priority
1. **Medium Priority**: Phase 8 (Modern UI Redesign - Remove Cards) - Complete UI overhaul using modern patterns
2. **Lower Priority**: Phase 5 (Testing & Quality Assurance) - Comprehensive testing framework (E2E, visual regression)

### Phase 8: Modern UI Redesign - Remove Cards 🔄 **IN PROGRESS**
**Session ID**: Current session
**Commit**: Multiple commits (55ea41c, 0cc2ed9, 39f6df7, 8f24b0b, fffc242)
**Directory**: `/workspaces/merathv01`
**Path**: Root directory (affects multiple screens and components)

#### Task Overview
The existing design does not feel modern. Move away from cards entirely and redesign the app's UI using modern, dynamic, and trending design patterns.

**Goal**: Redesign the app's UI using modern, dynamic, and trending design patterns without using cards.

**Constraints**:
- No card components (no white rounded rectangles acting as containers)
- Must work in React Native (core components + any popular library)
- Must remain respectful to the Islamic inheritance context (clear, accurate, trustworthy)

**Allowed Components** (Your Choice):
- Menus
- Lists
- Checkboxes / radio buttons
- Steppers / sliders
- Bottom sheets
- Floating action buttons
- Segmented controls
- Chips / tags
- Redo / reset / recalculate buttons
- Dividers, progress bars, badges
- Any other modern mobile UI pattern

#### Required Deliverables
- ✅ Modern design direction proposal - Explain what patterns to use instead of cards and why
- ✅ Component and layout recommendations for key screens:
  - Heir selection screen
  - Asset/estate input screen
  - Calculation results screen
  - Any other key screens
- ✅ Visual description or wireframe layout (text-based) showing information flow without cards
- ✅ Key style principles (spacing, hierarchy, interactions) for modern design
- ✅ Trade-offs and considerations - What might be gained or lost by removing cards

#### Current Card Usage Assessment
- **HeirSelection.tsx**: Uses Card components for heir categories
- **EstateSetup.tsx**: Uses Card components for estate input fields
- **Results.tsx**: Uses Card components for results display
- **Comparison.tsx**: Uses Card components for comparison table
- **Settings.tsx**: Uses Card components for settings groups
- **History.tsx**: Uses Card components for history items
- **Glossary.tsx**: Uses Card components for glossary items
- **TestCases.tsx**: Uses Card components for test case items
- **FiqhRules.tsx**: Uses Card components for fiqh rules
- **Home.tsx**: Uses Card components for quick actions

#### Completed Screens (6/10):
- ✅ **Home Screen** - Replaced Card with TouchableOpacity
  - Icon containers with left accent borders
  - Semi-transparent backgrounds instead of cards
  - Chevron indicators for navigation
  - RTL support maintained
  
- ✅ **History Screen** - Replaced Card with TouchableOpacity
  - Left border accent for visual hierarchy
  - Modern list item design with subtle borders
  - Chevron indicators
  - RTL support maintained
  
- ✅ **Settings Screen** - Replaced Card with section-based layout
  - Section headers for grouping (Appearance, Resources, About, Support, Legal)
  - Modern list items with subtle borders
  - Dividers for grouped items
  - Left accent border for danger items (clear cache)
  - RTL support maintained
  
- ✅ **Glossary Screen** - Replaced Card with TouchableOpacity and View
  - Left border accent for glossary items
  - Subtle backgrounds for verse and hadith items
  - Modern list item design with rounded corners
  - RTL support maintained
  
- ✅ **TestCases Screen** - Replaced Card with View
  - Empty state uses simple View with modern styling
  - Template items already used TouchableOpacity with custom styling
  - No functional changes to template cards
  - RTL support maintained
  
- ✅ **FiqhRules Screen** - Replaced Card with View
  - Madhab notes use View with left border
  - Special cases use View with subtle background
  - Modern styling with StyleSheet
  - RTL support maintained

#### Remaining Screens (6/10):
1. **MadhabSelect Screen** - Replace Card with modern list pattern (3 Card matches)
2. **EstateSetup Screen** - Replace Card-based input fields with modern input pattern (8 Card matches)
3. **Results Screen** - Replace Card-based results display with modern visualization (4 Card matches)
4. **Comparison Screen** - Replace Card-based comparison table with modern data visualization (4 Card matches)
5. **CalculationSteps Screen** - Replace Card-based calculation steps with modern pattern (9 Card matches)
6. **HeirSelector Component** - Replace Card in component with modern pattern (used by HeirSelection screen)

#### Modern Design Patterns Implemented:
- **Left Border Accent**: Used for visual hierarchy and emphasis
- **Semi-transparent Backgrounds**: `rgba(255, 255, 255, 0.95)` instead of solid cards
- **Subtle Borders**: `borderWidth: 1` with `borderColor: 'rgba(0, 0, 0, 0.05)'`
- **Section Headers**: Uppercase, small text for grouping
- **Dividers**: Horizontal lines for grouped items
- **Chevron Indicators**: For navigation affordance
- **RTL Support**: All redesigned screens maintain RTL compatibility

---

## Next Steps Recommendation

Based on the current state and analysis, here are the recommended next phases in priority order:

### **Priority 1: Phase 8 - Modern UI Redesign (Remove Cards)**
**Status**: 🔄 **IN PROGRESS** (6/10 screens completed)
**Progress**: 
- ✅ Home, History, Settings, Glossary, TestCases, FiqhRules completed
- ⏳ MadhabSelect, EstateSetup, Results, Comparison, CalculationSteps, HeirSelector remaining
**Rationale**: The current card-based design feels dated. A modern UI redesign will provide:
- More contemporary and dynamic user experience
- Better space utilization with modern patterns
- Improved visual hierarchy without card containers
- Trendy mobile UI patterns that users expect in 2025

**Key Tasks**:
- Design and implement modern patterns for all 10 screens
- Replace Card components with modern alternatives (lists, chips, bottom sheets, etc.)
- Maintain Islamic context respect and clarity
- Update components/ui/Card.tsx deprecation or replacement strategy
- Ensure accessibility is maintained in new design

---

## Notes
- All completed phases have been committed and pushed to the `feat/architectural-improvements` branch
- No engine logic was modified during phases 1-3 (all changes are non-breaking)
- Quality gates (ESLint, Prettier, Tests) are configured and passing
- The working tree is clean and ready for the next phase of work
