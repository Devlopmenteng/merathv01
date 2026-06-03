import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuditEntry {
  id: string;
  timestamp: string;
  madhab: string;
  netTotal: number;
  shares: any[];
  steps: { title: string; description: string }[];
  hijabLog?: string[];
  caseName?: string;
  caseDate?: string;
}

const STORAGE_KEY = 'merath_audit_trail';

export async function saveAuditTrail(entry: AuditEntry): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    let trail: AuditEntry[] = [];
    if (stored) {
      try {
        trail = JSON.parse(stored);
      } catch {
        trail = [];
      }
    }
    trail.unshift(entry);
    if (trail.length > 50) trail.pop();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trail));
  } catch (error) {
    throw new Error(
      `Failed to save audit trail: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function getAuditTrail(): Promise<AuditEntry[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  } catch (error) {
    throw new Error(
      `Failed to load audit trail: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function clearAuditTrail(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    throw new Error(
      `Failed to clear audit trail: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function searchAuditTrail(query: string): Promise<AuditEntry[]> {
  const all = await getAuditTrail();
  const lowerQuery = query.toLowerCase();
  return all.filter(entry =>
    entry.caseName?.toLowerCase().includes(lowerQuery) ||
    entry.caseDate?.includes(lowerQuery) ||
    entry.madhab.toLowerCase().includes(lowerQuery)
  );
}
