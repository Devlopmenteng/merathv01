# Merath – Islamic Inheritance Calculator

A comprehensive, madhab‑aware inheritance calculator for Muslims worldwide.

## Features
- Four major schools of thought (Hanafi, Maliki, Shafi'i, Hanbali)
- Special cases: Musharraka, Akdariyya, grandfather with siblings, blood relatives
- Multi‑language (English, Arabic, Urdu, Malay)
- Dark mode, export to PDF, share as image
- Full audit trail of calculations

## Tech Stack
- React Native (Expo) 55
- TypeScript
- React Navigation 7
- Vitest for testing

## Setup
```bash
npm install
npx expo start
```

## Build
```bash
eas build --platform android --profile preview   # APK
eas build --platform android --profile production # AAB
```

## Test
```bash
npm test
```

## License
MIT
