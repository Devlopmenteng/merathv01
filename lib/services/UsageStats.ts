import AsyncStorage from '@react-native-async-storage/async-storage';

export async function incrementCalculationCount(): Promise<number> {
  try {
    const stored = await AsyncStorage.getItem('merath_calc_count');
    const parsed = stored ? parseInt(stored, 10) : 0;
    const count = (Number.isNaN(parsed) ? 0 : parsed) + 1;
    await AsyncStorage.setItem('merath_calc_count', count.toString());
    return count;
  } catch (error) {
    throw new Error(
      `Failed to increment calculation count: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function getCalculationCount(): Promise<number> {
  try {
    const stored = await AsyncStorage.getItem('merath_calc_count');
    if (!stored) return 0;
    const parsed = parseInt(stored, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  } catch (error) {
    throw new Error(
      `Failed to get calculation count: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
