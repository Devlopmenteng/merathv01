import { describe, expect, it, beforeEach, vi } from 'vitest';
import { create, act, type ReactTestRenderer } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings } from '../screens/Settings';
import { PremiumProvider } from '../lib/context/PremiumContext';
import { ThemeProvider } from '../lib/context/ThemeContext';
import { LanguageProvider } from '../lib/context/LanguageContext';
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
    const navigation = { navigate: vi.fn() };
    let root!: ReactTestRenderer;

    await act(async () => {
      root = create(
        <PremiumProvider>
          <ThemeProvider>
            <LanguageProvider>
              <Settings navigation={navigation} />
            </LanguageProvider>
          </ThemeProvider>
        </PremiumProvider>,
      );
    });

    const textNodes = root.root.findAll(
      (node) => String(node.type) === 'Text',
    );
    const arabicButtonText = textNodes.find(
      (node) => node.props?.children === 'Arabic',
    );
    expect(arabicButtonText).toBeDefined();

    const arabicButton = arabicButtonText?.parent;
    expect(arabicButton).toBeDefined();
    expect(arabicButton?.props.onPress).toBeDefined();

    await act(async () => {
      arabicButton!.props.onPress();
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      APP_DEFAULTS.STORAGE_KEYS.LANGUAGE_PREFERENCE,
      'ar',
    );
    expect(storage[APP_DEFAULTS.STORAGE_KEYS.LANGUAGE_PREFERENCE]).toBe('ar');
  });
});
