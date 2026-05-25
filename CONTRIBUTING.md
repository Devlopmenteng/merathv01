# Contributing Guidelines

## Code Quality Standards

### TypeScript & Type Safety

- **Strict mode enabled**: All TypeScript strict checks are active
- **No `any` types**: Use specific types or generics instead
- **Unused variables**: Prefix with underscore if intentionally unused (`_variable`)
- **Always annotate function returns**: Especially for public APIs

### ESLint & Prettier

```bash
# Before committing, always run:
npm run lint:fix
npm run format
npm run type-check
```

All files must pass these checks before merging.

### Testing

- Maintain test coverage above 80% for new features
- Run full test suite before pushing: `npm test`
- Write integration tests for critical business logic

## Project Structure

```
├── App.tsx                    # Root app component with providers
├── app.config.ts             # Expo configuration
├── components/               # Reusable UI components
│   ├── ui/                   # Base UI components (Button, Input, etc)
│   └── [Feature].tsx         # Feature-specific components
├── screens/                  # Navigation screens
├── navigation/               # Navigation configuration
├── lib/
│   ├── context/              # React contexts (providers)
│   ├── engine/               # Business logic (calculations)
│   ├── services/             # External integrations (storage, analytics)
│   ├── utils/                # Utility functions
│   ├── constants/            # App-wide constants
│   ├── i18n/                 # Localization
│   └── design/               # Design system (theme)
├── hooks/                    # Custom React hooks
├── __tests__/                # Test files
└── assets/                   # Images, fonts, etc
```

## Storage & Constants

### Always Use APP_DEFAULTS

Instead of:
```typescript
// ❌ BAD
AsyncStorage.setItem('merath_premium', value);
if (wiveCount > 4) { /* ... */ }
```

Do:
```typescript
// ✅ GOOD
import { APP_DEFAULTS } from '../lib/constants/appDefaults';
AsyncStorage.setItem(APP_DEFAULTS.STORAGE_KEYS.PREMIUM, value);
if (wifeCount > APP_DEFAULTS.MAX_WIVES) { /* ... */ }
```

### Adding New Constants

Edit `lib/constants/appDefaults.ts` and add to the `APP_DEFAULTS` object:

```typescript
export const APP_DEFAULTS = {
  // ... existing ...
  MY_NEW_LIMIT: 10,
  STORAGE_KEYS: {
    // ... existing ...
    MY_NEW_KEY: 'my_new_storage_key',
  },
};
```

## Alerts & User Feedback

### Never Use Alert.alert Directly

Instead of:
```typescript
// ❌ BAD
Alert.alert('Error', 'Something went wrong');
```

Do:
```typescript
// ✅ GOOD
import { showError } from '../lib/utils/alerts';
showError('Something went wrong', 'Check your inputs');
```

### Alert Utilities

```typescript
import { 
  showAlert, 
  showConfirm, 
  showError, 
  showSuccess, 
  showValidationError 
} from '../lib/utils/alerts';

// Generic alert
showAlert('title_key', 'message_key', { /* options */ });

// Confirmation dialog
showConfirm('confirm_delete', 'are_you_sure', () => {
  // Handle confirmation
});

// Error (no i18n)
showError('Calculation failed', 'Invalid heir configuration');

// Success
showSuccess('success', 'calculation_complete');

// Validation error
showValidationError('Estate Total', 'must_be_positive');
```

## Error Handling

### Try-Catch Pattern

```typescript
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error('[OperationName]', message, error);
  throw new Error(`Operation failed: ${message}`);
}
```

### Async Storage

```typescript
try {
  await AsyncStorage.setItem(key, value);
} catch (error) {
  console.error('Storage error:', error);
  showError('Storage Error', 'Could not save data');
}
```

## Context & State Management

### Creating New Contexts

1. Create context provider in `lib/context/[Name].tsx`
2. Include proper TypeScript types
3. Add error boundary for context access:

```typescript
export const useMyContext = () => {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useMyContext must be used within MyProvider');
  }
  return context;
};
```

### Dependency Arrays in useEffect

Always include dependencies. Never use empty arrays unless for mount-only initialization:

```typescript
// ✅ Correct - runs on value change
useEffect(() => {
  loadData(value);
}, [value]);

// ✅ Correct - initialization only
useEffect(() => {
  initializeApp();
}, []);

// ❌ Wrong - missing dependencies
useEffect(() => {
  loadData(value);
}, []);
```

## Performance Considerations

### Memoization

Use `React.useMemo` for expensive computations:

```typescript
const expensiveValue = useMemo(() => {
  return complexCalculation(input);
}, [input]);
```

Use `useCallback` for event handlers passed to memoized children:

```typescript
const handleUpdate = useCallback((value) => {
  setData(value);
}, []);
```

### Component Memoization

Wrap expensive components with `React.memo` for props comparison:

```typescript
export const MyComponent = React.memo(({ data, onAction }) => {
  return <View>{/* ... */}</View>;
});
```

## i18n (Internationalization)

### Always Use Translation Keys

```typescript
// ❌ BAD
<Text>Welcome to Merath</Text>

// ✅ GOOD
import { t } from '../lib/i18n';
<Text>{t('welcome_title')}</Text>
```

Add new keys to `lib/i18n/locales/en.json` and corresponding translations to other locales.

## Commit Checklist

Before committing:

- [ ] `npm run lint:fix` passes
- [ ] `npm run type-check` passes
- [ ] `npm test` passes
- [ ] No hardcoded values (use APP_DEFAULTS)
- [ ] No direct Alert.alert calls (use alerts utility)
- [ ] Dependency arrays correct on useEffect
- [ ] Proper error handling
- [ ] Commit message follows format

## Code Review Focus Areas

Reviewers should check:

1. **Type Safety**: No `any` types, proper generics
2. **Storage**: Uses APP_DEFAULTS keys
3. **Alerts**: Uses alerts utility, not Alert.alert
4. **Dependencies**: useEffect/useMemo dependencies correct
5. **Error Handling**: Try-catch where needed
6. **Testing**: Adequate test coverage for changes
7. **Performance**: Proper memoization for expensive ops
8. **i18n**: No hardcoded strings

## Questions or Issues?

Refer to:
- `IMPROVEMENTS.md` - Architecture details
- `IMPROVEMENT_PLAN.md` - Remaining improvements
- Code comments for complex algorithms
- Test files for usage examples
