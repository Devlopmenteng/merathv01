import { describe, it, expect } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_DEFAULTS } from '../lib/constants/appDefaults';

describe('History Storage', () => {
  it('saves and retrieves history', async () => {
    const entry = { date: new Date().toISOString(), madhab: 'hanafi', netTotal: 1000, shares: [] };
    await AsyncStorage.setItem(APP_DEFAULTS.STORAGE_KEYS.AUDIT_TRAIL, JSON.stringify([entry]));
    const stored = await AsyncStorage.getItem(APP_DEFAULTS.STORAGE_KEYS.AUDIT_TRAIL);
    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].netTotal).toBe(1000);
  });
});
