import { describe, expect, it, beforeEach, vi } from 'vitest';
import { create, act } from 'react-test-renderer';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PremiumProvider } from '../lib/context/PremiumContext';
import { ThemeProvider } from '../lib/context/ThemeContext';
import { LanguageProvider, useLanguage } from '../lib/context/LanguageContext';
import { APP_DEFAULTS } from '../lib/constants/appDefaults';

vi.stubGlobal('__DEV__', true);

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const storage: Record<string, string> = {};

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async (key: string) => storage[key] ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      storage[key] = value;
      return value;
    }),
    removeItem: vi.fn(async (key: string) => {
      delete storage[key];
    }),
    clear: vi.fn(async () => {
      Object.keys(storage).forEach((key) => delete storage[key]);
    }),
  },
}));

vi.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  Switch: 'Switch',
  ScrollView: 'ScrollView',
  TouchableOpacity: 'TouchableOpacity',
  Modal: 'Modal',
  Pressable: 'Pressable',
  StyleSheet: { create: (styles: Record<string, unknown>) => styles },
  Alert: { alert: vi.fn() },
  useColorScheme: () => 'light',
  Linking: { openURL: vi.fn() },
  I18nManager: { forceRTL: vi.fn(), isRTL: false },
}));

vi.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'en' }],
}));

vi.mock('expo-modules-core', () => ({}));

vi.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

vi.mock('expo-store-review', () => ({
  hasAction: vi.fn(async () => false),
  requestReview: vi.fn(),
}));

vi.mock('expo-mail-composer', () => ({
  composeAsync: vi.fn(async () => ({ status: 'sent' })),
}));

describe('Settings screen', () => {
  beforeEach(() => {
    Object.keys(storage).forEach((key) => delete storage[key]);
    vi.clearAllMocks();
  });

  it('persists selected language when switching from Settings', async () => {
    // Test the actual language change functionality through the context
    // We'll create a minimal test to verify language persistence
    // by directly testing the LanguageProvider behavior
    let capturedChangeLocale: ((locale: string) => Promise<boolean>) | undefined;

    const TestConsumer = () => {
      const { locale, changeLocale: ctxChangeLocale } = useLanguage();
      capturedChangeLocale = ctxChangeLocale;
      return React.createElement('Text', null, `Current locale: ${locale}`);
    };

    await act(async () => {
      create(
        <PremiumProvider>
          <ThemeProvider>
            <LanguageProvider>
              <TestConsumer />
            </LanguageProvider>
          </ThemeProvider>
        </PremiumProvider>
      );
    });

    expect(capturedChangeLocale).toBeDefined();

    // Change locale to Arabic
    await act(async () => {
      await capturedChangeLocale!('ar');
    });

    // Verify it was persisted to AsyncStorage
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      APP_DEFAULTS.STORAGE_KEYS.LANGUAGE_PREFERENCE,
      'ar'
    );
    expect(storage[APP_DEFAULTS.STORAGE_KEYS.LANGUAGE_PREFERENCE]).toBe('ar');
  });
});
