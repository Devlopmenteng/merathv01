# Merath – Islamic Inheritance Calculator
# مراث – حاسبة المواريث الشرعية

A comprehensive, madhab‑aware inheritance calculator for Muslims worldwide.
حاسبة شاملة للمواريث الشرعية تدعم المذاهب الأربعة.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React_Native-55-61DAFB)](https://reactnative.dev/)
[![Tests](https://img.shields.io/badge/Tests-203%20passing-green)](https://github.com/yourusername/merath)

## Features / الميزات

### Core Features
- **Four Madhhabs**: Hanafi (حنفي), Maliki (مالكي), Shafii (شافعي), Hanbali (حنبلي)
- **Special Cases**: Musharraka (المشاركة), Akdariyya (الأكدرية), Grandfather rules (الجد مع الإخوة)
- **Blood Relatives**: ذوو الأرحام with priority-based distribution
- **Awl (عول)**: Handling when shares exceed estate
- **Radd (رد)**: Returning remainder when shares are less than estate
- **Hijab (حجب)**: Complete inheritance blocking system
- **Audit Trail**: Full calculation history and step-by-step breakdown

### User Experience
- **Multi-language Support**: English, Arabic, Urdu, Malay
- **Dark Mode**: Easy on the eyes
- **Export Options**: PDF export, share as image
- **Mobile-First**: Designed for React Native/Expo
- **Accessibility**: Screen reader support, proper contrast

### Developer Experience
- **TypeScript**: Full type safety
- **Comprehensive Tests**: 200+ test cases
- **API Documentation**: Complete API reference
- **Code Examples**: Extensive usage examples
- **Error Handling**: Custom error classes for better debugging

## Quick Start / البدء السريع

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/merath.git
cd merath

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Basic Usage / الاستخدام الأساسي

```typescript
import { calculateInheritance } from './lib/inheritance';

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

console.log('Net Estate:', result.netEstate);
result.shares.forEach(share => {
  console.log(`${share.name}: ${share.amount} (${share.fraction})`);
});
```

### Running Tests / تشغيل الاختبارات

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- __tests__/inheritance.test.ts

# Check test coverage
npm test -- --coverage
```

### Type Checking / فحص الأنواع

```bash
# Run TypeScript type checker
npm run type-check
```

## Documentation / التوثيق

- **[API Documentation](./docs/API.md)** - Complete API reference
- **[Code Examples](./docs/EXAMPLES.md)** - Usage examples and patterns
- **[System Architecture](./docs/ARCHITECTURE.md)** - Architecture and design
- **[Type Definitions](./lib/engine/types.ts)** - TypeScript type definitions
- **[Error Handling](./lib/engine/errors.ts)** - Custom error classes

## Tech Stack / تقنيات المشروع

- **React Native (Expo) 55** - Cross-platform mobile framework
- **TypeScript 5.0** - Type-safe JavaScript
- **React Navigation 7** - Navigation library
- **Vitest** - Testing framework
- **FractionClass** - Custom fraction arithmetic for precision

## Project Structure / هيكل المشروع

```
merath/
├── lib/
│   ├── engine/              # Core calculation engine
│   │   ├── calculator.ts    # Main calculator logic
│   │   ├── fraction.ts      # Fraction arithmetic
│   │   ├── hijab.ts         # Inheritance blocking
│   │   ├── constants.ts     # Heir constants & rules
│   │   ├── types.ts         # TypeScript definitions
│   │   └── errors.ts        # Custom error classes
│   ├── inheritance/         # Public API
│   │   ├── index.ts         # Main exports
│   │   └── calculateAdapter.ts # Simplified interface
│   └── services/           # Business logic services
├── screens/                 # React Native screens
├── components/             # Reusable components
├── __tests__/              # Test files
│   ├── integration.test.ts
│   ├── inheritance.test.ts
│   ├── special-cases.test.ts
│   └── performance/         # Performance benchmarks
├── docs/                   # Documentation
│   ├── API.md
│   └── EXAMPLES.md
└── ErrorBoundary.tsx       # Error handling
```

## Build / البناء

### Android

```bash
# Build APK for testing
eas build --platform android --profile preview

# Build AAB for production
eas build --platform android --profile production
```

### iOS

```bash
# Build for iOS (requires macOS)
eas build --platform ios --profile preview

# Build for production
eas build --platform ios --profile production
```

## Development / التطوير

### Adding New Features

1. Implement logic in `lib/engine/`
2. Add TypeScript types in `lib/engine/types.ts`
3. Write tests in `__tests__/`
4. Update documentation in `docs/`
5. Run `npm test` and `npm run type-check`

### Code Style

- Use TypeScript for all new code
- Follow existing naming conventions
- Add JSDoc comments for public APIs
- Write tests for new features
- Keep functions focused and small

## Testing / الاختبار

The project has comprehensive test coverage:

- **203 tests** covering:
  - Integration tests
  - Inheritance calculation logic
  - Special cases (Musharraka, Akdariyya)
  - Performance benchmarks
  - Real-world scenarios
  - Component tests

### Test Coverage

```bash
# View coverage report
npm test -- --coverage
```

## Contributing / المساهمة

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Write tests for your changes
4. Ensure all tests pass
5. Submit a pull request

## License / الترخيص

MIT License - see [LICENSE](LICENSE) file for details

## Acknowledgments / الشكر والتقدير

- Islamic scholars for fiqh guidance
- Open source community
- React Native and Expo teams
- All contributors

## Support / الدعم

For questions or issues:
- Open an issue on GitHub
- Check the [documentation](./docs/)
- Review the [examples](./docs/EXAMPLES.md)

---

Made with ❤️ for the Muslim community
صنع بحب للمجتمع المسلم