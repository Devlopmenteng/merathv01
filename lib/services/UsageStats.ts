import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_DEFAULTS } from '../constants/appDefaults';

export async function incrementCalculationCount() {
  const stored = await AsyncStorage.getItem(APP_DEFAULTS.STORAGE_KEYS.CALC_COUNT);
  const count = (stored ? parseInt(stored, 10) : 0) + 1;
  await AsyncStorage.setItem(APP_DEFAULTS.STORAGE_KEYS.CALC_COUNT, count.toString());
  return count;
}

export async function getCalculationCount(): Promise<number> {
  const stored = await AsyncStorage.getItem(APP_DEFAULTS.STORAGE_KEYS.CALC_COUNT);
  return stored ? parseInt(stored, 10) : 0;
}
